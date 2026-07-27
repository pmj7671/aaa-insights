# Specification Review Report — AAA Insights

**Reviews:** Requirements v5  |  **Date:** 2026-07-27  |  **Phase:** Grounded AI™ — Phase 2 (CHALLENGE)
**Prepared by:** Active AI Advisors  |  **Prepared for:** Paul Jamieson

---

## Summary

v5 is a substantive, well‑structured spec, and it held up well to an adversarial pass. The highest‑value
findings cluster where the **v5 closed‑loop pillar meets the older privacy invariants**: opening cases,
contacting people, and measuring *an individual's* recovery all press against INV‑5 / INV‑9 / X‑1 (anonymous
by default, no individual profile, not a CRM). Those tensions are resolvable, but three of them need **your
decision** because they change what the product is allowed to remember about a person. Beyond that, the
review surfaced concrete **security gaps** (bot / ballot‑stuffing on public endpoints, admin auth, connector
credential handling) and **legal gaps** (review‑gating under FTC rules, third‑party sharing consent, erasure
requests for scraped reviewers) that a listening‑only product could ignore but an *acting* product cannot.

Nothing here undermines the direction. Nineteen findings follow: **F‑1–F‑7 need a client decision**;
**F‑8–F‑19 we can resolve and fold into v6** for your review.

---

## Findings

