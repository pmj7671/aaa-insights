# CLAUDE.md — AAA Insights

Project context and progress log for **AAA Insights**, a product by **Active AI Advisors**.
This file is the entry point for any Claude session (or teammate) working in this repo. Read it
first. Keep it current: when a phase completes or a decision is made, update the relevant section
and commit.

---

## 1. What we're building

A software service so companies can **survey** customers, collect **reviews, ratings, and comments**,
and **analyze** that feedback with AI for customer, consumer, and **competitive** insight.

**Core capabilities:**
1. AI theme + sentiment analysis over open text, with traceability to source responses.
2. Conversational, AI-led surveys that probe with follow-ups like a human interviewer.
3. A unified feedback hub + an **aggregate "unified customer" view** (population-level; identity optional).
4. **Competitive insight** — competitors as first-class brands (benchmark + per-competitor deep-dive).
5. **Brand Love** — scale (Love / Like / Ambiguity / Dislike / Hate), Brand Love Index, benchmark lens.
6. **Brand Trust** *(v3)* — a complementary indicator: a Trust question type, a **Trust Index** with driver
   breakdown (reliability, integrity, benevolence, security/privacy), inferred trust from open text, and a
   **Love × Trust segmentation** (Devoted / Infatuated / Dependable / At-risk) with actions per quadrant.
7. **Emotion & experience** *(v7)* — an **emotion profile** (compact ~7-emotion headline set that rolls up a
   finer sub-emotion set — D-17) and a **Strengths & Gripes** board (aspect-based pros/cons), both with
   **own vs. competitor** comparison. Inferred, labeled companion reads — never blended into stated Love/Trust
   (INV-15/INV-16). Own-brand in MVP; competitive comparison rides Phase-1 collection (D-18).
8. Insight + recommendations — plain-language narratives and ranked actions, not just charts.

**Target customer:** SMB / mid-market companies (~10–500 employees) with no in-house research team.

**Hard constraint — lawful & ethical by construction:** externally collected data (incl. competitor
reviews) is public and lawfully obtained; no bypassing logins/paywalls/controls; provenance kept; no
individual profiling; **live web collection gated on the client's legal sign-off** (DPS-7). Prefer official
APIs / licensed providers over page collection.

**Company voice (Active AI Advisors):** lead with the verb, be specific, stay quiet, stay warm.
Avoid revolutionary, game-changing, leverage, synergize.

---

## 2. How we work — Grounded AI™ (spec-driven, gated)

**No phase starts until the previous artifact is approved.** The gate can be fast, but never skipped.

| # | Phase | Artifact | Status |
|---|-------|----------|--------|
| 1 | SPECIFY | `docs/01_requirements.md` (PRD / Requirements **v7.1**) | ✅ **v7 APPROVED 2026-07-30**; **v7.1 (2026-08-11) NFR targets confirmed** — Emotion & Experience pillar; approved baseline |
| 2 | CHALLENGE | `docs/02_spec_review_report.md` | ✅ Review report + all 19 findings resolved 2026-07-27 (D-A–D-G decided; F-8–F-19 folded → v6). *v7 pillar wants a light CHALLENGE pass, pre-empted by INV-15/16 + E-25–27* |
| 3 | TEST FIRST | `docs/03_test_plan.md` + `tests/` | ✅ Delivered 2026-07-30 — contract for "done"; ported to **Vitest** in Phase 4 (same IDs) |
| 4 | IMPLEMENT | `src/` (passing tests) | 🟡 **In progress — through increment 20 (2026-08-14):** domain feature-complete; + persistence layer (repository ports, in-memory + Postgres/pgvector adapters, schema) proven by a shared contract; **175 tests green** (+ Postgres integration, gated), gate GREEN. **65 requirement IDs + X-1–X-7 closed** |
| 5 | VERIFY | `docs/05_verification_report.md` | ⏳ Not started |
| 6 | DOCUMENT | Delivery Package | ⏳ Not started |
| 7 | DEPLOY | `docs/deployment_runbook.md` | ⏳ Not started |

**Safety loop (phases 4–5):** plan → read & search → snapshot (git commit) → patch → verify (tests + diff)
→ roll back or advance. Commit only green states; a branch per change; the suite gates merge.

---

## 3. Current status (2026-07-30)

- **Phase 1 (SPECIFY) at Requirements v7 — ready for approval.** v2 = unified-customer view + competitors +
  lawful collection + Brand Love + data model; v3 = Brand Trust; v4 = all 15 §14 decisions resolved +
  "Ambiguity" → "Ambivalence"; v5 = Closed-Loop / Service Recovery pillar; v6 = all 19 CHALLENGE findings
  resolved; **v7 = Emotion & Experience pillar** (emotion profile + Strengths/Gripes, own vs. competitor).
- **v7 additions (D-17/D-18):** Emotion profile (O-17) + Strengths & Gripes aspect-based pros/cons (O-18) +
  competitive comparison (O-19); requirements R-46–R-50; invariants INV-15 (inferred companion, never
  blended; "no emotion detected" ≠ neutral) and INV-16 (emotion a distinct lens; association ≠ causation);
  edge cases E-25–E-27; Emotion + AspectSentiment records in the data model. **Compact ~7-emotion headline
  set that rolls up a finer sub-emotion set on demand** (Richins CES / Laros & Steenkamp / Plutchik grounding).
  Scope: **own-brand in MVP, competitive comparison Phase 1.** New research theme to source: consumer emotions.
  *(Also fixed a latent `build_docx.js` bug — several `body()` paragraphs, incl. the whole Purpose prose, were
  silently not rendering; now pushed.)*
