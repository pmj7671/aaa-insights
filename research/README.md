# Research Library — AAA Insights

Background sources that make this product — and our point of view — credible. This is a **living
knowledge base**: we add to it as we go, and every source gets a short, honest annotation plus a note on
*how it informs the product*. The goal is simple — to be the sharpest, best‑grounded voice on
understanding customers, brands, and markets.

## How this folder works
- **One file per source**, named `Author_Year_ShortTitle` (PDF, or a `.md` note for links).
- **Every source is annotated below** with a full citation, the 2–3 findings that matter, and
  **Product implications** — what it changes in AAA Insights (cite requirement IDs where relevant).
- **Themes group the sources.** Add new themes as the library grows.
- **To add a source:** drop the file here, add an entry under the right theme using the template at the
  bottom, and commit.

## Index
| Theme | Source | Type | Why it matters |
|-------|--------|------|----------------|
| Brand Love & emotional attachment | Batra, Ahuvia & Bagozzi (2012), *Brand Love* | Journal (JM) | The foundational, validated model — grounds our Brand Love scale. |
| Brand Love & emotional attachment | Thomson, MacInnis & Park (2005), *The Ties That Bind* | Journal (JCP) | The validated emotional-attachment scale; attachment is distinct from satisfaction and predicts loyalty + price premium. |
| Brand Love & emotional attachment | Ahuvia (2023), *Brand Love's Greatest Hits* | Practitioner summary | A citation‑ranked map of the literature — our reading list. |
| Brand Love & emotional attachment | Nobre (2011), *Should Consumers Be in Love With Brands?* | Journal (JTM) | Passion‑love is more fragile than intimacy/loyalty‑love under disruption. |
| Brand Love & emotional attachment | Ghani & Tuhin (2016), *Consumer Brand Relationships* | Journal review (IRMM) | Maps the whole CBR field; validates the negative end (hate/avoidance). |
| Brand Love & emotional attachment | Wardani & Gustia (2016), *Brand Experience/Satisfaction/Trust → Attachment* | Journal (SEM) | Evidence that satisfaction ≠ attachment; trust is the bridge. |
| Brand Love & emotional attachment | Fetscherin (2014), *What type of relationship do we have with loved brands?* | Journal (JCM) | Brand love is a one-directional (parasocial) bond; love precedes loyalty and drives WOM. |
| Brand Love & emotional attachment | Maheshwari, Lodorfos & Jacobsen (2014), *Determinants of Brand Loyalty* | Journal (IJBA) | Emotional (affective) experience drives loyalty; lock-in (continuance) does not. |
| Brand Trust | Chaudhuri & Holbrook (2001); Mayer et al. (1995); Delgado-Ballester; Morgan & Hunt (1994) | References (to source) | Ground the v3 Trust extension: trust drivers and trust → loyalty. |
| Loyalty & customer expectations | BCG (2024), *Loyalty Programs Are Growing…* | Industry study | Differentiation now lives in understanding what customers value. |
| Search, discovery & marketing trends (GEO) | YouTube/Google (2026), *3 Marketing Opportunities* | Practitioner (Google) | Creators, commerce & AI reshape discovery and word of mouth. |
| Search, discovery & marketing trends (GEO) | Google (2026), *5 Things from Google's Search Chief* | Practitioner (Google) | AI Search = conversational, multimodal, "query fan‑out" — mirrors our design. |

---

## Theme: Brand Love & emotional attachment

### Batra, R., Ahuvia, A. C., & Bagozzi, R. P. (2012). *Brand Love.* Journal of Marketing, 76(2), 1–16.
`Ahuvia_Batra_Bagozzi_2012_Brand-Love_JournalOfMarketing.pdf`

The foundational, empirically‑validated model of brand love. Grounded‑theory studies + structural‑equation
modeling show brand love is **not** a simple like/dislike attitude but a **higher‑order construct with
seven core elements**: (1) self–brand integration, (2) passion‑driven behaviors, (3) positive emotional
connection, (4) long‑term relationship, (5) positive attitude valence, (6) attitude certainty/strength,
(7) anticipated separation distress. Quality beliefs are an antecedent; **outcomes are loyalty, positive
word of mouth, and resistance to negative information** — and the multi‑element model predicts these better
than any single "love" measure. Distinguishes love‑as‑emotion (episodic) from love‑as‑relationship
(durable).

