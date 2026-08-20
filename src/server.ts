/**
 * HTTP server entrypoint — the thin transport edge that bridges the tested,
 * framework-agnostic `createApp().handle()` to a real Node HTTP server on $PORT.
 *
 * This is the production wiring: it constructs the Postgres-backed repositories from
 * `AAA_DATABASE_URL` (injected from Secret Manager on Cloud Run), applies the schema
 * (idempotent; also enables pgvector), and serves. Liveness (`/healthz`, `/`) needs no
 * DB; readiness (`/readyz`) checks DB connectivity. Everything else is delegated to the
 * app's router unchanged.
 */
import http from 'node:http';
import pg from 'pg';
import { createApp, type App } from './api/app.js';
import { applySchema, PgFeedbackRepository } from './persistence/pgFeedbackRepository.js';
import { PgRecoveryCaseRepository } from './persistence/pgRecoveryCaseRepository.js';
import { PgContactRepository } from './persistence/pgContactRepository.js';
import { PgCompetitorRepository } from './persistence/pgCompetitorRepository.js';
import { baselineAnswerer, type GroundedAnswerer } from './domain/nlQuery.js';
import { createLlmAnswerer } from './domain/llmAnswerer.js';

const PORT = Number(process.env.PORT ?? 8080);
const DATABASE_URL = process.env.AAA_DATABASE_URL ?? '';

function normalizeHeaders(h: http.IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) {
    if (typeof v === 'string') out[k] = v;
    else if (Array.isArray(v)) out[k] = v.join(', ');
  }
  return out;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/**
 * Pick the grounded-answer phrasing seam. `AAA_LLM_PROVIDER=vertex` uses Claude via
 * Vertex (needs AAA_VERTEX_PROJECT + AAA_VERTEX_MODEL and the runtime SA's
 * aiplatform.user role); anything else — or any misconfiguration — uses the
 * deterministic baseline. The Vertex SDK is imported lazily so baseline mode never
 * loads it.
 */
async function chooseAnswerer(): Promise<GroundedAnswerer> {
  const mode = (process.env.AAA_LLM_PROVIDER ?? 'baseline').toLowerCase();
  if (mode !== 'vertex') {
    console.log('[startup] LLM answerer: baseline (deterministic)');
    return baselineAnswerer;
  }
  const projectId = process.env.AAA_VERTEX_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? '';
  const region = process.env.AAA_VERTEX_REGION ?? 'us-central1';
  const model = process.env.AAA_VERTEX_MODEL ?? '';
  if (!projectId || !model) {
    console.error('[startup] AAA_LLM_PROVIDER=vertex but AAA_VERTEX_PROJECT/MODEL unset — using baseline');
    return baselineAnswerer;
  }
  try {
    const { createVertexProvider } = await import('./infra/vertexProvider.js');
    const provider = createVertexProvider({ projectId, region, model });
    console.log(`[startup] LLM answerer: Claude via Vertex (${model} @ ${region})`);
    return createLlmAnswerer(provider, {
      onError: (err) => console.warn('[llmAnswerer] Vertex call failed, used baseline:', (err as Error).message),
    });
  } catch (e) {
    console.error('[startup] Vertex answerer init failed — using baseline:', (e as Error).message);
    return baselineAnswerer;
  }
}

async function main(): Promise<void> {
  const pool = new pg.Pool(DATABASE_URL ? { connectionString: DATABASE_URL } : {});

  // Ensure schema + pgvector (idempotent). Don't crash on a transient DB hiccup at
  // boot — /readyz surfaces DB health for diagnosis.
  let schemaReady = false;
  try {
    await applySchema(pool);
    schemaReady = true;
    console.log('[startup] schema applied — pgvector ready');
  } catch (e) {
    console.error('[startup] applySchema failed:', (e as Error).message);
  }

  const answerer = await chooseAnswerer();

  const app: App = createApp({
    feedback: new PgFeedbackRepository(pool),
    cases: new PgRecoveryCaseRepository(pool),
    contacts: new PgContactRepository(pool),
    competitors: new PgCompetitorRepository(pool),
    answerer,
  });

  const server = http.createServer((req, res) => {
    void (async () => {
      try {
        const method = req.method ?? 'GET';
        const path = req.url ?? '/';

        // Liveness — no DB dependency. Served at '/' (Google's front end special-cases
        // the literal path '/healthz' and answers it before it reaches us, so we don't
        // use that name; '/', the app's '/health', and '/readyz' all work normally).
        if (method === 'GET' && path === '/') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ service: 'aaa-insights-api', status: 'ok', schemaReady }));
          return;
        }
        // Readiness — verifies DB connectivity.
        if (method === 'GET' && path === '/readyz') {
          try {
            await pool.query('SELECT 1');
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ status: 'ready', db: 'up' }));
          } catch (e) {
            res.writeHead(503, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ status: 'not-ready', db: 'down', error: (e as Error).message }));
          }
          return;
        }

        const raw = await readBody(req);
        let body: unknown;
        if (raw.length > 0) {
          const ct = req.headers['content-type'] ?? '';
          if (ct.includes('application/json')) {
            try {
              body = JSON.parse(raw);
            } catch {
              res.writeHead(400, { 'content-type': 'application/json' });
              res.end(JSON.stringify({ error: 'invalid JSON body' }));
              return;
            }
          } else {
            body = raw;
          }
        }

        const response = await app.handle({ method, path, headers: normalizeHeaders(req.headers), body });
        const ct = response.headers?.['content-type'] ?? 'application/json';
        res.writeHead(response.status, { 'content-type': ct });
        res.end(ct.startsWith('application/json') ? JSON.stringify(response.body) : String(response.body));
      } catch (e) {
        console.error('[request] error:', e);
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'internal error' }));
      }
    })();
  });

  server.listen(PORT, () => console.log(`[startup] AAA Insights API listening on :${PORT}`));
}

main().catch((e) => {
  console.error('[fatal]', e);
  process.exit(1);
});
