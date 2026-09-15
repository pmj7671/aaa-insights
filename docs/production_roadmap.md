# Production Roadmap: AAA Insights

**Version:** v1 | **Date:** 2026-09-15 | **Basis:** current build state (Phase 4 IMPLEMENT), Requirements v7.1
**Prepared by:** Active AI Advisors | **Prepared for:** Paul Jamieson

This roadmap takes AAA Insights from where it stands today to a production pilot. It assumes one build
model: Claude generates the code, Paul reviews, commits, and deploys. It targets a demoable MVP first, then
hardens that MVP to production. Time estimates are elapsed calendar time at our current working cadence, not
person-hours. Code generation is fast. The real pace-setters are the review-and-deploy loop and a few
external waits (quota grants, Google Cloud provisioning, design-partner scheduling).

---

## Where we stand today

The backend is built and live. The user interface does not exist yet.

- **Domain, API, and data layers are complete and tested.** 251 test cases across 57 files. Every
  feature-level requirement in the spec is implemented at the domain layer.
- **The service runs on Google Cloud.** Real HTTP requests reach business logic and Cloud SQL, in
  production, today. Cloud Run, Cloud SQL (Postgres 16 + pgvector), Secret Manager, and Artifact Registry
  are all standing.
- **Claude is 90% wired.** The grounded query answerer is deployed against Vertex. It waits on one quota
  grant for Claude Sonnet 4.5 in us-east5. Until then it falls back to a deterministic baseline, so the
  service stays up with no downtime.
- **No front-end.** There are zero UI files. Today only a developer with an access token can reach the
  product. No customer can see or use it.
- **AI analysis runs on baselines.** Sentiment, emotion, and aspect extraction use keyword classifiers
  behind swap-in seams, not Claude.

The hard, invisible tier is done. What stands between us and a product a person can use is the front-end,
the real AI wiring, auth, and the closing verification.

---

## The two horizons

Horizon 1 gets us something clickable. Horizon 2 makes it safe for real customer data.

### Milestone summary

| # | Milestone | Horizon | Rough elapsed time | Gated by |
|---|-----------|---------|--------------------|----------|
| M1 | Claude live (grounded query) | Demoable MVP | Days (in flight) | Quota grant |
| M2 | Real AI analysis (classifiers + embeddings) | Demoable MVP | 1–2 weeks | Review cadence |
| M3 | Thin admin console over the API | Demoable MVP | 2–3 weeks | Review cadence |
| M4 | Respondent survey + conversational capture | Demoable MVP | 2–3 weeks | Review cadence |
| M5 | Real admin login (Identity Platform) | Production | ~1 week | GCP setup |
| M6 | Production hardening (DLP, edge, latency) | Production | 1–2 weeks | GCP setup |
| M7 | Phase 5 VERIFY | Production | 1–2 weeks | Review cadence |
| M8 | Phase 6 DOCUMENT | Production | ~1 week | Review cadence |
| M9 | Phase 7 DEPLOY (pilot go-live) | Production | ~1 week | Design partner |

---

## Horizon 1: Demoable MVP

Goal: Paul and a design partner run a survey, feedback flows in, Claude analyzes it, and a dashboard shows
the Brand Love read, the Trust read, the emotion profile, Strengths and Gripes, and the insight report.

### M1. Claude live (in flight)

The grounded query returns real Claude prose instead of the baseline. This needs the pending quota grant,
then one env-only redeploy and a check. No new code. See the "Resume tomorrow" note in CLAUDE.md.

### M2. Real AI analysis

Wire the three classifier seams to Claude: sentiment (R-15), emotion (R-46), and aspect extraction (R-48).
Add Vertex embeddings so semantic retrieval uses the pgvector column that already exists. This is the step
that turns "it runs" into "it reads feedback like an analyst." Each classifier keeps its baseline as a
fallback, so a model failure never breaks a request. We test each against the same mock-provider pattern
already in the suite.

### M3. Thin admin console

Build a small web console over the API that already exists. Screens for the first pass:

