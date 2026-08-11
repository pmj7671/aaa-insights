# Test Plan — AAA Insights

**Derived from:** Requirements **v7**  |  **Phase:** Grounded AI™ — Phase 3 (TEST FIRST)  |  **Date:** 2026-07-30
**Prepared by:** Active AI Advisors  |  **Prepared for:** Paul Jamieson

---

## What this is

This is the **definition of "done"** for AAA Insights, written **before** any implementation. Every behavior,
guarantee (invariant), and edge case in Requirements v7 maps to at least one test with a plain-English
description, so you can read this document like a checklist and recognize your own requirements. When the
build (Phase 4) is finished, "done" means **this suite is green** — nothing more, nothing less.

Read it as the contract: if a test here passes, the matching requirement is met; if we ever want to change
what the product does, we change a test here **first**, then the code. That is what keeps the software honest
as it grows.

## How to read the tables

Each row is one test. **Test** is the behavior it checks (named for the behavior, not the code). **Verifies**
says in plain English what "pass" means. **Type** is `unit` (one function/component), `integration`
(several parts together), `invariant` (a rule that must always hold), `edge` (an unusual condition from the
Phase-2 CHALLENGE), or `nfr` (a speed/reliability/accessibility budget). **Traces to** is the requirement
ID(s) from the spec, so every test is anchored and nothing is orphaned.

## Test harness (a note, not a product decision)

The executable suite in `tests/` is written in **pytest** — chosen as a widely-readable reference harness so
the plan is runnable and reviewable today. **This is not the product's technology stack.** The stack
(language, framework, database, model provider, hosting) is an **Architecture-phase** decision that hasn't
been made yet; when it is, these tests translate one-to-one to that stack's runner (Jest/Vitest, JUnit, Go
`testing`, etc.). The *plan below is the contract*; the harness is how we make it executable.

**Current state (Phase 4 underway):** the suite is now **Vitest** (ported from the pytest reference to match
the TypeScript stack). Built so far (increments 1–2) and **green** (`tests/domain/*`): R-13, R-19, R-30, R-32, R-33,
INV-2, INV-4, INV-12, INV-14, E-6, E-15, E-24. Every other behavior is a Vitest `todo` in
`tests/pending.test.ts`, carrying its requirement ID, and turns green as it's built.

---

## 1. Survey creation & distribution

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_create_survey_with_all_question_types | A survey can be built with single-select, multi-select, rating/scale, open text, the Brand Love scale, and the Trust battery | unit | R-1 |
| test_ai_drafts_survey_from_objective | A plain-language objective produces a draft survey that is editable before sending | integration | R-2 |
| test_conditional_logic_shows_and_skips | A question or branch is shown or skipped based on a previous answer | unit | R-3 |
| test_distribute_by_link_and_widget | A survey can be distributed by link and by embeddable widget (MVP); email list is Phase-1 | integration | R-4 |
| test_respondent_completes_without_account | A respondent can complete a survey on mobile and desktop without creating an account | integration | R-5, INV-5 |
| test_partial_response_recorded_incomplete | A partial response is saved and marked incomplete, never discarded | unit | R-6, E-2 |

## 2. Conversational (AI-led) surveys

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_conversational_mode_probes_followups | The AI interviewer asks a question and relevant follow-up probes | integration | R-7 |
| test_interviewer_stays_in_scope | The interviewer stays on the admin's objective and does not wander off topic | integration | R-8 |
| test_interviewer_ignores_injected_instructions | The interviewer ignores instructions injected into a respondent's answer | edge | R-8, E-7 |
| test_interviewer_ends_at_limit_or_objective | The interview ends after the configured max exchanges or when the objective is met | unit | R-9 |
| test_transcript_stored_and_analyzable | Every transcript is stored and analyzed by the same engine as structured responses | integration | R-10 |
| test_conversational_cost_and_safety_limits | The conversational endpoint enforces rate limits, per-link cost ceilings, and output content-safety checks | integration | R-45, E-7 |