- **v6 CHALLENGE resolutions (D-A–D-G + F-8–F-19):**
  - **D-A/D-B (F-1/F-2):** RecoveryCase is the *one* consented, purpose-limited place identity links to
    feedback — a named exception to INV-9 / X-1 (INV-9 amended). Recovery measurement is longitudinal
    **only for consented, contactable first-party customers**, plus cohort level.
  - **D-C (F-3):** Case-opening scoped to **first-party responses**. Public/competitor reviews (I-9) feed
    analysis + thematic recovery only — never individual outreach; anonymous internal-triage cases only.
  - **D-D (F-4):** Public-review prompts are **audience-neutral** (no review-gating); reinforcement reframed
    as advocacy/referral.
  - **D-E (F-5):** **Internal-only recovery loop — no external CRM/helpdesk push.** Connector entity +
    external_ref removed; R-37 = internal team notification/hand-off; X-2 revised; DPS-10 scoped internal.
  - **D-F (F-6):** DSR erasure extended to **scraped third-party review authors** (by provenance) — DPS-3.
  - **D-G (F-7):** **Stated-only headline Brand Love / Trust Index**; inferred reads are a labeled companion,
    never blended into the headline (INV-14, INV-4). **"Unreadable / no-signal → unknown," never Ambivalence**
    (F-12 fix); unknown excluded from the Index denominator.
  - **Security/privacy added:** R-41 bot/abuse defense on public endpoints (no CAPTCHA wall), R-42 admin
    SSO/MFA + session mgmt, R-43 secrets vault for credentials, R-44 PII detection/redaction, R-45
    conversational safety (rate/cost ceilings + output safety); DPS-11.
  - **Data-integrity/edge:** case dedup/throttle (R-35, E-21), recovery_rate = **measured delta** not closure
    (O-15), UTC + explicit period boundaries (E-22), retention hold for open cases + baselines (DPS-5),
    case-owner role (R-21), age-gate for contact collection (R-34, E-23). New E-21–E-24, DPS-11.
  - **NFR numbers** proposed and marked **"(confirm)"**: NFR-2 (analysis p95), NFR-3 (uptime), NFR-8
    (trigger→case latency), NFR-9 (RPO/RTO) — Paul confirms the business bar at approval.
- New **§15 CHALLENGE resolutions table (D-A–D-G)** in the spec records the decisions.
- Delivered in three formats: `docs/01_requirements.md` (canonical), `AAA_Insights_PRD.docx` / `.pdf`
  (AAA-branded, regenerated by `build_docx.js`).
- **Phase 3 (TEST FIRST) delivered 2026-07-30.** `docs/03_test_plan.md` (plain-English contract: every
  R-/INV-/E-/DPS-/NFR-/X- ID → named test + acceptance criteria AC-1–AC-7) and `tests/` (14 pytest files,
  130 tests, one per behavior, requirement ID in each docstring). All tests **skipped/pending until
  IMPLEMENT** — the expected TEST FIRST "red before green." `gate_check.py` = **GATE GREEN** (tests exist,
  suite green, all 93 R-/INV-/E- IDs traced). **pytest is a reference harness, not the product stack** —
  stack is an Architecture-phase decision (Paul deferred it).
- **Architecture / Tech Design delivered 2026-07-30** (`docs/architecture_overview.md`, v1). Stack chosen with
  Paul: **Google Cloud** (Cloud Run serverless containers, Cloud SQL Postgres 16 + pgvector, Cloud Tasks/
  Pub-Sub, Cloud Storage, Identity Platform SSO/MFA, Cloud DLP for PII, Secret Manager, Cloud Armor + signed
  one-time links for no-CAPTCHA abuse defense); **TypeScript end-to-end** (Next.js + Node API + Cloud Run Job
  workers, Prisma); **Anthropic Claude via Vertex AI behind an LLM gateway** (no lock-in, US residency),
  Vertex embeddings. Test runners: **Vitest + Playwright + k6**. Posture: low-ops now, container-portable to
  scale/migrate later. Includes components table, key decisions + rationale, data flow, honest limitations
  (not yet costed; NFRs still "(confirm)"; Vertex Claude versions to confirm; Phase-1 collection needs its own
  mini-design).
- **Test-harness reconciliation:** the Phase-3 plan is language-agnostic and unchanged; the pytest stubs get
  **ported to Vitest** (Playwright for e2e/accessibility, k6 for NFRs) at the start of IMPLEMENT — same names,
  IDs, acceptance criteria, only the runner changes.
- **Cost model delivered 2026-08-04** (`docs/cost_model.md`, v1). Key numbers: marginal AI cost ≈ **$0.004/
  response** (Haiku 4.5; ~$0.002 optimized w/ caching+batch); fixed infra floor ≈ **$100–200/mo** (mostly Cloud
  SQL). Scenarios: Pilot 5 accts ≈ $150/mo; Growing 25 ≈ $475/mo; Scaling 100 ≈ $2,000/mo (~$20/acct). Confirms
  **hybrid tiered+usage pricing (D-7)** — base fee covers the floor, usage covers AI; healthy margins at
  $99–299/acct/mo. Offered an interactive spreadsheet version as a follow-up.
