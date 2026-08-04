"""AI analysis, accounts, roles, export — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4).
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_nl_query_grounded_with_citations():
    """R-17, O-6, INV-6: A natural-language question is answered only from the account's own data,
    with citations."""


def test_insight_report_contents():
    """R-18, O-5: The insight report includes narrative, metrics, themes, sentiment, Love, Trust,
    the Love x Trust read, competitive comparison, quotes, and ranked actions."""


def test_core_metrics_computed():
    """R-19, O-4: Response/completion rate, average rating, distribution, and NPS/CSAT are computed
    when questions qualify."""


def test_alert_fires_on_threshold():
    """R-20, O-7: An alert on a signal (neg-sentiment share, average rating, Love/Trust Index,
    new theme) fires when crossed."""


def test_roles_and_case_owner():
    """R-21: Owner/Admin and Member roles exist, plus a lightweight case-owner designation for
    RecoveryCase assignment."""


def test_export_views_and_report():
    """R-22: Any analysis view and the insight report export (CSV; PDF and/or slides)."""


def test_delete_and_export_account_data():
    """R-23, INV-7: A survey/campaign/response can be deleted, and all account data exported or
    deleted."""
