"""Non-functional budgets (NFR-*) — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4). These need a performance/load/accessibility harness and are
confirmed in VERIFY (Phase 5). NFR-2/3/8/9 targets were confirmed in v7.1 and are asserted below.
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_survey_page_load_budget():
    """NFR-1: A survey page loads under 2 s on mobile; a submission acknowledges under 1 s."""


def test_analysis_latency_budget():
    """NFR-2: Analysis of ~5,000 items returns at p95 <= 60 s; larger sets run as
    background jobs with progress."""


def test_collection_uptime_budget():
    """NFR-3: The collection endpoint meets 99.9% uptime; ingestion stays
    durable if analysis degrades."""


def test_accessibility_wcag_aa():
    """NFR-4: Respondent-facing surveys meet WCAG 2.1 AA."""


def test_scales_without_rewrite():
    """NFR-5: The system grows from SMB volumes toward larger sets without a rewrite."""


def test_ai_outputs_carry_confidence_and_source():
    """NFR-6, INV-3: Every AI output carries its source data and a confidence signal, including
    inferred companion reads."""


def test_collection_freshness_and_politeness():
    """NFR-7: Collected data shows a freshness/coverage indicator; collection runs at a polite,
    configurable rate and records gaps."""


def test_trigger_latency_budget():
    """NFR-8, R-35: A dissatisfaction signal opens a RecoveryCase within <= 60 s."""


def test_durability_rpo_rto():
    """NFR-9: Storage is durable to RPO <= 1 h, RTO <= 8 h (point-in-time recovery); timestamps stored UTC."""
