# Business Model & Pricing — AAA Insights (living document)

**Version:** v0.1 (working draft)  |  **Date:** 2026-08-04  |  **Companion to:** `docs/cost_model.md`, Requirements v7
**Prepared by:** Active AI Advisors  |  **Prepared for:** Paul Jamieson

> **This is a living, evolving document — not the product definition.** It captures how AAA Insights makes
> money and how it's priced, and it grows as we learn (especially once design partners give real
> willingness-to-pay signal). It is deliberately kept *separate* from the requirements spec. See the linkage
> rule below for how the two connect.

---

## 1. How this relates to the product definition

The **product definition** (`docs/01_requirements.md`) says *what the software does and must always be true* —
testable behaviors and invariants. Price points, tiers, and positioning are **not** testable software
behaviors, so they do **not** live in the spec. They live here.

The two connect by a **one-way rule:**

> Pricing strategy lives in this document. **When a pricing decision requires the product to *do* something —
> meter responses, enforce a plan limit, gate a feature by tier, integrate billing — that specific capability
> becomes a requirement (R-) in the spec and is traced like any other.**

So strategy stays out of the spec; the *mechanics* a pricing decision demands come in. The spec already
records the **model type** as decision **D-7 (hybrid tiered + usage)** for exactly this reason — the choice
shapes what the product must eventually support.

**Capabilities this pricing model will imply (candidate future requirements, not yet in the MVP spec):**
- Usage **metering** of analyzed responses / AI analyses per account per period.
- **Plan / tier** model with included allowances and **limit enforcement** (soft caps, overage, upgrade prompts).
- **Feature gating** by tier (emotion, Strengths & Gripes, competitive benchmarking, closed loop).
- **Billing** integration (subscription + usage) — likely Phase 1+, not MVP (early accounts can be invoiced
  manually / via a design-partner agreement).
- A **meter/cap on conversational-interview** usage (the one cost driver that can multiply AI spend).

When we decide these are in scope, they get written as R-IDs in the spec and tested — closing the loop.

---

## 2. The model: B2B SaaS — hybrid tiered subscription + usage

The cost structure makes the case (see `cost_model.md`):

- There is a **fixed ~$100–200/mo floor** before the first heavy user → a **base subscription** should always
  cover it, giving predictable recurring revenue. (A pure pay-as-you-go model would underwater the floor.)
- The **marginal cost per response is ~$0.004** → usage is cheap, so **generous included allowances** with
  **usage-based overage** align cost to heavy users without nickel-and-diming. (A pure per-seat model would
  leave money on the table with heavy users.)
- Premium capabilities (emotion, Strengths & Gripes, competitive, closed loop) map cleanly to **tiers**,
  creating a natural upgrade path.

**Conclusion:** tiered subscription (base fee + included usage) with usage overage and feature-gated tiers —
the D-7 shape. Annual billing offered at ~2 months free (~17% off) for cash flow and retention.

---

## 3. Recommended tiers (working numbers — to validate)

| Tier | Price/mo | Included | For |
|------|----------|----------|-----|
| **Starter** | **$149** | 1 brand · ~1,000 analyzed responses/mo · core analysis (themes, sentiment, Brand Love/Trust) · 2 seats | Small SMB testing the water |
| **Growth** | **$399** | ~5,000 responses/mo · + emotion & Strengths/Gripes · conversational surveys · 1 tracked competitor · 5 seats | The core SMB sweet spot |
| **Pro** | **$899** | ~15,000 responses/mo · full multi-competitor benchmarking · closed-loop recovery · priority support | Mid-market, multi-brand |
| **Enterprise** | Custom (sales-led) | High volume · SSO/DPA · custom limits | Larger mid-market |

- **Overage:** bundle generously, then ~**$30–40 per additional 1,000 analyzed responses** (~8–10× the ~$4
  cost — strong margin and a clean nudge to the next tier).
- **Margin check:** Growth at $399 with ~$40–60 all-in cost ≈ **85–90% gross margin**. Every tier clears the
  bar; pricing is set by **value**, not cost.

*These numbers are cost- and market-anchored recommendations, **not validated willingness-to-pay.** Treat as a
starting hypothesis; start slightly high and discount for early design partners (easier to lower than raise).*

---

## 4. Positioning & value anchoring

AAA Insights occupies a **gap in the market:**

- **Cheap survey tools** (SurveyMonkey, Typeform; ~$25–100/mo) only *collect* — no real analysis.
- **Enterprise CX platforms** (Qualtrics, Medallia) *analyze* well but cost tens of thousands/year and need a
  specialist to run.

Position AAA Insights as **"an AI research analyst for companies without a research team."** Anchor the price
against what the buyer would otherwise spend: a part-time analyst (~$3–6k/mo), a one-off agency study
(~$5–20k), or an enterprise CX seat they can't justify. Against those, even Pro (~$900/mo) reads as a bargain —
which lets you **hold price** rather than race to the bottom. Price the **outcome** (continuous, decision-ready
insight), not the compute.

---

## 5. Go-to-market notes

- **Self-serve** checkout for Starter/Growth (credit card, low touch); **sales-assisted** for Pro/Enterprise.
- **14-day free trial** rather than a permanent free tier. If any always-free entry is offered, **cap it hard**
  (~50 responses) — free AI analysis has real cost.
- **Meter the conversational-interview mode** from day one; consider a per-tier cap — it's the usage pattern
  that can multiply AI spend.
- **Design-partner motion:** recruit 3–5 early accounts at a discount in exchange for WTP feedback and case
  studies (ties to open decision **D-8 — named design partner**).

---

## 6. Open questions / to validate

- **WTP validation (highest priority):** test these tiers against 3–5 real prospects before locking. Pricing is
  easy to raise later, hard to lower.
- **Design partner (D-8, still open):** who are the first 3–5? Their feedback calibrates both product and price.
- **Included-allowance sizing:** are 1,000 / 5,000 / 15,000 responses the right bundle breaks for the target
  segments? Revisit once real usage data exists.
- **Annual vs monthly mix** and discount depth.
- **Add-ons vs tiers:** should competitor tracking / extra brands / seats be à-la-carte add-ons rather than
  tier-bound? (More flexible, more complex.)
- **Billing build timing:** manual invoicing for design partners now; automated billing is a Phase-1+ product
  requirement once we scale past hands-on onboarding.

---

## 7. Change log

- **2026-08-04 (v0.1)** — First draft. Established the model (hybrid tiered + usage), a four-tier structure with
  working numbers, positioning, GTM notes, the linkage rule to the product spec, and the validation open
  questions. Grounded in `cost_model.md` v1.

---

*Prepared by Active AI Advisors under the Grounded AI™ methodology. A living commercial artifact — reviewable,
and expected to evolve as design partners and real usage sharpen the numbers.*
