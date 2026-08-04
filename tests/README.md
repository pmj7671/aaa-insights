# AAA Insights — Test Suite (TEST FIRST)

This directory is the **executable half** of Grounded AI™ Phase 3. The plain-English contract lives in
`../docs/03_test_plan.md`; the files here mirror it, one test function per row, each named for a **behavior**
and carrying its **requirement ID** (R-/INV-/E-/DPS-/NFR-/X-) in the docstring so every test traces back to
the spec.

## State: red-before-green (by design)

There is no implementation yet, so every test is **skipped** with the reason
`TEST FIRST: pending IMPLEMENT (Phase 4)`. Running the suite is green (skips, not failures) and confirms the
tests exist and are collected. This is the expected TEST FIRST state: the suite is the **target** the build
aims at. In Phase 4 (IMPLEMENT), each behavior is built and its test switched on and turned green — one
cluster at a time, via the safety loop.

## Running it

```bash
pip install pytest
pytest -q                     # collects and skips every test (green)
pytest -q --no-header -rs     # same, but list each skipped test with its reason
```

Verify the gate mechanically (tests exist + every requirement ID is referenced by a test):

```bash
python /path/to/skills/active-ai-advisors-app-dev/scripts/gate_check.py . --no-run
```

## Layout

| File | Covers |
|------|--------|
| `test_survey_creation.py` | R-1–R-6 — survey builder & distribution |
| `test_conversational.py` | R-7–R-10, R-45 — AI-led interviews & safety |
| `test_unified_hub.py` | R-11–R-13, R-26 — unified feedback hub |
| `test_brand_love_trust.py` | R-14–R-16, R-30–R-33 — Love, Trust, segmentation |
| `test_emotion_experience.py` | R-46–R-50 — Emotion profile & Strengths/Gripes *(v7)* |
| `test_competitive.py` | R-24–R-29 — competitor config, collection, benchmark |
| `test_closed_loop.py` | R-34–R-40 — service recovery (internal loop) |
| `test_security_privacy.py` | R-41–R-44 — bot defense, auth, secrets, PII |
| `test_analysis_accounts.py` | R-17–R-23 — query, report, metrics, roles, export |
| `test_invariants.py` | INV-1–INV-16 — rules that must always hold |
| `test_edge_cases.py` | E-1–E-27 — the Phase-2 CHALLENGE conditions |
| `test_data_privacy.py` | DPS-1–DPS-11 — data/privacy/security requirements |
| `test_nfr.py` | NFR-1–NFR-9 — speed/reliability/accessibility budgets |
| `test_exclusions.py` | X-1–X-7 — what the product must NOT do (negative tests) |

## Harness note

pytest is a reference runner chosen for readability. The product's stack (language, framework, DB, model
provider, hosting) is set in the **Architecture** phase; these tests translate one-to-one to that stack's
runner when it's chosen.