## 3. Unified feedback hub

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_import_csv_maps_to_schema | External feedback imports via CSV, mapping columns to the unified schema | integration | R-11 |
| test_all_feedback_queryable_filterable | All feedback is queryable together and filterable by brand, source, campaign, date, segment, rating, sentiment | integration | R-12 |
| test_deduplicate_identical_items | Obviously identical items (same source + text + timestamp) are de-duplicated | unit | R-13, E-6 |
| test_unified_customer_view_is_aggregate | The "unified customer" view is aggregate and builds no identity-linked profile | integration | R-26, INV-9 |

## 4. Brand Love, Trust & metrics

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_theme_analysis_with_quotes | Theme analysis returns counts and representative quotes for any filtered set | integration | R-14 |
| test_sentiment_assigned_and_aggregated | Sentiment is assigned to each open-text response and aggregated across dimensions | unit | R-15 |
| test_every_read_is_traceable | Every theme, sentiment aggregate, Brand Love read, and Trust read opens its exact underlying responses | integration | R-16, INV-3 |
| test_brand_love_index_is_stated_only | The Brand Love Index is computed on stated reads only; inferred reads are a labeled companion, never blended | unit | R-30, INV-4, INV-14 |
| test_unreadable_love_comment_is_unknown | An unreadable comment is scored "unknown" and excluded from the Index, never as Ambivalence | edge | R-30, INV-14, E-24 |
| test_trust_question_type_supported | A single-item trust rating and an optional driver battery can be asked | unit | R-31 |
| test_trust_index_stated_only_with_drivers | The Trust Index is stated-only with a per-driver breakdown; inferred trust is a labeled companion | unit | R-32, INV-14 |
| test_love_trust_segmentation_actions | The Love × Trust segmentation places respondents in the four quadrants with a recommended action each | integration | R-33 |

## 5. Emotion & experience analysis *(v7)*

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_emotion_detected_to_headline_set | Emotions in open text are classified to the compact ~7-emotion headline taxonomy with intensity and confidence | unit | R-46 |
| test_emotion_profile_has_verbatims_and_trend | The per-brand emotion profile carries representative verbatims and a trend over time | integration | R-46, O-17 |
| test_no_affect_is_no_emotion_bucket | A comment with no readable affect lands in "no emotion detected," never a forced neutral emotion | edge | R-46, INV-15, E-27 |
| test_emotion_drilldown_to_subemotions | A headline emotion drills down to its granular sub-emotions and the underlying verbatims | unit | R-47, INV-3 |
| test_strengths_and_gripes_extracted | Aspect-based strengths and gripes are extracted with polarity, volume, and representative quotes | integration | R-48, O-18 |
| test_strengths_ranked_by_association_not_causation | Strengths/gripes are ranked by association with Love/Trust movement, labeled association not causation | unit | R-48, INV-16 |
| test_aspects_are_account_configurable | The aspect taxonomy is account-configurable and fabricated aspects are excluded | unit | R-48, E-26 |
| test_competitive_emotion_and_gripes_aggregate | Emotion profiles and strengths/gripes compare own brand vs. competitors, on lawful public data, aggregate only | integration | R-49, O-19, INV-11 |
| test_emotion_taxonomy_published_with_confidence | The emotion taxonomy and its roll-up mapping are published; every emotion/aspect read carries model_version and confidence | unit | R-50, INV-16, NFR-6 |
| test_emotion_never_blended_into_headline | Emotion and aspect reads are never blended into the stated Brand Love/Trust headline Indices | invariant | R-50, INV-15 |

## 6. Unified customer & competitive insight

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_define_competitor_brands | A set of competitor brands can be defined and managed | unit | R-24 |
| test_collect_public_data_under_gate | Public reviews are collected only under the DPS-7 guardrails and behind the legal-review gate | integration | R-25, INV-10, DPS-7 |
| test_benchmark_own_vs_competitors | The brand benchmarks against competitors on ratings, Brand Love, Trust, sentiment, and themes over a period | integration | R-27, O-9 |
| test_per_competitor_analysis_traceable | Per-competitor aggregate analysis is produced with traceability to source items | integration | R-28, O-10 |
| test_competitor_figures_link_to_sources | All brand/competitor analysis is filterable and every competitor figure links to its source items | integration | R-29, INV-3 |