**Product implications.** Answers PRD **Q9** — ground our Brand Love read here. The seven elements become
the **signals the AI looks for in open text** to infer a Brand Love read (INV‑4 labels inferred values).
The authors' "sort‑of‑loved" fuzzy middle **justifies the "Ambivalence"** level in
**Love / Like / Ambivalence / Dislike / Hate**. Because brand love predicts loyalty/WOM/resistance, the
Brand Love Index (O‑11) is a leading indicator worth benchmarking (O‑9).

### Thomson, M., MacInnis, D. J., & Park, C. W. (2005). *The Ties That Bind: Measuring the Strength of Consumers' Emotional Attachments to Brands.* Journal of Consumer Psychology, 15(1), 77–91.
`Thomson-MacInnis-Park_2005_Emotional-Attachment-Ties-That-Bind.pdf`

The primary source that put a validated *measure* under emotional attachment (EA), across five studies. EA
is a **10-item scale** resolving into **three first-order factors under a single second-order attachment
construct**: **Affection** (affectionate, friendly, loved, peaceful), **Passion** (passionate, delighted,
captivated), and **Connection** (connected, bonded, attached). Two results matter most. **Discriminant
validity:** EA is empirically distinct from brand-attitude favorability, satisfaction, and involvement — a
customer can be satisfied yet not attached. **Predictive validity:** EA predicts **brand loyalty** and
**willingness to pay a price premium**, and stays significant *after* controlling for attitude,
satisfaction, and involvement — it is the **only** significant predictor of price-premium willingness. Two
side-findings: satisfaction and loyalty load together, but **dissatisfaction forms its own separate
factor** (the negative arm is not just low satisfaction); and attachment runs **stronger for
symbolic/hedonic/high-involvement brands** (BMW, Body Shop, Prada) than functional ones (AT&T, Ziploc).

**Product implications.** Hard, foundational evidence for the two bets the product is built on. (1) *Love
and Trust are distinct from — and deeper than — satisfaction* (**INV-12**): EA's discriminant validity from
satisfaction/attitude/involvement is exactly this, from a second independent source alongside Wardani &
Gustia. (2) *The Brand Love Index is a leading, predictive indicator* (**O-11**, benchmarked **O-9**):
EA→loyalty and EA→price-premium give the Index a dollars-and-loyalty outcome to point at. Concretely it
supports several **candidate deltas** (flagged for approval, not yet in the spec): the validated
**Affection / Passion / Connection** sub-structure as a companion attachment read — dovetailing with Nobre's
finding that passion-heavy love is more fragile, so *love type* is a resilience signal (relates to the
Emotion pillar **R-46/O-17** and the taxonomy **R-50**); an optional **validated EA battery** as a survey
template (**R-2** could offer peer-reviewed scales); a **price-premium / pricing-power** read as a
business-value outcome in the insight report (**R-18/R-19**); and **category-relative** attachment
benchmarking, extending the trust rule **E-16** (attachment is category-dependent). The separate
dissatisfaction factor reinforces the distinct **Dislike / Hate** arm and the recovery engine treating
dissatisfaction as its own state, not merely "low CSAT."

### Ahuvia, A. (2023). *Brand Love's Greatest Hits.* Psychology Today (Aaron Ahuvia, PhD), updated Jul 6, 2023.
`Ahuvia_2023_Brand-Loves-Greatest-Hits_PsychologyToday.pdf`

A plain‑language map of the field by one of its founders: the ~14 most‑cited brand‑love papers (>300
citations each), each with a one‑line finding. Recurring themes: brand love is **love applied to
brands/possessions that carry identity or enthusiasm**, driven by **self‑identity integration** (private
and public/social self) and **hedonic benefit**, reliably leading to **loyalty, WOM, and price premium**.

**Product implications.** Confirms the core design bet — measure identity‑linked *emotional attachment*,
not just satisfaction. Gives us citations to speak credibly and a shortlist for deepening the library.

### Nobre, H. (2011). *Should Consumers Be in Love With Brands? An Investigation Into the Influence That Specific Consumer‑Brand Relationships Have on the Quality of the Bonds…* Journal of Transnational Management, 16(4), 270–281.
`Nobre_2011_Should-Consumers-Be-in-Love-With-Brands_JTM.pdf`