| ID | Type | Finding | Risk | Recommended resolution | Client decision? |
|----|------|---------|------|------------------------|:---:|
| **F-1** | contradiction | **RecoveryCase links a person to feedback + owner + resolution — an identity‑linked individual record**, which INV‑9 ("no identity‑resolved profile of any individual") and X‑1 ("not a CRM") forbid. | The product's own invariants make its flagship v5 feature illegal‑by‑spec. | Carve a narrow, explicit exception: a RecoveryCase is a **consented, purpose‑limited** recovery record — the *one* place identity is linked, only with opt‑in (INV‑13), never a general profile. Amend INV‑9 / X‑1 to name it. | **Yes** |
| **F-2** | contradiction | **R‑38 "re‑measure Brand Love / Trust for that customer" before/after requires linking one person's responses over time** — a longitudinal individual record, again vs INV‑9. | Either recovery measurement is impossible, or INV‑9 is quietly violated. | Decide the unit of measurement: **(a)** aggregate / cohort only, or **(b)** longitudinal **only for consented, contactable customers** as an explicit INV‑9 exception. Recommend (b), scoped to consent. | **Yes** |
| **F-3** | gap / privacy | **R‑35 opens a case on any dissatisfaction signal, but scraped / competitor reviews (I‑9) and CSV imports have no consented contact** — and INV‑11 / X‑7 forbid contacting or re‑identifying scraped reviewers. | Un‑actionable cases; risk of an agent trying to contact a public reviewer (privacy breach). | Scope case‑opening to **first‑party responses**. Public / competitor reviews feed *analysis and thematic recovery*, never individual outreach. Distinguish **contactable** vs **anonymous (internal‑triage)** cases. | **Yes** |
| **F-4** | legal | **R‑39 solicits reviews / referrals from "Devoted / loved" customers specifically** — selectively prompting only happy customers is **review‑gating**, restricted by FTC guidance and many review‑platform ToS. | Regulatory / platform‑ToS exposure for customers who use the feature as designed. | Reframe reinforcement as **advocacy / referral**, or make public‑review prompts **audience‑neutral** (offered to all, not gated on sentiment). Confirm with counsel; flag in‑product. | **Yes** |
| **F-5** | legal / security | **R‑37 hands off a case (with respondent PII + feedback) to an external helpdesk / CRM** — a third‑party sharing / sub‑processor relationship the consent scope (DPS‑10) may not cover. | Sharing PII beyond the consented purpose; missing sub‑processor governance (GDPR / CCPA). | Require **DPS‑10 consent scope to explicitly include third‑party sharing** with the named tool; add sub‑processor / DPA governance; block hand‑off when consent doesn't cover it. | **Yes** |
| **F-6** | gap / legal | **DPS‑3 (export / deletion) is written for own respondents, but scraped public‑review authors (I‑9) are also data subjects** with erasure rights (GDPR). No path handles their requests. | Non‑compliance for third‑party personal data ingested from the web. | Extend DSR handling to **scraped third‑party data subjects** (erasure by source / author via provenance). Pairs with the DPS‑7 legal gate. | **Yes** |
| **F-7** | ambiguity | **Index composition is unspecified: are *inferred* Brand Love / Trust reads blended with *stated* ones in the Index (O‑11 / O‑12), and at what confidence?** INV‑4 labels inferred values, but the Index silently mixes them. | Headline metrics silently blend hard ratings with soft inferences → misleading trends and triggers. | Decide: **stated‑only**, or **stated + inferred above a confidence floor** with the mix disclosed. Set the same confidence floor for triggers (F‑13). | **Yes** |
| **F-8** | security | **Public survey + conversational endpoints (R‑5, no account) invite bot spam, ballot‑stuffing, and coordinated manipulation.** E‑6 dedups identical items and E‑9 keeps counts correct, but neither stops *authentic‑looking fraudulent* responses that corrupt Love / Trust. | Corrupted metrics → wrong decisions; a rival could poison a survey. | Add a requirement for bot / abuse defense on public endpoints (rate limiting, anomaly / duplication detection, one‑response‑per‑link tokens) **without** a CAPTCHA wall (protect NFR‑4). | resolve → v6 |
| **F-9** | security | **The AI conversational endpoint (R‑7) is an open, unauthenticated LLM surface** — exposed to cost‑abuse (token burn) and content‑safety misuse, beyond the scope / injection controls of R‑8 / R‑9. | Runaway cost; unsafe generated content on a public link. | Add rate limiting, per‑link cost ceilings, and output content‑safety checks to the conversational requirements. | resolve → v6 |
| **F-10** | security | **No admin authentication / authorization requirements**, and **Connector credentials (R‑37) for the customer's CRM / helpdesk are high‑value secrets** with only a generic DPS‑6 mention. | Account takeover; leaked CRM credentials. | Add explicit reqs: admin auth (SSO / MFA support), session management, and a secrets‑vault requirement for connector credentials (never in the data model or logs). | resolve → v6 |
| **F-11** | gap | **PII detection / redaction is implied (INV‑8, E‑10) but never a testable requirement.** And E‑10 "surface PII to the admin" is itself a disclosure with no access control specified. | Invariant can't be verified; PII leaks via the "surface to admin" path. | Add a requirement for PII detection / redaction in open text and transcripts; put E‑10 admin‑surfacing behind role + audit controls. | resolve → v6 |
| **F-12** | data‑integrity | **Ambivalence risks becoming a dumping ground for "couldn't infer,"** conflating *mixed feelings* (a real 3) with *unknown* (no signal). Both land at brand_love = 3, and Ambivalence is excluded from the Index → silent distortion. | Index and distribution distorted by unknowns masquerading as neutrals. | Separate **inferred‑Ambivalence** from **no‑inference / unknown**; exclude "unknown" from the Index denominator rather than scoring it 3. | resolve → v6 |
| **F-13** | data‑integrity | **Case‑storm risk:** a viral event, or one unhappy customer's multiple responses, could open thousands of (or duplicate) cases. R‑36 links `record_ids` (plural), but the **merge / dedup / throttle rule and trigger defaults are unspecified**. | Ops overload; duplicate outreach to the same person. | Add case de‑duplication / grouping (one incident / customer → one case), trigger throttling, and sensible default thresholds. | resolve → v6 |
| **F-14** | ambiguity | **"recovery_rate" (O‑15) is undefined:** does "recovered" mean status = `resolved` (an agent closed it) or a **measurably positive** recovery_delta (love / trust actually rose)? These differ sharply. | A vanity metric (cases closed) masquerading as an outcome metric (customers recovered). | Define recovery_rate on **measured recovery** (delta), reported separately from resolution / closure rate. | resolve → v6 |
| **F-15** | testability | **Unstated non‑functional numbers:** NFR‑2 "within a stated budget," NFR‑3 "a stated uptime," and R‑35 "near‑real‑time" are placeholders; no data‑durability (RPO / RTO). | Requirements that can't be tested in Phase 3. | Fill in concrete targets (analysis p95 latency, uptime %, trigger→case latency, RPO / RTO). A couple need your input on the business bar. | partial |
| **F-16** | edge | **Timezone / DST and "prior period" are undefined** across `captured_at`, "over time," trends, retention, and time‑to‑resolve. | Off‑by‑a‑day trend errors; retention / deletion boundary bugs. | Store UTC; define period boundaries and the account's reporting timezone explicitly. | resolve → v6 |
| **F-17** | edge | **Retention (DPS‑5, 24‑mo) collides with open cases and recovery baselines:** deleting old data (INV‑7) can erase the pre‑resolution baseline recovery_delta needs; an open case may need a legal hold. | Recovery metrics broken by retention; premature deletion of case‑relevant data. | Add a retention exception / hold for open cases and their baselines; define what E‑17 withdrawal keeps (de‑identified aggregate) vs purges. | resolve → v6 |
| **F-18** | gap | **RecoveryCase `owner` vs the two‑role model (R‑21):** cases need owners / agents, but only Owner/Admin and Member roles exist, and support agents may not be app users. | Can't assign / route cases cleanly; over‑ or under‑privileged owners. | Add a lightweight case‑owner / agent concept (or external‑owner reference for hand‑off); clarify which roles can own / resolve cases. | resolve → v6 |
| **F-19** | edge / legal | **No age‑gating / vulnerable‑respondent handling** — public surveys and opt‑in contact could reach minors (COPPA / GDPR‑K). | Collecting a minor's contact without a proper basis. | Add an age‑appropriate gate / consent basis for contact collection; keep anonymous response open to all. | resolve → v6 |

