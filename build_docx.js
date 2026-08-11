const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader
} = require('docx');

const INK = '1A1D21', PAPER = 'F4F1EA', SIGNAL = 'D9763A', SLATE = '6B6F76', MIST = 'E5E2DA';
const DISPLAY = 'Fraunces', BODY = 'Inter', MONO = 'JetBrains Mono';
const CONTENT_W = 9360;
const logo = fs.readFileSync(require('path').join(__dirname, 'assets', 'AAA_Mark_640.png'));
const NONE = { style: BorderStyle.NONE, size: 0, color: 'auto' };

function eyebrow(text) { return new Paragraph({ spacing: { before: 360, after: 80 }, children: [new TextRun({ text: text.toUpperCase(), font: BODY, bold: true, size: 17, color: SLATE, characterSpacing: 40 })] }); }
function shortRule() { return new Paragraph({ indent: { right: CONTENT_W - 620 }, spacing: { after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 1 } }, children: [new TextRun({ text: '', size: 2 })] }); }
function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 120, after: 160 }, children: [new TextRun({ text, font: DISPLAY, bold: true, size: 40, color: INK })] }); }
function lead(text) { return new Paragraph({ spacing: { before: 60, after: 200 }, children: [new TextRun({ text, font: DISPLAY, italics: true, size: 26, color: SLATE })] }); }
function body(segs, opts = {}) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  return new Paragraph({ spacing: { after: opts.after ?? 140, line: 300 }, children: arr.map(s => new TextRun({ text: s.t, font: s.mono ? MONO : BODY, bold: s.b, italics: s.i, size: s.size ?? 21, color: s.color ?? INK })) });
}
function bullet(id, segs, level = 0) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  const kids = [];
  if (id) kids.push(new TextRun({ text: id + '  ', font: MONO, bold: true, size: 20, color: SIGNAL }));
  arr.forEach(s => kids.push(new TextRun({ text: s.t, font: BODY, bold: s.b, italics: s.i, size: 21, color: s.color ?? INK })));
  return new Paragraph({ numbering: { reference: 'aaa-bullets', level }, spacing: { after: 90, line: 288 }, children: kids });
}
function subhead(text) { return new Paragraph({ spacing: { before: 200, after: 90 }, children: [new TextRun({ text, font: BODY, bold: true, size: 22, color: INK })] }); }
function calloutBox(title, lines) {
  const kids = [ new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, font: BODY, bold: true, size: 20, color: INK })] }) ];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 40, line: 276 }, children: [new TextRun({ text: l, font: BODY, size: 20, color: INK })] })));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    borders: { top: NONE, bottom: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE, left: { style: BorderStyle.SINGLE, size: 24, color: SIGNAL } },
    rows: [ new TableRow({ children: [ new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: MIST, color: 'auto' }, margins: { top: 160, bottom: 160, left: 220, right: 220 }, children: kids }) ] }) ] });
}
function table2(headers, rows, widths, opts = {}) {
  const cell = (text, { header, w, mono } = {}) => new TableCell({ width: { size: w, type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, fill: MIST, color: 'auto' } : undefined,
    margins: { top: 70, bottom: 70, left: 130, right: 130 },
    children: [new Paragraph({ spacing: { after: 0, line: 250 }, children: [ new TextRun({ text, font: mono ? MONO : BODY, bold: header, size: header ? 18 : 19, color: INK }) ] })] });
  const border = (c, sz) => ({ style: BorderStyle.SINGLE, size: sz, color: c });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    borders: { top: border(INK, 12), bottom: border(INK, 12), left: NONE, right: NONE, insideVertical: NONE, insideHorizontal: border(MIST, 8) },
    rows: [ new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { header: true, w: widths[i] })) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i], mono: opts.monoCol0 && i === 0 })) })) ] });
}

const children = [];

// ---- COVER ----
children.push(new Paragraph({ spacing: { before: 300, after: 260 }, children: [ new ImageRun({ type: 'png', data: logo, transformation: { width: 74, height: 74 } }) ] }));
children.push(new Paragraph({ spacing: { after: 60 }, children: [ new TextRun({ text: 'PRODUCT REQUIREMENTS DOCUMENT', font: BODY, bold: true, size: 18, color: SLATE, characterSpacing: 50 }) ] }));
children.push(shortRule());
children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [ new TextRun({ text: 'AAA Insights', font: DISPLAY, bold: true, size: 68, color: INK }) ] }));
children.push(new Paragraph({ spacing: { after: 300 }, children: [ new TextRun({ text: 'Collect surveys, reviews, ratings, and comments — then let AI turn them into customer, competitive, and relationship insight, and help you act on it.', font: DISPLAY, italics: true, size: 25, color: SLATE }) ] }));
const meta = [
  ['Version', 'v7.1 — Approved (Emotion & Experience pillar; NFR targets confirmed)'],
  ['Date', '2026-08-11'],
  ['Prepared by', 'Active AI Advisors'],
  ['Prepared for', 'Paul Jamieson'],
  ['Methodology', 'Grounded AI™ — Phase 1 (SPECIFY → v7.1)'],
];
meta.forEach(([k, v]) => children.push(new Paragraph({ spacing: { after: 40 }, children: [
  new TextRun({ text: (k + ':').padEnd(14), font: MONO, size: 18, color: SLATE }),
  new TextRun({ text: v, font: MONO, size: 18, color: INK }) ] })));
