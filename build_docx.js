const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader
} = require('docx');

// ---- Brand tokens ----
const INK = '1A1D21', PAPER = 'F4F1EA', SIGNAL = 'D9763A', SLATE = '6B6F76', MIST = 'E5E2DA';
const DISPLAY = 'Fraunces', BODY = 'Inter', MONO = 'JetBrains Mono';
const CONTENT_W = 9360;
const logo = fs.readFileSync('/root/.claude/skills/aaa-brand-guidelines/AAA_Mark_640.png');
const NONE = { style: BorderStyle.NONE, size: 0, color: 'auto' };

function eyebrow(text) {
  return new Paragraph({ spacing: { before: 360, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), font: BODY, bold: true, size: 17, color: SLATE, characterSpacing: 40 })] });
}
function shortRule() {
  return new Paragraph({ indent: { right: CONTENT_W - 620 }, spacing: { after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 1 } },
    children: [new TextRun({ text: '', size: 2 })] });
}
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 120, after: 160 },
    children: [new TextRun({ text, font: DISPLAY, bold: true, size: 40, color: INK })] });
}
function lead(text) {
  return new Paragraph({ spacing: { before: 60, after: 200 },
    children: [new TextRun({ text, font: DISPLAY, italics: true, size: 26, color: SLATE })] });
}
function body(segs, opts = {}) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  return new Paragraph({ spacing: { after: opts.after ?? 140, line: 300 }, alignment: opts.align,
    children: arr.map(s => new TextRun({ text: s.t, font: s.mono ? MONO : BODY, bold: s.b, italics: s.i, size: s.size ?? 21, color: s.color ?? INK })) });
}
function bullet(id, segs, level = 0) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  const kids = [];
  if (id) kids.push(new TextRun({ text: id + '  ', font: MONO, bold: true, size: 20, color: SIGNAL }));
  arr.forEach(s => kids.push(new TextRun({ text: s.t, font: BODY, bold: s.b, italics: s.i, size: 21, color: s.color ?? INK })));
  return new Paragraph({ numbering: { reference: 'aaa-bullets', level }, spacing: { after: 90, line: 288 }, children: kids });
}
function subhead(text) {
  return new Paragraph({ spacing: { before: 200, after: 90 }, children: [new TextRun({ text, font: BODY, bold: true, size: 22, color: INK })] });
}
function calloutBox(title, lines) {
  const kids = [ new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, font: BODY, bold: true, size: 20, color: INK })] }) ];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 40, line: 276 }, children: [new TextRun({ text: l, font: BODY, size: 20, color: INK })] })));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    borders: { top: NONE, bottom: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE, left: { style: BorderStyle.SINGLE, size: 24, color: SIGNAL } },
    rows: [ new TableRow({ children: [ new TableCell({ width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: MIST, color: 'auto' }, margins: { top: 160, bottom: 160, left: 220, right: 220 }, children: kids }) ] }) ] });
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
children.push(new Paragraph({ spacing: { after: 300 }, children: [ new TextRun({ text: 'Collect surveys, reviews, ratings, and comments — then let AI turn them into customer, competitive, and relationship insight.', font: DISPLAY, italics: true, size: 26, color: SLATE }) ] }));
const meta = [
  ['Version', 'v5 — Draft (Closed-Loop / Service Recovery pillar added)'],
  ['Date', '2026-07-27'],
  ['Prepared by', 'Active AI Advisors'],
  ['Prepared for', 'Paul Jamieson'],
  ['Methodology', 'Grounded AI™ — Phase 1 (SPECIFY)'],
];
meta.forEach(([k, v]) => children.push(new Paragraph({ spacing: { after: 40 }, children: [
  new TextRun({ text: (k + ':').padEnd(14), font: MONO, size: 18, color: SLATE }),
  new TextRun({ text: v, font: MONO, size: 18, color: INK }) ] })));
