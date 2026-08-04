# Architecture Overview — AAA Insights

**Version:** v1 (design)  |  **Date:** 2026-07-30  |  **Basis:** Requirements v7, Test Plan (Phase 3)
**Prepared by:** Active AI Advisors  |  **Prepared for:** Paul Jamieson

> This document bridges **TEST FIRST → IMPLEMENT**. It records *how* AAA Insights will be built — the pieces,
> how they fit, and the reasoning behind each choice — so Phase 4 (IMPLEMENT) builds against a design, not a
> guess. The requirements say *what*; this says *how*. Nothing here changes the spec; where the spec was
> deliberately implementation-agnostic (provider-abstracted models, "physical schema is an Architecture-phase
> decision"), this is where those decisions get made — and they stay reviewable and reversible.

**Design posture (from your answers):** hosted on **Google Cloud**, primary AI model **Anthropic Claude**
(behind an abstraction, so no lock-in), a **greenfield** build, and — most importantly — **low-operations to
start** (you and a non-technical team), **designed to migrate and scale** as the business plan grows. Every
choice below favors managed services that minimize server upkeep now, while staying **container-portable and
standards-based** so a future team can take it further without a rewrite.

---

## In one paragraph

AAA Insights is a **multi-tenant web application on Google Cloud**. Two web front-ends (a respondent-facing
survey/interview experience and an admin console) talk to a single **application API**, which stores everything
in a managed **PostgreSQL** database and hands slow work — the AI analysis — to **background workers** so the
app stays fast. All AI calls go through one **LLM gateway** that wraps Anthropic Claude (served on Google's
Vertex AI, keeping data in-cloud and US-resident), enforces the safety and cost limits the spec requires, and
can be pointed at a different model later without touching the rest of the code. Sensitive text is run through
**PII redaction** before it is analyzed or shown, secrets live in a **managed vault**, and public endpoints are
protected by **rate-limiting and one-time links** rather than a CAPTCHA wall. The whole thing runs on
**serverless containers** that scale down to near-zero when idle (cheap to run now) and up automatically as
volume grows (no rewrite to scale) — and because it's containers, it can move off any one service if the
business ever needs it to.

---

## Components

| Component | Responsibility | Talks to |
|-----------|----------------|----------|
| **Respondent web app + embeddable widget** | Renders surveys and the AI-led conversational interview; fast, mobile-first, WCAG 2.1 AA; no login (INV-5). Widget is a small embeddable script (R-4). | Application API |
| **Admin console** | Survey builder, dashboards, insight reports, Love/Trust/emotion views, Strengths & Gripes, recovery cases. Requires SSO/MFA login. | Application API, Identity Platform |
| **Application API** (Node/TypeScript on Cloud Run) | Business logic, multi-tenant isolation (INV-6), validation, survey/response handling, query endpoints, exports. The single front door. | PostgreSQL, LLM gateway, workers (via queue), DLP, Secret Manager, Cloud Storage |
| **Analysis workers** (Cloud Run Jobs) | The slow AI work off the request path: themes, sentiment, Brand Love/Trust reads, **emotion profile**, **Strengths & Gripes**, insight narratives. Async so the app stays responsive (NFR-2). | LLM gateway, PostgreSQL, DLP |
| **LLM gateway** (provider abstraction) | The *only* place model calls happen. Wraps Claude (via Vertex AI) + an embeddings model; enforces topic scope (R-8), per-link cost ceilings + output safety (R-45), and confidence/labels on every inferred read (INV-4/14/15). Swap-a-provider seam (DPS-9). | Vertex AI (Claude + embeddings) |
| **Trigger & recovery engine** | Evaluates dissatisfaction triggers, opens/de-dupes/throttles RecoveryCases within ≤60 s (R-35, NFR-8), notifies the owner/team **internally** (no external CRM — R-37, X-2), runs alerts (R-20). | PostgreSQL, queue, email service |
| **PostgreSQL** (Cloud SQL) + **pgvector** | System of record for the whole logical data model (§12 of the spec); `pgvector` holds embeddings for semantic search, theme/emotion/aspect grouping, and "ask your data" (R-17). | Application API, workers |
| **Object storage** (Cloud Storage) | CSV imports (R-11) and generated exports — insight reports, CSV/PDF/slides (R-22). | Application API |
| **Identity Platform** (admin auth) | Admin SSO + MFA, managed sessions (R-42, DPS-11). Respondents remain anonymous. | Admin console, Application API |
| **PII redaction** (Cloud DLP) | Detects and redacts PII in open text/transcripts before analysis or surfacing (R-44, INV-8). | Application API, workers |
| **Secret vault** (Secret Manager) | Model keys, provider/collection credentials, email keys — never in the database, exports, or logs (R-43, DPS-11). | Application API, workers, gateway |
| **Edge protection** (Cloud Armor + signed links) | Rate-limiting, anomaly detection, and one-response-per-link tokens on public endpoints — abuse defense **without a CAPTCHA wall** (R-41, protects NFR-4). | Respondent app, Application API |
| **Queue / scheduler** (Cloud Tasks + Pub/Sub) | Moves analysis and trigger work off the request path; drives the ≤60 s trigger latency and background analysis. | Application API, workers, recovery engine |
| **Email (internal notifications)** | Sends case/alert notifications to the internal team only (R-37). No customer-data push to third-party tools. | Recovery engine |
| **Observability** (Cloud Logging/Monitoring + error tracking) | Health, metrics, and errors — with PII kept out of logs (INV-8). | All services |
| **Competitive collection worker** *(Phase 1)* | Lawful public-review ingestion behind the DPS-7 legal-sign-off gate; provenance kept. Not in the MVP. | PostgreSQL, Cloud Storage |

---

## Key decisions (and why)

- **Serverless containers (Cloud Run) for compute** — over managed Kubernetes (GKE) or App Engine. Cloud Run
  scales to near-zero when idle (low cost while you're small) and up automatically under load (no rewrite to
  scale — NFR-5), with almost no servers to operate. Because the unit is a **container**, the app is portable
  — if the business plan later calls for a move, it isn't married to one service. *Trade-off:* cold starts on
  idle endpoints; mitigated with a minimum-instance setting on the respondent path so surveys stay snappy
  (NFR-1).
- **PostgreSQL (Cloud SQL) + pgvector as the single datastore** — over adding a separate vector database now.
  The spec's data model is relational (Brands, FeedbackRecords, Cases, MetricSnapshots), and Postgres holds it
  cleanly; `pgvector` covers the semantic/embedding needs (theme, emotion, and aspect grouping; "ask your
  data") in the *same* database. One system to run and back up now; we can graduate to a dedicated vector
  store later if scale demands. *Trade-off:* pgvector is very capable but not a specialized vector engine —
  fine well beyond the MVP's ~5,000-item target.
- **TypeScript end-to-end (Next.js front-ends + Node API/workers)** — over a split TypeScript-frontend /
  Python-backend design. One language is the cheapest to maintain and the easiest to hire a single developer
  or agency for — which matches "non-technical to start, migrate as appropriate." The AI work here is
  *orchestration and prompting*, not heavy numerical ML, so TypeScript (with the Anthropic SDK) is a natural
  fit. *Trade-off:* if Phase-1 web collection or future analytics wants Python's data ecosystem, we add a
  **single Python worker** behind the same queue — the design already isolates workers, so that's an addition,
  not a rewrite.
- **Anthropic Claude via Vertex AI, behind an LLM gateway** — your chosen model, served through Google's
  Vertex AI so the calls stay inside your GCP project with **US data residency** (DPS-8/DPS-9) and unified
  billing/security. The **gateway abstraction** means Claude is the default, not a lock-in: a config change
  points it at the Anthropic API directly or another provider, honoring DPS-9. Embeddings come from **Vertex
  AI** to stay in-cloud (Anthropic doesn't provide an embeddings model). *Trade-off:* a thin gateway layer to
  maintain — worth it, because it's also the single place we enforce scope, cost, and safety limits.
- **Managed identity for admins (Identity Platform), anonymous respondents** — SSO + MFA and session
  management come from a managed service rather than hand-rolled auth (R-42, DPS-11) — safer and lower-ops.
  Respondents never authenticate (INV-5); their integrity is protected at the edge instead.
- **Abuse defense without a CAPTCHA wall (Cloud Armor + signed one-time links)** — the spec explicitly forbids
  a CAPTCHA wall (it would break the respectful, accessible experience — R-41, NFR-4). So public endpoints get
  rate-limiting and anomaly detection at the edge, plus a **signed, single-use token per survey link** so one
  link can't be stuffed. *Trade-off:* determined abuse is harder to stop than with a challenge gate; acceptable
  for this audience, and reCAPTCHA Enterprise remains an *optional* fallback for a specific abused campaign.
- **PII redaction as a first-class step (Cloud DLP)** — a managed, testable redaction pass runs before any
  open text is analyzed or shown (R-44, INV-8), rather than relying on ad-hoc regexes. *Trade-off:* a per-call
  cost and a little latency on ingest; budgeted into NFR-2.
- **Secrets in a managed vault (Secret Manager)** — every credential referenced by name, never stored in the
  data model, exports, or logs (R-43, DPS-11).
- **Async analysis via a queue (Cloud Tasks/Pub-Sub)** — keeps the survey submit fast (NFR-1) while analysis
  runs behind it (NFR-2), and gives the trigger engine its ≤60 s path to open a RecoveryCase (NFR-8).

---

## Data flow

1. **Collect.** A respondent opens a survey (link or embedded widget) or the AI-led interview. The edge layer
   checks the signed one-time token and rate limits (R-41). No account is required (INV-5).
2. **Validate & store.** The Application API validates the submission, attributes it to exactly one brand and
   source (INV-1), runs the text through **PII redaction** (R-44), and writes the `FeedbackRecord` to Postgres.
   Partial responses are saved and flagged (R-6). Conversational turns are stored as a transcript (R-10).
3. **Analyze (async).** A job is enqueued; an **analysis worker** picks it up and, through the **LLM gateway**,
   produces themes, sentiment, Brand Love/Trust reads, the **emotion profile**, and **Strengths & Gripes** —
   each derived record carrying `model_version` + confidence and the **inferred/companion** label so it is
   never blended into a stated headline (INV-4/14/15). Every read stays linked to its verbatims (INV-3).
4. **Act (triggers & recovery).** The trigger engine evaluates dissatisfaction signals; within ≤60 s it opens
   (or groups/throttles — E-21) a **RecoveryCase**, assigns an owner, and notifies the team **in-app + email,
   internally only** (R-35–R-37). Consented first-party recovery is later re-measured before/after (R-38).
5. **Understand.** The admin console reads aggregates and `MetricSnapshot`s for dashboards, the Love × Trust
   segmentation, competitive benchmarks (Phase 1), and the insight report; "ask your data" (R-17) runs a
   grounded, cited query over the account's own data only (INV-6), using embeddings for retrieval.
6. **Export & retain.** Reports/exports are written to Cloud Storage (R-22). Retention runs on the 24-month
   default, holding open cases and their baselines past retention until closed (DPS-5); deletions propagate
   everywhere (INV-7).
7. **Compete (Phase 1).** Behind the DPS-7 legal-sign-off gate, the collection worker ingests **lawful public**
   reviews with provenance, feeding the same analysis pipeline — aggregate only, never individual outreach
   (INV-9/11).

---

## Chosen stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Language** | TypeScript (Node 20+) across app, API, and workers | One language to hire for and maintain; strong Anthropic SDK support |
| **Front-end** | Next.js (React) + Tailwind CSS; embeddable widget as a small standalone bundle | Fast, mobile-first, server-rendered survey pages (NFR-1); accessible (NFR-4); popular and hireable |
| **API layer** | Next.js route handlers / Node service; Prisma ORM | Type-safe data access; migrations; readable for a future dev |
| **Database** | Cloud SQL for **PostgreSQL 16** + **pgvector** | Managed relational store for the spec's model; embeddings in-database for MVP |
| **Compute** | **Cloud Run** services + Cloud Run **Jobs** | Serverless, scale-to-zero to scale-out; container-portable |
| **Async / scheduling** | Cloud **Tasks** + **Pub/Sub** | Off-request analysis (NFR-2); ≤60 s trigger path (NFR-8) |
| **AI — LLM** | **Anthropic Claude via Vertex AI**, behind an LLM-gateway module | Your chosen model; in-cloud US residency; no lock-in (DPS-9) |
| **AI — embeddings** | Vertex AI text embeddings | Semantic search, theme/emotion/aspect grouping; stays in GCP |
| **Admin auth** | Google Cloud **Identity Platform** (SSO + MFA) | Managed, standards-based (R-42, DPS-11) |
| **PII redaction** | Cloud **DLP** | Managed, testable redaction (R-44, INV-8) |
| **Secrets** | **Secret Manager** | Vaulted credentials (R-43, DPS-11) |
| **Edge protection** | **Cloud Armor** + signed one-time links | Abuse defense without a CAPTCHA wall (R-41) |
| **Object storage** | Cloud **Storage** | CSV import and report/export files (R-11, R-22) |
| **Email (internal)** | A transactional email provider (e.g. SendGrid/Resend) | Team notifications only; no external CRM push (R-37) |
| **Observability** | Cloud Logging + Monitoring; error tracking (e.g. Sentry) | Health/metrics with PII kept out of logs (INV-8) |
| **Test runners** | **Vitest** (unit/integration), **Playwright** (end-to-end + accessibility), **k6** (load/NFR) | Match the TypeScript stack; Playwright checks WCAG (NFR-4); k6 checks the NFR budgets |
| **CI/CD** | **GitHub Actions** → build container → deploy to Cloud Run; suite gates every change | Realizes the Phase-7 guardrail; the suite re-runs on every push |

### One reconciliation to note (the test harness)

The Phase-3 test **plan** (`docs/03_test_plan.md`) is language-agnostic and stays the contract unchanged. The
executable stubs were written in **pytest** as a readable reference; because the build stack is **TypeScript**,
those tests will be **ported to Vitest** (plus Playwright for the end-to-end/accessibility cases and k6 for the
NFR budgets) at the start of IMPLEMENT. Same test names, same requirement IDs, same acceptance criteria — only
the runner changes. This is a one-time, mechanical translation and is expected.

---

## Honest limitations of this design (v1)

- **Not yet costed.** This names managed services but not a monthly bill. A rough cost model (per ~1,000
  responses and per analysis run) should be produced before build so pricing (D-7) is grounded in real
  numbers.
- **Some NFRs still "(confirm)".** The design targets NFR-2/3/8/9, but the specific numbers await your
  sign-off; the load tests (k6) will assert whatever is agreed.
- **Vertex AI Claude availability.** Claude models are offered through Vertex AI, but exact model versions and
  regional availability should be confirmed against Google's current catalog at build time; the gateway makes a
  fallback to the Anthropic API a config change, not a redesign.
- **Phase-1 collection is sketched, not designed.** Lawful public-review ingestion (robots.txt, provenance,
  the legal gate) needs its own mini-design before Phase 1; it is intentionally out of the MVP.

---

## What this unblocks

With this approved, **Phase 4 (IMPLEMENT)** can begin: scaffold the repo to this stack, port the test suite to
Vitest, then build behavior-by-behavior through the safety loop (branch → build → green test → commit),
turning the skipped tests green one cluster at a time — starting with the MVP (Phase 0) slice of the roadmap.

*Prepared by Active AI Advisors under the Grounded AI™ methodology. Decisions here are reviewable and
reversible; tell me what you'd change and we adjust before a line of code is written.*