children.push(new Paragraph({ spacing: { before: 360 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: MIST, space: 6 } }, children: [
  new TextRun({ text: 'Applied AI for operators.   ·   activeaiadvisors.com   ·   paul@activeaiadvisors.com', font: BODY, size: 18, color: SLATE }) ] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- v7 changes callout ----
children.push(eyebrow('What changed in v7 / v7.1'));
children.push(shortRule());
children.push(calloutBox('Emotion & Experience pillar (v7) · NFR targets confirmed (v7.1, 2026-08-11)', [
  '• v7.1: confirmed the four NFR targets — analysis p95 ≤ 60 s, 99.9% uptime, trigger ≤ 60 s, and durability tightened to RPO ≤ 1 h / RTO ≤ 8 h (from a 24 h placeholder).',
  '• New: an Emotion profile (O-17) — the specific emotions customers voice about the brand (pride, relief, delight vs. frustration, disappointment, anger), with intensity, confidence, verbatims, and trend.',
  '• New: a Strengths & Gripes board (O-18) — the pluses and minuses customers name, per aspect, ranked by their association with Brand Love / Trust (association, not causation).',
  '• Both compare own brand vs. competitors (O-19). Emotions use a compact headline set (~7) that rolls up a finer sub-emotion set on demand (D-17).',
  '• Scope: own-brand emotion + strengths/gripes ship in the MVP; the competitive comparison rides Phase-1 competitor collection (D-18).',
  '• Guardrails: emotion & aspect reads are AI-inferred COMPANION signals — labeled, confidence-scored, never blended into the stated Love/Trust headline (INV-15/INV-16). New R-46–R-50, E-25–E-27, Emotion + Aspect records.',
]));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- CONTENTS ----
children.push(eyebrow('Contents'));
children.push(shortRule());
const toc = [
  ['01', 'Purpose'], ['02', 'Target users & buyer'], ['03', 'Product principles'],
  ['04', 'Inputs'], ['05', 'Outputs'], ['06', 'Requirements (behaviors)'],
  ['07', 'Invariants'], ['08', 'Edge cases'], ['09', 'Exclusions'],
  ['10', 'Data, privacy & security'], ['11', 'Non-functional requirements'],
  ['12', 'Data model (logical)'], ['13', 'Scope & phased roadmap'],
  ['14', 'SPECIFY decisions'], ['15', 'CHALLENGE resolutions'], ['—', 'Approval'],
];
toc.forEach(([n, t]) => children.push(new Paragraph({ spacing: { after: 70 }, children: [
  new TextRun({ text: n + '   ', font: MONO, bold: true, size: 20, color: SIGNAL }),
  new TextRun({ text: t, font: BODY, size: 22, color: INK }),
  new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, leader: PositionalTabLeader.DOT, relativeTo: 'margin' }),
  new TextRun({ text: '', font: BODY, size: 20, color: SLATE }) ] })));
children.push(new Paragraph({ children: [new PageBreak()] }));

function section(num, title, leadText) { children.push(eyebrow('Section ' + num)); children.push(shortRule()); children.push(h1(title)); if (leadText) children.push(lead(leadText)); }

// ---- 1 PURPOSE ----
section('01', 'Purpose', 'What the software is for — and who it serves.');
children.push(body('AAA Insights lets a company collect feedback — surveys, reviews, ratings, and open comments — unify it, and analyze it with AI to produce plain-language insight the business can act on. It extends this to a competitive view (the same analysis run against tracked competitors) and to acting on what it finds — resolving dissatisfied customers and reinforcing loyal ones, and measuring whether the action worked.'));
children.push(body([{ t: 'At the heart of the analysis are two complementary relationship indicators: ' }, { t: 'Brand Love', b: true }, { t: ' (the emotional pull) and ' }, { t: 'Brand Trust', b: true }, { t: ' (confidence the brand is reliable, honest, and acts in the customer’s interest). Measured together they diagnose what neither does alone — an attached customer who no longer trusts the brand is a very different, more fragile situation.' }]));
children.push(body([{ t: 'Underneath those indicators, the product reads two things that help a manager empathize and act: the ' }, { t: 'emotional texture', b: true }, { t: ' of the experience — the specific emotions customers voice, and how they compare to rivals — and the concrete ' }, { t: 'strengths and gripes', b: true }, { t: ' (the pluses and minuses) customers name. These are inferred from open text and stand beside the stated indicators as labeled, evidence-backed reads, never blended into a headline number.' }]));
children.push(body([{ t: 'Not "another survey tool." ', b: true }, { t: 'Survey creation is the on-ramp; the value is what happens after — themes and sentiment, conversational probing, brand-love and trust measurement, a unified hub, competitive benchmarking, insight with recommended actions, and a closed loop that helps the company act and measures the recovery.' }]));

// ---- 2 USERS ----
section('02', 'Target users & buyer', 'Two audiences, one product: credible analysis for the business, effortless response for the customer.');
children.push(body([{ t: 'Primary market: ', b: true }, { t: 'SMB / mid-market companies (~10–500 employees) that want to understand customers but have no in-house research team.' }]));
children.push(table2(['User role', 'What they need from AAA Insights'], [
  ['Owner / founder / GM (buyer)', 'A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first.'],
  ['Marketing / brand lead', 'Themes, sentiment, brand-love, trust, quotes, and competitive position to guide messaging and positioning.'],
  ['CX / customer-success manager', 'Early warning on dissatisfaction, eroding trust, drivers of churn, and a way to work and close recovery cases.'],
  ['Product manager', 'Prioritized signal on what customers want changed, backed by evidence and volume.'],
  ['Respondent (the customer)', 'A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard.'],
], [3000, 6360]));

// ---- 3 PRINCIPLES ----
section('03', 'Product principles', 'Nine commitments that shape every design decision.');
bullet('1', [{ t: 'Insight over dashboards. ', b: true }, { t: 'A plain-language answer to "what should I know and do," not a wall of charts.' }]);
bullet('2', [{ t: 'Every insight is traceable. ', b: true }, { t: 'No theme, sentiment, brand-love/trust read, or recommendation appears without a path to its verbatim responses.' }]);
bullet('3', [{ t: 'Respect the respondent. ', b: true }, { t: 'Surveys are short, mobile-first, accessible, and privacy-respecting.' }]);
bullet('4', [{ t: 'Trustworthy AI. ', b: true }, { t: 'AI output carries its confidence and source data; it never fabricates, separates said from inferred, and never blends an inference into a stated headline number.' }]);
bullet('5', [{ t: 'Lawful by construction. ', b: true }, { t: 'Externally collected data is public and lawfully obtained, with provenance; personal data is minimized and consent-gated. Compliance is a design property (§10).' }]);
bullet('6', [{ t: 'Measure the relationship, not just the transaction. ', b: true }, { t: 'Love and Trust are distinct first-class signals, never collapsed into satisfaction or into each other.' }]);
bullet('7', [{ t: 'Start simple, grow deliberately. ', b: true }, { t: 'The MVP is a tight, buildable core.' }]);
bullet('8', [{ t: 'Close the loop; measure the recovery. ', b: true }, { t: 'The product helps a company act on dissatisfaction and reinforce loyalty, and measures whether the action rebuilt love and trust. The loop is owned and run internally (no customer data pushed to third-party tools in v1).' }]);
bullet('9', [{ t: 'Read the feeling, name the reasons. ', b: true }, { t: 'Beyond the scores, surface the emotions customers express and the specific things they praise or criticize — always as labeled inferences with the verbatims behind them, so a manager can empathize with, and act on, what customers actually feel and say.' }]);

