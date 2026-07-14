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

// ================= CONTENT =================
const children = [];

// ---- COVER ----
children.push(new Paragraph({ spacing: { before: 300, after: 260 }, children: [ new ImageRun({ type: 'png', data: logo, transformation: { width: 74, height: 74 } }) ] }));
children.push(new Paragraph({ spacing: { after: 60 }, children: [ new TextRun({ text: 'PRODUCT REQUIREMENTS DOCUMENT', font: BODY, bold: true, size: 18, color: SLATE, characterSpacing: 50 }) ] }));
children.push(shortRule());
children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [ new TextRun({ text: 'AAA Insights', font: DISPLAY, bold: true, size: 68, color: INK }) ] }));
children.push(new Paragraph({ spacing: { after: 300 }, children: [ new TextRun({ text: 'Collect surveys, reviews, ratings, and comments — then let AI turn them into customer and competitive insight.', font: DISPLAY, italics: true, size: 27, color: SLATE }) ] }));
const meta = [
  ['Version', 'v2 — Draft (revised per client input)'],
  ['Date', '2026-07-13'],
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

// ---- v2 changes callout ----
children.push(eyebrow('What changed in v2'));
children.push(shortRule());
children.push(calloutBox('Revised 2026-07-13 per client direction', [
  '• Aggregate "unified customer" view across all feedback sources — identity stays optional (population, not person).',
  '• Competitors as first-class brands — aggregate benchmarking and per-competitor deep-dives.',
  '• Feedback collection from public web / review APIs / licensed providers / CSV, under compliance guardrails + a legal-review gate.',
  '• Brand Love scale (Love / Like / Ambiguity / Dislike / Hate) as a question type, a normalized metric, and a benchmark lens.',
  '• A new explicit data model (Section 12).',
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
  ['12', 'Data model (logical)'], ['13', 'Scope & phased roadmap'], ['14', 'Open questions'], ['—', 'Approval'],
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
body('AAA Insights lets a company collect feedback from its customers and consumers — surveys, reviews, ratings, and open comments — unify it in one place, and analyze it with AI to produce plain-language insight the business can act on. It extends this to a competitive view: the same collection and analysis run against the company’s tracked competitors, so a company sees not only what its own customers think, but how its brand compares.');
body('It closes the gap most SMB / mid-market companies live with today: they have customer feedback, scattered across tools, review sites, and inboxes, but lack the research team to turn it into decisions. AAA Insights applies AI research techniques — theme and sentiment analysis, adaptive conversational interviewing, brand-love measurement, and automated synthesis — so a company without a dedicated insights function can understand what its customers, and its competitors’ customers, think, why, and what to do about it.');
body([{ t: 'Not "another survey tool." ', b: true }, { t: 'Survey creation is the on-ramp; the value is what happens after feedback arrives — themes and sentiment, conversational probing, a unified hub, competitive benchmarking, and insight with recommended actions.' }]);

// ---- 2 USERS ----
section('02', 'Target users & buyer', 'Two audiences, one product: credible analysis for the business, effortless response for the customer.');
body([{ t: 'Primary market: ', b: true }, { t: 'SMB / mid-market companies (~10–500 employees) that want to understand customers but have no in-house research team.' }]);
children.push(table2(['User role', 'What they need from AAA Insights'], [
  ['Owner / founder / GM (buyer)', 'A fast, trustworthy read on what customers think, how the brand compares to rivals, and what to fix first.'],
  ['Marketing / brand lead', 'Themes, sentiment, brand-love, quotes, and competitive position to guide messaging and positioning.'],
  ['CX / customer-success manager', 'Early warning on dissatisfaction, drivers of churn, and a way to close the loop with unhappy customers.'],
  ['Product manager', 'Prioritized signal on what customers want changed, backed by evidence and volume.'],
  ['Respondent (the customer)', 'A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard.'],
], [3000, 6360]));

// ---- 3 PRINCIPLES ----
section('03', 'Product principles', 'Six commitments that shape every design decision.');
bullet('1', [{ t: 'Insight over dashboards. ', b: true }, { t: 'A plain-language answer to "what should I know and do," not a wall of charts.' }]);
bullet('2', [{ t: 'Every insight is traceable. ', b: true }, { t: 'No theme, sentiment, brand-love read, or recommendation appears without a path to its verbatim responses.' }]);
bullet('3', [{ t: 'Respect the respondent. ', b: true }, { t: 'Surveys are short, mobile-first, accessible, and privacy-respecting.' }]);
bullet('4', [{ t: 'Trustworthy AI. ', b: true }, { t: 'AI output carries its confidence and source data; it never fabricates, and it separates what was said from what was inferred.' }]);
bullet('5', [{ t: 'Lawful by construction. ', b: true }, { t: 'Externally collected data — including competitor data — is publicly available and lawfully obtained, with provenance on every item. Compliance is a design property (see §10).' }]);
bullet('6', [{ t: 'Start simple, grow deliberately. ', b: true }, { t: 'The MVP is a tight, buildable core; every later capability is added against this same discipline.' }]);

// ---- 4 INPUTS ----
section('04', 'Inputs', 'What the system receives.');
[
  ['I-1', 'Survey definition — built by an admin or AI-generated from a goal. Question types include the Brand Love scale (Love / Like / Ambiguity / Dislike / Hate).'],
  ['I-2', 'Survey response — ratings (incl. Brand Love), multiple-choice, and open-text comments. May be partial.'],
  ['I-3', 'Conversational response — free-text turns in an AI-led adaptive interview, as a threaded transcript.'],
  ['I-4', 'Imported feedback — external reviews/ratings/comments for the company’s own brand via CSV (source, timestamp, rating, text).'],
  ['I-5', 'Respondent metadata — optional, non-identifying attributes (segment, channel, product, region, language).'],
  ['I-6', 'Distribution request — publish a survey via link, email list, or widget.'],
  ['I-7', 'Analysis query — a natural-language question asked of the feedback data.'],
  ['I-8', 'Competitor configuration — the set of competitor brands to track: names, aliases, products, and the public sources where their reviews live.'],
  ['I-9', 'Externally-collected feedback — reviews/ratings/comments about the own brand and tracked competitors, from public web pages, review-site APIs, or a licensed provider. Each item carries source URL, capture date, brand, rating, text.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 5 OUTPUTS ----
section('05', 'Outputs', 'What the system produces.');
[
  ['O-1', 'Collected response store — every response (survey, conversational, imported, web-collected) persisted under a common schema, attributable to source, brand, and campaign.'],
  ['O-2', 'Theme analysis — AI-generated themes with counts, representative quotes, and trend vs. prior period. Filterable by brand.'],
  ['O-3', 'Sentiment analysis — positive / neutral / negative with intensity, per response and aggregated by theme, segment, source, brand, and time.'],
  ['O-4', 'Ratings & metrics — average ratings, distribution, response/completion rates, and NPS/CSAT where questions qualify.'],
  ['O-5', 'Insight report — a plain-language narrative of what’s happening, why, and what to do, with ranked actions; can include the competitive picture. Exportable.'],
  ['O-6', 'Answer to an analysis query — grounded strictly in the account’s own data, citing the responses used.'],
  ['O-7', 'Alerts — notifications when a monitored signal crosses a threshold.'],
  ['O-8', 'Respondent-facing survey — the rendered survey or conversational interview.'],
  ['O-9', 'Competitive benchmark — the company’s brand vs. competitors on ratings, Brand Love, sentiment, and themes over a chosen period.'],
  ['O-10', 'Per-competitor analysis — for a selected competitor, an aggregate view of its customers’ themes, sentiment, ratings, and Brand Love, traceable to underlying public reviews.'],
  ['O-11', 'Brand Love read — the distribution across Love / Like / Ambiguity / Dislike / Hate and a Brand Love Index (share of Love+Like minus share of Dislike+Hate), for the company and per competitor, over time.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 6 REQUIREMENTS ----
section('06', 'Requirements (behaviors)', 'Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.');
function reqGroup(title, items) { children.push(subhead(title)); items.forEach(([id, t]) => children.push(bullet(id, t))); }
reqGroup('Survey creation & distribution', [
  ['R-1', 'Create a survey with at least: single-select, multi-select, rating/scale, open text, and the Brand Love scale (Love / Like / Ambiguity / Dislike / Hate).'],
  ['R-2', 'Generate a draft survey from a plain-language objective; editable before sending.'],
  ['R-3', 'Conditional logic: a question or branch is shown or skipped based on a previous answer.'],
  ['R-4', 'Distribute by (a) link, (b) email list, and (c) embeddable widget. (Email is Phase-1; link + widget are MVP.)'],
  ['R-5', 'A respondent completes a survey on mobile and desktop without creating an account.'],
  ['R-6', 'Partial responses are recorded and marked incomplete, not discarded.'],
]);
reqGroup('Conversational (AI-led) surveys', [
  ['R-7', 'Enable a conversational mode where an AI interviewer asks questions and relevant follow-up probes in natural language.'],
  ['R-8', 'The interviewer stays on the admin-defined objective and does not ask outside the topic scope.'],
  ['R-9', 'The interviewer ends after a configurable max number of exchanges or when the objective is met.'],
  ['R-10', 'Every transcript is stored and analyzable by the same engine as structured responses.'],
]);
reqGroup('Unified feedback hub', [
  ['R-11', 'Import external feedback via CSV, mapping columns to the unified schema (brand, source, date, rating, text, segment).'],
  ['R-12', 'All feedback — survey, conversational, imported, web-collected — is queryable together, filterable by brand, source, campaign, date, segment, rating, sentiment.'],
  ['R-13', 'De-duplicate obviously identical items (same source + text + timestamp).'],
]);
reqGroup('Brand Love & metrics', [
  ['R-14', 'Produce theme analysis with counts and representative quotes for any filtered set.'],
  ['R-15', 'Assign sentiment to each open-text response and aggregate across chosen dimensions.'],
  ['R-16', 'For every theme, sentiment aggregate, and Brand Love read, open the exact underlying responses (traceability — INV-3).'],
  ['R-30', 'Record Brand Love on the five-point scale, normalize to an ordinal, and compute the Brand Love distribution and Index (O-11) — including inferring a Brand Love read from open text where no direct rating exists, clearly labeled as inferred (INV-4).'],
]);
reqGroup('Unified customer & competitive insight', [
  ['R-26', 'Produce an aggregate, cross-source "unified customer" view of the account’s customer base — one combined read across all sources and time — WITHOUT building or requiring an identity-linked individual profile (INV-9).'],
  ['R-24', 'Define and manage a set of competitor brands to track (I-8).'],
  ['R-25', 'Collect publicly available reviews/ratings/comments about the own brand and tracked competitors from configured sources (review APIs, licensed provider, and/or public web) — subject to §10 (DPS-7) and a legal-review gate before live collection is enabled.'],
  ['R-27', 'Benchmark the company’s brand vs. competitors on ratings, Brand Love, sentiment, and themes over a chosen period (O-9).'],
  ['R-28', 'For a selected competitor, produce per-competitor aggregate analysis (O-10) traceable to underlying public reviews.'],
  ['R-29', 'All brand/competitor analysis is filterable by brand, source, date, segment, and sentiment, and every competitor figure links to its source items.'],
]);
reqGroup('AI analysis, accounts, roles, export', [
  ['R-17', 'Ask a natural-language question and receive an answer grounded only in the account’s own data, with citations.'],
  ['R-18', 'Generate an insight report: narrative, metrics, top themes, sentiment, Brand Love, competitive comparison, quotes, ranked actions.'],
  ['R-19', 'Compute response rate, completion rate, average rating, rating distribution, and NPS/CSAT when questions qualify.'],
  ['R-20', 'Configure an alert on a signal (negative-sentiment share, average rating, Brand Love Index, new theme) with notification when crossed.'],
  ['R-21', 'At least two roles: Owner/Admin (account, users, billing) and Member (builds surveys, views analysis).'],
  ['R-22', 'Export any analysis view and the insight report (CSV for raw data; PDF and/or slides for the report).'],
  ['R-23', 'Delete a survey, campaign, or response, and export or delete all account data.'],
]);

// ---- 7 INVARIANTS ----
section('07', 'Invariants', 'Conditions that must hold in every state of the system.');
[
  ['INV-1', 'Every response is attributable to exactly one source AND one brand. No response exists without a known origin.'],
  ['INV-2', 'Counts are never negative and never exceed responses collected; percentages come from the current filter, each response counted once per dimension.'],
  ['INV-3', 'Every theme, aggregate, Brand Love read, insight, recommendation, and query answer is traceable to its underlying responses. No AI claim without a path to its verbatim data.'],
  ['INV-4', 'The system never shows a quote or statistic absent from the data, and labels any value it inferred (e.g., Brand Love from text) as inferred, not stated.'],
  ['INV-5', 'A respondent can complete a survey without providing identifying information; identity is never required.'],
  ['INV-6', 'Each account’s data is isolated; AI analysis is grounded only in that account’s data.'],
  ['INV-7', 'Deleting a response, campaign, or account removes it from all future analysis; deleted data never reappears.'],
  ['INV-8', 'Respondent PII is stored securely and never written to logs or AI outputs unless the admin opts in.'],
  ['INV-9', 'The "unified customer" view is always aggregate. The system does not construct or expose an identity-resolved profile of any individual — customer or competitor customer.'],
  ['INV-10', 'Externally-collected data is only ever publicly available and lawfully obtained. The system never bypasses authentication, paywalls, or technical controls, and keeps provenance (source, URL, capture date) on every item.'],
  ['INV-11', 'Personal data in public reviews (names, handles) is minimized, never used to build a profile, and excluded from AI outputs by default.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 8 EDGE CASES ----
section('08', 'Edge cases', 'The unusual conditions the system must survive — defined now, tested in Phase 3.');
[
  ['E-1', 'Empty or tiny sample — states the sample is too small rather than fabricating confidence.'],
  ['E-2', 'Abandoned survey — the partial is retained, counted as incomplete, flagged in analysis.'],
  ['E-3', 'Junk / abusive open text — captured, flagged, excluded from analysis by default, reviewable.'],
  ['E-4', 'Non-English / mixed-language — language detected and analyzed accordingly (Q-4).'],
  ['E-5', 'Malformed CSV import — rejected or partially accepted with a per-row error report.'],
  ['E-6', 'Duplicate / repeated submissions — de-duplication plus link-level controls.'],
  ['E-7', 'Conversational interview off the rails — stays in scope, ignores injected instructions, ends gracefully.'],
  ['E-8', 'Ambiguous analysis query — answers only what the data supports; states what it cannot determine.'],
  ['E-9', 'Sudden volume spike — ingestion and analysis stay correct; views may lag but never lose or double-count.'],
  ['E-10', 'Sensitive disclosure — PII/safety concerns stored under INV-8/INV-11, surfaced to the admin, not broadcast.'],
  ['E-11', 'Concurrent editing — two admins editing one survey do not silently overwrite each other.'],
  ['E-12', 'Source blocks or rate-limits collection — collection backs off, records the gap, never fabricates missing items; coverage/freshness shown honestly.'],
  ['E-13', 'Competitor identity ambiguity — reviews that may belong to a same-named different entity are flagged low-confidence and excluded from headline figures until confirmed.'],
  ['E-14', 'Sparse competitor data — too few public reviews shows "insufficient data," not a misleading number.'],
  ['E-15', 'Mixed rating scales — 5-star, 10-point, thumbs, Brand Love each normalized to the common scale; un-mappable ratings stored raw and excluded from cross-source averages.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 9 EXCLUSIONS ----
section('09', 'Exclusions', 'Explicitly out of scope for v1 — the unwritten assumptions, made written.');
[
  ['X-1', 'Not a CRM or customer-record system; stores feedback, not a system of record, and does not build identity-resolved individual profiles.'],
  ['X-2', 'No two-way case management / ticketing; closing the loop in v1 is export/notification.'],
  ['X-3', 'Collection is limited to publicly available content obtained lawfully via APIs, licensed providers, or public web pages under the DPS-7 guardrails. The system does NOT access private/authenticated content, bypass logins or paywalls, circumvent technical protections, or collect data a source’s terms prohibit.'],
  ['X-4', 'No prediction of future business outcomes (churn, revenue) in v1.'],
  ['X-5', 'No public respondent panel / audience marketplace; the company brings its own audience.'],
  ['X-6', 'Does not replace human research judgment; it is decision support, with every AI output shown alongside its evidence.'],
  ['X-7', 'Does not attempt to re-identify individuals, link competitor reviewers to real people, or merge scraped personal data into any profile.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 10 DATA/PRIVACY ----
section('10', 'Data, privacy & security', 'The handling bar this product is held to — enforced in build and verification.');
[
  ['DPS-1', 'The system is a data processor for the account’s feedback; the company is the controller.'],
  ['DPS-2', 'Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, and excluded from logs and AI outputs by default.'],
  ['DPS-3', 'Data-subject requests are supported: export and deletion on request.'],
  ['DPS-4', 'AI processing is isolated to the account; account data is not used to train shared/base models without opt-in.'],
  ['DPS-5', 'A configurable retention period is supported for both first-party and collected data.'],
  ['DPS-6', 'The full security checklist (input validation, authz/authn, secret handling) is applied during build and verification.'],
].forEach(([id, t]) => children.push(bullet(id, t)));
children.push(subhead('DPS-7 — Web / data-collection compliance (v2)'));
children.push(calloutBox('Lawful and ethical by construction — with a legal-review gate', [
  'Collect only publicly accessible content. Respect robots.txt and reasonable rate limits.',
  'Never bypass authentication, paywalls, or technical protections. Prefer official APIs and licensed providers over page collection.',
  'Keep provenance (source, URL, capture date) on every item. Minimize and never profile personal data in reviews (INV-11). Honor source-specific terms.',
  'The specific sources and methods are subject to the client’s legal review and written sign-off BEFORE live collection is enabled — a gate, not a default.',
  'Active AI Advisors is not providing legal advice; the client should confirm the approach with counsel.',
]));

// ---- 11 NFR ----
section('11', 'Non-functional requirements', 'Speed, reliability, access, and honesty — stated as testable budgets.');
[
  ['NFR-1', 'Performance — a survey page loads under 2 s on mobile; a submission acknowledges under 1 s.'],
  ['NFR-2', 'Analysis latency — up to the MVP size (~5,000 items, Q-6) returns within a stated budget; larger sets run as background jobs with progress.'],
  ['NFR-3', 'Availability — the collection endpoint targets a stated uptime; ingestion is durable even if analysis is degraded.'],
  ['NFR-4', 'Accessibility — respondent-facing surveys meet WCAG 2.1 AA.'],
  ['NFR-5', 'Scalability path — grows from SMB volumes toward larger sets without a rewrite.'],
  ['NFR-6', 'Explainability — every AI output carries the data behind it and, where meaningful, a confidence signal.'],
  ['NFR-7', 'Collection freshness & politeness — collected data shows a freshness/coverage indicator; collection runs at a polite, configurable rate and records gaps rather than guessing.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 12 DATA MODEL ----
section('12', 'Data model (logical)', 'The records the system keeps and how they relate. Physical schema is an Architecture-phase decision; this defines what is stored, not how.');
body([{ t: 'Every record is scoped to an ', }, { t: 'Account', b: true }, { t: ' (tenant) for isolation (INV-6). IDs in the tables tie fields back to the requirements and invariants.' }]);
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
entity('FeedbackRecord', 'the core record — one rating and/or comment about one brand (the "database of brand ratings, date, comments")', [
  ['record_id', 'Unique id'],
  ['account_id', 'Owning tenant (INV-6)'],
  ['brand_id', 'Which brand this is about — own or competitor (INV-1)'],
  ['source_id', 'Where it came from (INV-1)'],
  ['captured_at / date', 'When the feedback was given or collected'],
  ['rating_raw / rating_scale', 'Original rating and its scale (5_star, 10_pt, nps, csat, brand_love, …)'],
  ['rating_norm', 'Rating normalized to a common 1–5 ordinal (E-15)'],
  ['brand_love', 'Love / Like / Ambiguity / Dislike / Hate, if applicable — ordinal 5→1'],
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
entity('Theme / ThemeAssignment', 'discovered topics and their links to records', [
  ['theme_id / label', 'The theme and its plain-language name'],
  ['scope', 'Account + optional brand / period it was derived in'],
  ['record_id → theme_id', 'Which records mention the theme, with confidence'],
]);
entity('MetricSnapshot', 'a computed rollup for a brand over a period and filter (O-4, O-9, O-11)', [
  ['brand_id / period', 'Brand and time window'],
  ['metric', 'avg_rating · nps · csat · brand_love_index · neg_sentiment_share · response_rate · completion_rate'],
  ['value / filter_context', 'The number and the filter it was computed under (INV-2)'],
]);
children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(body([{ t: 'Supporting records: ', b: true }, { t: 'Survey/Campaign (config, status, owning brand), Segment (the named filter the unified-customer view aggregates by), Alert (signal + threshold + brand scope), and Account/User/Role (tenancy and permissions).' }]));
children.push(calloutBox('On the "unified customer" view (R-26, INV-9)', [
  'There is deliberately NO individual-Customer entity holding a person’s identity across records.',
  'The unified view is produced by aggregating FeedbackRecords for an own brand across all sources and time, grouped by Segment — a population read, not a person read.',
]));

// ---- 13 ROADMAP ----
section('13', 'Scope & phased roadmap', 'Only Phase 0 is committed by this document. Each later phase re-enters the pipeline before it is built.');
children.push(calloutBox('Phase 0 — MVP (the focused, buildable core)', [
  '• Survey builder: core types + Brand Love scale + conditional logic (R-1, R-3, R-30)  •  AI-drafted survey (R-2)',
  '• Distribution by link + widget (R-4)  •  Mobile, account-free capture incl. partials (R-5, R-6)',
  '• Conversational AI survey with scope control + turn limits (R-7–R-10)  •  CSV import into the unified hub (R-11, R-13)',
  '• Unified cross-source analysis + aggregate unified-customer view (R-12, R-26)',
  '• AI theme + sentiment + Brand Love with traceability (R-14–R-16, R-30)',
  '• Core metrics incl. NPS/CSAT + Brand Love Index (R-19, O-11)  •  Insight report with ranked actions (R-18, R-22)',
  '• Two roles, account isolation, data export/delete (R-21, R-23, INV-6, INV-7)',
]));
children.push(new Paragraph({ spacing: { after: 60 } }));
function phase(title, lines) { children.push(subhead(title)); lines.forEach(l => children.push(bullet('', l))); }
phase('Phase 1 — Competitive insight & distribution', [
  'Competitor configuration and benchmarking (own vs competitors) on ratings, Brand Love, sentiment, themes (R-24, R-27, O-9) — CSV / licensed-provider / API sources first.',
  'Live web collection (R-25, DPS-7) — enabled only after the client’s legal review and sign-off; until then, competitor data flows through CSV/API/provider.',
  'Per-competitor deep-dive (R-28, O-10).',
  'Natural-language "ask your data" query with citations (R-17, O-6).',
  'Email distribution + reminders (R-4 email); configurable alerts (R-20); slides export.',
]);
children.push(calloutBox('Advisory note — scope & risk', [
  'Competitive intelligence and web collection are the biggest additions in v2 and materially expand the build.',
  'The MVP delivers the aggregate unified-customer view and the data model that holds competitor brands; standing up compliant collection (legal review, source integrations, matching/normalization, freshness) is Phase 1 so the MVP is not gated on it.',
  'This sequencing is a recommendation — say the word and we’ll re-weight.',
]));
phase('Phase 2 — Connectors & scale', [
  'Additional sanctioned connectors; larger-volume background processing (NFR-5); multi-language expansion (Q-4); team collaboration (shared workspaces, comments, saved views).',
]);
phase('Phase 3 — Advanced insight', [
  'Driver analysis (what most influences rating / Brand Love); benchmarking against prior periods and optional, opt-in, anonymized peer norms; a research assistant that proposes surveys from the gaps it finds.',
]);

// ---- 14 OPEN QUESTIONS ----
section('14', 'Open questions', 'Decisions we need from you before proceeding to CHALLENGE (Phase 2).');
[
  ['Q-1', 'Product name — is "AAA Insights" the intended name or a working title?'],
  ['Q-2', 'Build vs. buy the survey engine — build collection natively, or wrap an existing component and focus the build on the AI/analysis layer?'],
  ['Q-3', 'AI models / hosting — any constraints on model provider or data residency?'],
  ['Q-4', 'Language coverage for v1 — English-only, or which additional languages at launch?'],
  ['Q-5', 'Compliance targets — which regimes must v1 satisfy (GDPR, CCPA, SOC 2 roadmap)?'],
  ['Q-6', 'MVP volume target — what item volume must the MVP handle comfortably?'],
  ['Q-7', 'Commercial model — per-seat, per-response, per-survey, per-competitor, or tiered?'],
  ['Q-8', 'First design partner — a specific first customer/segment to anchor the MVP?'],
  ['Q-9', 'Brand-love framework — resolved: Brand Love is a first-class scale and lens. Remaining: ground it in a published framework (e.g., Ahuvia) for the inferred-from-text read and Index formula? Is "Ambiguity" the final middle label (vs. "Ambivalence"/"Neutral")?'],
  ['Q-10', 'Competitors & sources — which competitors to track first, and which review sources (sites/APIs/providers) matter most in your market?'],
  ['Q-11', 'Collection method & legal sign-off — confirm the API / licensed-provider / public-web mix, and who provides the legal review that gates live web collection (DPS-7). Recommendation: start on APIs/licensed data; add public-web after counsel sign-off.'],
  ['Q-12', 'Rating normalization — confirm the common scale (proposed 1–5) and the Brand Love Index formula (proposed: %(Love+Like) − %(Dislike+Hate)).'],
  ['Q-13', 'Collected-data retention — how long should collected competitor/web data be retained?'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- APPROVAL ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(eyebrow('Approval'));
children.push(shortRule());
children.push(h1('The Phase-1 gate'));
body('On your approval, we proceed to CHALLENGE (Phase 2) — an adversarial review that stress-tests this specification (v2 now carries competitive collection and a data model, which widen the attack surface) — and fold the results, plus your answers to Section 14, into Requirements v3.');
children.push(new Paragraph({ spacing: { before: 260, after: 0 }, children: [
  new TextRun({ text: 'Approved by ', font: BODY, size: 21, color: INK }),
  new TextRun({ text: '______________________________', font: BODY, size: 21, color: SLATE }),
  new TextRun({ text: '     Date ', font: BODY, size: 21, color: INK }),
  new TextRun({ text: '____________________', font: BODY, size: 21, color: SLATE }) ] }));
children.push(new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: MIST, space: 6 } }, children: [
  new TextRun({ text: 'Prepared by Active AI Advisors under the Grounded AI™ methodology. Every phase produces an artifact you own.', font: BODY, italics: true, size: 18, color: SLATE }) ] }));
children.push(new Paragraph({ spacing: { before: 60 }, children: [
  new TextRun({ text: 'Active AI Advisors · paul@activeaiadvisors.com', font: BODY, size: 18, color: SLATE }) ] }));

// ================= DOCUMENT =================
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