SEM across eight known brands, applying interpersonal‑relationship theory's two ideals — **Intimacy‑Loyalty
vs. Passion**. Finding: **Intimacy‑Loyalty bonds build relationship strength indirectly through
partner‑quality inferences and hold up better under brand disruption; Passion bonds relate to strength too,
but less, and don't invoke partner quality — so they're more fragile and more prone to non‑repurchase when
the brand stumbles** (e.g., the BP spill, Toyota recalls).

**Product implications.** **Not all "love" is equal.** Two customers can both answer "Love," but
passion‑driven love is more brittle than intimacy/loyalty‑driven love. Argues the product should surface
*love type* (passion vs. trust/loyalty signals) and track a **resilience outcome** — repurchase and
sentiment *after* a negative event — as its own measure, not just a point‑in‑time love score.

### Ghani, N. H. B. A., & Tuhin, M. K. W. (2016). *Consumer Brand Relationships.* International Review of Management and Marketing, 6(4), 950–957.
`Ghani-Tuhin_2016_Consumer-Brand-Relationships_IRMM.pdf`

A literature review mapping the whole **consumer–brand relationship (CBR)** field: brands as relationship
partners (Fournier 1998), her fifteen relationship types and six‑faceted **Brand Relationship Quality**
(love/passion, self‑connection, interdependence, commitment, intimacy, brand‑partner quality); Keller's
brand resonance (behavioral loyalty, attitudinal attachment, sense of community, active engagement); and
Fetscherin & Heinrich's 2×2 — **brand satisfaction, brand love/passion, brand avoidance, and brand
hate/divorce**. Positions brand love (Carroll & Ahuvia 2006; Batra et al. 2012) as a strong driver of
loyalty, WOM, and price premium.

**Product implications.** Our reference map for the relationship constructs worth measuring beyond a single
love score — attachment, trust, commitment, community/advocacy. The **negative quadrants (avoidance,
hate/divorce)** validate the negative end of our scale (**Dislike / Hate**) as real, distinct states worth
detecting — not merely "low satisfaction."

### Wardani, D., & Gustia, R. R. (2016). *Analysis of Brand Experience, Brand Satisfaction and Brand Trust Relationship to Brand Attachment.* Jurnal Ilmu Manajemen & Ekonomika, 9(1), 59–…
`Wardani-Gustia_2016_Brand-Experience-Satisfaction-Trust-Attachment.pdf`

SEM on 150 BMW owners in Jakarta. Path results: brand experience → satisfaction (✓), but experience → trust
(✗ n.s.); satisfaction → trust (✓); **satisfaction → attachment (✗ n.s.)**; **trust → attachment (✓)**. In
short, **satisfaction alone doesn't create attachment — trust is the bridge.**

**Product implications.** Hard evidence that **CSAT ≠ attachment/love.** A brand can have satisfied
customers who aren't attached (a churn risk hiding behind good CSAT). Reinforces measuring Brand Love and
**trust** as signals *distinct from* satisfaction, and supports surfacing trust drivers, not just
satisfaction scores.

### Fetscherin, M. (2014). *What type of relationship do we have with loved brands?* Journal of Consumer Marketing, 31(6/7), 430–440.
`Fetscherin_2014_Relationship-With-Loved-Brands_JCM.pdf`

Tests **two relationship theories** behind brand love — **interpersonal vs. parasocial** — in a 2×2 design
across US and Japanese samples (EFA/CFA/multi-group SEM). Finding: modeling brand love as a **parasocial**
relationship (a **one-directional** bond, like the fan→celebrity or viewer→character relationship) performs
as well as or **better than** the interpersonal-love framing, with **stronger links to purchase intention and
word of mouth** in both samples. Also restates the field's intensity ladder — **satisfaction → trust →
loyalty**, with **brand love preceding loyalty** (Carroll & Ahuvia 2006) — and that love drives purchase
intention and WOM.

**Product implications.** Frames *how* we should read love from feedback: it's a **one-directional bond the
customer expresses toward the brand** — exactly what open text captures — so we're right to infer a Brand Love
read from what customers say (INV-4 labels it inferred). Because love is validated as a **leading indicator of
purchase intention and WOM/advocacy**, it strengthens the case for the Brand Love Index (O-11) as predictive
and for routing **advocacy/referral plays to loved customers** (R-39, O-16). The satisfaction → trust →
loyalty ladder reinforces keeping **Love and Trust distinct and deeper than satisfaction** (INV-12).

