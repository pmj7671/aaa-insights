# Cost Model — AAA Insights (rough, pre-build)

**Version:** v1  |  **Date:** 2026-08-04  |  **Basis:** Architecture v1, Requirements v7
**Prepared by:** Active AI Advisors  |  **Prepared for:** Paul Jamieson

> **Purpose.** A *rough* estimate of what it costs to **run** AAA Insights on the chosen stack (Google Cloud +
> Claude), so pricing (D-7) is grounded in real numbers before we build. This is a running-cost model, not a
> build-cost quote, and not a bill — it's a decision tool. Prices below are current as of the date above and
> **will drift**; the assumptions are stated plainly so you can re-run the math when they change.

**The one-line takeaway:** the **marginal cost to analyze a feedback response is about half a cent** (~$0.004
in AI), so gross margins are high at almost any subscription price. The thing to price around is the **fixed
monthly floor (~$100–200/mo)** of managed infrastructure — which is exactly why the spec's **hybrid
tiered + usage** model (D-7) is the right shape: a base fee covers the floor, usage covers the AI.

---

## 1. Unit prices used (current, with sources)

**AI — Anthropic Claude** (per million tokens; Vertex AI serving is comparable to these API rates):

| Model | Input / MTok | Output / MTok | Used for |
|-------|-------------|---------------|----------|
| **Claude Haiku 4.5** | $1 | $5 | Bulk per-response analysis (themes, sentiment, Love/Trust, emotion, aspects) |
| **Claude Sonnet 5** | $2 (promo→Aug 31 2026; $3 standard) | $10 (promo; $15 standard) | Insight-report narratives and "ask your data" queries |

Two levers cut AI cost materially: **prompt caching** (a cache hit on the static instruction portion costs
**0.1×** input) and the **Batch API** (**50% off** input and output for non-real-time jobs). Most analysis is
batchable and uses a fixed instruction prompt, so both apply.

**Google Cloud** (us-central1, request-based):

| Item | Rate | Notes |
|------|------|-------|
| Cloud Run CPU | $0.000024 / vCPU-sec (active) | First 180,000 vCPU-sec/mo **free** |
| Cloud Run memory | $0.0000025 / GiB-sec | First 360,000 GiB-sec/mo **free** |
| Cloud Run requests | $0.40 / million | First 2M/mo **free** |
| Cloud SQL PostgreSQL | ~$49/mo (1 vCPU/3.75 GB) · ~$99/mo (2 vCPU/7.5 GB) | + storage/backups; **HA ~doubles** compute |
| Vertex AI embeddings | ~pennies per million tokens | Negligible at this scale |
| Cloud DLP (PII redaction) | ~$1 / GB inspected | ~5,000 comments ≈ a few MB → cents/month |

---

## 2. Cost per response (the variable driver)

Stated assumptions (transparent so you can adjust):

- **Structured response analysis** — one combined analysis pass over a comment (~100 words): **~1,500 input +
  ~500 output tokens** on **Haiku 4.5** → **≈ $0.004 per response** at list price. With caching + batch,
  **≈ $0.002**.
- **AI conversational interview** (optional mode) — ~8 adaptive turns generated + stored: **~6,000 input +
  ~1,500 output tokens** → **≈ $0.014 extra per completed interview** (on top of the $0.004 analysis).
- **Insight report** — aggregates + representative quotes → narrative + ranked actions: **~12,000 input +
  ~2,500 output** on **Sonnet 5** → **≈ $0.06–0.10 per report**.
- **"Ask your data" query** — **≈ $0.02–0.05 per query**.
- **Embeddings + PII redaction** — **< $0.0005 per response** combined (negligible).

**Per 1,000 responses (AI only):** ≈ **$4** at list price (all structured), or ≈ **$2** optimized. If a fifth
of responses use the AI interview, add ~$2.70 → ≈ **$6.70 / 1,000** list, ≈ **$3.50 / 1,000** optimized. Call
it **$3–7 per 1,000 responses**, plus a little for reports and queries.

---

## 3. Fixed monthly floor (independent of volume)

The baseline you pay even at low usage, for a small production setup:

