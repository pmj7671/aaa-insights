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
7. Insight + recommendations — plain-language narratives and ranked actions, not just charts.

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
| 1 | SPECIFY | `docs/01_requirements.md` (PRD / Requirements **v6**) | ✅ v6 delivered 2026-07-27 — CHALLENGE resolutions folded in, **ready for client approval** |
| 2 | CHALLENGE | `docs/02_spec_review_report.md` | ✅ Review report + all 19 findings resolved 2026-07-27 (D-A–D-G decided; F-8–F-19 folded → v6) |
| 3 | TEST FIRST | `docs/03_test_plan.md` + `tests/` | ⏳ Not started |
| 4 | IMPLEMENT | `src/` (passing tests) | ⏳ Not started |
| 5 | VERIFY | `docs/05_verification_report.md` | ⏳ Not started |
| 6 | DOCUMENT | Delivery Package | ⏳ Not started |
| 7 | DEPLOY | `docs/deployment_runbook.md` | ⏳ Not started |

**Safety loop (phases 4–5):** plan → read & search → snapshot (git commit) → patch → verify (tests + diff)
→ roll back or advance. Commit only green states; a branch per change; the suite gates merge.

---

## 3. Current status (2026-07-27)

- **Phase 1 (SPECIFY) at Requirements v6 — ready for approval.** v2 = unified-customer view + competitors +
  lawful collection + Brand Love + data model; v3 = Brand Trust; v4 = all 15 §14 decisions resolved +
  "Ambiguity" → "Ambivalence"; v5 = Closed-Loop / Service Recovery pillar; **v6 = all 19 CHALLENGE findings
  resolved** (Phase 2 folded in).
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
- **Next action:** Paul approves v6 → Phase 3 TEST FIRST (derive test suite from v6).

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
│   ├── 01_requirements.md        # Phase 1 — Requirements v6 (SOURCE OF TRUTH; §12 data model, §15 resolutions)
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