### Maheshwari, V., Lodorfos, G., & Jacobsen, S. (2014). *Determinants of Brand Loyalty: A Study of the Experience-Commitment-Loyalty Constructs.* International Journal of Business Administration, 5(6), 13–23.
`Maheshwari-Lodorfos-Jacobsen_2014_Determinants-of-Brand-Loyalty_IJBA.pdf`

Investigates **brand experience** (Brakus et al. 2009's four dimensions — sensory, affective, behavioral,
intellectual) and **brand commitment** (split into **affective** vs. **continuance**) as drivers of loyalty
in the automotive sector. Key finding: **continuance commitment — staying because of switching cost or lack
of alternatives — has no considerable impact on genuine loyalty**; the loyalty that matters is **affective/
emotional**, carried by brand experience and affective commitment. Price and available alternatives don't
sustain the relationship on their own.

**Product implications.** Distinguishes **real attachment from lock-in** — a customer who stays only out of
inertia is a churn risk hiding behind a "loyal" label, echoing the **Love × Trust** at-risk/dependable
quadrants (O-13). The affective dimension of experience is exactly what the **Emotion pillar** reads (O-17,
R-46), and the four experience dimensions are a useful lens for the aspects behind **Strengths & Gripes**
(O-18, R-48). Overall it reinforces measuring **emotion and attachment, not inertia or satisfaction**, as the
signals that predict durable loyalty (INV-12).

---

## Theme: Brand Trust

Trust is the second half of the relationship pair with Brand Love: love is the emotional pull, trust is the
confidence that the brand is reliable, honest, and acts in the customer's interest. The **v3 PRD** adds a
Trust Index, a driver breakdown, and the Love × Trust segmentation (R-31–R-33, O-12/O-13). These are the
key sources that ground it — **citations logged now; PDFs to add to this folder next.**

- **Chaudhuri, A. & Holbrook, M. B. (2001). *The Chain of Effects from Brand Trust and Brand Affect to
  Brand Performance.* Journal of Marketing, 65(2).** Foundational: brand trust and brand affect each drive
  **loyalty** (both purchase and attitudinal); trust = the customer's willingness to rely on the brand to
  perform its stated function. → Anchors *why* we measure trust alongside love.
- **Mayer, R. C., Davis, J. H. & Schoorman, F. D. (1995). *An Integrative Model of Organizational Trust.*
  Academy of Management Review, 20(3).** The classic decomposition of trust into **ability (competence),
  benevolence, and integrity.** → The basis for our driver taxonomy in O-12 (reliability/competence,
  integrity/honesty, benevolence/care) — plus **security/privacy** for the digital age (Q-15).
- **Delgado-Ballester, E. (2003/2011). *Brand trust scale.*** A validated brand-trust measure
  (reliability + intentions dimensions). → Reference for the direct Trust battery (R-31).
- **Morgan, R. M. & Hunt, S. D. (1994). *The Commitment-Trust Theory of Relationship Marketing.* Journal of
  Marketing, 58(3).** Positions **trust and commitment** as the mediating variables of successful
  relationship marketing. → Frames trust as a relationship construct, not a satisfaction score (INV-12).

**Product implications.** Together these ground the Trust extension end-to-end: Chaudhuri & Holbrook for the
love+trust→loyalty logic, Mayer et al. for the **driver taxonomy** (Q-15), Delgado-Ballester for the direct
scale, and Morgan & Hunt for treating trust as a relationship variable distinct from satisfaction (INV-12).

---

## Theme: Loyalty & customer expectations

### BCG (2024). *Loyalty Programs Are Growing—So Are Customer Expectations.*
`BCG_Loyalty_Programs_2024.pdf` · Crouch, Eppler, Taylor, Mühlenbein, Hearne · Dec 9, 2024 · BCG loyalty
program survey, May 2024 (second annual).

As people join more loyalty programs, **loyalty and engagement decline** (the average US consumer belongs to
15+ programs, up ~10% since 2022; Europeans ~9). **Younger consumers switch more readily.** Points and cash
back are no longer enough — customers now expect **personalized rewards, relevant partnerships, and
exclusive experiences**, and the benefits they value **vary by region and age cohort**. Traditional
strongholds (hotels, airlines) lock in loyalty less than before; paid memberships command the strongest.

**Product implications.** Differentiation lives in *understanding what customers value and expect* — what
the theme/sentiment engine and conversational surveys surface — and in **segmenting** those signals.
Reinforces competitive benchmarking (O‑9) and the Brand Love lens over bare satisfaction.

