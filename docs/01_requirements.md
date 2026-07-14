# Product Requirements Document — AAA Insights

**Version:** v2  |  **Status:** Draft (revised per client input, awaiting approval)  |  **Date:** 2026-07-13
**Owner:** Active AI Advisors  |  **Prepared for:** Paul Jamieson
**Methodology:** Grounded AI™ — Phase 1 (SPECIFY)

> Changes in v2 (from client direction, 2026-07-13): the product adds an **aggregate, cross-source
> "unified customer" view** (population-level, identity stays optional); **competitors as first-class
> entities** for both aggregate benchmarking and per-competitor deep-dives; **feedback collection from
> the public web / APIs / CSV** under explicit compliance guardrails and a legal-review gate; a
> **Brand Love rating scale** (Love / Like / Ambiguity / Dislike / Hate) as a supported question type,
> a normalized metric, and a benchmark lens; and a new **explicit data model** (§12). Added/changed
> IDs are marked *(v2)*.

> This is the specification gate for AAA Insights. No implementation begins until this document is
> approved. Sections 1–3 frame the product; sections 4–11 are the testable requirements; section 12 is
> the data model; section 13 is the roadmap; section 14 is the list of decisions we need from you.

---

## 1. Purpose

AAA Insights is a software service that lets a company **collect** feedback from its customers and
consumers — through surveys, reviews, ratings, and open comments — **unify** that feedback in one place,
and **analyze** it with AI to produce plain-language insight the business can act on. *(v2)* It extends
this to a **competitive** view: the same collection and analysis run against the company's tracked
competitors, so a company can see not only what its own customers think, but how its brand compares.

