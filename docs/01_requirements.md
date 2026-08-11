# Product Requirements Document — AAA Insights

**Version:** v7.1  |  **Status:** Approved — NFR targets confirmed  |  **Date:** 2026-08-11
**Owner:** Active AI Advisors  |  **Prepared for:** Paul Jamieson
**Methodology:** Grounded AI™ — Phase 1 (SPECIFY increment → v7)

> **Changes in v7.1 (2026-08-11):** confirmed the four placeholder NFR targets (F-15). NFR-2 analysis
> **p95 ≤ 60 s**, NFR-3 **99.9% uptime**, NFR-8 trigger **≤ 60 s**, and NFR-9 **tightened to RPO ≤ 1 h /
> RTO ≤ 8 h** (from the 24 h placeholder — losing up to a day of feedback was too loose; point-in-time
> recovery on managed Postgres makes ~1 h cheap). No scope change; the `(confirm)` markers are removed.

> **Changes in v7 (2026-07-30):** added an **Emotion & Experience** analysis pillar and an explicit
> **Strengths & Gripes** (aspect-based pros/cons) output. The product now reads the **emotional texture**
> of feedback — *what* customers feel (pride, relief, delight vs. frustration, disappointment, anger) — as
> a per-brand **emotion profile** (O-17), and extracts the specific **pluses and minuses** customers name,
> grouped by attribute and ranked by their association with Love/Trust (O-18). Both compare **own brand vs.
> competitors** (O-19). Emotions use a **compact, manager-readable headline set (~7) that rolls up a finer
> sub-emotion set** on demand (D-17). New requirements R-46–R-50; invariants INV-15/INV-16; edge cases
> E-25–E-27; Emotion + Aspect records in the data model. Scope: **own-brand emotion + strengths/gripes in
> the MVP; the competitive comparison rides Phase-1 competitor collection** (D-18). Emotion and aspect
> reads are **AI-inferred companion signals** — labeled, confidence-scored, and **never blended into the
> stated Brand Love / Trust headline** (extends INV-4/INV-14).
>
> *v6 folded in the Phase-2 CHALLENGE findings (§15); v5 added the Closed-Loop / Service Recovery pillar; v4
> resolved the 15 SPECIFY open questions; v3 added Brand Trust; v2 added the unified-customer view,
> competitors, lawful collection, Brand Love, data model.*

> This is the specification gate. On approval, v7 is the baseline that carries into TEST FIRST (Phase 3).
> Sections 1–3 frame the product; 4–11 are the testable requirements; 12 is the data model; 13 is the
> roadmap; 14 records the SPECIFY decisions; 15 records the CHALLENGE resolutions.

---

## 1. Purpose

AAA Insights is a software service that lets a company **collect** feedback from its customers and
consumers — through surveys, reviews, ratings, and open comments — **unify** that feedback in one place,
and **analyze** it with AI to produce plain-language insight the business can act on. It extends this to a
**competitive** view (the same analysis run against tracked competitors) and to **acting** on what it finds
— resolving dissatisfied customers and reinforcing loyal ones, and measuring whether the action worked.

