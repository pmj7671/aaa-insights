"""Unified customer & competitive insight — AAA Insights.

TEST FIRST (Phase 3). Derived from Requirements v7 and docs/03_test_plan.md.
Skipped until IMPLEMENT (Phase 4).
"""
import pytest

pytestmark = pytest.mark.skip(reason="TEST FIRST: pending IMPLEMENT (Phase 4)")


def test_define_competitor_brands():
    """R-24: A set of competitor brands can be defined and managed."""


def test_collect_public_data_under_gate():
    """R-25, INV-10, DPS-7: Public reviews are collected only under the DPS-7 guardrails and
    behind the legal-review gate."""


def test_benchmark_own_vs_competitors():
    """R-27, O-9: The brand benchmarks against competitors on ratings, Brand Love, Trust,
    sentiment, and themes over a period."""


def test_per_competitor_analysis_traceable():
    """R-28, O-10: Per-competitor aggregate analysis is produced with traceability to sources."""


def test_competitor_figures_link_to_sources():
    """R-29, INV-3: All brand/competitor analysis is filterable and every competitor figure
    links to its source items."""