// ---- 4 INPUTS ----
section('04', 'Inputs', 'What the system receives.');
[
  ['I-1', 'Survey definition — question types include single/multi-select, rating/scale, open text, the Brand Love scale (Love / Like / Ambivalence / Dislike / Hate), and the Trust battery (single-item and/or driver battery).'],
  ['I-2', 'Survey response — ratings (incl. Brand Love and Trust), multiple-choice, and open-text comments. May be partial.'],
  ['I-3', 'Conversational response — free-text turns in an AI-led adaptive interview, as a transcript.'],
  ['I-4', 'Imported feedback — external reviews/ratings/comments for the company’s own brand via CSV.'],
  ['I-5', 'Respondent metadata — optional, non-identifying attributes (segment, channel, product, region, language).'],
  ['I-6', 'Distribution request — publish a survey via link, email list, or widget.'],
  ['I-7', 'Analysis query — a natural-language question asked of the feedback data.'],
  ['I-8', 'Competitor configuration — competitor brands to track: names, aliases, products, public sources.'],
  ['I-9', 'Externally-collected feedback — reviews/ratings/comments about the own brand and competitors, from public web / review APIs / a licensed provider. Analysis-only; never a basis for individual outreach (X-7).'],
  ['I-10', '(v6) Respondent contact & consent — optional, opt-in contact a first-party respondent provides, behind an age-appropriate gate. Anonymous-by-default preserved (INV-5, INV-13).'],
  ['I-11', '(v6) Recovery rules & routing config — admin-defined triggers and INTERNAL routing (owner/queue), with default thresholds and throttling.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 5 OUTPUTS ----
section('05', 'Outputs', 'What the system produces.');
[
  ['O-1', 'Collected response store — every response persisted under a common schema, attributable to source, brand, and campaign.'],
  ['O-2', 'Theme analysis — AI-generated themes with counts, quotes, and trend; filterable by brand.'],
  ['O-3', 'Sentiment analysis — positive/neutral/negative with intensity, aggregated by theme, segment, source, brand, and time.'],
  ['O-4', 'Ratings & metrics — average ratings, distribution, response/completion rates, NPS/CSAT.'],
  ['O-5', 'Insight report — narrative of what’s happening, why, and what to do, with ranked actions; can include the competitive picture and the Love × Trust read. Exportable.'],
  ['O-6', 'Answer to an analysis query — grounded strictly in the account’s own data, with citations.'],
  ['O-7', 'Alerts — notifications when a monitored signal crosses a threshold.'],
  ['O-8', 'Respondent-facing survey — the rendered survey or conversational interview.'],
  ['O-9', 'Competitive benchmark — own brand vs. competitors on ratings, Brand Love, Trust, sentiment, themes over a period.'],
  ['O-10', 'Per-competitor analysis — for a selected competitor, an aggregate view with traceability.'],
  ['O-11', '(v6) Brand Love read — distribution across Love / Like / Ambivalence / Dislike / Hate and a Brand Love Index (%(Love+Like) − %(Dislike+Hate)) computed on STATED reads only. Inferred reads are a separate labeled AI-signal, never blended. Unreadable comments are "unknown," excluded from the Index (not scored as Ambivalence).'],
  ['O-12', '(v6) Trust read — a Trust Index (net, STATED-only) plus a driver breakdown. Inferred trust is a labeled companion signal, same discipline as Brand Love.'],
].forEach(([id, t]) => children.push(bullet(id, t)));
children.push(subhead('O-13 — Love × Trust segmentation'));
children.push(table2(['Quadrant', 'Meaning and recommended action'], [
  ['Devoted', 'High love / high trust — advocates. Protect and activate.'],
  ['Infatuated (fragile)', 'High love / low trust — passion without a safety net. Shore up reliability and transparency before a stumble triggers churn.'],
  ['Dependable', 'Low love / high trust — loyal by reliability, not emotion. Deepen the relationship.'],
  ['At-risk', 'Low love / low trust — churn risk and detractors. Intervene or triage.'],
], [2400, 6960]));
[
  ['O-14', '(v5) Recovery case — an internally-managed case opened from a dissatisfaction signal: linked feedback, contact (first-party, if consented), owner, status (open → in-progress → resolved → closed), resolution notes.'],
  ['O-15', '(v6) Recovery metrics — a recovery rate defined on MEASURED recovery (a positive change in Brand Love / Trust before vs. after resolution), reported separately from case resolution/closure rate; plus time-to-resolve. For consented first-party customers and at cohort level.'],
  ['O-16', '(v6) Reinforcement prompts — referral/advocacy invitations may be routed to Devoted/loved customers; public-review prompts are audience-neutral (never sentiment-gated).'],
  ['O-17', '(v7) Emotion profile — for a brand and filtered set, the distribution of emotions expressed in open text and transcripts, using a compact headline taxonomy (~7 emotions: pride, delight, relief/reassurance, hope vs. frustration, disappointment, anger/anxiety), each with intensity, confidence, and representative verbatims, plus trend. Each headline emotion rolls up a finer sub-emotion set to drill into (D-17). "No emotion detected" is its own bucket, never a forced neutral (INV-15). A labeled companion signal — never blended into the stated Love/Trust Indices (INV-4, INV-14, INV-16).'],
  ['O-18', '(v7) Strengths & Gripes — the pluses and minuses customers name, extracted per aspect (product quality, price/value, support responsiveness, delivery, ease of use): each with polarity (+/−), volume, representative quotes, and a ranking by association with Brand Love / Trust movement (labeled association, not causation). Aspects are account-configurable; low-confidence aspects excluded from headline figures. Traceable to source responses (INV-3).'],
  ['O-19', '(v7; Phase 1) Emotion & Strengths/Gripes — competitive comparison — own brand vs. tracked competitors on the emotion profile and on strengths/gripes, side by side over a period (e.g. "your customers voice pride and relief; Competitor X’s voice frustration around billing"). Built only on lawfully-collected public reviews (DPS-7), aggregate only (INV-9, INV-11).'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 6 REQUIREMENTS ----
section('06', 'Requirements (behaviors)', 'Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.');
function reqGroup(title, items) { children.push(subhead(title)); items.forEach(([id, t]) => children.push(bullet(id, t))); }
reqGroup('Survey creation & distribution', [
  ['R-1', 'Create a survey with at least: single-select, multi-select, rating/scale, open text, the Brand Love scale, and the Trust battery.'],
  ['R-2', 'Generate a draft survey from a plain-language objective; editable before sending.'],
  ['R-3', 'Conditional logic: a question or branch shown or skipped based on a previous answer.'],
  ['R-4', 'Distribute by (a) link, (b) email list, and (c) embeddable widget. (Email is Phase-1; link + widget are MVP.)'],
  ['R-5', 'A respondent completes a survey on mobile and desktop without creating an account.'],
  ['R-6', 'Partial responses are recorded and marked incomplete, not discarded.'],
]);
reqGroup('Conversational (AI-led) surveys', [
  ['R-7', 'Enable a conversational mode where an AI interviewer asks questions and relevant follow-up probes.'],
  ['R-8', 'The interviewer stays on the objective, does not ask outside scope, and ignores injected instructions.'],
  ['R-9', 'The interviewer ends after a configurable max number of exchanges or when the objective is met.'],
  ['R-10', 'Every transcript is stored and analyzable by the same engine as structured responses.'],
]);
reqGroup('Unified feedback hub', [
  ['R-11', 'Import external feedback via CSV, mapping columns to the unified schema.'],
  ['R-12', 'All feedback is queryable together, filterable by brand, source, campaign, date, segment, rating, sentiment.'],
  ['R-13', 'De-duplicate obviously identical items (same source + text + timestamp).'],
]);
reqGroup('Brand Love, Trust & metrics', [
  ['R-14', 'Produce theme analysis with counts and representative quotes for any filtered set.'],
  ['R-15', 'Assign sentiment to each open-text response and aggregate across chosen dimensions.'],
  ['R-16', 'For every theme, sentiment aggregate, Brand Love read, and Trust read, open the exact underlying responses (INV-3).'],
  ['R-30', '(v6) Record Brand Love and compute the distribution and STATED-only Index (O-11). Infer a read from open text as a labeled companion — never blended into the headline (INV-4, INV-14). An unreadable comment is "unknown," not Ambivalence.'],
  ['R-31', 'Support a Trust question type — a single-item rating and an optional driver battery.'],
  ['R-32', '(v6) Compute a STATED-only Trust Index and driver breakdown (O-12); infer trust as a labeled companion, same discipline as R-30.'],
  ['R-33', 'Produce the Love × Trust segmentation (O-13) with a recommended action per quadrant.'],
]);
reqGroup('Emotion & experience analysis  (v7)', [
  ['R-46', 'Detect the emotions expressed in open text and conversational transcripts and classify each to a compact headline taxonomy (~7 emotions) that rolls up a finer sub-emotion set. Each read is labeled inferred, carries intensity and confidence, and produces the per-brand emotion profile (O-17) with verbatims and trend. A comment with no readable affect is "no emotion detected," never a forced neutral (INV-15).'],
  ['R-47', 'Drill down from any headline emotion to its granular sub-emotions and the underlying verbatims (INV-3), so the compact view stays readable while analysts can go deeper (D-17).'],
  ['R-48', 'Extract aspect-based strengths and gripes from comments — the attributes customers praise or criticize, each with polarity, volume, and representative quotes — and rank them by volume and by association with Brand Love / Trust movement (association, not causation). Aspects are account-configurable; produce O-18. Guarded against fabricated aspects (only aspects grounded in verbatims; low-confidence excluded — E-26).'],
  ['R-49', '(Phase 1) Compare emotion profiles and strengths/gripes across own brand and tracked competitors (O-19), computed on lawfully-collected public reviews (DPS-7) at aggregate level only (INV-9, INV-11).'],
  ['R-50', 'Be transparent about the method — publish the emotion taxonomy and its headline→sub-emotion roll-up mapping, and carry model_version/confidence on every emotion and aspect read (leave-no-black-box; NFR-6). Emotion and aspect reads are companion signals, never blended into a stated headline (INV-16).'],
]);
reqGroup('Unified customer & competitive insight', [
  ['R-26', 'Produce an aggregate, cross-source "unified customer" view WITHOUT a general identity-linked profile (INV-9; RecoveryCase exception aside).'],
  ['R-24', 'Define and manage a set of competitor brands to track (I-8).'],
  ['R-25', 'Collect publicly available reviews/comments about the own brand and competitors, subject to §10 (DPS-7) and a legal-review gate.'],
  ['R-27', 'Benchmark the brand vs. competitors on ratings, Brand Love, Trust, sentiment, themes over a period (O-9).'],
  ['R-28', 'For a selected competitor, produce per-competitor aggregate analysis (O-10) with traceability.'],
  ['R-29', 'All brand/competitor analysis is filterable and every competitor figure links to its source items.'],
]);
reqGroup('Closed-loop & service recovery  (v6 — internal loop; native workflow is the #3 horizon)', [
  ['R-34', 'Let a first-party respondent opt in to be contacted (age-gated); contact is never required and is stored under consent (INV-5, INV-13, DPS-10).'],
  ['R-35', '(v6) Triggers open a RecoveryCase from a dissatisfaction signal in near-real-time (≤ 60 s). ONLY first-party responses open contactable cases; public/competitor reviews open only anonymous internal-triage cases. Cases are de-duplicated/grouped (one incident/customer → one case) and triggers throttled to prevent case storms; sensible defaults ship.'],
  ['R-36', 'A RecoveryCase carries linked feedback, contact (if consented), an owner, a status lifecycle (open → in-progress → resolved → closed), and resolution notes — owned and resolved INSIDE AAA Insights.'],
  ['R-37', '(v6 — D-E) Notify the assigned owner/team of new/updated cases (in-app + email to the team). v1 does NOT push customer data into external CRM/helpdesk systems; native agent workflow and external integration are the #3 horizon.'],
  ['R-38', 'Measure recovery — for a consented first-party customer, re-measure Brand Love / Trust before vs. after resolution (longitudinal, INV-9 exception), and report at cohort level (O-15).'],
  ['R-39', '(v6 — D-D) Reinforce the satisfied — route referral/advocacy to Devoted/loved customers; public-review prompts are audience-neutral, never sentiment-gated (O-16).'],
  ['R-40', 'Prioritize open dissatisfaction cases by predicted value/risk (quadrant, trust drivers, volume).'],
]);
reqGroup('Security, privacy & integrity  (v6)', [
  ['R-41', 'Public survey and conversational endpoints defend against bots, spam, ballot-stuffing, and coordinated manipulation (rate limiting, anomaly/duplication detection, one-response-per-link tokens) WITHOUT a CAPTCHA wall (protect NFR-4).'],
  ['R-42', 'Admins authenticate securely (support SSO and MFA) with managed sessions; authorization enforces the role model.'],
  ['R-43', 'Credentials for inbound data providers and integration secrets are held in a secrets vault — never in the data model, exports, or logs.'],
  ['R-44', 'Detect and redact PII in open text and transcripts before analysis/surfacing; PII shown to an admin (E-10) is behind role + audit controls.'],
  ['R-45', 'The conversational endpoint enforces rate limits, per-link cost ceilings, and output content-safety checks (in addition to scope control, R-8).'],
]);
reqGroup('AI analysis, accounts, roles, export', [
  ['R-17', 'Ask a natural-language question and receive an answer grounded only in the account’s own data, with citations.'],
  ['R-18', 'Generate an insight report: narrative, metrics, top themes, sentiment, Brand Love, Trust and the Love × Trust read, competitive comparison, quotes, ranked actions.'],
  ['R-19', 'Compute response/completion rate, average rating, distribution, and NPS/CSAT when questions qualify.'],
  ['R-20', 'Configure an alert on a signal (neg-sentiment share, average rating, Brand Love Index, Trust Index, new theme).'],
  ['R-21', '(v6) At least two roles — Owner/Admin and Member — PLUS a lightweight case-owner designation for RecoveryCase assignment (internal user; external agents out of scope in v1).'],
  ['R-22', 'Export any analysis view and the insight report (CSV; PDF and/or slides).'],
  ['R-23', 'Delete a survey, campaign, or response, and export or delete all account data.'],
]);

// ---- 7 INVARIANTS ----
section('07', 'Invariants', 'Conditions that must hold in every state of the system.');
[
  ['INV-1', 'Every response is attributable to exactly one source AND one brand.'],
  ['INV-2', 'Counts are never negative and never exceed responses collected; percentages come from the current filter, counted once per dimension.'],
  ['INV-3', 'Every theme, aggregate, Brand Love/Trust read, insight, recommendation, and query answer is traceable to its underlying responses.'],
  ['INV-4', '(v6) The system never shows a quote or statistic absent from the data, labels any inferred value as inferred, and NEVER blends an inferred read into a stated headline metric.'],
  ['INV-5', 'A respondent can complete a survey without providing identifying information.'],
  ['INV-6', 'Each account’s data is isolated; AI analysis is grounded only in that account’s data.'],
  ['INV-7', 'Deleting a response/campaign/account removes it from all future analysis (subject to the DPS-5 retention hold for open cases).'],
  ['INV-8', 'Respondent PII is stored securely and never in logs or AI outputs unless the admin opts in; PII in open text is detected and redacted before surfacing (R-44).'],
  ['INV-9', '(v6) The "unified customer" view is always aggregate, and the system builds NO general identity-resolved profile. Sole exception: a RecoveryCase may link a consented, first-party respondent to their own feedback for service recovery — purpose-limited, never a general profile, never for scraped/competitor reviewers (X-7).'],
  ['INV-10', 'Externally-collected data is only ever publicly available and lawfully obtained; no bypassing controls; provenance kept on every item.'],
  ['INV-11', 'Personal data in public reviews is minimized, never used to build a profile, excluded from AI outputs by default.'],
  ['INV-12', 'Brand Love and Brand Trust are measured and reported as DISTINCT indicators — never collapsed, never presented as satisfaction.'],
  ['INV-13', 'Follow-up is consent-gated. Contact only on opt-in; anonymous-by-default preserved. Contact/case data under PII protections (INV-8, DPS-10); consent withdrawable anytime.'],
  ['INV-14', '(v6) Headline Brand Love / Trust Indices are STATED-only. Inferred reads are reported separately and labeled; an unreadable comment is "unknown," never scored as Ambivalence.'],
  ['INV-15', '(v7) Emotion and aspect (strengths/gripes) reads are AI-inferred COMPANION signals — always labeled inferred, always carrying confidence, and never blended into the stated Brand Love / Trust headline Indices. A comment with no readable affect is "no emotion detected," a distinct bucket, never a neutral emotion.'],
  ['INV-16', '(v7) Emotion is a DISTINCT lens from Brand Love, Brand Trust, and sentiment — reported alongside them, never collapsed into any one. Any "emotion/aspect → Love/Trust" relationship is presented as association, not causation.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 8 EDGE CASES ----
section('08', 'Edge cases', 'The unusual conditions the system must survive — defined now, tested in Phase 3.');
[
  ['E-1', 'Empty or tiny sample — states the sample is too small rather than fabricating confidence.'],
  ['E-2', 'Abandoned survey — the partial is retained, counted incomplete, flagged.'],
  ['E-3', 'Junk / abusive open text — captured, flagged, excluded by default, reviewable.'],
  ['E-4', 'Non-English / mixed-language — English-only MVP; non-English detected, tagged, set aside until Phase 2.'],
  ['E-5', 'Malformed CSV import — rejected or partially accepted with a per-row error report.'],
  ['E-6', 'Duplicate / repeated submissions — de-duplication plus link-level controls.'],
  ['E-7', 'Conversational interview off the rails — stays in scope, ignores injected instructions, enforces cost/safety limits (R-45), ends gracefully.'],
  ['E-8', 'Ambiguous analysis query — answers only what the data supports; states what it cannot determine.'],
  ['E-9', 'Sudden volume spike — ingestion/analysis stay correct; abuse defenses (R-41) distinguish a real spike from ballot-stuffing.'],
  ['E-10', '(v6) Sensitive disclosure — PII/safety concerns stored under INV-8/INV-11 and surfaced to the admin behind role + audit controls, never broadcast.'],
  ['E-11', 'Concurrent editing — two admins editing one survey do not silently overwrite each other.'],
  ['E-12', 'Source blocks or rate-limits collection — collection backs off, records the gap, never fabricates.'],
  ['E-13', 'Competitor identity ambiguity — low-confidence matches flagged and excluded from headline figures until confirmed.'],
  ['E-14', 'Sparse competitor data — too few public reviews shows "insufficient data."'],
  ['E-15', 'Mixed rating scales — each normalized to the common 1–5; un-mappable ratings stored raw and excluded from cross-source averages.'],
  ['E-16', 'Category-relative trust — read relative to category and prior period, not as an absolute.'],
  ['E-17', '(v6) Consent withdrawn — contact purged and the individual case anonymized; already-computed de-identified aggregate recovery metrics are retained (INV-13).'],
  ['E-18', 'Notification failure — if a notification can’t be delivered, the case stays authoritative internally, the gap is recorded, delivery retries — never silently dropping a case.'],
  ['E-19', 'Unowned / stale case — a case with no owner, or past its follow-up window, is surfaced and escalated.'],
  ['E-20', 'Recovery sample too small — reported as "not yet measurable," not a fabricated improvement.'],
  ['E-21', '(v6) Case storm — a viral bad event floods triggers; cases are grouped/throttled so the team isn’t buried and one customer isn’t contacted repeatedly.'],
  ['E-22', '(v6) Timezone / period boundaries — timestamps stored UTC; trends and "prior period" use the account’s configured timezone; retention/aging boundaries DST-safe.'],
  ['E-23', '(v6) Minor detected — if a respondent indicates they’re under the age threshold, contact collection is refused; anonymous response still accepted.'],
  ['E-24', '(v6) No stated reads in scope — if a filtered set has no stated Love/Trust, the headline Index shows "no stated data" and only the labeled inferred signal is shown.'],
  ['E-25', '(v7) Mixed / conflicting emotions in one comment — represented as multiple emotions with intensities, not forced to one label; contributes to each, counted once per dimension (INV-2).'],
  ['E-26', '(v7) Sarcasm / ambiguous affect — low-confidence emotion or aspect reads are flagged and excluded from headline figures until a confidence floor is met; the verbatim stays available.'],
  ['E-27', '(v7) No emotion / no aspect detectable — the system shows "no signal" rather than fabricating an emotion or a strength/gripe (parallels E-1, E-24).'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 9 EXCLUSIONS ----
section('09', 'Exclusions', 'Explicitly out of scope for v1.');
[
  ['X-1', '(v6) Not a CRM or general customer-record system; builds no general identity-resolved profile. The one exception is the consented, first-party RecoveryCase (INV-9).'],
  ['X-2', '(v6) v1 delivers a lightweight INTERNAL recovery workflow (open, own, track, resolve a case in-app, team notified). v1 does NOT push customer data into external CRM/helpdesk tools, and does NOT ship a native case-management workbench or external agent integrations — those are the posture-#3 horizon.'],
  ['X-3', 'Collection limited to publicly available content obtained lawfully under DPS-7 guardrails. No private/authenticated content, bypassing controls, or collecting data a source’s terms prohibit.'],
  ['X-4', 'No prediction of future business outcomes (churn, revenue) in v1.'],
  ['X-5', 'No public respondent panel / audience marketplace.'],
  ['X-6', 'Does not replace human research judgment; it is decision support with evidence attached.'],
  ['X-7', 'Does not re-identify individuals, contact scraped reviewers, or merge scraped personal data into any profile.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 10 DATA/PRIVACY ----
section('10', 'Data, privacy & security', 'The handling bar this product is held to — enforced in build and verification.');
[
  ['DPS-1', 'The system is a data processor for the account’s feedback; the company is the controller.'],
  ['DPS-2', 'Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, excluded from logs and AI outputs by default.'],
  ['DPS-3', '(v6) Data-subject requests (export/deletion) are supported for own respondents AND for the third-party public-review authors whose data we ingested — erasure by source/author via provenance (D-F).'],
  ['DPS-4', 'AI processing is isolated to the account; account data is never used to train shared/base models.'],
  ['DPS-5', '(v6) Per-account configurable retention (24-mo default); open RecoveryCases and the baseline data their recovery_delta depends on are held past retention until the case closes.'],
  ['DPS-6', 'The full security checklist (input validation, authz/authn, secret handling) is applied during build and verification.'],
].forEach(([id, t]) => children.push(bullet(id, t)));
children.push(subhead('DPS-7 — Web / data-collection compliance'));
children.push(calloutBox('Lawful and ethical by construction — with a legal-review gate', [
  'Collect only publicly accessible content. Respect robots.txt and reasonable rate limits.',
  'Never bypass authentication, paywalls, or technical protections. Prefer official APIs and licensed providers over page collection.',
  'Keep provenance on every item. Minimize and never profile personal data in reviews (INV-11). Honor source-specific terms.',
  'Sources and methods are subject to the client’s legal review and written sign-off BEFORE live collection is enabled.',
  'Active AI Advisors is not providing legal advice; the client should confirm the approach with counsel.',
]));
[
  ['DPS-8', 'v1 targets GDPR and CCPA; SOC 2 is a roadmap item for enterprise sales.'],
  ['DPS-9', 'AI model/hosting is provider-abstracted — best-available models, US data residency available, no lock-in; account data never trains shared models.'],
  ['DPS-10', '(v6) Contact & consent handling. Contact collected only on opt-in (age-gated), minimized, encrypted, access-controlled, used solely for the consented follow-up, deletable on withdrawal (INV-13). v1 shares NO contact/feedback with external tools (D-E). Consent scope and lawful basis tracked per contact.'],
  ['DPS-11', '(v6) Admin auth & secrets — admin authentication (SSO/MFA), managed sessions, and vaulted secrets for inbound data-provider credentials (R-42, R-43).'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 11 NFR ----
section('11', 'Non-functional requirements', 'Speed, reliability, access, honesty — testable budgets. (v7.1: NFR-2/3/8/9 targets confirmed.)');
[
  ['NFR-1', 'Performance — a survey page loads under 2 s on mobile; a submission acknowledges under 1 s.'],
  ['NFR-2', '(v7.1) Analysis latency — the MVP size (~5,000 items) returns at p95 ≤ 60 s (confirmed); larger sets background with progress.'],
  ['NFR-3', '(v7.1) Availability — the collection endpoint targets 99.9% uptime (confirmed); ingestion durable even if analysis is degraded.'],
  ['NFR-4', 'Accessibility — respondent-facing surveys meet WCAG 2.1 AA.'],
  ['NFR-5', 'Scalability path — grows from SMB volumes toward larger sets without a rewrite.'],
  ['NFR-6', 'Explainability — every AI output carries the data behind it and a confidence signal, including inferred (companion) reads.'],
  ['NFR-7', 'Collection freshness & politeness — a freshness/coverage indicator; polite, configurable rate; records gaps.'],
  ['NFR-8', '(v7.1) Trigger latency — a dissatisfaction signal opens a RecoveryCase within ≤ 60 s (confirmed).'],
  ['NFR-9', '(v7.1) Durability — RPO ≤ 1 h, RTO ≤ 8 h (point-in-time recovery); timestamps stored UTC, reporting in the account’s configured timezone.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 12 DATA MODEL ----
section('12', 'Data model (logical)', 'The records the system keeps and how they relate. Physical schema is an Architecture-phase decision.');
children.push(body([{ t: 'Every record is scoped to an ' }, { t: 'Account', b: true }, { t: ' (tenant) for isolation (INV-6).' }]));
function entity(name, desc, rows) {
  children.push(new Paragraph({ spacing: { before: 220, after: 40 }, children: [ new TextRun({ text: name, font: BODY, bold: true, size: 22, color: INK }), new TextRun({ text: '  — ' + desc, font: BODY, italics: true, size: 20, color: SLATE }) ] }));
  children.push(table2(['Field', 'Meaning'], rows, [2700, 6660], { monoCol0: true }));
}
entity('Brand', 'a company or competitor whose feedback is analyzed', [
  ['brand_id', 'Unique id'], ['name / aliases', 'Display name and alternates used to match reviews'],
  ['type', 'own or competitor'], ['products', 'Optional product / line names'], ['tracked', 'Whether active collection is enabled'],
]);
children.push(body([{ t: 'Source', b: true }, { t: ' — where feedback came from: source_id, type (survey · conversational · import_csv · web · api · provider), name/url, terms_note (DPS-7).' }]));
entity('FeedbackRecord', 'the core record — one rating and/or comment about one brand', [
  ['record_id / account_id', 'Unique id; owning tenant (INV-6)'],
  ['brand_id / source_id', 'Which brand (own/competitor) and where from (INV-1)'],
  ['captured_at', 'When given/collected — stored UTC (E-22)'],
  ['rating_raw / rating_scale', 'Original rating and scale (5_star, 10_pt, nps, csat, brand_love, trust, …)'],
  ['rating_norm', 'Normalized to a common 1–5 ordinal (E-15)'],
  ['brand_love', 'Love / Like / Ambivalence / Dislike / Hate (stated, 5→1) OR unknown (v6) — unknown is excluded from the Index, not scored as Ambivalence'],
  ['trust / trust_drivers', 'Trust rating (1–5) and per-driver scores, if applicable'],
  ['comment_text', 'The open-text comment (PII redacted — R-44)'],
  ['language / segment / …', 'Detected language; optional non-identifying metadata'],
  ['is_complete / flags', 'Complete vs partial; junk·abuse·safety·low_confidence'],
  ['provenance', 'source_url + capture_date, or import_batch (INV-10)'],
]);
children.push(body([{ t: 'Sentiment', b: true }, { t: ' — derived, one per record: polarity, intensity, model_version/confidence.   ' }, { t: 'Trust', b: true }, { t: ' — derived: trust_score, drivers, confidence, inferred (companion signal, not blended — INV-14).' }]));
children.push(body([{ t: 'Emotion (v7)', b: true }, { t: ' — derived, ONE OR MORE per record (a comment may carry several — E-25): emotion_id, record_id, emotion_headline (the ~7-set label), sub_emotion (finer — D-17), intensity, valence, model_version/confidence. Always inferred = true; a "no emotion detected" read is stored explicitly, never a neutral emotion (INV-15).   ' }, { t: 'AspectSentiment (v7)', b: true }, { t: ' — derived, ZERO OR MORE per record: aspect_id, record_id, aspect_label (account-configurable), polarity (+/−), intensity, confidence. Links to the verbatim (INV-3); feeds the Strengths & Gripes board (O-18).' }]));
children.push(body([{ t: 'Contact (v5)', b: true }, { t: ' — an opt-in, age-gated contact for a FIRST-PARTY respondent (INV-13): contact_id, respondent_ref, channel/value, consent_scope, consent_at, withdrawn_at. Separate, under DPS-10.   ' }, { t: 'Trigger / Rule (v6)', b: true }, { t: ' — rule_id, condition, action (open case, route to internal owner), throttle/grouping_key, enabled.' }]));
entity('RecoveryCase  (v6)', 'the internally-owned, consented, first-party recovery record (the INV-9 exception)', [
  ['case_id / account_id', 'Unique id; owning tenant'],
  ['record_ids', 'The feedback that opened / relates to the case (grouped — E-21)'],
  ['contact_id', 'Linked opt-in first-party contact, if any; null for anonymous triage cases'],
  ['case_owner', 'Assigned internal owner (R-21)'],
  ['status', 'open · in_progress · resolved · closed'],
  ['kind', 'contactable (first-party) or anonymous_triage (public/competitor-review)'],
  ['opened_at / resolved_at', 'Timestamps (UTC) → time-to-resolve (O-15)'],
  ['recovery_delta', 'Measured change in Brand Love / Trust before vs. after resolution (O-15)'],
  ['resolution_notes', 'What was done'],
]);
children.push(body([{ t: 'MetricSnapshot', b: true }, { t: ' — a rollup: metric ∈ avg_rating · nps · csat · brand_love_index (stated) · trust_index (stated) · recovery_rate (measured) · case_resolution_rate · avg_time_to_resolve · neg_sentiment_share · response_rate · completion_rate · emotion_distribution (inferred, companion) · top_strengths / top_gripes (inferred, companion, v7); value + filter_context (INV-2). Theme/ThemeAssignment, Survey/Campaign, Segment, Alert, Account/User/Role (incl. case-owner) round out the model.' }]));
children.push(calloutBox('Removed in v6, and the closed-loop principle', [
  'Removed: the Connector entity and RecoveryCase external_ref — v1 has NO outbound integrations (D-E). External connectors return only if posture #3 is pursued.',
  'The RecoveryCase and its recovery measurement live entirely inside AAA Insights (no external push). This IS the lightweight internal workflow; posture #3 later adds native agent queues/SLAs reusing the same case, triggers, and recovery metrics.',
  'Unified customer view — no general individual-Customer entity; aggregates FeedbackRecords for an own brand across sources and time, grouped by Segment.',
]));

// ---- 13 ROADMAP ----
section('13', 'Scope & phased roadmap', 'Only Phase 0 is committed. Each later phase re-enters the pipeline before it is built.');
children.push(calloutBox('Phase 0 — MVP (the focused, buildable core)', [
  '• Survey builder: core types + Brand Love scale + Trust battery + logic (R-1, R-3, R-30, R-31)  •  AI-drafted survey (R-2)  •  link + widget distribution (R-4)  •  mobile, account-free capture (R-5, R-6)',
  '• Conversational AI survey with scope, cost & safety controls (R-7–R-10, R-45)  •  CSV import + unified analysis + aggregate unified-customer view (R-11–R-13, R-26)',
  '• AI theme + sentiment + STATED-only Brand Love + Trust, inferred as labeled companion (R-14–R-16, R-30, R-32, INV-14)  •  core metrics + Love × Trust segmentation (R-19, O-11–O-13)',
  '• Emotion & experience (own brand): emotion profile with drill-down + Strengths & Gripes board, as labeled companion reads (R-46–R-48, R-50, O-17, O-18, INV-15, INV-16)',
  '• Closed-loop (internal starter): first-party opt-in contact, triggers, RecoveryCase own/track/resolve in-app + team notification, prioritization (R-34–R-37, R-40)',
  '• Insight report (R-18, R-22)  •  two roles + case-owner, isolation, export/delete (R-21, R-23)',
  '• Security & privacy baseline: bot/abuse defense, admin auth (SSO/MFA), PII redaction, secrets vault, age-gate (R-41–R-45, DPS-11)',
]));
children.push(new Paragraph({ spacing: { after: 60 } }));
function phase(title, lines) { children.push(subhead(title)); lines.forEach(l => children.push(bullet('', l))); }
phase('Phase 1 — Competitive insight, distribution & full loop', [
  'Competitor config + benchmarking (R-24, R-27, O-9) — CSV / licensed-provider / API first; live web collection (R-25, DPS-7) only after legal sign-off; per-competitor deep-dive (R-28, O-10).',
  'Emotion & Strengths/Gripes competitive comparison (R-49, O-19) — own brand vs. competitors, on lawfully-collected public reviews, aggregate only.',
  'Natural-language "ask your data" query (R-17, O-6); email distribution + reminders (R-4 email); alerts (R-20); slides export.',
  'Full internal loop: recovery measurement (R-38, O-15) and reinforcement plays (R-39). No external CRM push (D-E).',
]);
phase('Phase 2 — Connectors, scale & native workflow horizon', [
  'Larger-volume background processing (NFR-5); multi-language expansion (D-4); team collaboration.',
  'Native closed-loop workbench (posture #3) — agent queues, SLAs, macros, and (if demand justifies) sanctioned external integrations — reusing the RecoveryCase, triggers, consent, and recovery metrics.',
]);
phase('Phase 3 — Advanced insight', [
  'Driver analysis; the love-type distinction (passion vs. intimacy/loyalty, per Nobre 2011) and a resilience measure; benchmarking vs prior periods and optional anonymized peer norms; a research assistant that proposes surveys from the gaps it finds.',
]);

// ---- 14 SPECIFY DECISIONS ----
section('14', 'SPECIFY decisions (resolved in v4)', 'Unchanged — summary; full detail in prior versions.');
children.push(body('Keep AAA Insights working name (D-1); build survey engine natively (D-2); provider-abstracted hosting, US residency, no lock-in (D-3); English-only MVP (D-4); GDPR+CCPA (D-5); ~5,000-response target (D-6); hybrid tiered + usage pricing (D-7); no design partner yet (D-8, pending); Brand Love grounded in Batra/Ahuvia/Bagozzi 2012, label "Ambivalence" (D-9); competitors generic & configurable (D-10); CSV-first collection, web after legal sign-off (D-11, sign-off owner pending); 1–5 scale + net Love Index (D-12); per-account 24-mo retention (D-13); single-item + inferred Trust in MVP (D-14); four Trust drivers + net Index (D-15); Closed-Loop pillar #2→#3 (D-16).'));
children.push(subhead('v7 additions (SPECIFY increment, 2026-07-30)'));
children.push(bullet('D-17', [{ t: 'Emotion taxonomy — ', b: true }, { t: 'a compact, manager-readable headline set (~7 emotions) that rolls up a finer sub-emotion set on demand. Grounded in the consumer-emotion literature (Richins’ Consumption Emotions Set; Laros & Steenkamp’s hierarchy of consumer emotions; Plutchik). Reported as a labeled, confidence-scored companion signal (INV-15/INV-16).' }]));
children.push(bullet('D-18', [{ t: 'Scope of the pillar — ', b: true }, { t: 'own-brand emotion + Strengths/Gripes ship in the MVP (they reuse the analysis engine); the competitive comparison rides Phase-1 competitor collection. Emotion & Strengths/Gripes are a new research theme for the library.' }]));

// ---- 15 CHALLENGE RESOLUTIONS ----
section('15', 'CHALLENGE resolutions (v6)', 'From the Phase-2 review (docs/02_spec_review_report.md). Client decisions:');
children.push(table2(['#', 'Decision', 'Resolution'], [
  ['D-A', 'Identity exception for RecoveryCase', 'Yes — consented, first-party only. The RecoveryCase is the one identity-linked record (INV-9 exception, X-1).'],
  ['D-B', 'Unit of recovery measurement', 'Longitudinal for consented first-party customers, plus cohort level (R-38, O-15).'],
  ['D-C', 'Case-opening scope', 'First-party responses only open contactable cases; public/competitor reviews → anonymous internal-triage only (R-35).'],
  ['D-D', 'Reinforcement & review-gating', 'Audience-neutral public-review prompts; referral/advocacy may be sentiment-routed (R-39, O-16).'],
  ['D-E', 'External integrations', 'None in v1 — internal-only loop; team notified, no CRM/helpdesk push (R-37, X-2, DPS-10; Connector removed).'],
  ['D-F', 'Erasure for scraped authors', 'Yes — DSR/erasure extended to third-party review authors (DPS-3).'],
  ['D-G', 'Index composition', 'Stated-only headline Index; inferred = labeled companion; unreadable → "unknown," never Ambivalence (O-11/O-12, R-30, INV-14, INV-4).'],
], [780, 2600, 5980]));
children.push(subhead('Resolved by AAA and folded in (F-8–F-19)'));
children.push(body('Bot/abuse defense (R-41), conversational safety (R-45), admin auth + secrets (R-42/R-43/DPS-11), PII redaction (R-44/INV-8), "unknown" vs Ambivalence (INV-14/data model), case dedup/throttle (R-35/E-21), recovery_rate = measured (O-15), NFR numbers (NFR-2/3/8/9, proposed), timezone/UTC (E-22/NFR-9), retention hold (DPS-5), case-owner role (R-21), age-gate (R-34/E-23).'));

// ---- APPROVAL ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(eyebrow('Approval'));
children.push(shortRule());
children.push(h1('The specification gate'));
children.push(body('v7 added the Emotion & Experience pillar on the v6 CHALLENGE baseline and was approved; v7.1 confirms the four NFR targets (NFR-2/3/8/9). This approved spec is the baseline that carries into TEST FIRST (Phase 3) and IMPLEMENT (Phase 4).'));
children.push(body([{ t: 'Note: ', b: true }, { t: 'the new pillar warrants a light CHALLENGE pass — chiefly on inferred-emotion accuracy and the association-vs-causation framing — which its invariants INV-15/INV-16 and edge cases E-25–E-27 already pre-empt; we can fold any further findings before Phase 3.' }]));
children.push(new Paragraph({ spacing: { before: 260, after: 0 }, children: [
  new TextRun({ text: 'Approved by ', font: BODY, size: 21, color: INK }),
  new TextRun({ text: '______________________________', font: BODY, size: 21, color: SLATE }),
  new TextRun({ text: '     Date ', font: BODY, size: 21, color: INK }),
  new TextRun({ text: '____________________', font: BODY, size: 21, color: SLATE }) ] }));
children.push(new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: MIST, space: 6 } }, children: [
  new TextRun({ text: 'Prepared by Active AI Advisors under the Grounded AI™ methodology. Every phase produces an artifact you own.', font: BODY, italics: true, size: 18, color: SLATE }) ] }));
children.push(new Paragraph({ spacing: { before: 60 }, children: [
  new TextRun({ text: 'Active AI Advisors · paul@activeaiadvisors.com', font: BODY, size: 18, color: SLATE }) ] }));

const doc = new Document({
  background: { color: PAPER },
  numbering: { config: [ { reference: 'aaa-bullets', levels: [
    { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { run: { color: SIGNAL, font: BODY }, paragraph: { indent: { left: 360, hanging: 220 } } } },
    { level: 1, format: 'bullet', text: '–', alignment: AlignmentType.LEFT, style: { run: { color: SLATE, font: BODY }, paragraph: { indent: { left: 720, hanging: 220 } } } },
  ] } ] },
  styles: { default: {
    document: { run: { font: BODY, size: 21, color: INK } },
    heading1: { run: { font: DISPLAY, bold: true, size: 40, color: INK } },
    heading2: { run: { font: BODY, bold: true, size: 26, color: INK } },
  } },
  sections: [ { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children } ],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync('/home/claude/aaa-insights/AAA_Insights_PRD.docx', buf); console.log('WROTE', buf.length, 'bytes'); });