---

## Decisions required before proceeding (F‑1 – F‑7)

These change what the product may remember or do about a person, so they're yours to call:

- **D‑A — Identity exception for RecoveryCase (F‑1):** approve a narrow, consent‑gated exception to
  INV‑9 / X‑1 so a recovery record can link a person to their feedback? → decision: ____
  *(Recommended: yes — it is the point of the pillar.)*
- **D‑B — Unit of recovery measurement (F‑2):** aggregate / cohort only, or longitudinal per **consented**
  customer? → decision: ____ *(Recommended: per‑consented‑customer, scoped by consent.)*
- **D‑C — Case‑opening scope (F‑3):** restrict individual outreach to first‑party responses; public /
  competitor reviews drive analysis only? → decision: ____ *(Recommended: yes.)*
- **D‑D — Reinforcement & review‑gating (F‑4):** reframe R‑39 as advocacy / referral, and make public‑review
  prompts audience‑neutral? → decision: ____ *(Recommended: yes — confirm with counsel.)*
- **D‑E — Third‑party sharing consent (F‑5):** require consent scope to cover hand‑off to the named external
  tool, with sub‑processor governance? → decision: ____ *(Recommended: yes.)*
- **D‑F — Erasure for scraped data subjects (F‑6):** commit to handling erasure requests from public‑review
  authors we ingest? → decision: ____ *(Recommended: yes.)*
- **D‑G — Index composition (F‑7):** stated‑only, or stated + high‑confidence inferred (mix disclosed)? →
  decision: ____ *(Recommended: stated + inferred above a confidence floor, disclosed.)*

## What we'll resolve and fold into v6 (F‑8 – F‑19)

The security, data‑integrity, and edge findings don't need a business decision — we'll write the missing
requirements / invariants and tighten the ambiguous ones into **Requirements v6** for your review (F‑15's
concrete NFR numbers will include a couple we propose and you confirm).

## Result

On your resolution of the seven decisions (D‑A – D‑G), we update the spec to **Requirements v6**
incorporating the accepted findings; **that** version becomes the approved baseline that carries into
TEST FIRST (Phase 3).

Approved / decisions provided by: __________________________    Date: ______________

*Prepared by Active AI Advisors under the Grounded AI™ methodology. CHALLENGE finds the holes on paper,
where fixes are free.*
