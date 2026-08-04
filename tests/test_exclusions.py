"""Exclusions — what the product must NOT do (negative tests) — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4).
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_not_a_crm_no_general_profile():
    """X-1, INV-9: The system does not build a general customer-record/CRM profile
    (RecoveryCase exception aside)."""


def test_no_external_push_or_workbench():
    """X-2, R-37: v1 does not push data to external CRM/helpdesk and ships no native
    case-management workbench."""


def test_no_private_or_paywalled_collection():
    """X-3, INV-10: Collection never touches private/authenticated/paywalled content or data a
    source's terms forbid."""


def test_no_outcome_prediction():
    """X-4: v1 makes no prediction of future churn/revenue outcomes."""


def test_no_respondent_panel_marketplace():
    """X-5: There is no public respondent panel or audience marketplace."""


def test_decision_support_not_replacement():
    """X-6: The product presents evidence-backed decision support, not a replacement for human
    research judgment."""


def test_no_reidentify_or_contact_scraped():
    """X-7, INV-11: Scraped reviewers are never re-identified, contacted, or merged into a profile."""