- **NFR targets confirmed 2026-08-11 (spec → v7.1):** NFR-2 analysis **p95 ≤ 60 s**, NFR-3 **99.9% uptime**,
  NFR-8 trigger **≤ 60 s**, NFR-9 **tightened to RPO ≤ 1 h / RTO ≤ 8 h** (from 24 h placeholder). Written into
  spec, generator, test plan, and `tests/test_nfr.py`; branded doc regenerated (22 pp); gate GREEN. *(Also:
  vendored the AAA logo into `assets/` and pointed `build_docx.js` at it — the skill paths moved to
  `skills/synced/`, which broke the old hardcoded logo path; now self-contained.)*
- **Next action:** **Phase 4 IMPLEMENT** — scaffold to the GCP/TypeScript stack, port tests to Vitest, build
  the MVP/Phase-0 slice via the safety loop. Optional: light CHALLENGE on the emotion pillar; interactive cost
  spreadsheet. No open "(confirm)" items remain.

### Scoping decisions locked (all of §14 resolved in v4)
- Scope: **MVP + phased roadmap.** MVP = own-customer analysis + Brand Love + Trust + aggregate
  unified-customer view + the data model that holds competitors. Competitive collection/benchmark = Phase 1.
- Name: keep **AAA Insights** (working title) · **build survey engine natively** · **English-only** MVP ·
  **GDPR + CCPA** · **~5,000-response** target · model/hosting **provider-abstracted** (US residency avail.,
  no lock-in) · pricing **hybrid tiered + usage** · **no design partner yet** (generic MVP).
- Competitors **generic & configurable** · **CSV-first** collection (web only after legal sign-off) ·
  retention **per-account, 24-mo default**.
- **Brand Love** grounded in Batra/Ahuvia/Bagozzi (2012); scale **Love / Like / Ambivalence / Dislike /
  Hate**; Love Index = %(Love+Like) − %(Dislike+Hate). **Brand Trust** grounded in Wardani & Gustia (2016)
  + Nobre (2011) + Mayer et al. (1995); MVP = **single-item + inferred trust** (driver battery fast-follow);
  drivers = reliability/integrity/benevolence/security-privacy; Trust Index = %positive − %negative.
- INV-12 keeps Love and Trust distinct indicators.

### Still pending (non-blocking)
Named first design partner (D-8) and the named legal sign-off owner for live web collection (D-11).
Neither blocks approval or the MVP build.

---

## 4. Repository layout

```
aaa-insights/
├── CLAUDE.md                     # this file — read first
├── README.md                     # short project overview
├── AAA_Insights_PRD.docx/.pdf    # formal branded PRD (generated from docs/01_requirements.md)
├── build_docx.js                 # generator for the branded Word doc (keep in sync with the spec)
├── docs/
│   ├── 01_requirements.md        # Phase 1 — Requirements v7 (SOURCE OF TRUTH; §12 data model, §15 resolutions)
│   └── … (phase templates 02, 03, 05, known_limitations, maintenance_guide, architecture_overview, runbook)
├── research/                     # annotated knowledge library (brand love, trust, loyalty, GEO)
├── src/                          # Phase 4 implementation (empty until spec approved)
└── tests/                        # Phase 3 test suite (written before src/)
```

**Requirement IDs** are the connective tissue: R- (behaviors), INV- (invariants), E- (edge cases),
X- (exclusions), DPS- (data/privacy), NFR- (non-functional), O-/I- (outputs/inputs), Q- (open questions).
When you change behavior, change the spec (bump the version) first. **`build_docx.js` duplicates the spec's
content — update it alongside `docs/01_requirements.md`, then regenerate.**

---

## 5. Regenerating the formal PRD

```bash
node build_docx.js                                              # writes AAA_Insights_PRD.docx
python <docx-skill>/scripts/office/soffice.py --headless --convert-to pdf AAA_Insights_PRD.docx
```

Edit `docs/01_requirements.md` as the source of truth, mirror changes into `build_docx.js`, then regenerate.

---

## 6. Working agreements

- **Spec before build.** Don't write `src/` until the PRD is approved and tests exist (Gate 3).
- **Tests are the definition of done.** Every requirement ID gets at least one test.
- **Lawful & ethical collection.** Honor DPS-7; no live web collection before legal sign-off.
- **Love and Trust stay distinct** (INV-12); neither is collapsed into satisfaction.
- **Honest limitations. Leave no black boxes. Secrets stay out of git** (see `.gitignore`).

---

## 7. Source control & workflow

- GitHub: **github.com/pmj7671/aaa-insights** (private). Working repo is **`C:\Dev\aaa-insights`** (off
  OneDrive). Commit via **GitHub Desktop** (Summary → Commit to main → Push origin).
- Claude drops updated files into `C:\Dev\aaa-insights`; Paul commits + pushes. Claude cannot push from the
  cloud (read-only GitHub connector) but can read to verify.

## 8. Change log

