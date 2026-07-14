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
| Brand Love & emotional attachment | Batra, Ahuvia & Bagozzi (2012), *Brand Love* | Journal article (JM) | The foundational, validated model of brand love — grounds our Brand Love scale. |
| Brand Love & emotional attachment | Ahuvia (2023), *Brand Love's Greatest Hits* | Practitioner summary | A citation‑ranked map of the whole brand‑love literature — our reading list. |
| Loyalty & customer expectations | BCG (2024), *Loyalty Programs Are Growing…* | Industry study | Evidence that differentiation now lives in understanding what customers value. |

---

## Theme: Brand Love & emotional attachment

### Batra, R., Ahuvia, A. C., & Bagozzi, R. P. (2012). *Brand Love.* Journal of Marketing, 76(2), 1–16.
`Ahuvia_Batra_Bagozzi_2012_Brand-Love_JournalOfMarketing.pdf`

The foundational, empirically‑validated model of brand love. Using a grounded‑theory approach (two
qualitative studies) plus structural‑equation modeling on survey data, the authors show brand love is
**not** a simple like/dislike attitude but a **higher‑order construct with seven core elements**:

1. **Self–brand integration** — the brand expresses current and desired identity
2. **Passion‑driven behaviors** — investment of time/money, frequent use
3. **Positive emotional connection** — affection and a felt sense of "rightness"
4. **Long‑term relationship** — commitment to long‑term use
5. **Positive overall attitude valence**
6. **Attitude certainty and confidence** (strength)
7. **Anticipated separation distress** — losing the brand would be emotionally painful

Quality beliefs act as an antecedent; the modeled **outcomes are brand loyalty, positive word of mouth,
and resistance to negative information** — and this multi‑element model predicts those outcomes better
than any single summary "love" measure. The paper also separates love‑as‑emotion (short, episodic) from
love‑as‑relationship (durable); brand love is the latter.

**Product implications.**
- This is the framework that answers PRD open question **Q9** — ground our Brand Love read in
  Batra/Ahuvia/Bagozzi (2012).
- The seven elements become the **signals the AI looks for in open text** to *infer* a Brand Love read
  when there's no direct rating (INV‑4 keeps inferred values labeled as inferred): identity language,
  passion/usage, emotional connection, longevity, and separation distress.
- The authors' finding that consumers naturally sort brands into *loved / not‑loved / a fuzzy
  "sort‑of‑loved" middle* directly **justifies our five‑point scale** —
  **Love / Like / Ambiguity / Dislike / Hate** — with "Ambiguity" as that fuzzy middle.
- Because brand love predicts **loyalty, WOM, and resistance to negative information**, the Brand Love
  Index (O‑11) is a leading indicator worth benchmarking against competitors (O‑9).

### Ahuvia, A. (2023). *Brand Love's Greatest Hits.* Psychology Today (Aaron Ahuvia, PhD), updated Jul 6, 2023.
`Ahuvia_2023_Brand-Loves-Greatest-Hits_PsychologyToday.pdf`

A plain‑language map of the field by one of its founders: the ~14 most‑cited brand‑love papers (>300
citations each), each with a one‑line finding. A fast orientation and a ready‑made reading list.
Recurring themes across the literature: brand love is **love applied to brands/possessions that carry
identity or enthusiasm**; it is driven by **self‑identity integration** (both the private self and the
public/social self) and **hedonic benefit**; and it reliably leads to **loyalty, WOM, and willingness to
pay a premium**.

Anchors worth adding to this library next (named here): Carroll & Ahuvia (2006) — the *first* brand‑love
scale (hedonic + identity → loyalty/WOM); Albert & Merunka (2013); Bergkvist & Bech‑Larsen (2010);
Wallace, Buil & de Chernatony (2014) — self‑expressive brands and social WOM.

**Product implications.** Confirms the core design bet: measuring identity‑linked *emotional attachment*
(not just satisfaction) is where the differentiated signal lives. Gives us the citations to speak
credibly and a shortlist for deepening the library.

---

## Theme: Loyalty & customer expectations

### BCG (2024). *Loyalty Programs Are Growing—So Are Customer Expectations.*
`BCG_Loyalty_Programs_2024.pdf` · Crouch, Eppler, Taylor, Mühlenbein, Hearne · Dec 9, 2024 · BCG loyalty
program survey, May 2024 (second annual).

Direct evidence for the problem AAA Insights addresses. As people join more loyalty programs, **loyalty
and engagement decline** (the average US consumer now belongs to 15+ programs, up ~10% since 2022;
Europeans ~9). **Younger consumers switch more readily.** Points and cash back are no longer enough —
customers now expect **personalized rewards, relevant partnerships, and exclusive experiences**, and the
benefits they value **vary by region and age cohort**. Traditional strongholds (hotels, airlines) lock in
loyalty less than they used to; paid memberships (streaming, gaming, credit cards) command the strongest.

**Product implications.** Differentiation now lives in *understanding what customers value and expect* —
exactly what the theme/sentiment engine and conversational surveys surface — and in **segmenting** those
signals (age cohort, region). Reinforces competitive benchmarking (O‑9) and the Brand Love lens over bare
satisfaction.

---

## To add next (the backlog — more research coming)
- **Carroll & Ahuvia (2006)** — the first brand‑love scale.
- **Fournier (1998)** — consumer–brand relationships (the relationship metaphor).
- **Thomson, MacInnis & Park (2005)** — emotional attachment to brands.
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