## 7. Closed-loop & service recovery

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_first_party_opt_in_contact_agegated | A first-party respondent can opt in to be contacted, behind an age-appropriate gate; contact is never required | unit | R-34, INV-13, E-23 |
| test_trigger_opens_case_near_real_time | A configurable trigger opens a RecoveryCase from a dissatisfaction signal in near-real-time | integration | R-35, NFR-8 |
| test_only_first_party_opens_contactable_case | Only first-party responses open contactable cases; public/competitor reviews open anonymous internal-triage only | integration | R-35, INV-9 |
| test_cases_deduped_and_throttled | Cases are grouped/de-duplicated (one incident/customer → one case) and triggers throttled to prevent storms | edge | R-35, E-21 |
| test_recovery_case_lifecycle_internal | A RecoveryCase carries feedback, contact, owner, and a status lifecycle, owned and resolved inside the product | unit | R-36 |
| test_owner_notified_no_external_push | The assigned owner/team is notified in-app and by email; no customer data is pushed to external CRM/helpdesk | integration | R-37, INV-9, X-2 |
| test_recovery_measured_before_after | Recovery is measured by re-reading Love/Trust before vs. after resolution for consented customers, reported at cohort level | integration | R-38, O-15 |
| test_reinforcement_audience_neutral_prompts | Referral/advocacy may be routed to loved customers; public-review prompts are audience-neutral, never sentiment-gated | unit | R-39, O-16 |
| test_cases_prioritized_by_value_risk | Open cases are prioritized by predicted value/risk (quadrant, trust drivers, volume) | unit | R-40 |

## 8. Security, privacy & integrity

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_public_endpoints_defend_against_bots | Public survey/conversational endpoints resist bots, ballot-stuffing, and manipulation without a CAPTCHA wall | integration | R-41, E-9 |
| test_admin_auth_sso_mfa_sessions | Admins authenticate with SSO/MFA support and managed sessions; authorization enforces the role model | integration | R-42, DPS-11 |
| test_secrets_held_in_vault_not_logged | Provider/integration credentials live in a secrets vault, never in the data model, exports, or logs | unit | R-43, DPS-11, INV-8 |
| test_pii_detected_and_redacted | PII in open text and transcripts is detected and redacted before analysis/surfacing | unit | R-44, INV-8 |
| test_pii_admin_surfacing_role_gated | PII surfaced to an admin is behind role and audit controls, never broadcast | edge | R-44, E-10 |

## 9. AI analysis, accounts, roles, export

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_nl_query_grounded_with_citations | A natural-language question is answered only from the account's own data, with citations | integration | R-17, O-6, INV-6 |
| test_insight_report_contents | The insight report includes narrative, metrics, themes, sentiment, Love, Trust, the Love × Trust read, competitive comparison, quotes, and ranked actions | integration | R-18, O-5 |
| test_core_metrics_computed | Response/completion rate, average rating, distribution, and NPS/CSAT are computed when questions qualify | unit | R-19, O-4 |
| test_alert_fires_on_threshold | An alert on a signal (neg-sentiment share, average rating, Love/Trust Index, new theme) fires when crossed | unit | R-20, O-7 |
| test_roles_and_case_owner | Owner/Admin and Member roles exist, plus a lightweight case-owner designation for RecoveryCase assignment | unit | R-21 |
| test_export_views_and_report | Any analysis view and the insight report export (CSV; PDF and/or slides) | unit | R-22 |
| test_delete_and_export_account_data | A survey/campaign/response can be deleted, and all account data exported or deleted | integration | R-23, INV-7 |