- **2026-08-14 (Phase 4 — increment 20, persistence layer — start of the infra tier)** — First infrastructure
  slice: added a storage boundary under the (unchanged) domain. `src/persistence/ports.ts` defines the
  `FeedbackRepository` port with tenant isolation baked into its shape (every read/delete takes `accountId`,
  INV-6) and tombstone semantics (`delete` tombstones; `save` refuses a tombstoned id, INV-7).
  `memoryFeedbackRepository.ts` (in-memory, for tests/offline) and `pgFeedbackRepository.ts` (Postgres 16 +
  pgvector — race-free tombstone-guarded upsert, per-statement account filter, transactional delete) both
  implement it; `schema.sql` is the DDL (tenant columns, provenance for DSR, UTC timestamps, a nullable
  `vector(1536)` column for future semantic retrieval of R-17). A **shared conformance contract**
  (`tests/persistence/feedbackRepositoryContract.ts`) runs against BOTH adapters so they behave identically;
  the Postgres run is an integration test gated on `AAA_TEST_DATABASE_URL` and skips cleanly on CI without a
  database. Added `pg` (dep) + `@types/pg` (dev). **175 tests green** (+7 in-memory contract; +7 more when
  Postgres is configured), tsc clean, gate GREEN. No NEW requirement IDs (this reinforces INV-6/INV-7 at the
  storage boundary and lays the groundwork for DPS-2 encryption-at-rest and NFR-3/NFR-9 durability, which
  close with infra config). Still **65 requirement IDs + all 7 exclusions.** Local dev: `initdb` a cluster,
  `CREATE EXTENSION vector`, set `AAA_TEST_DATABASE_URL=postgresql://<user>@/<db>?host=/tmp&port=5433`.
  Next infra slices: repositories for cases/contacts/competitors, then the HTTP API surface, live
  provider/collection wiring, and admin auth (R-42); then Phase 5 VERIFY.
- **2026-08-14 (Phase 4 — increment 19, grounded NL "ask your data" query)** — Built `src/domain/nlQuery.ts`
  (**R-17/INV-6/E-8/NFR-6**): `retrieveEvidence` scopes retrieval to ONE account (INV-6 isolation by
  construction — a query naming another tenant still only sees its own records) and `answerQuery` returns a
  grounded answer with per-record citations + snippets and a confidence signal (NFR-6); when the account's
  data can't answer, `supported: false` with a caveat (E-8), and thin single-response evidence lowers
  confidence and flags the limit. Prose generation plugs in behind a `GroundedAnswerer` seam (Claude via the
  LLM gateway in production; deterministic baseline for tests) that only ever receives account-scoped
  evidence, and a runtime invariant asserts no citation leaks across the tenant boundary. Closed R-17, INV-6,
  E-8. **168 tests green** (+7), tsc clean, gate GREEN — **65 requirement IDs + all 7 exclusions closed.**
  The feature/domain layer is now essentially complete; the only remaining feature item is admin auth (R-42,
  infra-tied). Remaining: the DPS/NFR operational items, the infrastructure tier (persistence, HTTP API,
  lawful-collection wiring, admin auth), and Phase 5 VERIFY.
- **2026-08-14 (Phase 4 — increment 18, account export/delete + DSR + retention hold)** — Built
  `src/domain/accountData.ts` (**R-23/INV-7/DPS-3/DPS-5**): an `AccountData` bundle with `exportAccountData`
  (portable, provenance-preserving snapshot of all account data), `deleteResponse` / `deleteBySource`
  (single response or a whole survey/campaign — unlinks from RecoveryCases and drops emptied cases, INV-7
  propagation), a tombstone ledger so deleted data never reappears even via re-import (INV-7),
  `eraseByProvenance` (data-subject erasure for own respondents and ingested third-party review authors
  alike, DPS-3), and `deleteAllAccountData` (full purge that HOLDS open cases + their baseline records past
  deletion until each case closes, DPS-5). Closed R-23, INV-7, DPS-3. **161 tests green** (+7), tsc clean,
  gate GREEN — **62 requirement IDs + all 7 exclusions closed.** Remaining domain items: R-17 (grounded NL
  query), admin auth (R-42); then remaining edges (mostly infra-tied or VERIFY), the DPS/NFR operational
  items, the infrastructure tier (persistence, HTTP API, lawful-collection wiring), and Phase 5 VERIFY.
- **2026-08-14 (Phase 4 — increment 17, lawful collection + competitors + exclusions)** — Built
  `src/domain/collectionPolicy.ts` (**R-25/DPS-7/X-3/INV-10**: `collectionDecision(source)` gate — web
  sources require public + no-auth + no-paywall + robots-allowed + terms-allow + legal sign-off; licensed
  provider/API/CSV allowed when terms permit), `src/domain/competitors.ts` (**R-24**: competitor config —
  add/remove de-duped by brandId, list tracked, match brand by name/alias) and `src/domain/boundaries.ts`
  (**X-1…X-7**: explicit out-of-scope guard functions — no general identity profile, no external-tool push,
  no future-outcome prediction, no respondent panel, decision-support-only, no re-identification of scraped
  reviewers). Closed R-24, R-25 and X-1–X-7. **154 tests green** (+14), tsc clean, gate GREEN — **60
  requirement IDs + all 7 exclusions closed.** Remaining: R-17 (NL query), R-23 (delete/export account),
  admin auth (R-42), remaining edges (E-2/7/8/9/10/12/13/14/16/17/18 — mostly infra-tied or VERIFY), the
  DPS/NFR operational items, then the infrastructure tier (persistence, HTTP API, lawful-collection wiring)
  and Phase 5 VERIFY.
