# AAA Insights — Test Suite (Vitest)

The executable half of the build. The plain-English contract lives in `../docs/03_test_plan.md`; the files
here are the runnable suite, built out slice-by-slice during **Phase 4 (IMPLEMENT)**.

## State

- **Runner:** Vitest (TypeScript). The suite was ported from the Phase-3 pytest reference to match the chosen
  stack (see `../docs/architecture_overview.md`). Same behaviors, same requirement IDs — only the runner changed.
- **Built (green):** real tests live under `tests/domain/` — increment 1 covers the analysis core
  (R-13, R-30, R-32, INV-2, INV-4, INV-14, E-6, E-15, E-24).
- **Pending:** `tests/pending.test.ts` holds every not-yet-built behavior as a Vitest `todo`, one per
  requirement ID. Todos show as pending (never failing), so the suite stays green while it grows. As each
  behavior is built, it moves out of `pending.test.ts` into a real test and turns green.

## Running

```bash
npm install
npm test            # vitest run — 22 passing, rest todo (green)
npm run typecheck   # tsc --noEmit
```

## How a slice gets built (the safety loop)

1. Pick a cluster of pending todos (one area).
2. Write the real test(s) in a `tests/<area>/*.test.ts` file (behavior name + requirement ID).
3. Implement the domain/module code until green.
4. Run `npm test` + `npm run typecheck`; commit only when green.
5. Remove the matching todos from `pending.test.ts`.

Traceability is checked mechanically by the Grounded AI™ `gate_check.py` (every R-/INV-/E- ID is referenced
by a test or the test plan).