## 10. Invariants (must always hold)

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_response_has_one_source_one_brand | Every response is attributable to exactly one source and one brand | invariant | INV-1 |
| test_counts_never_negative_or_overcounted | Counts are never negative, never exceed responses, and each response is counted once per dimension | invariant | INV-2 |
| test_all_ai_claims_traceable | No theme, aggregate, read, insight, recommendation, or answer exists without a path to its verbatims | invariant | INV-3 |
| test_inferred_never_blended_into_stated | Inferred values are labeled and never blended into a stated headline metric | invariant | INV-4 |
| test_survey_completable_anonymously | A respondent can complete a survey without providing identifying information | invariant | INV-5 |
| test_account_data_isolated | Each account's data is isolated and AI analysis is grounded only in that account's data | invariant | INV-6 |
| test_deleted_data_never_reappears | Deleted data disappears from all future analysis (subject to the DPS-5 open-case hold) | invariant | INV-7 |
| test_pii_never_in_logs_or_outputs | PII is stored securely and never written to logs or AI outputs unless the admin opts in | invariant | INV-8 |
| test_no_general_individual_profile | No general identity-resolved profile is built; the consented first-party RecoveryCase is the sole exception | invariant | INV-9 |
| test_external_data_lawful_with_provenance | Externally-collected data is only ever public and lawfully obtained, with provenance kept | invariant | INV-10 |
| test_public_review_pii_minimized | Personal data in public reviews is minimized, never profiled, and excluded from AI outputs by default | invariant | INV-11 |
| test_love_and_trust_stay_distinct | Brand Love and Brand Trust are reported as distinct indicators, never collapsed or shown as satisfaction | invariant | INV-12 |
| test_followup_is_consent_gated | Follow-up happens only on opt-in; consent is withdrawable and anonymous-by-default is preserved | invariant | INV-13 |
| test_headline_indices_stated_only | Headline Love/Trust Indices are stated-only; an unreadable comment is "unknown," never Ambivalence | invariant | INV-14 |
| test_emotion_reads_are_labeled_companions | Emotion/aspect reads are labeled inferred, carry confidence, and are never blended into the stated headline | invariant | INV-15 |
| test_emotion_is_distinct_lens | Emotion is a distinct lens from Love, Trust, and sentiment, and any link to them is association, not causation | invariant | INV-16 |

## 11. Edge cases (from the Phase-2 CHALLENGE)

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_tiny_sample_states_low_confidence | A tiny sample is reported as too small, not dressed up as confident | edge | E-1 |
| test_abandoned_survey_flagged | An abandoned survey is retained, counted incomplete, and flagged | edge | E-2 |
| test_junk_text_flagged_excluded | Junk/abusive open text is captured, flagged, excluded by default, and reviewable | edge | E-3 |
| test_non_english_set_aside | Non-English responses are detected, tagged, and set aside with an honest note (English-only MVP) | edge | E-4 |
| test_malformed_csv_per_row_errors | A malformed CSV is rejected or partially accepted with a per-row error report | edge | E-5 |
| test_duplicate_submissions_controlled | Duplicate/repeated submissions are de-duplicated with link-level controls | edge | E-6 |
| test_conversation_off_rails_recovers | An interview pushed off the rails stays in scope, enforces safety limits, and ends gracefully | edge | E-7 |
| test_ambiguous_query_states_limits | An ambiguous analysis query answers only what the data supports and states what it cannot determine | edge | E-8 |
| test_volume_spike_stays_correct | A sudden volume spike never loses or double-counts, and abuse defenses tell a real spike from ballot-stuffing | edge | E-9 |
| test_sensitive_disclosure_role_gated | A sensitive disclosure is stored protected and surfaced to the admin behind role/audit controls | edge | E-10 |
| test_concurrent_edits_no_silent_overwrite | Two admins editing one survey do not silently overwrite each other | edge | E-11 |
| test_source_block_backs_off | When a source blocks/rate-limits collection, collection backs off, records the gap, and fabricates nothing | edge | E-12 |
| test_competitor_ambiguity_excluded | Low-confidence competitor matches are flagged and excluded from headline figures until confirmed | edge | E-13 |
| test_sparse_competitor_data_insufficient | Too few competitor reviews shows "insufficient data," not a misleading number | edge | E-14 |
| test_mixed_scales_normalized | Mixed rating scales are normalized to 1–5; un-mappable ratings are stored raw and excluded from cross-source averages | edge | E-15 |
| test_trust_read_category_relative | The Trust Index is read relative to category and prior period, not as an absolute | edge | E-16 |
| test_consent_withdrawn_purges_keeps_aggregate | On consent withdrawal, contact is purged and the case anonymized; de-identified aggregate metrics are retained | edge | E-17 |
| test_notification_failure_case_survives | A failed notification never drops a case; the case stays authoritative and delivery retries | edge | E-18 |
| test_stale_case_escalated | An unowned or overdue case is surfaced and escalated, not left to rot | edge | E-19 |
| test_recovery_sample_too_small | Too few responses to re-measure reports "not yet measurable," not a fabricated improvement | edge | E-20 |
| test_case_storm_grouped_throttled | A viral bad event is grouped/throttled so the team isn't buried and one customer isn't contacted repeatedly | edge | E-21 |
| test_timezone_period_boundaries | Timestamps are UTC; trends and "prior period" use the account's timezone; retention boundaries are DST-safe | edge | E-22 |
| test_minor_detected_contact_refused | A respondent under the age threshold is refused contact collection but can still respond anonymously | edge | E-23 |
| test_no_stated_reads_shows_no_stated_data | With no stated Love/Trust in scope, the headline Index shows "no stated data" and only the labeled inferred signal | edge | E-24 |
| test_mixed_emotions_multi_labeled | A comment with several emotions is represented as multiple emotions with intensities, counted once per dimension | edge | E-25 |
| test_sarcasm_low_confidence_excluded | Low-confidence/sarcastic emotion or aspect reads are excluded from headline figures until a confidence floor is met | edge | E-26 |
| test_no_signal_not_fabricated | Where affect or aspects can't be read, the system shows "no signal" rather than fabricating one | edge | E-27 |