1. Sign in (a light gate at this stage, real SSO comes in M5).
2. Import or submit feedback for an account.
3. Run an "ask your data" query and read the grounded answer with citations.
4. View the account dashboard: Brand Love Index, Trust Index, the emotion profile, Strengths and Gripes,
   and the insight report.

This is the first thing you can click. It reuses every endpoint we have built, so the work is presentation,
not new logic.

### M4. Respondent survey and conversational capture

Build the public-facing capture path so data enters through the product, not CSV or curl. The first pass
covers a basic survey page and the conversational interview MVP (R-4, R-7 to R-9). Respondents stay
anonymous and need no login (INV-5).

**End of Horizon 1: a demoable MVP.** A design partner runs a real survey. Feedback arrives. Claude analyzes
it. The dashboard shows the reads. This is the version you show, not the version you sell.

---

## Horizon 2: Harden to production

Goal: the MVP holds real customer data safely and meets the numbers in the spec.

### M5. Real admin login

Wire Identity Platform SSO and MFA into the deployed service (R-42, DPS-11). The auth logic is already
built and tested. This connects it to a real identity provider and replaces the light gate from M3.

### M6. Production hardening

- PII redaction with Cloud DLP before any text is analyzed or shown (R-44, INV-8).
- Edge protection with Cloud Armor and one-time links, no CAPTCHA wall (R-41).
- A minimum-instance setting on the respondent path so surveys stay fast (NFR-1).
- A secrets and config review before real data lands.

### M7. Phase 5 VERIFY

Run the verification phase of the Grounded AI method. Produce the verification report. Load-test the NFR
numbers with k6: analysis p95 at or under 60 seconds (NFR-2), uptime target (NFR-3), recovery targets
(NFR-9). Audit accessibility to WCAG 2.1 AA. Review security and tenant isolation (INV-6). Fix what the
tests find.

### M8. Phase 6 DOCUMENT

Assemble the delivery package: the deployment runbook, the maintenance guide, the known-limitations
register, and basic user docs for the admin console.

### M9. Phase 7 DEPLOY

Go live for a pilot: a custom domain, monitoring and alerting, verified backups, and one real pilot
account. This is the first production customer.

**End of Horizon 2: a production pilot.** The MVP scope goes live: own-customer analysis, Brand Love, Trust,
the emotion profile, and the unified customer view, on real data behind real auth.

---

## What this does not include

These are already scoped as post-MVP in the spec. They are not part of the road to the first production
pilot.

- **Competitive collection.** Lawful public-review ingestion sits behind the DPS-7 legal sign-off gate. It
  is a Phase 1 item with its own mini-design.
- **The full closed-loop recovery workbench.** The MVP ships the starter recovery loop. The native
  workbench is a later phase.
- **The Trust driver battery and advanced emotion drill-downs.** Fast-follows after the MVP proves out.

---

## Honest read on timing

At our current cadence, a demoable MVP is roughly 6 to 8 weeks of focused work from today. A production
pilot is roughly 5 to 7 weeks beyond that. Call it on the order of three months elapsed to a first
production customer.

Three things drive that number, and only one is code:

1. **The front-end is the biggest lift and the least like what we have built.** Most of the estimate risk
   lives in M3 and M4.
2. **The loop passes through you.** Every change moves through your review, your GitHub Desktop push, and a
   Cloud Shell deploy. Steady sessions keep the number honest. Long gaps stretch it.
3. **A few external waits are outside our control.** Quota grants, Google Cloud provisioning, Identity
   Platform setup, and design-partner scheduling each add days, not hours.

The build model stays disciplined. Each new tier still runs the Grounded AI loop: a short spec, tests
first, then the build, then verify. The front-ends get end-to-end and accessibility tests with Playwright.
"Claude builds" speeds the writing. It does not skip the gates.

---

## The next three actions

1. **Land the quota grant, then flip Claude on.** Run the check, then the one redeploy. This closes M1.
2. **Wire the classifiers and embeddings to Claude.** This is M2 and the highest-value step after the query.
3. **Stand up the thin admin console.** This is M3 and the first thing you can click.

*Prepared by Active AI Advisors under the Grounded AI™ method. This plan is reviewable and reversible. Tell
me what you would reorder, and we adjust.*
