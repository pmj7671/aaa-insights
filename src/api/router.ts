/**
 * A tiny, dependency-free router. Matches an incoming (method, path) against
 * registered patterns like `/accounts/:accountId/feedback`, extracting path params.
 * Deliberately minimal — just enough to route the Application API's endpoints and stay
 * trivially testable.
 */
import type { Handler, HttpRequest, HttpResponse } from './http.js';
import { json, notFound } from './http.js';

interface Route {
  method: string;
  segments: string[]; // pattern segments; ':name' captures
  handler: Handler;
}

const split = (path: string): string[] => path.split('/').filter((s) => s.length > 0);

export class Router {
  private readonly routes: Route[] = [];

  add(method: string, pattern: string, handler: Handler): this {
    this.routes.push({ method: method.toUpperCase(), segments: split(pattern), handler });
    return this;
  }

  /** Match and dispatch. 404 for no path match; 405 when only the method differs. */
  async handle(req: {
    method: string;
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
  }): Promise<HttpResponse> {
    const qIdx = req.path.indexOf('?');
    const rawPath = qIdx >= 0 ? req.path.slice(0, qIdx) : req.path;
    const query = qIdx >= 0 ? parseQuery(req.path.slice(qIdx + 1)) : {};
    const headers = lowerKeys(req.headers ?? {});
    const reqSegs = split(rawPath);
    let pathMatchedButMethod = false;

    for (const route of this.routes) {
      const params = tryMatch(route.segments, reqSegs);
      if (params === null) continue;
      if (route.method !== req.method.toUpperCase()) {
        pathMatchedButMethod = true;
        continue;
      }
      const full: HttpRequest = { method: req.method, path: req.path, params, query, headers, body: req.body };
      return route.handler(full);
    }
    return pathMatchedButMethod ? json(405, { error: 'method not allowed' }) : notFound();
  }
}

function lowerKeys(h: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(h)) out[k.toLowerCase()] = v;
  return out;
}

function parseQuery(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const key = eq >= 0 ? pair.slice(0, eq) : pair;
    const val = eq >= 0 ? pair.slice(eq + 1) : '';
    out[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, ' '));
  }
  return out;
}

/** Returns captured params if the pattern matches, else null. */
function tryMatch(pattern: string[], actual: string[]): Record<string, string> | null {
  if (pattern.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i] as string;
    const a = actual[i] as string;
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(a);
    else if (p !== a) return null;
  }
  return params;
}