## 12. Data, privacy & security requirements

*(Traced for completeness; several are also verified across the security and invariant tests above.)*

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_processor_controller_roles | The system acts as processor for the account's feedback; the company is the controller | integration | DPS-1 |
| test_pii_encrypted_access_controlled | Respondent PII is minimized, encrypted at rest and in transit, and role-access-controlled | unit | DPS-2, INV-8 |
| test_dsr_export_delete_first_and_third_party | Data-subject export/deletion works for own respondents and for ingested third-party review authors | integration | DPS-3 |
| test_account_data_not_used_for_training | Account data is isolated and never used to train shared/base models | unit | DPS-4 |
| test_retention_with_open_case_hold | Retention (24-mo default) applies, but open cases and their recovery baselines are held past retention until closed | edge | DPS-5, E-17 |
| test_security_checklist_applied | The input-validation/authz/secret-handling checklist is applied in build and verification | integration | DPS-6 |
| test_collection_compliance_gate | Collection is public-only, respects robots.txt/rate limits, keeps provenance, and waits on written legal sign-off | integration | DPS-7, INV-10 |
| test_gdpr_ccpa_targets | The system meets the GDPR + CCPA v1 compliance targets | integration | DPS-8 |
| test_provider_abstracted_hosting | Model/hosting is provider-abstracted with US residency available and no lock-in | integration | DPS-9 |
| test_contact_consent_scoped_internal | Contact is opt-in, minimized, scoped to the consented follow-up, deletable, and shared with no external tool | unit | DPS-10, INV-13 |
| test_admin_auth_and_vaulted_secrets | Admin auth (SSO/MFA), managed sessions, and vaulted data-provider secrets are enforced | integration | DPS-11 |

## 13. Non-functional budgets

*(These need a performance/load/accessibility harness, not a plain unit test; several are confirmed in VERIFY.
The NFR-2/3/8/9 targets were confirmed in v7.1.)*

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_survey_page_load_budget | A survey page loads under 2 s on mobile; a submission acknowledges under 1 s | nfr | NFR-1 |
| test_analysis_latency_budget | Analysis of ~5,000 items returns at p95 ≤ 60 s; larger sets run as background jobs with progress | nfr | NFR-2 |
| test_collection_uptime_budget | The collection endpoint meets 99.9% uptime; ingestion stays durable if analysis degrades | nfr | NFR-3 |
| test_accessibility_wcag_aa | Respondent-facing surveys meet WCAG 2.1 AA | nfr | NFR-4 |
| test_scales_without_rewrite | The system grows from SMB volumes toward larger sets without a rewrite | nfr | NFR-5 |
| test_ai_outputs_carry_confidence_and_source | Every AI output carries its source data and a confidence signal, including inferred companion reads | nfr | NFR-6, INV-3 |
| test_collection_freshness_and_politeness | Collected data shows a freshness/coverage indicator; collection runs at a polite, configurable rate and records gaps | nfr | NFR-7 |
| test_trigger_latency_budget | A dissatisfaction signal opens a RecoveryCase within ≤ 60 s | nfr | NFR-8, R-35 |
| test_durability_rpo_rto | Storage is durable to RPO ≤ 1 h, RTO ≤ 8 h (point-in-time recovery); timestamps stored UTC | nfr | NFR-9 |