- **2026-08-14 (Phase 4 — increment 16, edge-case cluster)** — Built `src/domain/dataQuality.ts` (**E-1**
  sample adequacy, **E-3** junk/abuse flags, **E-4** non-English detection → set aside), `concurrency.ts`
  (**E-11** optimistic version/conflict — no silent overwrite) and `periods.ts` (**E-22** UTC day bounds in
  the account timezone + prior period). Closed E-1, E-3, E-4, E-11, E-22. **140 tests green** (+9), tsc clean,
  gate GREEN — **58 requirement IDs closed.** Remaining edges (E-2/7/8/9/10/12/13/14/16/17/18) are mostly
  tied to infra behaviors (conversation, collection, notifications) or fold into VERIFY; plus R-17/23/24/25,
  admin auth (R-42), exclusions X-1–X-7 (negative tests), persistence/API.
- **2026-08-14 (Phase 4 — increment 15, roles + report + export)** — Built `src/domain/roles.ts` (**R-21**:
  Owner/Admin + Member permission matrix + composable case-owner designation), `src/domain/insightReport.ts`
  (**R-18/O-5**: assemble headline/metrics/themes + rank actions from signals; honest "no stated data"
  headline), `src/domain/exportCsv.ts` (**R-22**: RFC-4180 CSV of any view). Closed R-18, R-21, R-22. **131
  tests green** (+11), tsc clean, gate GREEN — **53 requirement IDs closed.** Remaining: R-17 (NL query),
  R-23 (delete/export account), R-24/R-25 (competitor config/lawful collection), small edges
  (E-1/3/4/8/10/11/12/16/17/18/22), exclusions X-1–X-7 (negative tests), infra (persistence/API, admin auth
  R-42), NFR/DPS operational (VERIFY-phase).
- **2026-08-14 (Phase 4 — increment 14, hub query surface)** — Built `src/domain/feedbackQuery.ts`:
  `applyFilter` over FeedbackRecords by brand/source/date/segment/rating (**R-12**), `unifiedCustomerView`
  aggregate-by-segment counts with **no identity profile** (**R-26/INV-9**), `perCompetitorAnalysis` aggregate
  + traceable recordIds, filterable (**R-28/R-29/INV-3**). Closed R-12, R-26, R-28, R-29. **120 tests green**
  (+6), tsc clean, gate GREEN — **50 requirement IDs closed** (milestone). Remaining: infra (persistence/API,
  admin auth R-42, lawful collection R-25, competitor config R-24), reporting/query/export/roles
  (R-17/18/22/23/21), small edges, exclusions (negative tests), NFR/DPS operational (VERIFY-phase).
- **2026-08-13 (Phase 4 — increment 13, PII redaction + secrets)** — Built `src/domain/pii.ts` (detect +
  redact email/phone/SSN/credit-card/IP before analysis or surfacing — **R-44/INV-8**) and
  `src/domain/secrets.ts` (opaque **SecretRef** by name, **SecretVault** seam = Secret Manager in prod,
  `redactSecrets` scrub for logs/exports — **R-43/DPS-11**). Closed R-43, R-44, INV-8. **114 tests green**
  (+6), tsc clean, gate GREEN — **46 requirement IDs closed** (~half the spec). Remaining is the infra tier:
  persistence/API, admin auth (R-42), lawful collection (R-25), per-competitor (R-28/29), unified-customer
  view (R-26), insight report/query/export/roles (R-17/18/22/23/21), plus small edges (E-1/3/4/8/10/11/12/
  13/16/17/18/22), NFR/DPS operational items, exclusions (negative tests). These need DB/HTTP scaffolding
  or are VERIFY-phase.
- **2026-08-13 (Phase 4 — increment 12, Strengths & Gripes + benchmark)** — Built `src/domain/aspects.ts`
  (**R-48/O-18**: aspect strengths/gripes tally, net, volume, traceable recordIds, association-not-causation
  label; AspectExtractor seam), `baselineAspects.ts` (lexicon extractor, configurable taxonomy), and
  `benchmark.ts` (**R-27/O-9**: own-vs-competitor across Love/Trust/rating/neg-sentiment with deltas; **E-14**
  null rather than a fabricated number). Closed R-27, R-48. **108 tests green** (+7), tsc clean, gate GREEN —
  **43 requirement IDs closed.** Remaining: per-competitor deep-dive (R-28/R-29), lawful collection (R-25),
  insight report/query/export/roles (R-17/18/22/23/26/21), infra (persistence/API, admin auth R-42, secrets
  R-43, PII redaction R-44), plus small edges.
- **2026-08-13 (Phase 4 — increment 11, classifiers on the seams)** — Built `src/domain/baselineSentiment.ts`
  and `baselineEmotion.ts` (deterministic lexicon classifiers implementing the SentimentClassifier /
  EmotionClassifier seams — real impls, production swaps Claude via the gateway) and `src/domain/analyzeText.ts`
  (**R-15**: assign sentiment to each response + aggregate; **R-46**: detect emotions per record → profile).
  Closed R-15, R-46 — the flagship AI analysis now runs **end-to-end** with a swappable baseline. **101 tests
  green** (+4), tsc clean, gate GREEN — **41 requirement IDs closed.** Next: Strengths & Gripes / aspect
  analysis (R-48), competitive benchmark (R-27), or infra (persistence/API, admin auth, secrets, PII redaction).
