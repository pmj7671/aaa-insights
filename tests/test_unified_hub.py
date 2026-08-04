"""Unified feedback hub — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4).
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_import_csv_maps_to_schema():
    """R-11: External feedback imports via CSV, mapping columns to the unified schema."""


def test_all_feedback_queryable_filterable():
    """R-12: All feedback is queryable together and filterable by brand, source, campaign,
    date, segment, rating, and sentiment."""


def test_deduplicate_identical_items():
    """R-13, E-6: Obviously identical items (same source + text + timestamp) are de-duplicated."""


def test_unified_customer_view_is_aggregate():
    """R-26, INV-9: The 'unified customer' view is aggregate and builds no identity-linked profile."""