| Item | Monthly (small) | Notes |
|------|-----------------|-------|
| Cloud SQL PostgreSQL (small, zonal) | ~$60 | db-standard-1 + storage/backups; **+$60 with HA** (recommended for prod) |
| Cloud Run (warm respondent instance) | ~$10 | Min-instance to avoid cold starts (NFR-1); otherwise ~$0 |
| Cloud Armor (edge protection) | ~$10–30 | Policy + rules (R-41) |
| Identity Platform (admin auth) | ~$0 | Free tier covers early admin users |
| Email (transactional, internal) | ~$0–20 | Free/low tier at MVP volume |
| DLP, Secret Manager, Tasks/PubSub, Storage, Sentry | ~$5–15 | Small/free tiers |
| **Floor total** | **≈ $85–145/mo (no HA)** · **≈ $145–205/mo (with HA)** | |

---

## 4. Three scenarios (illustrative)

| | **A — Pilot** | **B — Growing** | **C — Scaling** |
|---|---|---|---|
| Accounts | 5 | 25 | 100 |
| Responses / mo | 5,000 | 50,000 | 300,000 |
| AI cost (list) | ~$30 | ~$275 | ~$1,500 |
| AI cost (optimized) | ~$18 | ~$150 | ~$850 |
| Fixed infra | ~$120 (HA) | ~$200 | ~$500 |
| **Total / mo (list)** | **~$150** | **~$475** | **~$2,000** |
| **Cost / account / mo** | **~$30** | **~$19** | **~$20** |
| **Cost / 1,000 responses** | **~$30** | **~$9.50** | **~$6.70** |

The per-account cost **falls then flattens** as the fixed floor amortizes across more accounts; the per-response
cost keeps dropping with scale and optimization. Optimized (caching + batch) roughly **halves the AI line** in
every column.

---

## 5. What this means for pricing (D-7)

- **Margins are healthy.** Even a modest subscription — say **$99–299/account/month** — sits far above the
  ~$15–30/account infra cost once past a handful of accounts. The product is not infra-cost-constrained; it's
  value-priced.
- **Price around the floor, not the marginal cost.** Because ~$100–200/mo exists before the first heavy user,
  a **base fee (tier)** should always cover the floor, with **usage (responses/AI analyses)** layered on top —
  precisely the hybrid model in D-7. Avoid a pure per-seat price that could underwater the floor at low volume.
- **A usage allowance is cheap to give.** At ~$0.004/response, bundling, say, 2,000–5,000 analyzed responses
  into a tier costs $8–20 — generous-looking to the buyer, trivial to you.
- **The optimization levers are real money at scale.** Haiku-for-classification, prompt caching, and the Batch
  API together roughly halve the dominant cost line; worth building in from day one (the architecture's LLM
  gateway is where they live).

---

## 6. Honest limitations of this estimate

- **Rough by design.** Token counts are reasoned estimates, not measured; real numbers arrive once we build and
  meter a few hundred real responses. Expect ±50% until then.
- **Excludes one-time build cost** (engineering to implement Phase 0), and any **committed-use / volume
  discounts** from Google or Anthropic (which only improve the picture).
- **Vertex vs. direct-API pricing** for Claude can differ slightly by region/model version — confirm against
  Google's live catalog at build time; the gateway makes switching a config change.
- **Conversational mix is a big swing.** If most surveys use the AI interview, the AI line rises severalfold —
  worth a per-tier cap or a usage meter on interviews specifically.
- **HA and scale headroom** (read replicas, larger DB) raise the floor as you grow; folded roughly into
  Scenario C.

---

## 7. Suggested next step

If useful, I can turn this into an **interactive spreadsheet** where you change the number of accounts,
responses, conversational mix, and subscription price and watch cost, revenue, and margin update — handy for
setting the actual tiers. Otherwise these three scenarios are enough to ground the pricing decision.

---

**Sources (prices current as of 2026-08-04):**
- Claude API pricing — [BenchLM](https://benchlm.ai/anthropic/api-pricing), [Anthropic model pricing overview (MetaCTO)](https://www.metacto.com/blogs/anthropic-api-pricing-a-full-breakdown-of-costs-and-integration)
- Cloud Run pricing — [Google Cloud](https://cloud.google.com/run/pricing)
- Cloud SQL for PostgreSQL pricing — [Bytebase Cloud SQL pricing](https://www.bytebase.com/dbcost/cloudsql-pricing/)

*Prepared by Active AI Advisors under the Grounded AI™ methodology. Estimates are reviewable; tell me which
assumptions to change and the model updates.*