- **2026-08-13 (Phase 4 — increment 10, LLM gateway + abuse defense)** — Built `src/domain/abuseDefense.ts`
  (token-bucket rate limiter, one-response-per-link tokens, duplication signatures — **R-41**, no CAPTCHA) and
  `src/domain/llmGateway.ts` (**LLMProvider seam** for Claude-via-Vertex, per-link token-budget cost ceiling,
  output SafetyChecker, bounded ConversationSession — **R-45**). Deterministic stub provider in tests. Closed
  R-41, R-45. **97 tests green** (+8), tsc clean, gate GREEN — **39 requirement IDs closed.** The gateway is
  the seam the sentiment/emotion/theme classifiers plug into; wiring a real (or baseline) classifier next
  closes R-15/R-46 end-to-end. Remaining: classifiers on the gateway, persistence/API, admin auth (R-42),
  secrets vault (R-43), PII redaction (R-44), competitive collection, plus small pure edges.
- **2026-08-13 (Phase 4 — increment 9, consent + recovery measurement)** — Built `src/domain/contact.ts`
  (**R-34** opt-in contact, **E-23** age gate refusal, **INV-13** consent-gated + withdrawable; first-party
  only) and `src/domain/recoveryMeasure.ts` (**R-38/O-15** before/after delta + cohort recovery_rate, **E-20**
  "not yet measurable" below min sample). Closed R-34, R-38, E-20, E-23, INV-13. **89 tests green** (+8), tsc
  clean, gate GREEN — **37 requirement IDs closed.** (Safety loop caught a test-data miscount — code was
  right, test fixed.) Remaining is mostly infra/AI: LLM gateway, persistence/API, competitive collection,
  security endpoints (R-41/42/43/44/45), plus a few smaller pure edges.
- **2026-08-13 (Phase 4 — increment 8, traceability spine)** — Built `src/domain/traceability.ts`: generic
  `buildTraceIndex` (group recordIds by any key — Love label, Trust bucket, sentiment polarity, theme — with
  dedup), `openTrace` (open a read to its exact underlying responses), `isTraceable`/`assertTraceable` guards.
  Closes **R-16** and **INV-3** (the "every claim opens its verbatims" guarantee). **81 tests green** (+6),
  tsc clean, gate GREEN — **32 requirement IDs closed.** Next: LLM-gateway seam (real classifiers) or
  persistence/API.
- **2026-08-13 (Phase 4 — increment 7, themes + alerts)** — Built `src/domain/themes.ts` (**R-14/O-2**:
  aggregate theme assignments → counts, share, de-duplicated representative quotes, and **recordIds for
  traceability** — the INV-3/R-16 spine; ThemeExtractor seam) and `src/domain/alerts.ts` (**R-20/O-7**:
  threshold crossing above/below, disabled/null-safe, batch evaluation). Closed R-14, R-20. **75 tests green**
  (+8), tsc clean, gate GREEN — **30 requirement IDs closed.** Next pure-ish: retrofit traceability across
  aggregates to close R-16/INV-3, or begin the LLM-gateway seam.
- **2026-08-13 (Phase 4 — increment 6, CSV import)** — Built `src/domain/feedbackRecord.ts` (unified record +
  **INV-1** attribution: exactly one brand + one source) and `src/domain/csvImport.ts` (RFC-4180 CSV parser,
  column mapping to the unified schema — **R-11**, per-row error report with partial acceptance — **E-5**;
  normalises ratings/Brand Love via existing modules). Closed R-11, E-5, INV-1. **67 tests green** (+8), tsc
  clean, gate GREEN — **28 requirement IDs closed.** *(Cloud container was reclaimed over the break; restored
  the full workspace from `C:\Dev\aaa-insights` via the device bridge, re-`npm install`ed, re-init'd local git
  for snapshots. No work lost — GitHub + C:\Dev are the durable backups. The in-progress increment-6 files
  survived in the workspace.)*
- **2026-08-11 (Phase 4 — increment 5, recovery domain)** — Built `src/domain/recovery.ts`: dissatisfaction
  trigger evaluation (**R-35**), RecoveryCase lifecycle transitions (**R-36**), the contactable-vs-anonymous
  case-kind boundary (D-C/INV-9 — only consented first-party is contactable; public/competitor → anonymous
  triage), case grouping/throttle (**E-21**), prioritisation (**R-40**), stale-case escalation (**E-19**).
  Closed R-35, R-36, R-40, E-19, E-21. **59 tests green** (+9), tsc clean, gate GREEN — **25 requirement IDs
  closed.** (One test-bug caught + fixed via the safety loop: a grouping-test signal lacked a dissatisfaction
  indicator so no case opened — corrected.) Remaining work leans on infra/AI: LLM gateway (live classifiers),
  persistence/API, CSV import, competitive collection.
- **2026-08-11 (Phase 4 — increment 4, AI seam)** — Built `src/domain/sentiment.ts` (Sentiment type,
  **SentimentClassifier** interface = the LLM seam, confidence-floor aggregation — E-26) and
  `src/domain/emotion.ts` (compact ~7 **headline emotion taxonomy** + sub-emotion rollup D-17,
  **EmotionClassifier** seam, `emotionProfile` with no-signal bucket, mixed-emotion counting, low-confidence
  exclusion, always-inferred companion). Closed **E-25, E-26, E-27, INV-15, INV-16**. **50 tests green**
  (+10), tsc clean, gate GREEN. **R-15 (sentiment assign) and R-46 (emotion detect) stay pending** — their
  aggregation cores + interfaces are built; the live model wires in when the LLM gateway is implemented.
  **20 requirement IDs now closed.** Natural pause point: next up is either wiring the LLM gateway (real
  classifiers) or the persistence/API layer — both step beyond pure domain logic into infrastructure.
