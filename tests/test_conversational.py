"""Conversational (AI-led) surveys — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4).
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_conversational_mode_probes_followups():
    """R-7: The AI interviewer asks a question and relevant follow-up probes."""


def test_interviewer_stays_in_scope():
    """R-8: The interviewer stays on the admin's objective and does not wander off topic."""


def test_interviewer_ignores_injected_instructions():
    """R-8, E-7: The interviewer ignores instructions injected into a respondent's answer."""


def test_interviewer_ends_at_limit_or_objective():
    """R-9: The interview ends after the configured max exchanges or when the objective is met."""


def test_transcript_stored_and_analyzable():
    """R-10: Every transcript is stored and analyzed by the same engine as structured responses."""


def test_conversational_cost_and_safety_limits():
    """R-45, E-7: The conversational endpoint enforces rate limits, per-link cost ceilings,
    and output content-safety checks."""