It closes the gap most small and mid-market companies live with today: they have customer feedback,
scattered across survey tools, review sites, support tickets, and inboxes, but lack the research team to
turn it into decisions. AAA Insights applies AI research techniques — theme and sentiment analysis,
adaptive conversational interviewing, brand-love measurement, and automated synthesis — so a company
without a dedicated insights function can understand what its customers (and its competitors' customers)
think, why, and what to do about it.

The product is not "another survey tool." Survey creation is the on-ramp; the differentiated value is
what happens after the feedback arrives — automatic discovery of themes and sentiment, AI-led follow-up
that probes like a human interviewer, one unified feedback hub across sources, competitive benchmarking,
and generated insight with recommended actions.

## 2. Target users and buyer

**Primary market:** small and mid-market companies (roughly 10–500 employees) that sell to customers or
consumers and want to understand them better, but do not have an in-house market-research or
CX-analytics team.

| User role | What they need from AAA Insights |
|-----------|----------------------------------|
| **Owner / founder / GM** (buyer) | A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first. |
| **Marketing / brand lead** | Themes, sentiment, brand-love, verbatim quotes, and competitive position to guide messaging and positioning. |
| **CX / customer-success manager** | Early warning on dissatisfaction, drivers of churn, and a way to close the loop with unhappy customers. |
| **Product manager** | Prioritized signal on what customers want changed, backed by evidence and volume. |
| **Respondent** (the customer) | A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard. |

The **buyer and administrator** is typically the owner, marketing lead, or CX manager. The **end
respondent** is their customer. The system serves two audiences: credible analysis for the business, and
fast, low-friction, private response for the customer.

## 3. Product principles

1. **Insight over dashboards.** The default output is a plain-language answer to "what should I know and
   do," not a wall of charts.
2. **Every insight is traceable.** No AI-generated theme, sentiment, brand-love read, or recommendation
   appears without a path to the verbatim responses that support it.
3. **Respect the respondent.** Surveys are short, mobile-first, accessible, and privacy-respecting.
4. **Trustworthy AI.** AI analysis carries its confidence and its source data; it never fabricates a
   quote or a statistic, and it separates what respondents said from what the AI inferred.
5. **Lawful by construction.** *(v2)* Feedback we collect from outside the company — including competitor
   data — is publicly available and lawfully obtained, with provenance kept on every item. Compliance is
   a design property, not an afterthought (see §10).
6. **Start simple, grow deliberately.** The MVP is a tight, buildable core; every later capability is
   added against this same specification discipline.

---

## 4. Inputs

- **I-1: Survey definition** — built by an admin (questions, types, logic, branding) or AI-generated from
  a plain-language goal. Stored as structured survey config. *(v2)* Question types include the **Brand
  Love scale** (Love / Like / Ambiguity / Dislike / Hate).
- **I-2: Survey response** — a respondent's answers: ratings (including Brand Love), multiple-choice, and
  open-text comments. May be partial.
- **I-3: Conversational response** — free-text turns in an AI-led adaptive interview, captured as a
  threaded transcript.
- **I-4: Imported feedback** — external reviews, ratings, and comments for the company's **own** brand via
  CSV upload. Each carries source, timestamp, rating, and text.
- **I-5: Respondent metadata** — optional, non-identifying attributes (segment, channel, product line,
  region, language) used for filtering and comparison.
- **I-6: Distribution request** — an admin action to publish a survey via link, email list, or widget.
- **I-7: Analysis query** — a natural-language question asked of the feedback data.
- **I-8: Competitor configuration** *(v2)* — the set of competitor brands to track: names, aliases,
  associated products, and the public sources (sites/APIs) where their reviews live.
- **I-9: Externally-collected feedback** *(v2)* — reviews, ratings, and comments about the company's own
  brand **and its tracked competitors**, gathered from public web pages, review-site APIs, or a licensed
  data provider. Each item carries source URL, capture date, brand, rating (if any), and text.

## 5. Outputs

- **O-1: Collected response store** — every response (survey, conversational, imported, web-collected)
  persisted under a common schema, attributable to its source, brand, and campaign.
- **O-2: Theme analysis** — AI-generated themes for a chosen set of responses, each with a label,
  count/percentage, representative quotes, and trend vs. prior period. Filterable by brand *(v2)*.
- **O-3: Sentiment analysis** — positive / neutral / negative with intensity, per response and aggregated
  by theme, segment, source, brand *(v2)*, and time.
- **O-4: Ratings & metrics** — average ratings, distribution, response/completion rates, and standard
  indices (NPS, CSAT) where questions qualify.
- **O-5: Insight report** — a plain-language narrative of what's happening, why, and what to do, with
  ranked recommended actions. *(v2)* Can include the competitive picture. Exportable.
- **O-6: Answer to an analysis query** — grounded strictly in the account's own data, citing the specific
  responses used.
- **O-7: Alerts** — notifications when a monitored signal crosses a threshold.
- **O-8: Respondent-facing survey** — the rendered survey or conversational interview.
- **O-9: Competitive benchmark** *(v2)* — a side-by-side comparison of the company's brand vs. its tracked
  competitors on ratings, Brand Love, sentiment, and themes over a chosen period.
- **O-10: Per-competitor analysis** *(v2)* — for a selected competitor, an aggregate view of that
  competitor's customers' themes, sentiment, ratings, and Brand Love, with traceability to the underlying
  public reviews.
- **O-11: Brand Love read** *(v2)* — the distribution across Love / Like / Ambiguity / Dislike / Hate and
  a **Brand Love Index** (share of Love+Like minus share of Dislike+Hate), for the company and per
  competitor, over time.

## 6. Requirements (behaviors)

Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.

**Survey creation & distribution**

- **R-1:** An admin can create a survey with at least: single-select, multi-select, rating/scale
  (configurable range), open text, and *(v2)* the **Brand Love scale** (Love / Like / Ambiguity /
  Dislike / Hate).
- **R-2:** An admin can generate a draft survey from a plain-language objective; the result is editable
  before sending.
- **R-3:** A survey supports conditional logic: a question or branch is shown or skipped based on a
  previous answer.
- **R-4:** An admin can distribute by (a) shareable link, (b) email invitation list, and (c) embeddable
  widget. (Email is a Phase-1 roadmap item; link and widget are MVP.)
- **R-5:** A respondent can complete a survey on mobile and desktop without creating an account.
- **R-6:** The system records partial responses and marks them incomplete rather than discarding them.

**Conversational (AI-led) surveys**

- **R-7:** An admin can enable a conversational mode in which an AI interviewer asks questions and
  relevant follow-up probes in natural language.
- **R-8:** The interviewer stays on the admin-defined objective and does not ask outside the topic scope.
- **R-9:** The interviewer ends after a configurable maximum number of exchanges or when the objective is
  met.
- **R-10:** Every conversational transcript is stored and analyzable by the same engine as structured
  responses.

**Unified feedback hub**

- **R-11:** An admin can import external feedback via CSV, mapping columns to the unified schema
  (brand, source, date, rating, text, segment).
- **R-12:** All feedback — survey, conversational, imported, web-collected — is queryable together,
  filterable by brand *(v2)*, source, campaign, date range, segment, rating, and sentiment.
- **R-13:** The system de-duplicates obviously identical items (same source + text + timestamp) so they
  are not double-counted.

**Brand Love & metrics** *(v2)*

- **R-14:** For any filtered set of responses, the system produces theme analysis with counts and
  representative quotes.
- **R-15:** The system assigns sentiment to each open-text response and aggregates it across the chosen
  dimensions.
- **R-16:** For every theme, sentiment aggregate, and Brand Love read, the user can open the exact
  underlying responses that produced it (traceability — INV-3).
- **R-30:** *(v2)* The system records Brand Love on the five-point scale (Love / Like / Ambiguity /
  Dislike / Hate), normalizes it to an ordinal value, and computes the Brand Love distribution and Index
  (O-11) for any filtered set — including inferring a Brand Love read from open-text where a direct rating
  is absent, clearly labeled as inferred (INV-4).

**Unified customer & competitive insight** *(v2)*

- **R-26:** The system produces an **aggregate, cross-source "unified customer" view** of the account's
  customer base — one combined read across all feedback sources and time — **without** building or
  requiring an identity-linked profile of any individual (INV-9).
- **R-24:** An admin can define and manage a set of **competitor brands** to track (I-8).
- **R-25:** The system collects publicly available reviews/ratings/comments about the company's brand and
  its tracked competitors from configured sources — review-site APIs, a licensed data provider, and/or
  public web pages — subject to the compliance requirements in §10 (DPS-7) and a legal-review gate before
  live collection is enabled.
- **R-27:** The system **benchmarks** the company's brand vs. its competitors on ratings, Brand Love,
  sentiment, and themes over a chosen period (O-9).
- **R-28:** For a selected competitor, the system produces **per-competitor aggregate analysis** (O-10)
  with traceability to the underlying public reviews.
- **R-29:** All brand and competitor analysis is filterable by brand, source, date, segment, and
  sentiment, and every competitor figure links to its source items.

**AI analysis, accounts, roles, export**

- **R-17:** An admin can ask a natural-language question of their data and receive an answer grounded only
  in their own account's data, with citations.
- **R-18:** The system generates an insight report for a chosen scope: narrative, metrics, top themes,
  sentiment, Brand Love, competitive comparison, quotes, and ranked recommended actions.
- **R-19:** The system computes response rate, completion rate, average rating, rating distribution, and
  at least NPS and CSAT when questions qualify.
- **R-20:** An admin can configure an alert on a signal (negative-sentiment share, average rating, Brand
  Love Index, new theme) and be notified when the threshold is crossed.
- **R-21:** At least two roles: an Owner/Admin (account, users, billing) and a Member (builds surveys,
  views analysis).
- **R-22:** An admin can export any analysis view and the insight report (CSV for raw data; PDF and/or
  slides for the report).
- **R-23:** An admin can delete a survey, campaign, or individual response, and can export or delete all
  data for the account.

## 7. Invariants (must ALWAYS be true)

- **INV-1:** Every response is attributable to exactly one source **and one brand** *(v2)*. No response
  exists without a known origin.
- **INV-2:** Response counts are never negative and never exceed responses actually collected; percentages
  are computed from the current filter and each response is counted once per dimension.
- **INV-3:** Every AI-generated theme, aggregate, Brand Love read, insight, recommendation, and query
  answer is traceable to the specific underlying responses. The UI never shows an AI claim without a path
  to its verbatim data.
- **INV-4:** The system never displays a quote or statistic absent from the collected data, and it labels
  any value it **inferred** (e.g., Brand Love from open text) as inferred rather than stated.
- **INV-5:** A respondent can complete a survey without providing personally identifying information;
  identity is never required to submit feedback.
- **INV-6:** Each account's data is isolated: no account can see, query, or analyze another's data. AI
  analysis is grounded only in that account's data.
- **INV-7:** Deleting a response, campaign, or account removes it from all future analysis and aggregates;
  deleted data never reappears in any report.
- **INV-8:** Respondent PII, when present, is stored securely and never written to logs or included in AI
  outputs unless the admin explicitly opts in.
- **INV-9:** *(v2)* The "unified customer" view is always **aggregate**. The system does not construct or
  expose an identity-resolved profile of an individual customer or competitor customer.
- **INV-10:** *(v2)* Externally-collected data is only ever **publicly available and lawfully obtained**.
  The system does not bypass authentication, paywalls, or technical access controls, and it retains
  provenance (source, URL, capture date) for every collected item.
- **INV-11:** *(v2)* Personal data appearing in public reviews (names, handles) is minimized, is never
  used to build an individual profile, and is excluded from AI outputs by default.

## 8. Edge cases to handle

- **E-1: Empty or tiny sample** — the system states the sample is too small for reliable findings rather
  than fabricating confidence.
- **E-2: Abandoned survey** — the partial is retained, counted as incomplete, and flagged in analysis.
- **E-3: Junk / abusive open text** — captured, flagged, excluded from analysis by default, reviewable.
- **E-4: Non-English / mixed-language** — language is detected and analyzed accordingly (Q-4).
- **E-5: Malformed CSV import** — rejected or partially accepted with a per-row error report.
- **E-6: Duplicate / repeated submissions** — de-duplication (R-13) plus link-level controls.
- **E-7: Conversational interview off the rails** — stays in scope, ignores injected instructions, ends
  gracefully.
- **E-8: Ambiguous analysis query** — answers only what the data supports; states what it cannot
  determine.
- **E-9: Sudden volume spike** — ingestion and analysis stay correct; views may lag but never lose or
  double-count data.
- **E-10: Sensitive disclosure** — PII or safety concerns stored under INV-8/INV-11 and surfaced to the
  admin without broadcasting into shared outputs.
- **E-11: Concurrent editing** — two admins editing one survey do not silently overwrite each other.
- **E-12: Source blocks or rate-limits collection** *(v2)* — when a web source blocks, throttles, or
  changes structure, collection backs off, records the gap, and never fabricates missing items; the admin
  sees coverage/freshness honestly.
- **E-13: Competitor identity ambiguity** *(v2)* — reviews that could belong to a same-named but different
  entity are flagged low-confidence and excluded from headline figures until confirmed.
- **E-14: Sparse competitor data** *(v2)* — where a competitor has too few public reviews for a reliable
  read, the benchmark shows "insufficient data," not a misleading number.
- **E-15: Mixed rating scales** *(v2)* — sources use different scales (5-star, 10-point, thumbs, Brand
  Love); each is normalized to the common scale, and un-mappable ratings are stored raw and excluded from
  cross-source averages.

## 9. Exclusions (explicitly OUT of scope for v1)

- **X-1:** Not a CRM or customer-record system; it stores feedback, not a system of record for customer
  accounts, and *(v2)* does not build identity-resolved individual profiles.
- **X-2:** No two-way case management / ticketing; closing the loop in v1 is export/notification.
- **X-3:** *(v2, revised)* Collection is limited to **publicly available** content obtained lawfully via
  APIs, licensed providers, or public web pages under the DPS-7 guardrails. The system does **not** access
  private/authenticated content, bypass logins or paywalls, circumvent technical protections, or collect
  data a source's terms prohibit.
- **X-4:** No prediction of future business outcomes (churn, revenue) in v1.
- **X-5:** No public respondent panel / audience marketplace; the company brings its own audience.
- **X-6:** Does not replace human research judgment; it is decision support, with every AI output shown
  alongside its evidence.
- **X-7:** *(v2)* Does not attempt to re-identify individuals, link competitor reviewers to real people,
  or merge scraped personal data into any profile.

## 10. Data, privacy & security

- **DPS-1:** The system is a data processor for the account's feedback; the company is the controller.
- **DPS-2:** Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role,
  and excluded from logs and AI outputs by default.
- **DPS-3:** Data-subject requests are supported: export and deletion on request.
- **DPS-4:** AI processing is isolated to the account; account data is not used to train shared/base
  models without explicit opt-in.
- **DPS-5:** A configurable retention period is supported for both first-party and collected data.
- **DPS-6:** The full security checklist (input validation, authz/authn, secret handling) is applied
  during build and verification.
- **DPS-7:** *(v2) Web/data-collection compliance.* The system collects only publicly accessible content;
  respects `robots.txt` and reasonable rate limits; never bypasses authentication, paywalls, or technical
  protections; prefers official APIs and licensed providers over page collection; keeps provenance
  (source, URL, capture date) on every item; minimizes and never profiles personal data in reviews
  (INV-11); and honors source-specific terms. **The specific sources and collection methods are subject to
  the client's legal review and written sign-off before live collection is enabled** — this is a gate, not
  a default. *(Active AI Advisors is not providing legal advice; the client should confirm the approach
  with counsel.)*

## 11. Non-functional requirements

- **NFR-1 (Performance):** A survey page loads in under 2 s on mobile; a submission acknowledges in under
  1 s.
- **NFR-2 (Analysis latency):** Analysis up to the MVP size (target ~5,000 items, Q-6) returns within a
  stated budget; larger sets run as background jobs with progress shown.
- **NFR-3 (Availability):** The collection endpoint targets a stated uptime so responses are never lost;
  ingestion is durable even if analysis is degraded.
- **NFR-4 (Accessibility):** Respondent-facing surveys meet WCAG 2.1 AA.
- **NFR-5 (Scalability path):** The architecture grows from SMB volumes toward larger sets without a
  rewrite.
- **NFR-6 (Explainability):** Every AI output carries an indication of the data behind it and, where
  meaningful, a confidence signal.
- **NFR-7 (Collection freshness & politeness):** *(v2)* Collected data has a visible freshness/coverage
  indicator; collection runs at a polite, configurable rate and records gaps rather than guessing.

---

## 12. Data model (logical) *(v2)*

A plain-English, logical model — the records the system keeps and how they relate. Physical schema
(database engine, indexes, storage) is decided in the Architecture phase; this section defines *what* is
stored, not *how*. Every record is scoped to an **Account** (tenant) for isolation (INV-6).

**Brand** — a company or competitor whose feedback is analyzed.

| Field | Meaning |
|-------|---------|
| brand_id | Unique id |
| name / aliases | Display name and alternates used to match reviews |
| type | `own` or `competitor` |
| products | Optional product/line names |
| tracked | Whether active collection is enabled |

**Source** — where a piece of feedback came from.

| Field | Meaning |
|-------|---------|
| source_id | Unique id |
| type | `survey` · `conversational` · `import_csv` · `web` · `api` · `provider` |
| name / url | Human name and, for web/API, the location |
| terms_note | Compliance note / permitted-use flag (DPS-7) |

**FeedbackRecord** — the core record: one rating and/or comment about one brand. *(This is the "database
of brand ratings, date, comments, etc." — the heart of the model.)*

| Field | Meaning |
|-------|---------|
| record_id | Unique id |
| account_id | Owning tenant (INV-6) |
| brand_id | Which brand this is about (own or competitor) — INV-1 |
| source_id | Where it came from — INV-1 |
| captured_at / date | When the feedback was given or collected |
| rating_raw / rating_scale | Original rating and its scale (`5_star`, `10_pt`, `nps`, `csat`, `brand_love`, …) |
| rating_norm | Rating normalized to a common 1–5 ordinal (E-15) |
| brand_love | One of Love / Like / Ambiguity / Dislike / Hate, if applicable — normalized ordinal 5→1 |
| comment_text | The open-text comment |
| language | Detected language (E-4) |
| segment / region / channel | Optional non-identifying metadata (I-5) |
| is_complete | Complete vs. partial (R-6) |
| flags | `junk` · `abuse` · `safety` · `low_confidence` (E-3, E-13) |
| provenance | source_url + capture_date (web/API) or import_batch (INV-10) |

**Sentiment** — derived, one per record.

| Field | Meaning |
|-------|---------|
| record_id | The record it describes |
| polarity | positive / neutral / negative |
| intensity | strength score |
| model_version / confidence | What produced it and how sure (NFR-6) |

**Theme** and **ThemeAssignment** — discovered topics and their links to records.

| Field | Meaning |
|-------|---------|
| theme_id / label | The theme and its plain-language name |
| scope | Account + optional brand/period the theme was derived in |
| (assignment) record_id → theme_id | Which records mention the theme, with confidence |

**MetricSnapshot** — a computed rollup for a brand over a period and filter (supports O-4, O-9, O-11).

| Field | Meaning |
|-------|---------|
| brand_id / period | Brand and time window |
| metric | `avg_rating` · `nps` · `csat` · `brand_love_index` · `neg_sentiment_share` · `response_rate` · `completion_rate` |
| value / filter_context | The number and the filter it was computed under (INV-2) |

**Supporting records:** **Survey/Campaign** (config, status, owning brand), **Segment** (named filter
definition — the dimension the "unified customer" view aggregates by), **Alert** (signal + threshold +
brand scope), **Account/User/Role** (tenancy and permissions).

**On the "unified customer" view (R-26, INV-9):** there is deliberately **no** individual-Customer entity
holding a person's identity across records. The unified view is produced by aggregating FeedbackRecords
for an `own` brand across all Sources and time, grouped by Segment — a population read, not a person read.

---

## 13. Scope & phased roadmap

Only Phase 0 is committed by this document. Each later phase re-enters the pipeline before it is built.

### Phase 0 — MVP (the focused, buildable core)
- Survey builder: core question types + **Brand Love scale** + conditional logic (R-1, R-3, R-30).
- AI-drafted survey from a goal (R-2).
- Distribution by link + embeddable widget (R-4).
- Mobile, account-free capture incl. partials (R-5, R-6).
- Conversational AI survey with scope control + turn limits (R-7–R-10).
- CSV import into the unified hub (R-11, R-13).
- Unified, cross-source analysis with filtering (R-12) and the **aggregate unified-customer view** (R-26).
- AI theme + sentiment + **Brand Love** with traceability (R-14–R-16, R-30).
- Core metrics incl. NPS/CSAT and **Brand Love Index** (R-19, O-11).
- Insight report with ranked actions, exportable (R-18, R-22).
- Two roles, account isolation, data export/delete (R-21, R-23, INV-6, INV-7).

### Phase 1 — Competitive insight & distribution
- Competitor configuration and **benchmarking** (own vs competitors) on ratings, Brand Love, sentiment,
  themes (R-24, R-27, O-9) — using **CSV / licensed-provider / API** sources first.
- **Live web collection** (R-25, DPS-7) — *enabled only after the client's legal review and sign-off.*
  Until then, competitor data flows through CSV/API/provider.
- Per-competitor deep-dive (R-28, O-10).
- Natural-language "ask your data" query with citations (R-17, O-6).
- Email invitation distribution and reminders (R-4 email); configurable alerts (R-20); slides export.

> **Advisory note (scope & risk):** competitive intelligence and web collection are the biggest
> additions in v2 and materially expand the build. The MVP delivers the aggregate unified-customer view
> and the data model that *holds* competitor brands; standing up compliant collection (legal review,
> source integrations, matching/normalization, freshness handling) is Phase 1 so the MVP is not gated on
> it. This sequencing is a recommendation — say the word and we'll re-weight.

### Phase 2 — Connectors & scale
- Additional sanctioned connectors; larger-volume background processing (NFR-5); multi-language
  expansion (Q-4); team collaboration (shared workspaces, comments, saved views).

### Phase 3 — Advanced insight
- Driver analysis (what most influences rating / Brand Love); benchmarking against prior periods and
  optional, opt-in, anonymized peer norms; a research assistant that proposes surveys from the gaps it
  finds.

---

## 14. Open questions (client decision needed)

- **Q-1: Product name** — is "AAA Insights" the intended name or a working title?
- **Q-2: Build vs. buy the survey engine** — build collection natively, or wrap an existing component and
  focus the build on the AI/analysis layer?
- **Q-3: AI models / hosting** — any constraints on model provider or data residency?
- **Q-4: Language coverage for v1** — English-only, or which additional languages at launch?
- **Q-5: Compliance targets** — which regimes must v1 satisfy (GDPR, CCPA, SOC 2 roadmap)?
- **Q-6: MVP volume target** — what item volume must the MVP handle comfortably?
- **Q-7: Commercial model** — per-seat, per-response, per-survey, per-competitor, or tiered?
- **Q-8: First design partner** — a specific first customer/segment to anchor the MVP?
- **Q-9: Brand-love framework** — *resolved (v2):* Brand Love (Love / Like / Ambiguity / Dislike / Hate)
  is a first-class scale and insight lens. **Remaining:** should we ground it in a specific published
  framework (e.g., Ahuvia) for the inferred-from-text read and the Index formula, and is "Ambiguity" the
  final middle label (vs. "Ambivalence"/"Neutral")?
- **Q-10: Competitors & sources** *(v2)* — which competitors to track first, and which review sources
  (sites/APIs/providers) matter most in your market?
- **Q-11: Collection method & legal sign-off** *(v2)* — confirm the intended mix of API / licensed
  provider / public-web collection, and who provides the legal review that gates live web collection
  (DPS-7). Recommendation: start on APIs/licensed data; add public-web collection after counsel sign-off.
- **Q-12: Rating normalization** *(v2)* — confirm the common normalized scale (proposed 1–5) and the
  Brand Love Index formula (proposed: %(Love+Like) − %(Dislike+Hate)).
- **Q-13: Collected-data retention** *(v2)* — how long should collected competitor/web data be retained?

---

## Approval

This is the Phase-1 gate. On your approval, we proceed to **CHALLENGE (Phase 2)** — an adversarial review
that stress-tests this specification (v2 now carries competitive collection and a data model, which widen
the attack surface) — and fold the results, plus your answers to §14, into Requirements v3.

Approved by: __________________________    Date: ______________

*Prepared by Active AI Advisors under the Grounded AI™ methodology. Every phase produces an artifact you own.*