- **2026-08-11 (Phase 4 — increment 3)** — Built `src/domain/survey.ts`: question types incl. Brand Love
  scale + Trust battery (**R-1**), conditional show/skip logic (**R-3**), Trust question type single-item +
  optional four-driver battery (**R-31**), plus structural survey validation. Closed R-1, R-3, R-31. **40
  tests green** (+8), tsc clean, gate GREEN. Requirements closed so far: R-1, R-3, R-13, R-19, R-30, R-31,
  R-32, R-33, INV-2, INV-4, INV-12, INV-14, E-6, E-15, E-24 (15 IDs). Remaining pure-domain candidates thin
  out here — next steps involve the AI seam (sentiment R-15, emotion R-46 behind a classifier interface) or
  persistence/API behaviors.
- **2026-08-11 (Phase 4 — increment 2)** — Built `src/domain/segmentation.ts` (**R-33/O-13**: four Love×Trust
  quadrants + action each; **INV-12** — the two axes stay distinct) and `src/domain/surveyMetrics.ts`
  (**R-19/O-4**: response/completion rate, NPS, CSAT) with inline INV-2 guards. Closed R-33, R-19, INV-12 in
  `pending.test.ts`. **32 tests green** (+10), tsc clean, gate GREEN. Still pure-domain (no infra). Next
  candidates: sentiment aggregation (R-15) or theme structures (R-14) behind a classifier interface, or the
  survey-definition domain (R-1/R-3).
- **2026-08-11 (Phase 4 — IMPLEMENT increment 1)** — Scaffolded the build: **TypeScript + Vitest** (`package.json`,
  `tsconfig.json`, `vitest.config.ts`). Ported the pytest reference suite to **Vitest** (retired the `.py`
  stubs); `tests/pending.test.ts` holds every not-yet-built behavior as a `todo` (one per requirement ID).
  Built the **analysis-core slice** (`src/domain/`): Brand Love stated-only Index + unknown handling
  (R-30/INV-4/INV-14/E-24/F-12), Trust Index (R-32), rating normalisation (E-15), metric-count guards (INV-2),
  dedup (R-13/E-6) — with inline runtime invariant assertions. **22 tests green, tsc clean, gate GREEN.** Next
  increment: theme/sentiment structures or the survey-definition domain. Build happens in the cloud workspace,
  synced to C:\Dev. **Runner is now `npm test` (Vitest), not pytest.**
- **2026-08-11 (v7.1 — NFR targets confirmed)** — Closed F-15: NFR-2 p95 ≤ 60 s, NFR-3 99.9% uptime, NFR-8
  trigger ≤ 60 s, NFR-9 tightened to RPO ≤ 1 h / RTO ≤ 8 h (from 24 h). Removed all `(confirm)` markers across
  spec / test plan / tests; regenerated branded docx/pdf (22 pp, gate GREEN). Vendored AAA logo → `assets/` and
  fixed `build_docx.js` logo path (skills relocated to `skills/synced/`).
- **2026-08-04 (Research library +2)** — Added two Brand Love papers: **Fetscherin (2014, JCM)** — brand love
  as a one-directional *parasocial* bond; love precedes loyalty, drives purchase intention + WOM (supports
  O-11 as leading indicator, R-39 advocacy). **Maheshwari, Lodorfos & Jacobsen (2014, IJBA)** — affective
  experience drives loyalty, *continuance/lock-in does not* (supports emotion pillar O-17/R-46, Strengths &
  Gripes O-18, INV-12). Annotated under Brand Love theme. Third upload (Ghani & Tuhin 2016) was a **duplicate**
  of an existing library item — not re-filed. Fixed a stale "Ambiguity"→"Ambivalence" reference in the README.
- **2026-08-04 (Business model & pricing)** — `docs/business_model.md` v0.1 — **living** commercial artifact,
  separate from the product spec. Model: **B2B SaaS hybrid tiered+usage** (grounds D-7). Four tiers (Starter
  $149 / Growth $399 / Pro $899 / Enterprise custom), generous included response allowances + ~$30–40/1,000
  overage, ~85–90% gross margin. Positioning: "an AI research analyst for companies without a research team,"
  priced vs. analyst/agency/enterprise-CX. **Linkage rule:** pricing strategy stays out of the spec; when a
  pricing decision needs a product capability (metering, tier limits, feature gating, billing) it becomes an
  R- in the spec. Numbers are hypotheses pending WTP validation with design partners (D-8).
- **2026-08-04 (Cost model)** — `docs/cost_model.md` v1. Marginal AI ≈ $0.004/response (Haiku 4.5), fixed floor
  ≈ $100–200/mo (Cloud SQL-led). Three scenarios (Pilot/Growing/Scaling). Grounds hybrid tiered+usage pricing
  (D-7); margins healthy at $99–299/acct/mo. Prices web-sourced (Claude/BenchLM, Cloud Run, Cloud SQL), current
  2026-08-04, flagged as drifting. Rough (±50%) pre-build estimate.