## 14. Exclusions (negative tests — the product must NOT do these)

| Test | Verifies (plain English) | Type | Traces to |
|------|--------------------------|------|-----------|
| test_not_a_crm_no_general_profile | The system does not build a general customer-record/CRM profile (RecoveryCase exception aside) | invariant | X-1, INV-9 |
| test_no_external_push_or_workbench | v1 does not push data to external CRM/helpdesk and ships no native case-management workbench | integration | X-2, R-37 |
| test_no_private_or_paywalled_collection | Collection never touches private/authenticated/paywalled content or data a source's terms forbid | edge | X-3, INV-10 |
| test_no_outcome_prediction | v1 makes no prediction of future churn/revenue outcomes | unit | X-4 |
| test_no_respondent_panel_marketplace | There is no public respondent panel or audience marketplace | unit | X-5 |
| test_decision_support_not_replacement | The product presents evidence-backed decision support, not a replacement for human research judgment | integration | X-6 |
| test_no_reidentify_or_contact_scraped | Scraped reviewers are never re-identified, contacted, or merged into a profile | invariant | X-7, INV-11 |

---

## Acceptance criteria (the headline "done" conditions)

- **AC-1 — Stated-only headline (INV-14, R-30/R-32):** the Brand Love and Trust Indices are computed from
  stated reads only; an inferred read never changes a headline number, and an unreadable comment is
  "unknown," never Ambivalence.
- **AC-2 — Everything traceable (INV-3):** every theme, sentiment, Love/Trust read, emotion, strength/gripe,
  insight, and query answer can open the exact verbatim responses behind it.
- **AC-3 — Emotion is a labeled companion (INV-15/INV-16, R-46/R-50):** emotions and strengths/gripes are
  shown as inferred, confidence-scored companion reads, never blended into the stated headline, and any link
  to Love/Trust is stated as association, not causation.
- **AC-4 — Internal loop only (D-E, R-37, X-2):** a dissatisfaction signal opens and resolves a RecoveryCase
  inside the product with the team notified; no customer data is pushed to any external tool in v1.
- **AC-5 — Consent-gated identity (INV-9/INV-13, R-34/R-38):** the only identity-linked record is a consented,
  first-party RecoveryCase; recovery is measured longitudinally only for consented customers, plus cohort
  level; scraped reviewers are never contacted or profiled.
- **AC-6 — Lawful collection gate (DPS-7, INV-10):** live web collection is disabled until the client's
  written legal sign-off; collection is public-only, provenance-kept, and rate-polite.
- **AC-7 — Security baseline (R-41–R-45, DPS-11):** public endpoints resist abuse without a CAPTCHA wall,
  admins use SSO/MFA, secrets are vaulted, PII is redacted, and the conversational endpoint is cost- and
  safety-bounded.

## Coverage summary

Every requirement (R-1–R-50), invariant (INV-1–INV-16), and edge case (E-1–E-27) has at least one test above,
plus the data/privacy (DPS-1–DPS-11), non-functional (NFR-1–NFR-9), and exclusion (X-1–X-7) items. The
`tests/` suite mirrors these tables, one function per row.

**What is not a plain unit test (verified elsewhere):** the NFR budgets (§13) need a performance/load and an
accessibility harness and are confirmed in **VERIFY (Phase 5)**; several DPS items (§12) are organizational/
compliance controls confirmed by review rather than a single automated assertion. These are listed so nothing
is silently uncovered.

**NFR targets confirmed (v7.1):** NFR-2 analysis **p95 ≤ 60 s**, NFR-3 **99.9% uptime**, NFR-8 trigger
**≤ 60 s**, NFR-9 **RPO ≤ 1 h / RTO ≤ 8 h**. The NFR tests assert these numbers.

---

*Prepared by Active AI Advisors under the Grounded AI™ methodology. In TEST FIRST, the tests are the contract:
"done" is this suite, green.*
