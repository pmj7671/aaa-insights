# CLAUDE.md — AAA Insights

Project context and progress log for **AAA Insights**, a product by **Active AI Advisors**.
This file is the entry point for any Claude session (or teammate) working in this repo. Read it
first. Keep it current: when a phase completes or a decision is made, update the relevant section
and commit.

---

## 1. What we're building

A software service so companies can **survey** customers, collect **reviews, ratings, and comments**,
and **analyze** that feedback with AI for customer and consumer insight. The differentiated value is
what happens *after* feedback arrives — not the survey form, but the insight.

**Core differentiators (all four are in scope):**
1. AI theme + sentiment analysis over open text, at scale, with traceability to source responses.
2. Conversational, AI-led surveys that probe with follow-ups like a human interviewer.
3. A unified feedback hub — surveys, conversational transcripts, and imported reviews in one place.
4. Insight + recommendations — plain-language narratives and ranked actions, not just charts.

**Target customer:** SMB / mid-market companies (~10–500 employees) with no in-house research team.

**Company voice (Active AI Advisors):** lead with the verb, be specific, stay quiet, stay warm.
Say build/ship/deploy/workflow/test/invariant. Avoid revolutionary, game-changing, leverage, synergize.

---

## 2. How we work — Grounded AI™ (spec-driven, gated)

Development follows AAA's Grounded AI™ pipeline. **No phase starts until the previous artifact is
approved.** The gate can be fast, but it is never skipped.

| # | Phase | Artifact | Status |
|---|-------|----------|--------|
| 1 | SPECIFY | `docs/01_requirements.md` (PRD / Requirements v1) | ✅ Delivered 2026-07-13 — **awaiting client approval** |
| 2 | CHALLENGE | `docs/02_spec_review_report.md` | ⏳ Blocked on Gate 1 + §13 answers |
| 3 | TEST FIRST | `docs/03_test_plan.md` + `tests/` | ⏳ Not started |
| 4 | IMPLEMENT | `src/` (passing tests) | ⏳ Not started |
| 5 | VERIFY | `docs/05_verification_report.md` | ⏳ Not started |
| 6 | DOCUMENT | Delivery Package (`docs/known_limitations.md`, `docs/maintenance_guide.md`, `docs/architecture_overview.md`) | ⏳ Not started |
| 7 | DEPLOY | `docs/deployment_runbook.md` | ⏳ Not started |

**The safety loop (how we build and debug in phases 4–5):** plan → read & search → snapshot (git
commit) → patch → verify (run tests + diff) → roll back or advance. Commit only green states. A
branch per change; the test suite is the gate to merge.

---

## 3. Current status (2026-07-13)

- **Phase 1 (SPECIFY) complete.** Requirements v1 / PRD written and delivered in three formats:
  - `docs/01_requirements.md` — the canonical, versioned build spec (source of truth).
  - `AAA_Insights_PRD.docx` / `.pdf` — formal, AAA-branded copies for stakeholders.
- **Next action:** client (Paul) approves the PRD and answers the 9 open questions in §13 of the
  requirements doc. On approval → begin Phase 2 CHALLENGE.

### Scoping decisions locked (2026-07-13)
- Deliverable: both a Markdown build spec and a formal branded Word/PDF.
- Scope: **MVP + phased roadmap.** Phase 0 (MVP) is the only committed scope; Phases 1–3 are vision.
- Target: SMB / mid-market.
- All four differentiators above are core (conversational surveys + AI theme/sentiment both in the MVP).

### Open questions awaiting client decision (mirror of requirements §13)
Q1 product name · Q2 build-vs-buy the survey engine · Q3 AI model/hosting + data residency ·
Q4 language coverage · Q5 compliance targets (GDPR/CCPA/SOC 2) · Q6 MVP volume target ·
Q7 pricing model · Q8 first design partner · Q9 whether to build in a brand-love / emotional-
attachment research framework as an insight lens.

---

## 4. Repository layout

```
aaa-insights/
├── CLAUDE.md                     # this file — read first
├── README.md                     # short project overview
├── AAA_Insights_PRD.docx/.pdf    # formal branded PRD (generated from docs/01_requirements.md)
├── build_docx.js                 # generator for the branded Word doc
├── docs/
│   ├── 01_requirements.md        # Phase 1 — Requirements v1 (SOURCE OF TRUTH)
│   ├── 02_spec_review_report.md  # Phase 2 (template, not yet filled)
│   ├── 03_test_plan.md           # Phase 3 (template)
│   ├── 05_verification_report.md # Phase 5 (template)
│   ├── known_limitations.md      # Phase 6 (template)
│   ├── maintenance_guide.md      # Phase 6 (template)
│   ├── architecture_overview.md  # Phase 6 (template)
│   └── deployment_runbook.md     # Phase 7 (template)
├── research/                     # background inputs informing the product
│   ├── README.md
│   └── BCG_Loyalty_Programs_2024.pdf
├── src/                          # Phase 4 implementation (empty until spec approved)
└── tests/                        # Phase 3 test suite (written before src/)
```

**Requirement IDs** are the connective tissue: R- (behaviors), INV- (invariants), E- (edge cases),
X- (exclusions), Q- (open questions), plus O-/I-/NFR-/DPS-. Tests and code cite these IDs so any line
traces back to the spec. When you change behavior, change the spec (bump the version) first.

---

## 5. Regenerating the formal PRD

The Word/PDF are generated from the Markdown spec so they never drift:

```bash
node build_docx.js                                              # writes AAA_Insights_PRD.docx
python <docx-skill>/scripts/office/soffice.py --headless --convert-to pdf AAA_Insights_PRD.docx
```

Branding (Ink/Paper/Signal palette, Fraunces/Inter/JetBrains Mono) lives in the AAA brand guidelines
skill; the generator applies it. Keep `docs/01_requirements.md` as the edit surface, then regenerate.

---

## 6. Working agreements

- **Spec before build.** Don't write `src/` until the PRD is approved and tests exist (Gate 3).
- **Tests are the definition of done.** Every requirement ID gets at least one test.
- **Honest limitations.** Document what the system can't do as carefully as what it can.
- **Leave no black boxes.** Anything shipped must be explainable in plain English.
- **Secrets stay out of git.** No `.env`, keys, or tokens in history (see `.gitignore`).

---

## 7. Change log

- **2026-07-13** — Local git repo initialized and committed (Phase 1 SPECIFY: Requirements v1 / PRD,
  branded Word/PDF, BCG loyalty-programs research). **GitHub push pending** — push to
  `github.com/pmj7671/aaa-insights` from a machine with your own GitHub auth (see below). Awaiting
  client approval to proceed to Phase 2.

### Push to GitHub (run once, from your machine, in this folder)
```bash
# with GitHub CLI:
gh repo create pmj7671/aaa-insights --private --source=. --remote=origin --push
# or manually, after creating an empty repo named aaa-insights on github.com:
git remote add origin https://github.com/pmj7671/aaa-insights.git
git push -u origin main
```