---

## Theme: Search, discovery & marketing trends (GEO)

### YouTube / Think with Google (Feb 2026). *3 years of streaming leadership, 3 marketing opportunities for brands in 2026.* (Anne Marie Nelson‑Bogle, VP Ads Marketing, YouTube.)
`Google-YouTube_2026_3-Marketing-Opportunities-2026.pdf`

YouTube has been the #1 US streaming platform for three straight years (Nielsen). The argued opportunities:
**(1) Creators are the new stars** — 63% of US viewers (83% of Gen Z) prefer creator content over studio
productions; 1B+ hours/day watched on TVs. **(2) Creator economy & commerce** — $100B+ paid to creators
over four years; 500k+ creators in YouTube Shopping acting as *trusted guides*; 1B+ conversions from TV
screens; 81% say YouTube helps them research/discover products. **(3) AI supercharging creativity** — the
Ask tool, daily AI creation tools, auto‑dubbing, dynamic planning, Asset Studio.

**Product implications.** Two signals for us: creators/advocates are a growing **word‑of‑mouth and discovery
force** (the very outcomes brand love predicts), and audiences increasingly discover and decide through
multimodal, creator‑led content. Relevant to AAA's **Active GEO** positioning and to how AAA Insights frames
"what customers value" — trusted‑voice discovery and experience, not just product attributes.

### Think with Google (Feb 2026). *5 things marketers need to know from Google's Search chief.* (Liz Reid, VP of Search, at IAB ALM 2026.)
`Google_2026_5-Things-From-Googles-Search-Chief.pdf`

Liz Reid on the AI inflection in Search: **(1) Search is more conversational** — AI Mode is multi‑turn;
queries are getting longer and more commercially specific, and many lead to follow‑ups. **(2) Search is more
visual/multimodal** — images, video, Lens, Circle to Search, visual shopping. **(3) SEO/AIO/GEO — build for
people**: "query fan‑out" breaks one long question into many behind‑the‑scenes sub‑queries, so content that
does one facet *deeply* beats shallow answer‑everything pages; unique expert content is the moat.
**(4) AI makes ads more relevant** — longer, specific queries let niche brands surface. **(5) Strengthen
direct connections** — personalization/subscriptions turn Search into a retention surface.

**Product implications.** Reinforces AAA's **Active GEO** work and validates our **conversational‑survey**
design: Google's "query fan‑out" is the same probe‑and‑follow‑up logic our AI interviewer uses (R‑7–R‑9).
"Build depth / unique expert content" is precisely *why this research library exists* — being the sharpest,
best‑grounded voice is what wins in AI‑mediated discovery.

---

## Candidate spec deltas (parked — for a future SPECIFY/CHALLENGE pass)
Research-driven ideas captured but **not yet in the spec or the build**. Revisit deliberately, not mid-implementation.

- **Attachment sub-structure — Affection / Passion / Connection** as an optional companion read (love *type* → resilience signal; passion-heavy love is more fragile, per Nobre). Relates to R-46/O-17, R-50. — *Thomson, MacInnis & Park (2005).*
- **Validated EA battery** as an optional survey template (deploy the peer-reviewed 10-item scale). Relates to R-2. — *Thomson et al. (2005).*
- **Price-premium / pricing-power read** as a business-value outcome in the insight report. Relates to R-18/R-19. — *Thomson et al. (2005); Ahuvia (2023).*
- **Category-relative attachment benchmarking** (attachment is category-dependent), extending the trust rule E-16. — *Thomson et al. (2005).*

## To add next (the backlog — more research coming)
- **Carroll & Ahuvia (2006)** — the first brand‑love scale (primary source).
- **Fournier (1998)** — consumer–brand relationships (the relationship metaphor; primary).
- **Fetscherin & Heinrich** — brand hate / the negative relationship quadrants (primary).
- **Reichheld / NPS literature** — loyalty measurement, and its critiques.
- **Open‑text sentiment & theme‑extraction methods** — for the analysis engine.
- **Survey methodology & question design** — bias, scale construction, sampling.
- **Competitive‑intelligence ethics & law** — boundaries of public‑data collection (ties to DPS‑7).

## How to add a source (template)
```
### Author(s) (Year). *Title.* Venue.
`filename.pdf`
2–3 sentences: what it is and the findings that matter.
**Product implications.** What it changes in AAA Insights (cite requirement IDs where relevant).
```