- **2026-07-30 (Architecture / Tech Design)** — `docs/architecture_overview.md` v1. Stack: GCP (Cloud Run,
  Cloud SQL Postgres+pgvector, Tasks/PubSub, Storage, Identity Platform, DLP, Secret Manager, Cloud Armor),
  TypeScript end-to-end (Next.js/Node/Prisma), Claude via Vertex AI behind an LLM gateway + Vertex embeddings,
  Vitest/Playwright/k6. Low-ops-now, container-portable. Chosen with Paul (GCP, Claude, greenfield, non-tech
  maintainer to start). Unblocks Phase 4 IMPLEMENT.
- **2026-07-30 (Phase 3 — TEST FIRST)** — v7 **approved** (Paul: proceed to TEST FIRST). Derived the test
  suite from v7: `docs/03_test_plan.md` (traceability tables for every R-/INV-/E-/DPS-/NFR-/X- ID + AC-1–AC-7)
  and `tests/` (14 pytest files, 130 behavior-named tests, requirement ID in each docstring, README + conftest).
  Tests skipped/pending until IMPLEMENT. `gate_check.py` GREEN — all 93 R-/INV-/E- IDs traced. Harness = pytest
  (reference only); product stack deferred to Architecture. Earlier this session Paul confirmed: security
  belongs in the PRD as requirements (already there); testing = its own phase (this); tech stack = Architecture.
- **2026-07-30 (v7 — Emotion & Experience pillar)** — Added an **emotion analysis** lens (emotion profile
  O-17, drill-down R-46/R-47) and an explicit **Strengths & Gripes** aspect-based pros/cons output (O-18,
  R-48), both with **own-vs-competitor comparison** (O-19, R-49) and a transparency requirement (R-50). New
  invariants INV-15/INV-16 (inferred companion signals, never blended; distinct lens; association ≠
  causation); edge cases E-25–E-27; Emotion + AspectSentiment records + MetricSnapshot metrics; principle 9.
  Decisions D-17 (compact ~7-emotion headline rolling up finer sub-emotions) and D-18 (own-brand MVP,
  competitive Phase 1). Fixed a latent generator bug (unpushed `body()` paragraphs incl. Purpose prose).
  Regenerated branded docx/pdf (22 pp).
- **2026-07-27 (v6 — CHALLENGE folded in)** — Requirements **v6**: all 19 CHALLENGE findings resolved.
  Decisions D-A–D-G applied — internal-only recovery loop (D-E: Connector/external_ref removed, R-37
  internal, X-2/DPS-10 revised); RecoveryCase as sole consented INV-9 exception (D-A/D-B; INV-9 amended);
  first-party-only case-opening (D-C); audience-neutral review prompts (D-D); stated-only headline Index +
  inferred companion, "unknown" ≠ Ambivalence (D-G; INV-14, INV-4); erasure for scraped review authors
  (D-F; DPS-3). Added security/privacy R-41–R-45 + DPS-11; edge E-21–E-24; case-owner in R-21; NFR-2/3/8/9
  concrete targets marked "(confirm)". New §15 resolutions table. Regenerated branded docx/pdf (19 pp).
- **2026-07-27 (Phase 2 CHALLENGE)** — Delivered `docs/02_spec_review_report.md`: 19 findings. F-1–F-7 need
  client decisions (D-A–D-G, mostly the closed-loop identity/consent/legal tensions); F-8–F-19 (security,
  data-integrity, edge) fold into v6. Awaiting Paul's decisions → then Requirements v6 → TEST FIRST.
- **2026-07-27 (v5)** — Added the **Closed-Loop / Service Recovery** pillar (posture #2, architected for #3):
  opt-in contactability (I-10, R-34), triggers (R-35), RecoveryCase + lifecycle owned internally (R-36),
  integrations/hand-off (R-37), recovery measurement (R-38, O-15), reinforcement (R-39), prioritization
  (R-40); INV-13 consent-gated; DPS-10; data-model Contact/Trigger/RecoveryCase/Connector; E-17–E-20;
  X-2 revised; D-16. Roadmap: starter loop in MVP, full loop Phase 1, native workbench (#3) Phase 2+.
- **2026-07-27 (v4)** — Resolved all 15 §14 open questions → a Decisions table (D-1…D-15). Set MVP scope
  (English-only, GDPR+CCPA, ~5k, native build, CSV-first, per-account retention, hybrid pricing, provider-
  abstracted hosting; DPS-8/DPS-9 added). Changed Brand Love middle label **"Ambiguity" → "Ambivalence"**.
  Spec now "ready for approval." Regenerated branded docx/pdf.
- **2026-07-14 (v3)** — Trust extension: Trust question type (R-31), Trust Index + drivers (O-12, R-32),
  Love × Trust segmentation (O-13, R-33), INV-12 (Love/Trust distinct), data-model Trust fields, E-16,
  Q-14/Q-15. Added a Brand Trust theme to research/. Regenerated branded docx/pdf.
- **2026-07-14** — Expanded research library: Nobre (2011), Ghani & Tuhin (2016), Wardani & Gustia (2016),
  two Google/YouTube GEO pieces. Moved repo off OneDrive to `C:\Dev`; adopted GitHub Desktop.
- **2026-07-13 (v2)** — Unified-customer view, competitors, lawful collection (DPS-7), Brand Love, data
  model. **2026-07-13 (v1)** — Repo created; Phase 1 SPECIFY; Ahuvia + BCG research.
