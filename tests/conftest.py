"""Shared pytest configuration for the AAA Insights test suite.

TEST FIRST (Grounded AI™ Phase 3): this suite is derived from Requirements v7 and
docs/03_test_plan.md, and is written BEFORE any implementation. Until IMPLEMENT
(Phase 4) begins there is no code to run against, so every module marks its tests
`skip` with a clear reason. The suite therefore runs green (skipped, not failed),
while each test stands as the agreed, human-readable definition of "done".

As each behavior is built in Phase 4, remove the module-level skip (or the specific
test's) and implement the assertion against the real code.

The pytest harness is a readable *reference* runner for the plan — NOT the product's
technology stack, which is an Architecture-phase decision.
"""

PENDING_IMPLEMENT = "TEST FIRST: pending IMPLEMENT (Phase 4) — no implementation yet"