At the heart of the analysis are two complementary relationship indicators: **Brand Love** (the emotional
pull — identity, passion, attachment) and **Brand Trust** (confidence the brand is reliable, honest, and
acts in the customer's interest). Measured together they diagnose what neither does alone — an attached
customer who no longer trusts the brand is a very different, and more fragile, situation than one who is
both attached and trusting.

Underneath those indicators, the product reads two things that help a manager *empathize and act*: the
**emotional texture** of the experience — the specific emotions customers voice about the brand, and how
they compare to rivals — and the concrete **strengths and gripes** (the pluses and minuses) customers name
in their own words. These are inferred from open text and stand beside the stated indicators as labeled,
evidence-backed reads, never blended into a headline number.

The product is not "another survey tool." Survey creation is the on-ramp; the value is what happens after
feedback arrives — themes and sentiment, conversational probing, brand-love and trust measurement, a
unified hub, competitive benchmarking, insight with recommended actions, and a closed loop that helps the
company act and measures the recovery.

## 2. Target users and buyer

**Primary market:** SMB / mid-market companies (~10–500 employees) that want to understand customers but
have no in-house market-research or CX-analytics team.

| User role | What they need from AAA Insights |
|-----------|----------------------------------|
| **Owner / founder / GM** (buyer) | A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first. |
| **Marketing / brand lead** | Themes, sentiment, brand-love, trust, quotes, and competitive position to guide messaging and positioning. |
| **CX / customer-success manager** | Early warning on dissatisfaction, eroding trust, drivers of churn, and a way to work and close recovery cases. |
| **Product manager** | Prioritized signal on what customers want changed, backed by evidence and volume. |
| **Respondent** (the customer) | A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard. |

## 3. Product principles

1. **Insight over dashboards.** A plain-language answer to "what should I know and do," not a wall of charts.
2. **Every insight is traceable.** No theme, sentiment, brand-love read, trust read, or recommendation
   appears without a path to the verbatim responses that support it.
3. **Respect the respondent.** Surveys are short, mobile-first, accessible, and privacy-respecting.
4. **Trustworthy AI.** AI output carries its confidence and source data; it never fabricates, it separates
   what was said from what was inferred, and it **never blends an inference into a stated headline number.**
5. **Lawful by construction.** Externally collected data is public and lawfully obtained, with provenance on
   every item; personal data is minimized and consent-gated. Compliance is a design property (see §10).
6. **Measure the relationship, not just the transaction.** Love and Trust are distinct first-class signals,
   never collapsed into satisfaction or into each other.
7. **Start simple, grow deliberately.** The MVP is a tight, buildable core.
8. **Close the loop; measure the recovery.** The product helps a company act on dissatisfaction and
   reinforce loyalty, and measures whether the action rebuilt love and trust. The loop is **owned and run
   internally** (no customer data pushed to third-party tools in v1).
9. **Read the feeling, name the reasons.** Beyond the scores, surface the *emotions* customers express and
   the *specific things* they praise or criticize — always as labeled inferences with the verbatims behind
   them, so a manager can empathize with, and act on, what customers actually feel and say.

---

## 4. Inputs

- **I-1: Survey definition** — built by an admin or AI-generated. Question types include single-select,
  multi-select, rating/scale, open text, the **Brand Love scale** (Love / Like / Ambivalence / Dislike /
  Hate), and the **Trust battery** (single-item and/or a driver battery: reliability, integrity,
  benevolence, security/privacy).
- **I-2: Survey response** — ratings (incl. Brand Love and Trust), multiple-choice, and open-text comments.
  May be partial.
- **I-3: Conversational response** — free-text turns in an AI-led adaptive interview, as a transcript.
- **I-4: Imported feedback** — external reviews/ratings/comments for the company's own brand via CSV.
- **I-5: Respondent metadata** — optional, non-identifying attributes (segment, channel, product, region,
  language).
- **I-6: Distribution request** — publish a survey via link, email list, or widget.
- **I-7: Analysis query** — a natural-language question asked of the feedback data.
- **I-8: Competitor configuration** — competitor brands to track: names, aliases, products, public sources.
- **I-9: Externally-collected feedback** — reviews/ratings/comments about the own brand and tracked
  competitors, from public web pages, review-site APIs, or a licensed provider (source URL, capture date,
  brand, rating, text). Analysis-only; never a basis for individual outreach (X-7).
- **I-10: Respondent contact & consent** *(v5)* — optional, opt-in contact a first-party respondent provides
  so the company may follow up (e.g., email), with an **age-appropriate gate** (F-19). Anonymous-by-default
  is preserved (INV-5, INV-13).
- **I-11: Recovery rules & routing config** *(v5)* — admin-defined triggers (which signals open a case) and
  **internal** routing (which owner/queue), with default thresholds and throttling.

## 5. Outputs

- **O-1: Collected response store** — every response persisted under a common schema, attributable to
  source, brand, and campaign.
- **O-2: Theme analysis** — AI-generated themes with counts, quotes, and trend; filterable by brand.
- **O-3: Sentiment analysis** — positive/neutral/negative with intensity, aggregated by theme, segment,
  source, brand, and time.
- **O-4: Ratings & metrics** — average ratings, distribution, response/completion rates, NPS/CSAT.
- **O-5: Insight report** — narrative of what's happening, why, and what to do, with ranked actions; can
  include the competitive picture and the Love × Trust read. Exportable.
- **O-6: Answer to an analysis query** — grounded strictly in the account's own data, with citations.
- **O-7: Alerts** — notifications when a monitored signal crosses a threshold.
- **O-8: Respondent-facing survey** — the rendered survey or conversational interview.
- **O-9: Competitive benchmark** — own brand vs. competitors on ratings, Brand Love, Trust, sentiment, and
  themes over a chosen period.
- **O-10: Per-competitor analysis** — for a selected competitor, an aggregate view with traceability.
- **O-11: Brand Love read** — the distribution across Love / Like / Ambivalence / Dislike / Hate and a
  **Brand Love Index** (share of Love+Like minus share of Dislike+Hate) **computed on stated reads only**
  *(v6)*. Inferred reads are shown as a separate, clearly-labeled **AI-inferred signal**, never blended into
  the headline Index. Unreadable comments are **"unknown,"** excluded from the Index (not scored as
  Ambivalence).
- **O-12: Trust read** — a **Trust Index** (net trust, **stated-only** *(v6)*) plus a **driver breakdown**
  (reliability, integrity, benevolence, security/privacy). Inferred trust is a labeled companion signal, as
  with Brand Love.
- **O-13: Love × Trust segmentation** — respondents/segments placed in one of four quadrants with a
  recommended action for each:
  - **Devoted** (high love / high trust) — advocates; protect and activate.
  - **Infatuated / fragile** (high love / low trust) — passion without a safety net; shore up reliability
    and transparency before a stumble triggers churn.
  - **Dependable** (low love / high trust) — loyal by reliability, not emotion; deepen the relationship.
  - **At-risk** (low love / low trust) — churn risk and detractors; intervene or triage.
- **O-14: Recovery case** *(v5)* — an internally-managed case opened from a dissatisfaction signal: linked
  feedback, contact (first-party, if consented), owner, status (open → in-progress → resolved → closed), and
  resolution notes.
- **O-15: Recovery metrics** *(v6 refined)* — a **recovery rate defined on *measured* recovery** (a positive
  change in Brand Love / Trust before vs. after resolution), **reported separately from the case
  resolution/closure rate**; plus time-to-resolve. Measured for consented first-party customers and at
  cohort level.
- **O-16: Reinforcement prompts** *(v6 refined)* — **referral/advocacy** invitations may be routed to
  Devoted/loved customers; **public-review prompts are audience-neutral** (offered to all respondents or
  none, never sentiment-gated), to avoid review-gating.
- **O-17: Emotion profile** *(v7)* — for a brand and filtered set, the **distribution of emotions** expressed
  in open text and transcripts, using a **compact headline taxonomy (~7 emotions)** — e.g. *pride, delight,
  relief/reassurance, hope/anticipation* on the positive side; *frustration, disappointment, anger/anxiety*
  on the negative — each carrying **intensity**, a **confidence** score, and **representative verbatims**
  (traceability, INV-3), with **trend over time**. Each headline emotion **rolls up a finer sub-emotion set**
  a user can drill into (D-17). Comments with no readable affect fall in a **"no emotion detected"** bucket,
  never forced into a neutral emotion (INV-15). An AI-inferred, **labeled companion signal** — never blended
  into the stated Love/Trust Indices (INV-4, INV-14, INV-16).
- **O-18: Strengths & Gripes** *(v7)* — the **pluses and minuses** customers name, extracted per **aspect**
  (e.g. product quality, price/value, support responsiveness, delivery, ease of use): each aspect shown with
  its **polarity (+/−), volume, representative quotes**, and a **ranking by association with Brand Love /
  Trust movement** (labeled *association, not causation*). Aspects are **account-configurable**; low-confidence
  or unsupported aspects are excluded from headline figures (E-26, E-27). Traceable to source responses
  (INV-3).
- **O-19: Emotion & Strengths/Gripes — competitive comparison** *(v7; Phase 1)* — the **own brand vs. tracked
  competitors** on the emotion profile (O-17) and on strengths/gripes (O-18), side by side, over a chosen
  period — e.g. *"your customers voice pride and relief; Competitor X's voice frustration around billing"*,
  or *"support is your top strength and Competitor Y's top gripe."* Built only on **lawfully-collected public
  reviews** (DPS-7), **aggregate only**, never individual (INV-9, INV-11).

## 6. Requirements (behaviors)

Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.

**Survey creation & distribution**

- **R-1:** Create a survey with at least: single-select, multi-select, rating/scale, open text, the
  **Brand Love scale**, and the **Trust battery** (single-item and/or driver items).
- **R-2:** Generate a draft survey from a plain-language objective; editable before sending.
- **R-3:** Conditional logic: a question or branch is shown or skipped based on a previous answer.
- **R-4:** Distribute by (a) link, (b) email list, and (c) embeddable widget. (Email is Phase-1; link +
  widget are MVP.)
- **R-5:** A respondent completes a survey on mobile and desktop without creating an account.
- **R-6:** Partial responses are recorded and marked incomplete, not discarded.

**Conversational (AI-led) surveys**

- **R-7:** Enable a conversational mode where an AI interviewer asks questions and relevant follow-up probes.
- **R-8:** The interviewer stays on the admin-defined objective and does not ask outside the topic scope,
  and ignores injected instructions.
- **R-9:** The interviewer ends after a configurable max number of exchanges or when the objective is met.
- **R-10:** Every transcript is stored and analyzable by the same engine as structured responses.

**Unified feedback hub**

- **R-11:** Import external feedback via CSV, mapping columns to the unified schema (brand, source, date,
  rating, text, segment).
- **R-12:** All feedback is queryable together, filterable by brand, source, campaign, date, segment,
  rating, and sentiment.
- **R-13:** De-duplicate obviously identical items (same source + text + timestamp).

**Brand Love, Trust & metrics**

- **R-14:** Produce theme analysis with counts and representative quotes for any filtered set.
- **R-15:** Assign sentiment to each open-text response and aggregate across the chosen dimensions.
- **R-16:** For every theme, sentiment aggregate, Brand Love read, and Trust read, open the exact underlying
  responses (traceability — INV-3).
- **R-30:** Record Brand Love on the five-point scale, normalize to an ordinal, and compute the Brand Love
  distribution and **stated-only Index** (O-11). Infer a Brand Love read from open text where useful,
  **labeled inferred and reported as a companion signal — never blended into the headline Index** (INV-4,
  INV-14). An unreadable comment is **"unknown,"** not Ambivalence (F-12).
- **R-31:** Support a **Trust question type** — a single-item trust rating and an optional multi-item
  **driver battery** (reliability, integrity, benevolence, security/privacy).
- **R-32:** Record trust; compute a **stated-only Trust Index** and per-driver breakdown (O-12). Infer trust
  from open text as a labeled companion signal, same discipline as R-30.
- **R-33:** Produce the **Love × Trust segmentation** (O-13) with a recommended action per quadrant,
  available in the insight report (O-5) and the competitive benchmark (O-9).

**Emotion & experience analysis** *(v7)*

- **R-46:** **Detect the emotions** expressed in open text and conversational transcripts and classify each
  to a **compact headline taxonomy (~7 emotions)** that **rolls up a finer sub-emotion set**. Each read is
  **labeled inferred**, carries **intensity and confidence**, and produces the per-brand **emotion profile**
  (O-17) with representative verbatims and trend. A comment with no readable affect is **"no emotion
  detected,"** never forced into a neutral emotion (INV-15).
- **R-47:** **Drill down** from any headline emotion to its **granular sub-emotions** and the **underlying
  verbatims** (traceability, INV-3), so the compact view stays readable while analysts can go deeper (D-17).
- **R-48:** **Extract aspect-based strengths and gripes** from comments — the specific attributes customers
  praise or criticize, each with **polarity, volume, and representative quotes** — and **rank them by volume
  and by association with Brand Love / Trust movement** (labeled *association, not causation*). Aspects are
  **account-configurable**; produce O-18. Guarded against fabricated aspects (only aspects grounded in
  verbatims; low-confidence excluded from headline — E-26).
- **R-49:** *(Phase 1)* **Compare** emotion profiles and strengths/gripes **across own brand and tracked
  competitors** (O-19), computed on **lawfully-collected public reviews** (DPS-7) at **aggregate** level only
  (INV-9, INV-11).
- **R-50:** **Be transparent about the method** — publish the emotion taxonomy and its headline→sub-emotion
  roll-up mapping, and carry `model_version`/confidence on every emotion and aspect read (leave-no-black-box;
  NFR-6). Emotion and aspect reads are **companion signals, never blended into a stated headline** (INV-16).

**Unified customer & competitive insight**

- **R-26:** Produce an aggregate, cross-source "unified customer" view — without building or requiring a
  general identity-linked profile (INV-9; the RecoveryCase exception aside).
- **R-24:** Define and manage a set of competitor brands to track (I-8).
- **R-25:** Collect publicly available reviews/ratings/comments about the own brand and tracked competitors
  from configured sources, subject to §10 (DPS-7) and a legal-review gate before live collection is enabled.
- **R-27:** Benchmark the company's brand vs. competitors on ratings, Brand Love, Trust, sentiment, and
  themes over a chosen period (O-9).
- **R-28:** For a selected competitor, produce per-competitor aggregate analysis (O-10) with traceability.
- **R-29:** All brand/competitor analysis is filterable by brand, source, date, segment, and sentiment, and
  every competitor figure links to its source items.

**Closed-loop & service recovery** *(v6 — internal loop; native workflow is the #3 horizon)*

- **R-34:** Let a **first-party** respondent **opt in to be contacted** for follow-up (e.g., leave an
  email), behind an age-appropriate gate; contact is never required and is stored under consent
  (INV-5, INV-13, DPS-10).
- **R-35:** Configurable **triggers** open a RecoveryCase from a dissatisfaction signal (Dislike/Hate, low
  Trust, At-risk quadrant, negative-sentiment spike, rating below a floor) in near-real-time (≤ 60 s, F-15).
  **Only first-party responses open *contactable* cases;** public/competitor reviews may open only
  *anonymous internal-triage/thematic* cases (never individual outreach). Cases are **de-duplicated and
  grouped** (one incident, or one customer, → one case) and triggers **throttled** to prevent case storms;
  sensible default thresholds ship out of the box.
- **R-36:** A **RecoveryCase** carries the linked feedback, contact (first-party, if consented), an owner, a
  status lifecycle (open → in-progress → resolved → closed), and resolution notes — **owned and resolved
  inside AAA Insights.**
- **R-37:** *(v6 revised — D-E)* **Notify** the assigned owner/team of new or updated cases (in-app + email
  to the team). **v1 does not push customer data into external CRM/helpdesk systems**; native agent workflow
  and any sanctioned external integration are the #3 horizon.
- **R-38:** **Measure recovery** — for a **consented first-party customer**, re-measure Brand Love / Trust
  before vs. after resolution (longitudinal, permitted by the INV-9 exception), and report recovery at the
  cohort level. Compute the metrics in O-15.
- **R-39:** *(v6 revised — D-D)* **Reinforce the satisfied** — route **referral/advocacy** invitations to
  Devoted/loved customers; **public-review prompts are audience-neutral** (never sentiment-gated) (O-16).
- **R-40:** **Prioritize** open dissatisfaction cases by predicted value/risk (Love × Trust quadrant, trust
  drivers, volume) so the highest-leverage recoveries surface first.

**Security, privacy & integrity** *(v6 — F-8–F-11, F-19)*

- **R-41:** Public survey and conversational endpoints defend against **bots, spam, ballot-stuffing, and
  coordinated manipulation** — rate limiting, anomaly/duplication detection, and one-response-per-link
  tokens — **without a CAPTCHA wall** (protect NFR-4).
- **R-42:** Admins **authenticate securely** (support SSO and MFA) with managed sessions; authorization
  enforces the role model (R-21).
- **R-43:** Credentials for inbound data providers (review APIs / licensed feeds) and any integration
  secrets are held in a **secrets vault** — never in the data model, exports, or logs.
- **R-44:** **Detect and redact PII** in open text and transcripts before analysis/surfacing; any PII that
  must be shown to an admin (E-10) is behind **role + audit** controls.
- **R-45:** The conversational endpoint enforces **rate limits, per-link cost ceilings, and output
  content-safety checks** (in addition to scope control, R-8).

**AI analysis, accounts, roles, export**

- **R-17:** Ask a natural-language question and receive an answer grounded only in the account's own data,
  with citations.
- **R-18:** Generate an insight report: narrative, metrics, top themes, sentiment, Brand Love, Trust and the
  Love × Trust read, competitive comparison, quotes, ranked actions.
- **R-19:** Compute response rate, completion rate, average rating, rating distribution, and NPS/CSAT when
  questions qualify.
- **R-20:** Configure an alert on a signal (negative-sentiment share, average rating, Brand Love Index,
  Trust Index, new theme) with notification when crossed.
- **R-21:** *(v6)* At least two account roles — Owner/Admin (account, users, billing) and Member (builds
  surveys, views analysis) — **plus a lightweight case-owner designation** for RecoveryCase assignment (an
  internal user; external agents are out of scope in v1).
- **R-22:** Export any analysis view and the insight report (CSV for raw data; PDF and/or slides).
- **R-23:** Delete a survey, campaign, or response, and export or delete all account data.

## 7. Invariants (must ALWAYS be true)

- **INV-1:** Every response is attributable to exactly one source AND one brand. No response exists without
  a known origin.
- **INV-2:** Counts are never negative and never exceed responses collected; percentages come from the
  current filter, each response counted once per dimension.
- **INV-3:** Every theme, aggregate, Brand Love read, Trust read, insight, recommendation, and query answer
  is traceable to its underlying responses. No AI claim without a path to its verbatim data.
- **INV-4:** The system never shows a quote or statistic absent from the data, labels any inferred value as
  inferred, and **never blends an inferred read into a stated headline metric** *(v6)*.
- **INV-5:** A respondent can complete a survey without providing identifying information.
- **INV-6:** Each account's data is isolated; AI analysis is grounded only in that account's data.
- **INV-7:** Deleting a response, campaign, or account removes it from all future analysis; deleted data
  never reappears (subject to the retention hold for open cases, DPS-5).
- **INV-8:** Respondent PII is stored securely and never written to logs or AI outputs unless the admin
  explicitly opts in; PII in open text is detected and redacted before surfacing (R-44).
- **INV-9:** *(v6 revised)* The "unified customer" view is always **aggregate**, and the system builds **no
  general identity-resolved profile** of any individual. **Sole exception:** a **RecoveryCase may link a
  consented, first-party respondent to their own feedback** for the purpose of service recovery — a
  purpose-limited record, never a general profile, and **never for scraped/competitor reviewers** (X-7).
- **INV-10:** Externally-collected data is only ever publicly available and lawfully obtained; no bypassing
  authentication, paywalls, or technical controls; provenance kept on every item.
- **INV-11:** Personal data in public reviews is minimized, never used to build a profile, and excluded
  from AI outputs by default.
- **INV-12:** **Brand Love and Brand Trust are measured and reported as distinct indicators** — never
  collapsed into one score, and never presented as satisfaction (or vice versa).
- **INV-13:** **Follow-up is consent-gated.** The system contacts a respondent only when they opted in;
  anonymous-by-default is preserved (INV-5). Contact and recovery-case data fall under the same PII
  protections (INV-8, DPS-10); consent is withdrawable at any time.
- **INV-14:** *(v6)* **Headline Brand Love / Trust Indices are stated-only.** Inferred reads are reported
  separately and labeled; an unreadable comment is **"unknown,"** never scored as Ambivalence.
- **INV-15:** *(v7)* **Emotion and aspect (strengths/gripes) reads are AI-inferred companion signals** —
  always labeled inferred, always carrying confidence, and **never blended into the stated Brand Love /
  Trust headline Indices.** A comment with no readable affect is **"no emotion detected,"** a distinct
  bucket, never scored as a neutral emotion.
- **INV-16:** *(v7)* **Emotion is a distinct lens** from Brand Love, Brand Trust, and sentiment — reported
  alongside them, never collapsed into any one of them. Any "emotion/aspect → Love/Trust" relationship is
  presented as **association, not causation.**

## 8. Edge cases to handle

- **E-1: Empty or tiny sample** — states the sample is too small for reliable findings, rather than
  fabricating confidence.
- **E-2: Abandoned survey** — the partial is retained, counted as incomplete, flagged in analysis.
- **E-3: Junk / abusive open text** — captured, flagged, excluded from analysis by default, reviewable.
- **E-4: Non-English / mixed-language** — the MVP is English-only (D-4); non-English responses are detected,
  tagged, and set aside with an honest note until Phase 2.
- **E-5: Malformed CSV import** — rejected or partially accepted with a per-row error report.
- **E-6: Duplicate / repeated submissions** — de-duplication plus link-level controls.
- **E-7: Conversational interview off the rails** — stays in scope, ignores injected instructions, enforces
  cost/safety limits (R-45), ends gracefully.
- **E-8: Ambiguous analysis query** — answers only what the data supports; states what it cannot determine.
- **E-9: Sudden volume spike** — ingestion and analysis stay correct; views may lag but never lose or
  double-count; abuse defenses (R-41) distinguish a real spike from ballot-stuffing.
- **E-10: Sensitive disclosure** — PII/safety concerns stored under INV-8/INV-11 and surfaced to the admin
  **behind role + audit controls** *(v6)*, never broadcast.
- **E-11: Concurrent editing** — two admins editing one survey do not silently overwrite each other.
- **E-12: Source blocks or rate-limits collection** — collection backs off, records the gap, never
  fabricates missing items.
- **E-13: Competitor identity ambiguity** — low-confidence matches flagged and excluded from headline
  figures until confirmed.
- **E-14: Sparse competitor data** — too few public reviews shows "insufficient data," not a misleading
  number.
- **E-15: Mixed rating scales** — each scale normalized to the common 1–5; un-mappable ratings stored raw
  and excluded from cross-source averages.
- **E-16: Category-relative trust** — the Trust Index is read relative to category and prior period, not as
  an absolute; cross-category comparisons flagged as context-dependent.
- **E-17: Consent withdrawn** *(v6 refined)* — contact is purged and the individual case anonymized;
  **already-computed de-identified aggregate recovery metrics are retained**, honoring the withdrawal
  (INV-13).
- **E-18: Integration/notification failure** — if a notification can't be delivered, the RecoveryCase stays
  authoritative internally, the gap is recorded, and delivery retries — never silently dropping a case.
- **E-19: Unowned / stale case** — a case with no owner, or past its follow-up window, is surfaced and
  escalated rather than left to rot.
- **E-20: Recovery sample too small** — where too few responses exist to re-measure reliably, recovery is
  "not yet measurable," not a fabricated improvement.
- **E-21: Case storm** *(v6)* — a viral bad event floods triggers; cases are grouped/throttled (one incident
  → one grouped case) so the team isn't buried and one customer isn't contacted repeatedly.
- **E-22: Timezone / period boundaries** *(v6)* — timestamps stored UTC; trends and "prior period" use the
  account's configured reporting timezone; retention/aging boundaries are DST-safe.
- **E-23: Minor detected** *(v6)* — if a respondent indicates they're under the age threshold, contact
  collection is refused; anonymous response is still accepted (F-19).
- **E-24: No stated reads in scope** *(v6)* — if a filtered set has no stated Love/Trust, the headline Index
  shows "no stated data" and only the labeled inferred signal is shown (INV-14).
- **E-25: Mixed / conflicting emotions in one comment** *(v7)* — a comment expressing more than one emotion
  is represented as **multiple emotions with intensities**, not forced to a single label; it contributes to
  each, counted once per dimension (INV-2).
- **E-26: Sarcasm / ambiguous affect** *(v7)* — low-confidence emotion or aspect reads are flagged and
  **excluded from headline figures** until a confidence floor is met; the verbatim stays available for review.
- **E-27: No emotion / no aspect detectable** *(v7)* — where affect or aspects can't be read, the system
  shows **"no signal"** rather than fabricating an emotion or a strength/gripe (parallels E-1, E-24).

## 9. Exclusions (explicitly OUT of scope for v1)

- **X-1:** *(v6)* Not a CRM or general customer-record system; builds no general identity-resolved profile.
  **The one exception is the consented, first-party RecoveryCase** (INV-9), purpose-limited to service
  recovery.
- **X-2:** *(v6 revised)* v1 delivers a **lightweight internal recovery workflow** (open, own, track,
  resolve a RecoveryCase in-app, with the team notified). v1 does **not** push customer data into external
  CRM/helpdesk tools, and does **not** ship a full native case-management workbench (agent queues, SLAs,
  macros) or external agent integrations — those are the posture-#3 horizon.
- **X-3:** Collection is limited to publicly available content obtained lawfully via APIs, licensed
  providers, or public web pages under the DPS-7 guardrails. No private/authenticated content, no bypassing
  logins/paywalls/protections, no collecting data a source's terms prohibit.
- **X-4:** No prediction of future business outcomes (churn, revenue) in v1.
- **X-5:** No public respondent panel / audience marketplace.
- **X-6:** Does not replace human research judgment; it is decision support with evidence attached.
- **X-7:** Does not re-identify individuals, contact scraped reviewers, or merge scraped personal data into
  any profile.

## 10. Data, privacy & security

- **DPS-1:** The system is a data processor for the account's feedback; the company is the controller.
- **DPS-2:** Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, and
  excluded from logs and AI outputs by default.
- **DPS-3:** *(v6)* Data-subject requests (export/deletion) are supported for **own respondents and for the
  third-party public-review authors whose data we ingested** — erasure by source/author via provenance
  (D-F / F-6).
- **DPS-4:** AI processing is isolated to the account; account data is never used to train shared/base
  models.
- **DPS-5:** *(v6)* A **per-account configurable** retention period (24-month default) for first-party and
  collected data; **open RecoveryCases and the baseline data their recovery_delta depends on are held past
  retention** until the case closes (F-17).
- **DPS-6:** The full security checklist (input validation, authz/authn, secret handling) is applied during
  build and verification.
- **DPS-7:** *Web/data-collection compliance.* Collect only publicly accessible content; respect
  `robots.txt` and reasonable rate limits; never bypass authentication, paywalls, or technical protections;
  prefer official APIs and licensed providers over page collection; keep provenance on every item; minimize
  and never profile personal data in reviews (INV-11); honor source terms. **Sources and methods are subject
  to the client's legal review and written sign-off before live collection is enabled.** *(Not legal advice;
  confirm with counsel.)*
- **DPS-8:** v1 targets **GDPR and CCPA**; SOC 2 is a roadmap item for enterprise sales.
- **DPS-9:** AI model/hosting is **provider-abstracted** — best-available models, US data residency
  available, no lock-in; account data never trains shared models (DPS-4).
- **DPS-10:** *(v6 revised)* **Contact & consent handling.** Respondent contact is collected only on opt-in
  (age-gated), minimized, encrypted, access-controlled, used solely for the consented follow-up, and
  deletable on withdrawal (INV-13). **v1 shares no contact/feedback with external tools** (D-E), removing
  third-party-sharing exposure. Consent scope and lawful basis are tracked per contact.
- **DPS-11:** *(v6)* **Admin auth & secrets.** Admin authentication (SSO/MFA), managed sessions, and vaulted
  secrets for inbound data-provider credentials (R-42, R-43).

## 11. Non-functional requirements

*(v7.1: the previously-placeholder targets NFR-2/3/8/9 are now confirmed — F-15 closed.)*

- **NFR-1 (Performance):** A survey page loads under 2 s on mobile; a submission acknowledges under 1 s.
- **NFR-2 (Analysis latency):** Theme/sentiment/index analysis of the MVP size (~5,000 items) returns at
  **p95 ≤ 60 s** *(confirmed v7.1)*; larger sets run as background jobs with progress shown.
- **NFR-3 (Availability):** The collection endpoint targets **99.9% uptime** *(confirmed v7.1)*; ingestion is
  durable even if analysis is degraded.
- **NFR-4 (Accessibility):** Respondent-facing surveys meet WCAG 2.1 AA.
- **NFR-5 (Scalability path):** Grows from SMB volumes toward larger sets without a rewrite.
- **NFR-6 (Explainability):** Every AI output carries the data behind it and a confidence signal, including
  inferred (companion) Brand Love and Trust reads.
- **NFR-7 (Collection freshness & politeness):** Collected data shows a freshness/coverage indicator;
  collection runs at a polite, configurable rate and records gaps.
- **NFR-8 (Trigger latency):** *(v6)* A dissatisfaction signal opens a RecoveryCase within **≤ 60 s**
  *(confirmed v7.1)*.
- **NFR-9 (Durability):** *(v7.1)* Durable storage with **RPO ≤ 1 h, RTO ≤ 8 h** (point-in-time recovery); all
  timestamps stored UTC, reporting in the account's configured timezone.

---

## 12. Data model (logical)

Plain-English logical model; physical schema is an Architecture-phase decision. Every record is scoped to an
**Account** (tenant) for isolation (INV-6).

**Brand** — a company or competitor whose feedback is analyzed.

| Field | Meaning |
|-------|---------|
| brand_id | Unique id |
| name / aliases | Display name and alternates used to match reviews |
| type | `own` or `competitor` |
| products | Optional product / line names |
| tracked | Whether active collection is enabled |

**Source** — where a piece of feedback came from: `source_id`, `type` (`survey` · `conversational` ·
`import_csv` · `web` · `api` · `provider`), `name`/`url`, `terms_note` (DPS-7).

**FeedbackRecord** — the core record: one rating and/or comment about one brand.

| Field | Meaning |
|-------|---------|
| record_id / account_id | Unique id; owning tenant (INV-6) |
| brand_id / source_id | Which brand (own/competitor) and where from (INV-1) |
| captured_at | When given/collected — **stored UTC** (E-22) |
| rating_raw / rating_scale | Original rating and its scale (`5_star`, `10_pt`, `nps`, `csat`, `brand_love`, `trust`, …) |
| rating_norm | Normalized to a common 1–5 ordinal (E-15) |
| brand_love | Love / Like / Ambivalence / Dislike / Hate (stated, ordinal 5→1) **or `unknown`** *(v6)* — `unknown` is excluded from the Index, not scored as Ambivalence |
| trust / trust_drivers | Trust rating (normalized 1–5) and per-driver scores, if applicable |
| comment_text | The open-text comment (PII redacted — R-44) |
| language / segment / region / channel | Detected language; optional non-identifying metadata |
| is_complete / flags | Complete vs partial; `junk`·`abuse`·`safety`·`low_confidence` |
| provenance | source_url + capture_date, or import_batch (INV-10) |

**Sentiment** — derived, one per record: polarity, intensity, model_version/confidence.

**Trust** — derived, one per record where trust is present or inferred: `trust_score`, `drivers`,
`model_version`/`confidence`, `inferred` (companion signal, not blended — INV-14).

**Emotion** *(v7)* — derived, **one or more per record** (a comment may carry several — E-25): `emotion_id`,
`record_id`, `emotion_headline` (the ~7-set label), `sub_emotion` (finer label — D-17), `intensity`,
`valence`, `model_version`/`confidence`. Always `inferred = true`; a "no emotion detected" read is stored
explicitly, never as a neutral emotion (INV-15).

**AspectSentiment** *(v7)* — derived, **zero or more per record**: `aspect_id`, `record_id`, `aspect_label`
(account-configurable taxonomy), `polarity` (+/−), `intensity`, `model_version`/`confidence`. Links to the
verbatim for traceability (INV-3); feeds the Strengths & Gripes board (O-18).

**Contact** *(v5)* — an opt-in, age-gated contact for a **first-party** respondent (INV-13): `contact_id`,
`respondent_ref`, `channel`/`value`, `consent_scope`, `consent_at`, `withdrawn_at`. Separate, under DPS-10.

**Trigger / Rule** *(v5)* — signal → action: `rule_id`, `condition` (brand_love ≤ Dislike, trust_index < x,
quadrant = At-risk, rating < floor), `action` (open case, route to internal owner), `throttle` /
`grouping_key` *(v6)*, `enabled`.

**RecoveryCase** *(v6)* — the internally-owned, consented, first-party recovery record (the INV-9 exception).

| Field | Meaning |
|-------|---------|
| case_id / account_id | Unique id; owning tenant |
| record_ids | The feedback that opened / relates to the case (grouped — E-21) |
| contact_id | Linked opt-in first-party contact, if any (INV-13); null for anonymous triage cases |
| case_owner | Assigned internal owner (R-21) |
| status | `open` · `in_progress` · `resolved` · `closed` |
| kind | `contactable` (first-party) or `anonymous_triage` (public/competitor-review) *(v6)* |
| opened_at / resolved_at | Timestamps (UTC) → time-to-resolve (O-15) |
| recovery_delta | Measured change in Brand Love / Trust before vs. after resolution (O-15) |
| resolution_notes | What was done |

**Theme / ThemeAssignment** — discovered topics and their links to records (with confidence).

**MetricSnapshot** — a rollup for a brand over a period and filter (O-4, O-9, O-11, O-12, O-15).

| Field | Meaning |
|-------|---------|
| brand_id / period | Brand and time window (period boundaries per E-22) |
| metric | `avg_rating` · `nps` · `csat` · `brand_love_index` (stated) · `trust_index` (stated) · `recovery_rate` (measured) · `case_resolution_rate` · `avg_time_to_resolve` · `neg_sentiment_share` · `response_rate` · `completion_rate` · `emotion_distribution` (inferred, companion) · `top_strengths` / `top_gripes` (inferred, companion) *(v7)* |
| value / filter_context | The number and the filter it was computed under (INV-2) |

**Supporting records:** Survey/Campaign, Segment, Alert, Account/User/Role (incl. case-owner).

*Removed in v6:* the **Connector** entity and RecoveryCase `external_ref` — v1 has **no outbound
integrations** (D-E). External connectors return only if/when posture #3 is pursued.

**On the "unified customer" view (R-26, INV-9):** no general individual-Customer entity; the view aggregates
FeedbackRecords for an `own` brand across sources and time, grouped by Segment.

**On the closed loop (R-34–R-40):** the RecoveryCase and its recovery measurement live entirely inside AAA
Insights (no external push). This *is* the lightweight internal workflow; posture #3 later adds native agent
queues/SLAs (and, if justified, sanctioned external integrations) reusing the same case, triggers, and
recovery metrics.

---

## 13. Scope & phased roadmap

Only Phase 0 is committed. Each later phase re-enters the pipeline before it is built.

### Phase 0 — MVP (the focused, buildable core)
- Survey builder: core types + Brand Love scale + Trust battery + conditional logic (R-1, R-3, R-30, R-31).
- AI-drafted survey (R-2); distribution by link + widget (R-4); mobile, account-free capture incl. partials
  (R-5, R-6).
- Conversational AI survey with scope, cost, and safety controls (R-7–R-10, R-45).
- CSV import into the unified hub (R-11, R-13); unified analysis + aggregate unified-customer view (R-12,
  R-26).
- AI theme + sentiment + **stated-only Brand Love + Trust**, inferred as labeled companion (R-14–R-16,
  R-30, R-32, INV-14).
- **Emotion & experience (own brand):** emotion profile with drill-down + Strengths & Gripes board, as
  labeled companion reads (R-46–R-48, R-50, O-17, O-18, INV-15, INV-16).
- Core metrics incl. NPS/CSAT + Brand Love / Trust Indices (R-19, O-11, O-12); Love × Trust segmentation
  (R-33, O-13).
- **Closed-loop (internal starter):** first-party opt-in contact, triggers, RecoveryCase own/track/resolve
  in-app + team notification, prioritization (R-34–R-37, R-40).
- Insight report with ranked actions (R-18, R-22); two roles + case-owner, account isolation, export/delete
  (R-21, R-23).
- **Security & privacy baseline:** bot/abuse defense, admin auth (SSO/MFA), PII redaction, secrets vault,
  age-gate (R-41–R-45, DPS-11).

### Phase 1 — Competitive insight, distribution & full loop
- Competitor configuration + benchmarking (R-24, R-27, O-9) — CSV / licensed-provider / API sources first;
  live web collection (R-25, DPS-7) only after legal sign-off; per-competitor deep-dive (R-28, O-10).
- **Emotion & Strengths/Gripes competitive comparison** (R-49, O-19) — own brand vs. competitors, on
  lawfully-collected public reviews, aggregate only.
- Natural-language "ask your data" query (R-17, O-6); email distribution + reminders (R-4 email); alerts
  (R-20); slides export.
- **Full internal loop:** recovery measurement (R-38, O-15) and reinforcement plays (R-39). *No external
  CRM push* (D-E).

### Phase 2 — Connectors, scale & native workflow horizon
- Larger-volume background processing (NFR-5); multi-language expansion (D-4); team collaboration.
- **Native closed-loop workbench (posture #3)** — agent queues, SLAs, macros, and (if demand justifies)
  sanctioned external integrations — reusing the RecoveryCase, triggers, consent, and recovery metrics.

### Phase 3 — Advanced insight
- Driver analysis; the love-type distinction (passion vs. intimacy/loyalty, per Nobre 2011) and a resilience
  measure; benchmarking vs prior periods and optional anonymized peer norms; a research assistant that
  proposes surveys from the gaps it finds.

---

## 14. SPECIFY decisions (resolved in v4)

*(Unchanged. Summary — full detail in prior versions.)* Keep **AAA Insights** working name (D-1); **build
survey engine natively** (D-2); **provider-abstracted** hosting, US residency, no lock-in (D-3);
**English-only** MVP (D-4); **GDPR+CCPA** (D-5); **~5,000-response** target (D-6); **hybrid tiered + usage**
pricing (D-7); **no design partner yet** (D-8, pending); Brand Love grounded in Batra/Ahuvia/Bagozzi 2012,
label **Ambivalence** (D-9); competitors **generic & configurable** (D-10); **CSV-first** collection, web
after legal sign-off (D-11, sign-off owner pending); **1–5 scale + net Love Index** (D-12); **per-account
24-mo retention** (D-13); **single-item + inferred Trust** in MVP (D-14); **four Trust drivers + net Index**
(D-15); **Closed-Loop pillar** #2→#3 (D-16).

**v7 additions (SPECIFY increment, 2026-07-30):**
- **D-17 — Emotion taxonomy:** a **compact, manager-readable headline set (~7 emotions)** that **rolls up a
  finer sub-emotion set** on demand. Grounded in the consumer-emotion literature (Richins' Consumption
  Emotions Set; Laros & Steenkamp's hierarchy of consumer emotions; Plutchik). Reported as a labeled,
  confidence-scored companion signal (INV-15/INV-16).
- **D-18 — Scope of the pillar:** **own-brand emotion + Strengths/Gripes ship in the MVP** (they reuse the
  analysis engine); the **competitive comparison rides Phase-1 competitor collection** (it needs the lawful
  collection engine anyway). Emotion & Strengths/Gripes are a **new research theme** for the library.

## 15. CHALLENGE resolutions (v6)

From the Phase-2 review (`docs/02_spec_review_report.md`). Client decisions:

| # | Decision | Resolution |
|---|----------|------------|
| D-A | Identity exception for RecoveryCase | **Yes — consented, first-party only.** RecoveryCase is the one identity-linked record (INV-9 exception, X-1). |
| D-B | Unit of recovery measurement | **Longitudinal for consented first-party customers**, plus cohort level (R-38, O-15). |
| D-C | Case-opening scope | **First-party responses only** open contactable cases; public/competitor reviews → anonymous internal-triage only (R-35). |
| D-D | Reinforcement & review-gating | **Audience-neutral public-review prompts;** referral/advocacy may be sentiment-routed (R-39, O-16). |
| D-E | External integrations | **None in v1** — the recovery loop is internal-only; team notified, no CRM/helpdesk push (R-37, X-2, DPS-10; Connector removed). |
| D-F | Erasure for scraped authors | **Yes** — DSR/erasure extended to third-party review authors (DPS-3). |
| D-G | Index composition | **Stated-only headline Index;** inferred = labeled companion; unreadable → "unknown," never Ambivalence (O-11/O-12, R-30, INV-14, INV-4). |

**Resolved by AAA and folded in (F-8–F-19):** bot/abuse defense (R-41), conversational safety (R-45), admin
auth + secrets (R-42/R-43/DPS-11), PII redaction (R-44/INV-8), "unknown" vs Ambivalence (INV-14/data model),
case dedup/throttle (R-35/E-21), recovery_rate = measured (O-15), NFR numbers (NFR-2/3/8/9, proposed),
timezone/UTC (E-22/NFR-9), retention hold (DPS-5), case-owner role (R-21), age-gate (R-34/E-23).

---

## Approval

This is the specification gate. **v7 added the Emotion & Experience pillar on the v6 CHALLENGE baseline and
was approved; v7.1 confirms the four NFR targets (NFR-2/3/8/9).** This approved spec is the baseline that
carries into **TEST FIRST (Phase 3)** and **IMPLEMENT (Phase 4)**. *(The emotion pillar still warrants an
optional light CHALLENGE pass — chiefly on inferred-emotion accuracy and the association-vs-causation
framing — which invariants INV-15/INV-16 and edge cases E-25–E-27 already pre-empt.)*

Approved by: __________________________    Date: ______________

*Prepared by Active AI Advisors under the Grounded AI™ methodology. Every phase produces an artifact you own.*
