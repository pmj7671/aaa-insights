# Product Requirements Document — AAA Insights

**Version:** v3  |  **Status:** Draft (Trust extension, awaiting approval)  |  **Date:** 2026-07-14
**Owner:** Active AI Advisors  |  **Prepared for:** Paul Jamieson
**Methodology:** Grounded AI™ — Phase 1 (SPECIFY)

> **Changes in v3 (2026-07-14):** added **Brand Trust** as a first-class indicator that complements
> Brand Love — a Trust question type, a **Trust Index** with driver breakdown (reliability, integrity,
> benevolence, security/privacy), inference from open text, and a **Love × Trust** segmentation
> (Devoted / Infatuated / Dependable / At-risk) with a recommended action per quadrant. Grounded in the
> research library (Wardani & Gustia 2016: trust bridges satisfaction to attachment; Nobre 2011:
> passion-love without trust is fragile). Added/changed IDs are marked *(v3)*.
>
> *v2 (2026-07-13) added: aggregate unified-customer view, competitors as first-class brands, lawful
> web/API/CSV collection under DPS-7, the Brand Love scale, and the data model.*

> This is the specification gate. No implementation begins until this document is approved. Sections 1–3
> frame the product; 4–11 are the testable requirements; 12 is the data model; 13 is the roadmap; 14 is
> the list of decisions we need from you.

---

## 1. Purpose

AAA Insights is a software service that lets a company **collect** feedback from its customers and
consumers — through surveys, reviews, ratings, and open comments — **unify** that feedback in one place,
and **analyze** it with AI to produce plain-language insight the business can act on. It extends this to a
**competitive** view: the same collection and analysis run against tracked competitors.