children.push(new Paragraph({ spacing: { before: 360 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: MIST, space: 6 } }, children: [
  new TextRun({ text: 'Applied AI for operators.', font: BODY, size: 18, color: SLATE }),
  new TextRun({ text: '   ·   activeaiadvisors.com   ·   paul@activeaiadvisors.com', font: BODY, size: 18, color: SLATE }) ] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ---- v5 changes callout ----
children.push(eyebrow('What changed in v5'));
children.push(shortRule());
children.push(calloutBox('Revised 2026-07-27 — Closed-Loop / Service Recovery pillar', [
  '• Added the shift from measuring sentiment to actively managing it: opt-in respondent contactability, signal-driven triggers, and a first-class RecoveryCase with a status lifecycle.',
  '• Hand-off to the tools a company already uses (helpdesk / CRM / email) via connectors, plus recovery measurement — did Brand Love / Trust actually rebuild? — and reinforcement plays for satisfied customers.',
  '• Delivered as posture #2 (orchestrate + measure), architected for #3 (native workflow) — the RecoveryCase and its measurement are owned internally, so #3 is an evolution, not a rewrite.',
  '• Grounded in the service-recovery paradox: a well-resolved complaint can leave a customer more loyal than if nothing had gone wrong.',
  '  (v4 resolved all 15 open questions; v3 added Brand Trust; v2 added the unified-customer view, competitors, lawful collection, Brand Love, and the data model.)',
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
  ['12', 'Data model (logical)'], ['13', 'Scope & phased roadmap'], ['14', 'Decisions (resolved)'], ['—', 'Approval'],
];
toc.forEach(([n, t]) => children.push(new Paragraph({ spacing: { after: 70 }, children: [
  new TextRun({ text: n + '   ', font: MONO, bold: true, size: 20, color: SIGNAL }),
  new TextRun({ text: t, font: BODY, size: 22, color: INK }),
  new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, leader: PositionalTabLeader.DOT, relativeTo: 'margin' }),
  new TextRun({ text: '', font: BODY, size: 20, color: SLATE }) ] })));
children.push(new Paragraph({ children: [new PageBreak()] }));

function section(num, title, leadText) {
  children.push(eyebrow('Section ' + num));
  children.push(shortRule());
  children.push(h1(title));
  if (leadText) children.push(lead(leadText));
}

// ---- 1 PURPOSE ----
section('01', 'Purpose', 'What the software is for — and who it serves.');
body('AAA Insights lets a company collect feedback from its customers and consumers — surveys, reviews, ratings, and open comments — unify it in one place, and analyze it with AI to produce plain-language insight the business can act on. It extends this to a competitive view: the same collection and analysis run against tracked competitors.');
body([{ t: 'At the heart of the analysis are two complementary relationship indicators: ', }, { t: 'Brand Love', b: true }, { t: ' (the emotional pull — identity, passion, attachment) and ', }, { t: 'Brand Trust', b: true }, { t: ' (confidence that the brand is reliable, honest, and acts in the customer’s interest). Measured together they diagnose what neither does alone — an attached customer who no longer trusts the brand is a very different, and more fragile, situation than one who is both attached and trusting.' }]);
body([{ t: 'Not "another survey tool." ', b: true }, { t: 'Survey creation is the on-ramp; the value is what happens after feedback arrives — themes and sentiment, conversational probing, brand-love and trust measurement, a unified hub, competitive benchmarking, and insight with recommended actions.' }]);

// ---- 2 USERS ----
section('02', 'Target users & buyer', 'Two audiences, one product: credible analysis for the business, effortless response for the customer.');
body([{ t: 'Primary market: ', b: true }, { t: 'SMB / mid-market companies (~10–500 employees) that want to understand customers but have no in-house research team.' }]);
children.push(table2(['User role', 'What they need from AAA Insights'], [
  ['Owner / founder / GM (buyer)', 'A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first.'],
  ['Marketing / brand lead', 'Themes, sentiment, brand-love, trust, quotes, and competitive position to guide messaging and positioning.'],
  ['CX / customer-success manager', 'Early warning on dissatisfaction, eroding trust, drivers of churn, and a way to close the loop.'],
  ['Product manager', 'Prioritized signal on what customers want changed, backed by evidence and volume.'],
  ['Respondent (the customer)', 'A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard.'],
], [3000, 6360]));

// ---- 3 PRINCIPLES ----
section('03', 'Product principles', 'Eight commitments that shape every design decision.');
bullet('1', [{ t: 'Insight over dashboards. ', b: true }, { t: 'A plain-language answer to "what should I know and do," not a wall of charts.' }]);
bullet('2', [{ t: 'Every insight is traceable. ', b: true }, { t: 'No theme, sentiment, brand-love read, trust read, or recommendation appears without a path to its verbatim responses.' }]);
bullet('3', [{ t: 'Respect the respondent. ', b: true }, { t: 'Surveys are short, mobile-first, accessible, and privacy-respecting.' }]);
bullet('4', [{ t: 'Trustworthy AI. ', b: true }, { t: 'AI output carries its confidence and source data; it never fabricates, and it separates what was said from what was inferred.' }]);
bullet('5', [{ t: 'Lawful by construction. ', b: true }, { t: 'Externally collected data is publicly available and lawfully obtained, with provenance on every item (see §10).' }]);
bullet('6', [{ t: 'Measure the relationship, not just the transaction. ', b: true }, { t: 'Love and Trust are distinct signals from satisfaction; the product treats them as first-class and never collapses them into one number.' }]);
bullet('7', [{ t: 'Start simple, grow deliberately. ', b: true }, { t: 'The MVP is a tight, buildable core.' }]);
bullet('8', [{ t: 'Close the loop; measure the recovery. ', b: true }, { t: '(v5) The product doesn’t stop at insight — it helps a company act on dissatisfaction and reinforce loyalty, and it measures whether the action actually rebuilt love and trust. We own the recovery loop internally and execute through the tools the company already uses.' }]);

// ---- 4 INPUTS ----
section('04', 'Inputs', 'What the system receives.');
[
  ['I-1', 'Survey definition — built by an admin or AI-generated. Question types include single-select, multi-select, rating/scale, open text, the Brand Love scale (Love / Like / Ambivalence / Dislike / Hate), and the Trust battery (a single-item trust rating and/or a short driver battery: reliability, integrity, benevolence, security/privacy).'],
  ['I-2', 'Survey response — ratings (incl. Brand Love and Trust), multiple-choice, and open-text comments. May be partial.'],
  ['I-3', 'Conversational response — free-text turns in an AI-led adaptive interview, as a transcript.'],
  ['I-4', 'Imported feedback — external reviews/ratings/comments for the company’s own brand via CSV.'],
  ['I-5', 'Respondent metadata — optional, non-identifying attributes (segment, channel, product, region, language).'],
  ['I-6', 'Distribution request — publish a survey via link, email list, or widget.'],
  ['I-7', 'Analysis query — a natural-language question asked of the feedback data.'],
  ['I-8', 'Competitor configuration — the competitor brands to track: names, aliases, products, public sources.'],
  ['I-9', 'Externally-collected feedback — reviews/ratings/comments about the own brand and tracked competitors from public web pages, review-site APIs, or a licensed provider (source URL, capture date, brand, rating, text).'],
  ['I-10', '(v5) Respondent contact & consent — optional, opt-in contact details a respondent provides so the company may follow up (e.g., email). Anonymous-by-default is preserved (INV-5, INV-13).'],
  ['I-11', '(v5) Recovery rules & routing config — admin-defined triggers (which signals open a case) and routing (which owner/queue or external tool a case is handed to).'],
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
  ['O-9', 'Competitive benchmark — own brand vs. competitors on ratings, Brand Love, Trust, sentiment, and themes over a chosen period.'],
  ['O-10', 'Per-competitor analysis — for a selected competitor, an aggregate view with traceability.'],
  ['O-11', 'Brand Love read — the distribution across Love / Like / Ambivalence / Dislike / Hate and a Brand Love Index (share of Love+Like minus share of Dislike+Hate), per company and competitor, over time.'],
  ['O-12', 'Trust read — a Trust Index (net trust) plus a driver breakdown (reliability, integrity, benevolence, security/privacy), per company and competitor, over time.'],
].forEach(([id, t]) => children.push(bullet(id, t)));
children.push(subhead('O-13 — Love × Trust segmentation'));
children.push(body('Respondents and segments are placed in one of four quadrants, each with a recommended action:'));
children.push(table2(['Quadrant', 'Meaning and recommended action'], [
  ['Devoted', 'High love / high trust — your advocates. Protect and activate them.'],
  ['Infatuated (fragile)', 'High love / low trust — passion without a safety net. One stumble triggers churn; shore up reliability and transparency.'],
  ['Dependable', 'Low love / high trust — loyal by reliability, not emotion. Steady; deepen the relationship.'],
  ['At-risk', 'Low love / low trust — churn risk and detractors. Intervene or triage.'],
], [2400, 6960]));
[
  ['O-14', '(v5) Recovery case — a tracked case opened from a dissatisfaction signal: the linked feedback, contact (if consented), owner, status (open → in-progress → resolved), and resolution notes.'],
  ['O-15', '(v5) Recovery metrics — recovery rate, time-to-resolve, and the change in Brand Love / Trust before vs. after resolution (the service-recovery outcome).'],
  ['O-16', '(v5) Reinforcement prompts — for satisfied/loved customers, opt-in prompts to review, refer, or advocate.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 6 REQUIREMENTS ----
section('06', 'Requirements (behaviors)', 'Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.');
function reqGroup(title, items) { children.push(subhead(title)); items.forEach(([id, t]) => children.push(bullet(id, t))); }
reqGroup('Survey creation & distribution', [
  ['R-1', 'Create a survey with at least: single-select, multi-select, rating/scale, open text, the Brand Love scale, and the Trust battery (single-item and/or driver items).'],
  ['R-2', 'Generate a draft survey from a plain-language objective; editable before sending.'],
  ['R-3', 'Conditional logic: a question or branch is shown or skipped based on a previous answer.'],
  ['R-4', 'Distribute by (a) link, (b) email list, and (c) embeddable widget. (Email is Phase-1; link + widget are MVP.)'],
  ['R-5', 'A respondent completes a survey on mobile and desktop without creating an account.'],
  ['R-6', 'Partial responses are recorded and marked incomplete, not discarded.'],
]);
reqGroup('Conversational (AI-led) surveys', [
  ['R-7', 'Enable a conversational mode where an AI interviewer asks questions and relevant follow-up probes.'],
  ['R-8', 'The interviewer stays on the admin-defined objective and does not ask outside the topic scope.'],
  ['R-9', 'The interviewer ends after a configurable max number of exchanges or when the objective is met.'],
  ['R-10', 'Every transcript is stored and analyzable by the same engine as structured responses.'],
]);
reqGroup('Unified feedback hub', [
  ['R-11', 'Import external feedback via CSV, mapping columns to the unified schema (brand, source, date, rating, text, segment).'],
  ['R-12', 'All feedback is queryable together, filterable by brand, source, campaign, date, segment, rating, sentiment.'],
  ['R-13', 'De-duplicate obviously identical items (same source + text + timestamp).'],
]);
reqGroup('Brand Love, Trust & metrics', [
  ['R-14', 'Produce theme analysis with counts and representative quotes for any filtered set.'],
  ['R-15', 'Assign sentiment to each open-text response and aggregate across chosen dimensions.'],
  ['R-16', 'For every theme, sentiment aggregate, Brand Love read, and Trust read, open the exact underlying responses (traceability — INV-3).'],
  ['R-30', 'Record Brand Love on the five-point scale, normalize to an ordinal, and compute the Brand Love distribution and Index (O-11) — including inferring a read from open text where no direct rating exists, labeled inferred (INV-4).'],
  ['R-31', 'Support a Trust question type — a single-item trust rating and an optional multi-item driver battery (reliability, integrity, benevolence, security/privacy).'],
  ['R-32', 'Record trust; compute a Trust Index and per-driver breakdown (O-12) for any filtered set — including inferring a trust read from open text where no direct rating exists, labeled inferred (INV-4), the same way Brand Love is inferred (R-30).'],
  ['R-33', 'Produce the Love × Trust segmentation (O-13) with a recommended action per quadrant, available in the insight report (O-5) and the competitive benchmark (O-9).'],
]);
reqGroup('Unified customer & competitive insight', [
  ['R-26', 'Produce an aggregate, cross-source "unified customer" view WITHOUT building or requiring an identity-linked individual profile (INV-9).'],
  ['R-24', 'Define and manage a set of competitor brands to track (I-8).'],
  ['R-25', 'Collect publicly available reviews/ratings/comments about the own brand and tracked competitors from configured sources, subject to §10 (DPS-7) and a legal-review gate before live collection is enabled.'],
  ['R-27', 'Benchmark the company’s brand vs. competitors on ratings, Brand Love, Trust, sentiment, and themes over a chosen period (O-9).'],
  ['R-28', 'For a selected competitor, produce per-competitor aggregate analysis (O-10) with traceability.'],
  ['R-29', 'All brand/competitor analysis is filterable by brand, source, date, segment, and sentiment, and every competitor figure links to its source items.'],
]);
reqGroup('Closed-loop & service recovery  (v5 — posture #2, architected for #3)', [
  ['R-34', 'Let a respondent opt in to be contacted for follow-up (e.g., leave an email); contact is never required and is stored under consent (INV-5, INV-13, DPS-10).'],
  ['R-35', 'Configurable triggers — a dissatisfaction signal (Dislike/Hate, low Trust, At-risk quadrant, negative-sentiment spike, rating below a floor) opens a RecoveryCase in near-real-time.'],
  ['R-36', 'A RecoveryCase carries the linked feedback, contact (if consented), an owner, a status lifecycle (open → in-progress → resolved), and resolution notes. The case and its lifecycle are owned internally — this is what makes native workflow (#3) an evolution, not a rewrite.'],
  ['R-37', 'Hand off / integrate — dispatch a case or action to an external tool the company already uses (helpdesk, CRM, email) via a connector; status changes round-trip back to the RecoveryCase.'],
  ['R-38', 'Measure recovery — after resolution, re-measure sentiment / Brand Love / Trust for that customer or segment and compute a recovery rate and time-to-resolve (O-15).'],
  ['R-39', 'Reinforce the satisfied — for Devoted/loved customers, generate opt-in prompts to review, refer, or advocate (O-16).'],
  ['R-40', 'Prioritize open dissatisfaction cases by predicted value/risk (Love × Trust quadrant, trust drivers, volume) so the highest-leverage recoveries surface first.'],
]);
reqGroup('AI analysis, accounts, roles, export', [
  ['R-17', 'Ask a natural-language question and receive an answer grounded only in the account’s own data, with citations.'],
  ['R-18', 'Generate an insight report: narrative, metrics, top themes, sentiment, Brand Love, Trust and the Love × Trust read, competitive comparison, quotes, ranked actions.'],
  ['R-19', 'Compute response rate, completion rate, average rating, rating distribution, and NPS/CSAT when questions qualify.'],
  ['R-20', 'Configure an alert on a signal (negative-sentiment share, average rating, Brand Love Index, Trust Index, new theme) with notification when crossed.'],
  ['R-21', 'At least two roles: Owner/Admin (account, users, billing) and Member (builds surveys, views analysis).'],
  ['R-22', 'Export any analysis view and the insight report (CSV for raw data; PDF and/or slides).'],
  ['R-23', 'Delete a survey, campaign, or response, and export or delete all account data.'],
]);

// ---- 7 INVARIANTS ----
section('07', 'Invariants', 'Conditions that must hold in every state of the system.');
[
  ['INV-1', 'Every response is attributable to exactly one source AND one brand. No response exists without a known origin.'],
  ['INV-2', 'Counts are never negative and never exceed responses collected; percentages come from the current filter, each response counted once per dimension.'],
  ['INV-3', 'Every theme, aggregate, Brand Love read, Trust read, insight, recommendation, and query answer is traceable to its underlying responses. No AI claim without a path to its verbatim data.'],
  ['INV-4', 'The system never shows a quote or statistic absent from the data, and labels any value it inferred (e.g., Brand Love or Trust from text) as inferred, not stated.'],
  ['INV-5', 'A respondent can complete a survey without providing identifying information.'],
  ['INV-6', 'Each account’s data is isolated; AI analysis is grounded only in that account’s data.'],
  ['INV-7', 'Deleting a response, campaign, or account removes it from all future analysis; deleted data never reappears.'],
  ['INV-8', 'Respondent PII is stored securely and never written to logs or AI outputs unless the admin opts in.'],
  ['INV-9', 'The "unified customer" view is always aggregate; no identity-resolved profile of any individual.'],
  ['INV-10', 'Externally-collected data is only ever publicly available and lawfully obtained; no bypassing authentication, paywalls, or technical controls; provenance kept on every item.'],
  ['INV-11', 'Personal data in public reviews is minimized, never used to build a profile, and excluded from AI outputs by default.'],
  ['INV-12', 'Brand Love and Brand Trust are measured and reported as DISTINCT indicators. The system never collapses them into a single score, and never presents Trust as satisfaction (or vice versa).'],
  ['INV-13', '(v5) Follow-up is consent-gated. The system contacts a respondent only when they have opted in; anonymous-by-default is preserved (INV-5). Recovery-case data and contact details fall under the same PII protections (INV-8, DPS-10), and a respondent can withdraw consent at any time.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 8 EDGE CASES ----
section('08', 'Edge cases', 'The unusual conditions the system must survive — defined now, tested in Phase 3.');
[
  ['E-1', 'Empty or tiny sample — states the sample is too small for reliable findings (themes, sentiment, Brand Love, or Trust) rather than fabricating confidence.'],
  ['E-2', 'Abandoned survey — the partial is retained, counted as incomplete, flagged in analysis.'],
  ['E-3', 'Junk / abusive open text — captured, flagged, excluded from analysis by default, reviewable.'],
  ['E-4', 'Non-English / mixed-language — the MVP is English-only (D-4); non-English responses are detected, tagged, and set aside with an honest note until multilingual analysis lands in Phase 2.'],
  ['E-5', 'Malformed CSV import — rejected or partially accepted with a per-row error report.'],
  ['E-6', 'Duplicate / repeated submissions — de-duplication plus link-level controls.'],
  ['E-7', 'Conversational interview off the rails — stays in scope, ignores injected instructions, ends gracefully.'],
  ['E-8', 'Ambiguous analysis query — answers only what the data supports; states what it cannot determine.'],
  ['E-9', 'Sudden volume spike — ingestion and analysis stay correct; views may lag but never lose or double-count.'],
  ['E-10', 'Sensitive disclosure — PII/safety concerns stored under INV-8/INV-11, surfaced to the admin, not broadcast.'],
  ['E-11', 'Concurrent editing — two admins editing one survey do not silently overwrite each other.'],
  ['E-12', 'Source blocks or rate-limits collection — collection backs off, records the gap, never fabricates missing items.'],
  ['E-13', 'Competitor identity ambiguity — low-confidence matches flagged and excluded from headline figures until confirmed.'],
  ['E-14', 'Sparse competitor data — too few public reviews shows "insufficient data," not a misleading number.'],
  ['E-15', 'Mixed rating scales — 5-star, 10-point, thumbs, Brand Love, Trust each normalized to the common scale; un-mappable ratings stored raw and excluded from cross-source averages.'],
  ['E-16', 'Category-relative trust — the Trust Index is read relative to category and prior period, not as an absolute (a bank’s trust bar differs from a snack brand’s). Cross-category trust comparisons are flagged as context-dependent.'],
  ['E-17', '(v5) Consent withdrawn — a respondent who opted in later opts out; their contact is purged and any open case is closed/anonymized, honoring the withdrawal (INV-13).'],
  ['E-18', '(v5) Integration/sync failure — if the external helpdesk/CRM is unreachable, the RecoveryCase stays authoritative internally, the gap is recorded, and it re-syncs when the tool returns — never silently dropping a case.'],
  ['E-19', '(v5) Unowned / stale case — a case with no owner, or one past its follow-up window, is surfaced and escalated rather than left to rot.'],
  ['E-20', '(v5) Recovery sample too small — where too few responses exist to re-measure reliably, recovery is reported as "not yet measurable," not a fabricated improvement (E-1 applies).'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 9 EXCLUSIONS ----
section('09', 'Exclusions', 'Explicitly out of scope for v1 — the unwritten assumptions, made written.');
[
  ['X-1', 'Not a CRM or customer-record system; does not build identity-resolved individual profiles.'],
  ['X-2', '(v5, revised) v1 does NOT ship a full native case-management workbench (agent queues, SLAs, macros) — that is posture #3, an explicit later horizon. v1 delivers posture #2: opening and owning a RecoveryCase internally and executing through the company’s existing tools via integrations, plus recovery measurement.'],
  ['X-3', 'Collection is limited to publicly available content obtained lawfully via APIs, licensed providers, or public web pages under the DPS-7 guardrails. No private/authenticated content, bypassing logins/paywalls/protections, or collecting data a source’s terms prohibit.'],
  ['X-4', 'No prediction of future business outcomes (churn, revenue) in v1.'],
  ['X-5', 'No public respondent panel / audience marketplace.'],
  ['X-6', 'Does not replace human research judgment; it is decision support with evidence attached.'],
  ['X-7', 'Does not attempt to re-identify individuals or merge scraped personal data into any profile.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 10 DATA/PRIVACY ----
section('10', 'Data, privacy & security', 'The handling bar this product is held to — enforced in build and verification.');
[
  ['DPS-1', 'The system is a data processor for the account’s feedback; the company is the controller.'],
  ['DPS-2', 'Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, and excluded from logs and AI outputs by default.'],
  ['DPS-3', 'Data-subject requests are supported: export and deletion on request.'],
  ['DPS-4', 'AI processing is isolated to the account; account data is not used to train shared/base models without opt-in.'],
  ['DPS-5', 'A configurable retention period is supported for both first-party and collected data.'],
  ['DPS-6', 'The full security checklist is applied during build and verification. (Security/privacy is also a Trust driver measured in O-12 — how safe customers feel is part of the trust picture.)'],
].forEach(([id, t]) => children.push(bullet(id, t)));
children.push(subhead('DPS-7 — Web / data-collection compliance'));
children.push(calloutBox('Lawful and ethical by construction — with a legal-review gate', [
  'Collect only publicly accessible content. Respect robots.txt and reasonable rate limits.',
  'Never bypass authentication, paywalls, or technical protections. Prefer official APIs and licensed providers over page collection.',
  'Keep provenance (source, URL, capture date) on every item. Minimize and never profile personal data in reviews (INV-11). Honor source-specific terms.',
  'The specific sources and methods are subject to the client’s legal review and written sign-off BEFORE live collection is enabled — a gate, not a default.',
  'Active AI Advisors is not providing legal advice; the client should confirm the approach with counsel.',
]));
children.push(bullet('DPS-8', [{ t: '(v4) ', i: true }, { t: 'v1 targets ' }, { t: 'GDPR and CCPA', b: true }, { t: ' compliance; SOC 2 is a roadmap item for later enterprise sales.' }]));
children.push(bullet('DPS-9', [{ t: '(v4) ', i: true }, { t: 'AI model/hosting is ' }, { t: 'provider-abstracted', b: true }, { t: ' — best-available models, US data residency available, no single-vendor lock-in; account data never trains shared models (DPS-4).' }]));
children.push(bullet('DPS-10', [{ t: '(v5) ', i: true }, { t: 'Contact & consent handling.', b: true }, { t: ' Respondent contact details are collected only on opt-in, minimized, encrypted, access-controlled, used solely for the follow-up the respondent consented to, and deletable on withdrawal (INV-13). Consent scope and lawful basis are tracked per contact (GDPR/CCPA).' }]));

// ---- 11 NFR ----
section('11', 'Non-functional requirements', 'Speed, reliability, access, and honesty — stated as testable budgets.');
[
  ['NFR-1', 'Performance — a survey page loads under 2 s on mobile; a submission acknowledges under 1 s.'],
  ['NFR-2', 'Analysis latency — up to the MVP size (~5,000 items, Q-6) returns within a stated budget; larger sets run as background jobs with progress.'],
  ['NFR-3', 'Availability — the collection endpoint targets a stated uptime; ingestion is durable even if analysis is degraded.'],
  ['NFR-4', 'Accessibility — respondent-facing surveys meet WCAG 2.1 AA.'],
  ['NFR-5', 'Scalability path — grows from SMB volumes toward larger sets without a rewrite.'],
  ['NFR-6', 'Explainability — every AI output carries the data behind it and a confidence signal, including inferred Brand Love and Trust reads.'],
  ['NFR-7', 'Collection freshness & politeness — collected data shows a freshness/coverage indicator; collection runs at a polite, configurable rate and records gaps.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 12 DATA MODEL ----
section('12', 'Data model (logical)', 'The records the system keeps and how they relate. Physical schema is an Architecture-phase decision; this defines what is stored, not how.');
body([{ t: 'Every record is scoped to an ', }, { t: 'Account', b: true }, { t: ' (tenant) for isolation (INV-6).' }]);
function entity(name, desc, rows) {
  children.push(new Paragraph({ spacing: { before: 220, after: 40 }, children: [
    new TextRun({ text: name, font: BODY, bold: true, size: 22, color: INK }),
    new TextRun({ text: '  — ' + desc, font: BODY, italics: true, size: 20, color: SLATE }) ] }));
  children.push(table2(['Field', 'Meaning'], rows, [2700, 6660], { monoCol0: true }));
}
entity('Brand', 'a company or competitor whose feedback is analyzed', [
  ['brand_id', 'Unique id'],
  ['name / aliases', 'Display name and alternates used to match reviews'],
  ['type', 'own or competitor'],
  ['products', 'Optional product / line names'],
  ['tracked', 'Whether active collection is enabled'],
]);
entity('Source', 'where a piece of feedback came from', [
  ['source_id', 'Unique id'],
  ['type', 'survey · conversational · import_csv · web · api · provider'],
  ['name / url', 'Human name and, for web/API, the location'],
  ['terms_note', 'Compliance note / permitted-use flag (DPS-7)'],
]);
entity('FeedbackRecord', 'the core record — one rating and/or comment about one brand', [
  ['record_id', 'Unique id'],
  ['account_id', 'Owning tenant (INV-6)'],
  ['brand_id', 'Which brand this is about — own or competitor (INV-1)'],
  ['source_id', 'Where it came from (INV-1)'],
  ['captured_at / date', 'When the feedback was given or collected'],
  ['rating_raw / rating_scale', 'Original rating and its scale (5_star, 10_pt, nps, csat, brand_love, trust, …)'],
  ['rating_norm', 'Rating normalized to a common 1–5 ordinal (E-15)'],
  ['brand_love', 'Love / Like / Ambivalence / Dislike / Hate, if applicable — ordinal 5→1'],
  ['trust  (v3)', 'Trust rating if directly asked — normalized 1–5'],
  ['trust_drivers  (v3)', 'Optional per-driver scores/tags: reliability, integrity, benevolence, security_privacy'],
  ['comment_text', 'The open-text comment'],
  ['language', 'Detected language (E-4)'],
  ['segment / region / channel', 'Optional non-identifying metadata (I-5)'],
  ['is_complete', 'Complete vs. partial (R-6)'],
  ['flags', 'junk · abuse · safety · low_confidence (E-3, E-13)'],
  ['provenance', 'source_url + capture_date, or import_batch (INV-10)'],
]);
entity('Sentiment', 'derived, one per record', [
  ['record_id', 'The record it describes'],
  ['polarity / intensity', 'positive / neutral / negative, with strength'],
  ['model_version / confidence', 'What produced it and how sure (NFR-6)'],
]);
entity('Trust  (v3)', 'derived, one per record where trust is present or inferred', [
  ['record_id', 'The record it describes'],
  ['trust_score', 'Normalized trust value'],
  ['drivers', 'reliability / integrity / benevolence / security_privacy sub-scores'],
  ['model_version / confidence', 'What produced it and how sure (NFR-6)'],
  ['inferred', 'True if derived from open text rather than a direct rating (INV-4)'],
]);
children.push(body([{ t: 'Contact (v5)', b: true }, { t: ' — an opt-in contact for a respondent (INV-13): contact_id, respondent_ref, channel/value (email), consent_scope, consent_at, withdrawn_at; kept separate and under DPS-10.' }]));
children.push(body([{ t: 'Trigger / Rule (v5)', b: true }, { t: ' — signal → action: rule_id, condition (brand_love ≤ Dislike, trust_index < x, quadrant = At-risk, rating < floor), action (open case, route to connector/owner), enabled.' }]));
entity('RecoveryCase  (v5)', 'the internally-owned loop record (design-for-#3)', [
  ['case_id', 'Unique id'],
  ['account_id', 'Owning tenant (INV-6)'],
  ['record_ids', 'The feedback that opened / relates to the case'],
  ['contact_id', 'Linked opt-in contact, if any (INV-13)'],
  ['owner', 'Assigned owner / queue'],
  ['status', 'open · in_progress · resolved · closed'],
  ['external_ref', 'The linked item in the company’s helpdesk/CRM, if integrated (R-37)'],
  ['opened_at / resolved_at', 'Timestamps → time-to-resolve (O-15)'],
  ['recovery_delta', 'Change in Brand Love / Trust before vs. after resolution (O-15)'],
  ['resolution_notes', 'What was done'],
]);
children.push(body([{ t: 'Connector (v5)', b: true }, { t: ' — an integration to an external tool: connector_id, type (helpdesk / CRM / email), config / credentials-ref (secrets kept out of the model — DPS-6), scope.' }]));
entity('MetricSnapshot', 'a computed rollup for a brand over a period and filter (O-4, O-9, O-11, O-12, O-15)', [
  ['brand_id / period', 'Brand and time window'],
  ['metric', 'avg_rating · nps · csat · brand_love_index · trust_index (v3) · trust_<driver> (v3) · recovery_rate (v5) · avg_time_to_resolve (v5) · neg_sentiment_share · response_rate · completion_rate'],
  ['value / filter_context', 'The number and the filter it was computed under (INV-2)'],
]);
children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(calloutBox('Love × Trust segment (v3)  &  the "unified customer" view', [
  'Love × Trust segment — computed from the Brand Love and Trust metrics for a brand/segment; each respondent or segment falls in one quadrant (Devoted / Infatuated / Dependable / At-risk) with counts and shares (O-13).',
  'Unified customer view — there is deliberately NO individual-Customer entity. It aggregates FeedbackRecords for an own brand across all sources and time, grouped by Segment — a population read, not a person read (R-26, INV-9).',
  'Closed loop (v5) — the RecoveryCase, its status lifecycle, and its recovery measurement live in AAA Insights’ own data model even when the workflow runs in an external tool; that is what makes native workflow (#3) an additive evolution, not a rewrite.',
]));

// ---- 13 ROADMAP ----
section('13', 'Scope & phased roadmap', 'Only Phase 0 is committed by this document. Each later phase re-enters the pipeline before it is built.');
children.push(calloutBox('Phase 0 — MVP (the focused, buildable core)', [
  '• Survey builder: core types + Brand Love scale + Trust battery + conditional logic (R-1, R-3, R-30, R-31)  •  AI-drafted survey (R-2)',
  '• Distribution by link + widget (R-4)  •  Mobile, account-free capture incl. partials (R-5, R-6)',
  '• Conversational AI survey with scope control + turn limits (R-7–R-10)  •  CSV import into the unified hub (R-11, R-13)',
  '• Unified cross-source analysis + aggregate unified-customer view (R-12, R-26)',
  '• AI theme + sentiment + Brand Love + Trust with traceability (R-14–R-16, R-30, R-32)',
  '• Core metrics incl. NPS/CSAT + Brand Love Index + Trust Index (R-19, O-11, O-12)',
  '• Love × Trust segmentation with recommended actions (R-33, O-13)',
  '• Insight report with ranked actions (R-18, R-22)  •  Two roles, account isolation, data export/delete (R-21, R-23)',
  '• Closed-loop (starter): detect + prioritize dissatisfaction, open RecoveryCases, opt-in follow-up contact (R-34–R-36, R-40) — architected for the full loop and #3.',
]));
children.push(new Paragraph({ spacing: { after: 60 } }));
children.push(calloutBox('MVP note on Trust depth', [
  'The MVP can ship with a single-item trust rating plus inferred trust from open text; the full multi-item driver battery (reliability/integrity/benevolence/security) can be a fast-follow if it risks the MVP timeline. See D-14.',
]));
children.push(new Paragraph({ spacing: { after: 60 } }));
function phase(title, lines) { children.push(subhead(title)); lines.forEach(l => children.push(bullet('', l))); }
phase('Phase 1 — Competitive insight & distribution', [
  'Competitor configuration and benchmarking (own vs competitors) on ratings, Brand Love, Trust, sentiment, themes (R-24, R-27, O-9) — CSV / licensed-provider / API sources first.',
  'Live web collection (R-25, DPS-7) — enabled only after the client’s legal review and sign-off.',
  'Per-competitor deep-dive (R-28, O-10).',
  'Natural-language "ask your data" query (R-17, O-6); email distribution (R-4 email); alerts (R-20); slides export.',
  'Full closed loop (#2): integrations / hand-off to helpdesk / CRM / email (R-37), recovery measurement (R-38, O-15), and reinforcement plays for satisfied customers (R-39).',
]);
phase('Phase 2 — Connectors, scale & native workflow horizon', [
  'Additional sanctioned connectors; larger-volume background processing (NFR-5); multi-language expansion (D-4); team collaboration.',
  'Native closed-loop workbench (posture #3) — agent queues, SLAs, and macros brought in-house, reusing the RecoveryCase, triggers, connectors, consent, and recovery metrics built for #2. Pursued when demand from #2 justifies it (a real decision, made from evidence — it changes the buyer and the pricing).',
]);
phase('Phase 3 — Advanced insight', [
  'Driver analysis — what most influences Brand Love and Trust; the love-type distinction (passion vs. intimacy/loyalty, per Nobre 2011) and a resilience measure (does sentiment/repurchase hold after a negative event); benchmarking vs prior periods and optional, opt-in, anonymized peer norms; a research assistant that proposes surveys from the gaps it finds.',
]);

// ---- 14 DECISIONS ----
section('14', 'Decisions (resolved in v4)', 'All fifteen prior open questions are now decided (client direction, 2026-07-27). Two items remain pending but non-blocking.');
children.push(table2(['#', 'Decision', 'Resolution'], [
  ['D-1', 'Product name', 'Keep "AAA Insights" as the working title (note overlap with the existing Active Pulse sentiment monitor; revisit branding later).'],
  ['D-2', 'Build vs. buy survey engine', 'Build survey collection natively — full control of the survey, conversational, and data experience.'],
  ['D-3', 'AI models / hosting', 'Provider-abstracted: best-available models, US data residency available, no lock-in; account data never trains shared models (DPS-9).'],
  ['D-4', 'Language coverage', 'English-only MVP; multilingual analysis in Phase 2 (E-4).'],
  ['D-5', 'Compliance targets', 'GDPR + CCPA for v1; SOC 2 on the roadmap (DPS-8).'],
  ['D-6', 'MVP volume', '~5,000 responses handled comfortably (NFR-2).'],
  ['D-7', 'Commercial model', 'Hybrid: tiered subscription + usage (see note below).'],
  ['D-8', 'First design partner', 'None yet — build a generic MVP; find a partner in parallel (pending).'],
  ['D-9', 'Brand Love framework & label', 'Grounded in Batra/Ahuvia/Bagozzi (2012). Middle label = "Ambivalence" (changed from "Ambiguity"). Scale: Love / Like / Ambivalence / Dislike / Hate.'],
  ['D-10', 'Competitors & sources', 'Generic & configurable — each account sets its own competitors and sources; no presets.'],
  ['D-11', 'Collection method & legal sign-off', 'CSV import first (MVP); APIs/licensed feeds in Phase 1; live web collection only after the client’s legal sign-off (DPS-7). Sign-off owner (pending).'],
  ['D-12', 'Normalization & Love Index', 'Common 1–5 scale; Brand Love Index = %(Love+Like) − %(Dislike+Hate).'],
  ['D-13', 'Collected-data retention', 'Per-account configurable, 24-month default (DPS-5).'],
  ['D-14', 'Trust depth for v1', 'Single-item trust + inferred trust in the MVP; driver battery is a fast-follow.'],
  ['D-15', 'Trust drivers & Trust Index', 'Drivers: reliability, integrity, benevolence, security/privacy; Trust Index = %positive-trust − %negative-trust.'],
  ['D-16', 'Closed-loop / service recovery (v5)', 'Adopt the Closed-Loop pillar as posture #2 (orchestrate + measure), architected for #3 (native workflow) as a later horizon. MVP: detect + prioritize detractors + opt-in follow-up; full loop + recovery measurement in Phase 1.'],
], [900, 2500, 5960]));
children.push(subhead('Commercial model note (D-7)'));
children.push(body('A hybrid built for SMB/mid-market — tiered subscription plans (e.g. Starter / Growth / Pro) bundling a monthly response/analysis allowance, with usage-based overage and a competitor-tracking add-on. Fuller pricing is a go-to-market decision to firm up alongside the first design partner; the spec only assumes the account/billing hooks in R-21.'));
children.push(subhead('Still pending (non-blocking)'));
children.push(body('A named first design partner (D-8) and the named legal sign-off owner for web collection (D-11). Neither blocks approval or the MVP build; both are needed before their respective Phase-1 features go live.'));

// ---- APPROVAL ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(eyebrow('Approval'));
children.push(shortRule());
children.push(h1('The Phase-1 gate'));
body('v5 adds the Closed-Loop / Service Recovery pillar and is ready for your approval. On approval we proceed to CHALLENGE (Phase 2) — an adversarial review that stress-tests this specification (competitive collection, the data model, the Love/Trust pair, and now the recovery loop and opt-in contact widen the attack surface) — and fold the results into Requirements v6.');
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
  numbering: { config: [ {
    reference: 'aaa-bullets',
    levels: [
      { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT, style: { run: { color: SIGNAL, font: BODY }, paragraph: { indent: { left: 360, hanging: 220 } } } },
      { level: 1, format: 'bullet', text: '–', alignment: AlignmentType.LEFT, style: { run: { color: SLATE, font: BODY }, paragraph: { indent: { left: 720, hanging: 220 } } } },
    ],
  } ] },
  styles: { default: {
    document: { run: { font: BODY, size: 21, color: INK } },
    heading1: { run: { font: DISPLAY, bold: true, size: 40, color: INK } },
    heading2: { run: { font: BODY, bold: true, size: 26, color: INK } },
  } },
  sections: [ { properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children } ],
});
Packer.toBuffer(doc).then(buf => { fs.writeFileSync('/home/claude/aaa-insights/AAA_Insights_PRD.docx', buf); console.log('WROTE', buf.length, 'bytes'); });