At the heart of the analysis are two complementary emotional-relationship indicators: **Brand Love** (the
emotional pull — identity, passion, attachment) and, *(v3)* **Brand Trust** (the confidence that the brand
is reliable, honest, and acts in the customer's interest). Measured together they diagnose what neither
does alone — an emotionally attached customer who no longer trusts the brand is a very different (and more
fragile) situation than one who is both attached and trusting.

The product is not "another survey tool." Survey creation is the on-ramp; the value is what happens after
feedback arrives — themes and sentiment, conversational probing, brand-love and trust measurement, a
unified hub, competitive benchmarking, and insight with recommended actions.

## 2. Target users and buyer

**Primary market:** SMB / mid-market companies (~10–500 employees) that want to understand customers but
have no in-house market-research or CX-analytics team.

| User role | What they need from AAA Insights |
|-----------|----------------------------------|
| **Owner / founder / GM** (buyer) | A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first. |
| **Marketing / brand lead** | Themes, sentiment, brand-love, **trust**, quotes, and competitive position to guide messaging and positioning. |
| **CX / customer-success manager** | Early warning on dissatisfaction, eroding trust, drivers of churn, and a way to close the loop. |
| **Product manager** | Prioritized signal on what customers want changed, backed by evidence and volume. |
| **Respondent** (the customer) | A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard. |

## 3. Product principles

1. **Insight over dashboards.** A plain-language answer to "what should I know and do," not a wall of charts.
2. **Every insight is traceable.** No theme, sentiment, brand-love read, trust read, or recommendation
   appears without a path to the verbatim responses that support it.
3. **Respect the respondent.** Surveys are short, mobile-first, accessible, and privacy-respecting.
4. **Trustworthy AI.** AI output carries its confidence and source data; it never fabricates, and it
   separates what was said from what was inferred.
5. **Lawful by construction.** Externally collected data is publicly available and lawfully obtained, with
   provenance on every item. Compliance is a design property (see §10).
6. **Measure the relationship, not just the transaction.** *(v3)* Love and Trust are distinct signals from
   satisfaction; the product treats them as first-class and never collapses them into a single number.
7. **Start simple, grow deliberately.** The MVP is a tight, buildable core.

---

## 4. Inputs

- **I-1: Survey definition** — built by an admin or AI-generated from a goal. Question types include
  single-select, multi-select, rating/scale, open text, the **Brand Love scale**
  (Love / Like / Ambiguity / Dislike / Hate), and *(v3)* the **Trust battery** (a single-item trust rating
  and/or a short driver battery: reliability, integrity, benevolence, security/privacy).
- **I-2: Survey response** — ratings (incl. Brand Love and Trust), multiple-choice, and open-text comments.
  May be partial.
- **I-3: Conversational response** — free-text turns in an AI-led adaptive interview, as a transcript.
- **I-4: Imported feedback** — external reviews/ratings/comments for the company's own brand via CSV.
- **I-5: Respondent metadata** — optional, non-identifying attributes (segment, channel, product, region,
  language).
- **I-6: Distribution request** — publish a survey via link, email list, or widget.
- **I-7: Analysis query** — a natural-language question asked of the feedback data.
- **I-8: Competitor configuration** — the competitor brands to track: names, aliases, products, public
  sources.
- **I-9: Externally-collected feedback** — reviews/ratings/comments about the own brand and tracked
  competitors, from public web pages, review-site APIs, or a licensed provider (source URL, capture date,
  brand, rating, text).

## 5. Outputs

- **O-1: Collected response store** — every response persisted under a common schema, attributable to
  source, brand, and campaign.
- **O-2: Theme analysis** — AI-generated themes with counts, quotes, and trend; filterable by brand.
- **O-3: Sentiment analysis** — positive/neutral/negative with intensity, aggregated by theme, segment,
  source, brand, and time.
- **O-4: Ratings & metrics** — average ratings, distribution, response/completion rates, NPS/CSAT.
- **O-5: Insight report** — narrative of what's happening, why, and what to do, with ranked actions; can
  include the competitive picture and *(v3)* the Love × Trust read. Exportable.
- **O-6: Answer to an analysis query** — grounded strictly in the account's own data, with citations.
- **O-7: Alerts** — notifications when a monitored signal crosses a threshold.
- **O-8: Respondent-facing survey** — the rendered survey or conversational interview.
- **O-9: Competitive benchmark** — own brand vs. competitors on ratings, Brand Love, *(v3)* Trust,
  sentiment, and themes over a chosen period.
- **O-10: Per-competitor analysis** — for a selected competitor, an aggregate view with traceability.
- **O-11: Brand Love read** — the distribution across Love / Like / Ambiguity / Dislike / Hate and a
  **Brand Love Index** (share of Love+Like minus share of Dislike+Hate), for the company and per
  competitor, over time.
- **O-12: Trust read** *(v3)* — a **Trust Index** (net trust) plus a **driver breakdown** (reliability,
  integrity, benevolence, security/privacy), for the company and per competitor, over time.
- **O-13: Love × Trust segmentation** *(v3)* — respondents/segments placed in one of four quadrants with a
  recommended action for each:
  - **Devoted** (high love / high trust) — advocates; protect and activate.
  - **Infatuated / fragile** (high love / low trust) — passion without a safety net; shore up reliability
    and transparency before a stumble triggers churn.
  - **Dependable** (low love / high trust) — loyal by reliability, not emotion; deepen the relationship.
  - **At-risk** (low love / low trust) — churn risk and detractors; intervene or triage.

## 6. Requirements (behaviors)

Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.

**Survey creation & distribution**

- **R-1:** Create a survey with at least: single-select, multi-select, rating/scale, open text, the
  **Brand Love scale**, and *(v3)* the **Trust battery** (single-item and/or driver items).
- **R-2:** Generate a draft survey from a plain-language objective; editable before sending.
- **R-3:** Conditional logic: a question or branch is shown or skipped based on a previous answer.
- **R-4:** Distribute by (a) link, (b) email list, and (c) embeddable widget. (Email is Phase-1; link +
  widget are MVP.)
- **R-5:** A respondent completes a survey on mobile and desktop without creating an account.
- **R-6:** Partial responses are recorded and marked incomplete, not discarded.

**Conversational (AI-led) surveys**

- **R-7:** Enable a conversational mode where an AI interviewer asks questions and relevant follow-up probes.
- **R-8:** The interviewer stays on the admin-defined objective and does not ask outside the topic scope.
- **R-9:** The interviewer ends after a configurable max number of exchanges or when the objective is met.
- **R-10:** Every transcript is stored and analyzable by the same engine as structured responses.

**Unified feedback hub**

- **R-11:** Import external feedback via CSV, mapping columns to the unified schema (brand, source, date,
  rating, text, segment).
- **R-12:** All feedback is queryable together, filterable by brand, source, campaign, date, segment,
  rating, and sentiment.
- **R-13:** De-duplicate obviously identical items (same source + text + timestamp).

**Brand Love, Trust & metrics** *(v3 expands this group)*

- **R-14:** Produce theme analysis with counts and representative quotes for any filtered set.
- **R-15:** Assign sentiment to each open-text response and aggregate across the chosen dimensions.
- **R-16:** For every theme, sentiment aggregate, Brand Love read, and *(v3)* Trust read, open the exact
  underlying responses (traceability — INV-3).
- **R-30:** Record Brand Love on the five-point scale, normalize to an ordinal, and compute the Brand Love
  distribution and Index (O-11) for any filtered set — including inferring a Brand Love read from open text
  where no direct rating exists, labeled inferred (INV-4).
- **R-31:** *(v3)* Support a **Trust question type** — a single-item trust rating and an optional
  multi-item **driver battery** (reliability, integrity, benevolence, security/privacy).
- **R-32:** *(v3)* Record trust; compute a **Trust Index** and per-driver breakdown (O-12) for any filtered
  set — including **inferring a trust read from open text** where no direct rating exists, labeled inferred
  (INV-4), the same way Brand Love is inferred (R-30).
- **R-33:** *(v3)* Produce the **Love × Trust segmentation** (O-13) with a recommended action per quadrant,
  available in the insight report (O-5) and the competitive benchmark (O-9).

**Unified customer & competitive insight**

- **R-26:** Produce an aggregate, cross-source "unified customer" view of the account's customer base —
  without building or requiring an identity-linked individual profile (INV-9).
- **R-24:** Define and manage a set of competitor brands to track (I-8).
- **R-25:** Collect publicly available reviews/ratings/comments about the own brand and tracked competitors
  from configured sources, subject to §10 (DPS-7) and a legal-review gate before live collection is enabled.
- **R-27:** Benchmark the company's brand vs. competitors on ratings, Brand Love, **Trust** *(v3)*,
  sentiment, and themes over a chosen period (O-9).
- **R-28:** For a selected competitor, produce per-competitor aggregate analysis (O-10) with traceability.
- **R-29:** All brand/competitor analysis is filterable by brand, source, date, segment, and sentiment, and
  every competitor figure links to its source items.

**AI analysis, accounts, roles, export**

- **R-17:** Ask a natural-language question and receive an answer grounded only in the account's own data,
  with citations.
- **R-18:** Generate an insight report: narrative, metrics, top themes, sentiment, Brand Love, **Trust and
  the Love × Trust read** *(v3)*, competitive comparison, quotes, ranked actions.
- **R-19:** Compute response rate, completion rate, average rating, rating distribution, and NPS/CSAT when
  questions qualify.
- **R-20:** Configure an alert on a signal (negative-sentiment share, average rating, Brand Love Index,
  **Trust Index** *(v3)*, new theme) and be notified when the threshold is crossed.
- **R-21:** At least two roles: Owner/Admin (account, users, billing) and Member (builds surveys, views
  analysis).
- **R-22:** Export any analysis view and the insight report (CSV for raw data; PDF and/or slides).
- **R-23:** Delete a survey, campaign, or response, and export or delete all account data.

## 7. Invariants (must ALWAYS be true)

- **INV-1:** Every response is attributable to exactly one source AND one brand. No response exists without
  a known origin.
- **INV-2:** Counts are never negative and never exceed responses collected; percentages come from the
  current filter, each response counted once per dimension.
- **INV-3:** Every theme, aggregate, Brand Love read, **Trust read** *(v3)*, insight, recommendation, and
  query answer is traceable to its underlying responses. No AI claim without a path to its verbatim data.
- **INV-4:** The system never shows a quote or statistic absent from the data, and labels any value it
  inferred (e.g., Brand Love or Trust from text) as inferred, not stated.
- **INV-5:** A respondent can complete a survey without providing identifying information.
- **INV-6:** Each account's data is isolated; AI analysis is grounded only in that account's data.
- **INV-7:** Deleting a response, campaign, or account removes it from all future analysis; deleted data
  never reappears.
- **INV-8:** Respondent PII is stored securely and never written to logs or AI outputs unless the admin
  opts in.
- **INV-9:** The "unified customer" view is always aggregate; the system does not construct or expose an
  identity-resolved profile of any individual.
- **INV-10:** Externally-collected data is only ever publicly available and lawfully obtained; no bypassing
  authentication, paywalls, or technical controls; provenance kept on every item.
- **INV-11:** Personal data in public reviews is minimized, never used to build a profile, and excluded
  from AI outputs by default.
- **INV-12:** *(v3)* **Brand Love and Brand Trust are measured and reported as distinct indicators.** The
  system never collapses them into a single score, and never presents Trust as satisfaction (or vice versa).

## 8. Edge cases to handle

- **E-1: Empty or tiny sample** — the system states the sample is too small for reliable findings
  (themes, sentiment, Brand Love, or Trust) rather than fabricating confidence.
- **E-2: Abandoned survey** — the partial is retained, counted as incomplete, and flagged in analysis.
- **E-3: Junk / abusive open text** — captured, flagged, excluded from analysis by default, reviewable.
- **E-4: Non-English / mixed-language** — language detected and analyzed accordingly (Q-4).
- **E-5: Malformed CSV import** — rejected or partially accepted with a per-row error report.
- **E-6: Duplicate / repeated submissions** — de-duplication plus link-level controls.
- **E-7: Conversational interview off the rails** — stays in scope, ignores injected instructions, ends
  gracefully.
- **E-8: Ambiguous analysis query** — answers only what the data supports; states what it cannot determine.
- **E-9: Sudden volume spike** — ingestion and analysis stay correct; views may lag but never lose or
  double-count.
- **E-10: Sensitive disclosure** — PII/safety concerns stored under INV-8/INV-11, surfaced to the admin,
  not broadcast.
- **E-11: Concurrent editing** — two admins editing one survey do not silently overwrite each other.
- **E-12: Source blocks or rate-limits collection** — collection backs off, records the gap, never
  fabricates missing items.
- **E-13: Competitor identity ambiguity** — low-confidence matches flagged and excluded from headline
  figures until confirmed.
- **E-14: Sparse competitor data** — too few public reviews shows "insufficient data," not a misleading
  number.
- **E-15: Mixed rating scales** — 5-star, 10-point, thumbs, Brand Love, Trust each normalized to the common
  scale; un-mappable ratings stored raw and excluded from cross-source averages.
- **E-16:** *(v3)* **Category-relative trust** — the Trust Index is read relative to category and prior
  period, not as an absolute (a bank's trust bar differs from a snack brand's). Cross-category trust
  comparisons are flagged as context-dependent.

## 9. Exclusions (explicitly OUT of scope for v1)

- **X-1:** Not a CRM or customer-record system; does not build identity-resolved individual profiles.
- **X-2:** No two-way case management / ticketing; closing the loop in v1 is export/notification.
- **X-3:** Collection is limited to publicly available content obtained lawfully via APIs, licensed
  providers, or public web pages under the DPS-7 guardrails. No private/authenticated content, no bypassing
  logins/paywalls/technical protections, no collecting data a source's terms prohibit.
- **X-4:** No prediction of future business outcomes (churn, revenue) in v1.
- **X-5:** No public respondent panel / audience marketplace.
- **X-6:** Does not replace human research judgment; it is decision support with evidence attached.
- **X-7:** Does not attempt to re-identify individuals or merge scraped personal data into any profile.

## 10. Data, privacy & security

- **DPS-1:** The system is a data processor for the account's feedback; the company is the controller.
- **DPS-2:** Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, and
  excluded from logs and AI outputs by default.
- **DPS-3:** Data-subject requests are supported: export and deletion on request.
- **DPS-4:** AI processing is isolated to the account; account data is not used to train shared/base models
  without opt-in.
- **DPS-5:** A configurable retention period is supported for both first-party and collected data.
- **DPS-6:** The full security checklist (input validation, authz/authn, secret handling) is applied during
  build and verification. *(Note: security/privacy is also a Trust driver measured in O-12 — how safe
  customers feel is part of the trust picture.)*
- **DPS-7:** *Web/data-collection compliance.* Collect only publicly accessible content; respect
  `robots.txt` and reasonable rate limits; never bypass authentication, paywalls, or technical protections;
  prefer official APIs and licensed providers over page collection; keep provenance on every item; minimize
  and never profile personal data in reviews (INV-11); honor source terms. **The specific sources and
  methods are subject to the client's legal review and written sign-off before live collection is enabled.**
  *(Active AI Advisors is not providing legal advice; the client should confirm the approach with counsel.)*

## 11. Non-functional requirements

- **NFR-1 (Performance):** A survey page loads under 2 s on mobile; a submission acknowledges under 1 s.
- **NFR-2 (Analysis latency):** Analysis up to the MVP size (~5,000 items, Q-6) returns within a stated
  budget; larger sets run as background jobs with progress shown.
- **NFR-3 (Availability):** The collection endpoint targets a stated uptime; ingestion is durable even if
  analysis is degraded.
- **NFR-4 (Accessibility):** Respondent-facing surveys meet WCAG 2.1 AA.
- **NFR-5 (Scalability path):** Grows from SMB volumes toward larger sets without a rewrite.
- **NFR-6 (Explainability):** Every AI output carries the data behind it and, where meaningful, a confidence
  signal — including inferred Brand Love and Trust reads.
- **NFR-7 (Collection freshness & politeness):** Collected data shows a freshness/coverage indicator;
  collection runs at a polite, configurable rate and records gaps.

---

## 12. Data model (logical)

A plain-English, logical model — the records the system keeps and how they relate. Physical schema is an
Architecture-phase decision. Every record is scoped to an **Account** (tenant) for isolation (INV-6).

**Brand** — a company or competitor whose feedback is analyzed.

| Field | Meaning |
|-------|---------|
| brand_id | Unique id |
| name / aliases | Display name and alternates used to match reviews |
| type | `own` or `competitor` |
| products | Optional product / line names |
| tracked | Whether active collection is enabled |

**Source** — where a piece of feedback came from.

| Field | Meaning |
|-------|---------|
| source_id | Unique id |
| type | `survey` · `conversational` · `import_csv` · `web` · `api` · `provider` |
| name / url | Human name and, for web/API, the location |
| terms_note | Compliance note / permitted-use flag (DPS-7) |

**FeedbackRecord** — the core record: one rating and/or comment about one brand.

| Field | Meaning |
|-------|---------|
| record_id | Unique id |
| account_id | Owning tenant (INV-6) |
| brand_id | Which brand this is about — own or competitor (INV-1) |
| source_id | Where it came from (INV-1) |
| captured_at / date | When the feedback was given or collected |
| rating_raw / rating_scale | Original rating and its scale (`5_star`, `10_pt`, `nps`, `csat`, `brand_love`, `trust`, …) |
| rating_norm | Rating normalized to a common 1–5 ordinal (E-15) |
| brand_love | Love / Like / Ambiguity / Dislike / Hate, if applicable — ordinal 5→1 |
| trust *(v3)* | Trust rating if directly asked — normalized 1–5 |
| trust_drivers *(v3)* | Optional per-driver scores/tags: reliability, integrity, benevolence, security_privacy |
| comment_text | The open-text comment |
| language | Detected language (E-4) |
| segment / region / channel | Optional non-identifying metadata (I-5) |
| is_complete | Complete vs. partial (R-6) |
| flags | `junk` · `abuse` · `safety` · `low_confidence` (E-3, E-13) |
| provenance | source_url + capture_date, or import_batch (INV-10) |

**Sentiment** — derived, one per record: polarity, intensity, model_version/confidence.

**Trust** *(v3)* — derived, one per record where trust is present or inferred.

| Field | Meaning |
|-------|---------|
| record_id | The record it describes |
| trust_score | Normalized trust value |
| drivers | reliability / integrity / benevolence / security_privacy sub-scores |
| model_version / confidence | What produced it and how sure (NFR-6) |
| inferred | True if derived from open text rather than a direct rating (INV-4) |

**Theme / ThemeAssignment** — discovered topics and their links to records (with confidence).

**MetricSnapshot** — a computed rollup for a brand over a period and filter (O-4, O-9, O-11, O-12).

| Field | Meaning |
|-------|---------|
| brand_id / period | Brand and time window |
| metric | `avg_rating` · `nps` · `csat` · `brand_love_index` · `trust_index` *(v3)* · `trust_<driver>` *(v3)* · `neg_sentiment_share` · `response_rate` · `completion_rate` |
| value / filter_context | The number and the filter it was computed under (INV-2) |

**Love × Trust segment** *(v3)* — computed from the Brand Love and Trust metrics for a brand/segment; each
respondent or segment falls in one quadrant (Devoted / Infatuated / Dependable / At-risk) with counts and
shares (O-13).

**Supporting records:** Survey/Campaign, Segment (the dimension the unified-customer view aggregates by),
Alert (signal + threshold + brand scope), Account/User/Role.

**On the "unified customer" view (R-26, INV-9):** there is deliberately no individual-Customer entity
holding a person's identity across records. The unified view aggregates FeedbackRecords for an `own` brand
across all sources and time, grouped by Segment — a population read, not a person read.

---

## 13. Scope & phased roadmap

Only Phase 0 is committed by this document. Each later phase re-enters the pipeline before it is built.

### Phase 0 — MVP (the focused, buildable core)
- Survey builder: core types + **Brand Love scale** + **Trust battery** + conditional logic
  (R-1, R-3, R-30, R-31).
- AI-drafted survey from a goal (R-2).
- Distribution by link + embeddable widget (R-4).
- Mobile, account-free capture incl. partials (R-5, R-6).
- Conversational AI survey with scope control + turn limits (R-7–R-10).
- CSV import into the unified hub (R-11, R-13).
- Unified cross-source analysis + aggregate unified-customer view (R-12, R-26).
- AI theme + sentiment + **Brand Love** + **Trust** with traceability (R-14–R-16, R-30, R-32).
- Core metrics incl. NPS/CSAT + **Brand Love Index** + **Trust Index** (R-19, O-11, O-12).
- **Love × Trust segmentation** with recommended actions (R-33, O-13).
- Insight report with ranked actions, exportable (R-18, R-22).
- Two roles, account isolation, data export/delete (R-21, R-23, INV-6, INV-7).

> **MVP note on Trust depth:** the MVP can ship with a **single-item trust rating plus inferred trust**
> from open text; the full multi-item **driver battery** (reliability/integrity/benevolence/security) can
> be a fast-follow if it risks the MVP timeline. See Q-14.

### Phase 1 — Competitive insight & distribution
- Competitor configuration and benchmarking (own vs competitors) on ratings, Brand Love, Trust, sentiment,
  themes (R-24, R-27, O-9) — using CSV / licensed-provider / API sources first.
- Live web collection (R-25, DPS-7) — enabled only after the client's legal review and sign-off.
- Per-competitor deep-dive (R-28, O-10).
- Natural-language "ask your data" query with citations (R-17, O-6).
- Email distribution + reminders (R-4 email); configurable alerts (R-20); slides export.

### Phase 2 — Connectors & scale
- Additional sanctioned connectors; larger-volume background processing (NFR-5); multi-language expansion
  (Q-4); team collaboration.

### Phase 3 — Advanced insight
- **Driver analysis** — what most influences Brand Love and Trust; **love-type** distinction (passion vs.
  intimacy/loyalty, per Nobre 2011) and a **resilience** measure (does sentiment/repurchase hold after a
  negative event); benchmarking against prior periods and optional, opt-in, anonymized peer norms; a
  research assistant that proposes surveys from the gaps it finds.

---

## 14. Open questions (client decision needed)

- **Q-1: Product name** — is "AAA Insights" the intended name or a working title?
- **Q-2: Build vs. buy the survey engine** — build collection natively, or wrap an existing component?
- **Q-3: AI models / hosting** — any constraints on model provider or data residency?
- **Q-4: Language coverage for v1** — English-only, or which additional languages at launch?
- **Q-5: Compliance targets** — which regimes must v1 satisfy (GDPR, CCPA, SOC 2 roadmap)?
- **Q-6: MVP volume target** — what item volume must the MVP handle comfortably?
- **Q-7: Commercial model** — per-seat, per-response, per-survey, per-competitor, or tiered?
- **Q-8: First design partner** — a specific first customer/segment to anchor the MVP?
- **Q-9: Brand-love framework** — resolved: Brand Love grounded in Batra/Ahuvia/Bagozzi (2012). Confirm
  "Ambiguity" as the middle label (vs. "Ambivalence"/"Neutral").
- **Q-10: Competitors & sources** — which competitors to track first, and which review sources matter most?
- **Q-11: Collection method & legal sign-off** — confirm the API / licensed-provider / public-web mix, and
  who provides the legal review that gates live web collection (DPS-7).
- **Q-12: Rating normalization** — confirm the common scale (proposed 1–5) and the Brand Love Index formula
  (proposed: %(Love+Like) − %(Dislike+Hate)).
- **Q-13: Collected-data retention** — how long should collected competitor/web data be retained?
- **Q-14:** *(v3)* **Trust depth for v1** — single-item trust rating plus inference, or the full
  multi-item driver battery (reliability/integrity/benevolence/security)? *(Recommendation: single-item +
  inference in the MVP; driver battery as a fast-follow.)*
- **Q-15:** *(v3)* **Trust driver taxonomy** — confirm reliability / integrity / benevolence /
  security-privacy as the drivers, and the Trust Index formula (proposed net: %positive-trust −
  %negative-trust, computed on the normalized scale).

---

## Approval

This is the Phase-1 gate. On your approval, we proceed to **CHALLENGE (Phase 2)** — an adversarial review
that stress-tests this specification (v3 now carries competitive collection, a data model, and the
Love/Trust indicator pair, which widen the attack surface) — and fold the results, plus your answers to
§14, into Requirements v4.

Approved by: __________________________    Date: ______________

*Prepared by Active AI Advisors under the Grounded AI™ methodology. Every phase produces an artifact you own.*
