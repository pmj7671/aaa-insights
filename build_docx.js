const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ImageRun,
  PositionalTab, PositionalTabAlignment, PositionalTabLeader
} = require('docx');

// ---- Brand tokens ----
const INK = '1A1D21', PAPER = 'F4F1EA', SIGNAL = 'D9763A', SLATE = '6B6F76', MIST = 'E5E2DA';
const DISPLAY = 'Fraunces', BODY = 'Inter', MONO = 'JetBrains Mono';
const CONTENT_W = 9360; // usable width within 1" margins on Letter (12240 - 2*1440)
const logo = fs.readFileSync('/root/.claude/skills/aaa-brand-guidelines/AAA_Mark_640.png');

// ---- helpers ----
const NONE = { style: BorderStyle.NONE, size: 0, color: 'auto' };

function eyebrow(text) {
  return new Paragraph({
    spacing: { before: 360, after: 80 },
    children: [new TextRun({ text: text.toUpperCase(), font: BODY, bold: true, size: 17, color: SLATE, characterSpacing: 40 })],
  });
}
// short ink rule (~40px) as a paragraph bottom border with heavy right indent
function shortRule() {
  return new Paragraph({
    indent: { right: CONTENT_W - 620 },
    spacing: { after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 1 } },
    children: [new TextRun({ text: '', size: 2 })],
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 120, after: 160 },
    children: [new TextRun({ text, font: DISPLAY, bold: true, size: 40, color: INK })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text, font: BODY, bold: true, size: 26, color: INK })],
  });
}
function lead(text) {
  return new Paragraph({
    spacing: { before: 60, after: 200 },
    children: [new TextRun({ text, font: DISPLAY, italics: true, size: 26, color: SLATE })],
  });
}
// body paragraph; segs = array of {t, b(old), i(talic), mono, color}
function body(segs, opts = {}) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  return new Paragraph({
    spacing: { after: opts.after ?? 140, line: 300 },
    alignment: opts.align,
    children: arr.map(s => new TextRun({
      text: s.t, font: s.mono ? MONO : BODY, bold: s.b, italics: s.i,
      size: s.size ?? 21, color: s.color ?? INK,
    })),
  });
}
// bullet with a leading bold ID in Signal, then body text (mixed runs supported)
function bullet(id, segs, level = 0) {
  const arr = (typeof segs === 'string') ? [{ t: segs }] : segs;
  const kids = [];
  if (id) kids.push(new TextRun({ text: id + '  ', font: MONO, bold: true, size: 20, color: SIGNAL }));
  arr.forEach(s => kids.push(new TextRun({ text: s.t, font: BODY, bold: s.b, italics: s.i, size: 21, color: s.color ?? INK })));
  return new Paragraph({
    numbering: { reference: 'aaa-bullets', level },
    spacing: { after: 90, line: 288 },
    children: kids,
  });
}
function calloutBox(title, lines) {
  const kids = [ new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, font: BODY, bold: true, size: 20, color: INK })] }) ];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 40, line: 276 }, children: [new TextRun({ text: l, font: BODY, size: 20, color: INK })] })));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    borders: { top: NONE, bottom: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE,
      left: { style: BorderStyle.SINGLE, size: 24, color: SIGNAL } },
    rows: [ new TableRow({ children: [ new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: MIST, color: 'auto' },
      margins: { top: 160, bottom: 160, left: 220, right: 220 },
      children: kids }) ] }) ],
  });
}
// two-column table with header; rows = [[c1,c2],...]; widths sum to CONTENT_W
function table2(headers, rows, widths) {
  const cell = (text, { header, w, mono } = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: header ? { type: ShadingType.CLEAR, fill: MIST, color: 'auto' } : undefined,
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: [
      new TextRun({ text, font: mono ? MONO : BODY, bold: header, size: header ? 19 : 20, color: INK }) ] })],
  });
  const border = (c, sz) => ({ style: BorderStyle.SINGLE, size: sz, color: c });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths,
    borders: {
      top: border(INK, 12), bottom: border(INK, 12),
      left: NONE, right: NONE, insideVertical: NONE,
      insideHorizontal: border(MIST, 8),
    },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { header: true, w: widths[i] })) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i], mono: i === 0 && c.length <= 6 })) })),
    ],
  });
}

// ================= CONTENT =================
const children = [];

// ---- COVER ----
children.push(new Paragraph({ spacing: { before: 300, after: 260 }, children: [
  new ImageRun({ type: 'png', data: logo, transformation: { width: 74, height: 74 } }) ] }));
children.push(new Paragraph({ spacing: { after: 60 }, children: [
  new TextRun({ text: 'PRODUCT REQUIREMENTS DOCUMENT', font: BODY, bold: true, size: 18, color: SLATE, characterSpacing: 50 }) ] }));
children.push(shortRule());
children.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [
  new TextRun({ text: 'AAA Insights', font: DISPLAY, bold: true, size: 68, color: INK }) ] }));
children.push(new Paragraph({ spacing: { after: 300 }, children: [
  new TextRun({ text: 'A feedback-to-insight service: collect surveys, reviews, ratings, and comments — then let AI turn them into decisions.', font: DISPLAY, italics: true, size: 28, color: SLATE }) ] }));
// meta block in mono
const meta = [
  ['Version', 'v1 — Draft (awaiting client approval)'],
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

// ---- CONTENTS ----
children.push(eyebrow('Contents'));
children.push(shortRule());
const toc = [
  ['01', 'Purpose'], ['02', 'Target users & buyer'], ['03', 'Product principles'],
  ['04', 'Inputs'], ['05', 'Outputs'], ['06', 'Requirements (behaviors)'],
  ['07', 'Invariants'], ['08', 'Edge cases'], ['09', 'Exclusions'],
  ['10', 'Data, privacy & security'], ['11', 'Non-functional requirements'],
  ['12', 'Scope & phased roadmap'], ['13', 'Open questions'], ['—', 'Approval'],
];
toc.forEach(([n, t]) => children.push(new Paragraph({ spacing: { after: 70 }, children: [
  new TextRun({ text: n + '   ', font: MONO, bold: true, size: 20, color: SIGNAL }),
  new TextRun({ text: t, font: BODY, size: 22, color: INK }),
  new PositionalTab({ alignment: PositionalTabAlignment.RIGHT, leader: PositionalTabLeader.DOT, relativeTo: 'margin' }),
  new TextRun({ text: '', font: BODY, size: 20, color: SLATE }) ] })));
children.push(new Paragraph({ children: [new PageBreak()] }));

// helper to open a numbered section with masthead
function section(num, title, leadText) {
  children.push(eyebrow('Section ' + num));
  children.push(shortRule());
  children.push(h1(title));
  if (leadText) children.push(lead(leadText));
}

// ---- 1 PURPOSE ----
section('01', 'Purpose', 'What the software is for — and who it serves.');
body('AAA Insights is a software service that lets a company collect feedback from its customers and consumers — through surveys, reviews, ratings, and open comments — unify that feedback in one place, and analyze it with AI to produce plain-language insight the business can act on.');
body('It closes the gap most small and mid-market companies live with today: they have customer feedback, scattered across survey tools, review sites, support tickets, and inboxes, but lack the research team to turn it into decisions. AAA Insights applies AI research techniques — theme and sentiment analysis, adaptive conversational interviewing, and automated synthesis — so a company without a dedicated insights function can understand what its customers think, why, and what to do about it.');
body([{ t: 'The product is not "another survey tool." ', b: true }, { t: 'Survey creation is the on-ramp; the differentiated value is what happens after the feedback arrives — automatic discovery of themes and sentiment, AI-led follow-up that probes like a human interviewer, one unified feedback hub across sources, and generated insight with recommended actions.' }]);

// ---- 2 USERS ----
section('02', 'Target users & buyer', 'Two audiences, one product: credible analysis for the business, effortless response for the customer.');
body([{ t: 'Primary market: ', b: true }, { t: 'small and mid-market companies (roughly 10–500 employees) that sell to customers or consumers and want to understand them better, but do not have an in-house market-research or CX-analytics team.' }]);
children.push(table2(['User role', 'What they need from AAA Insights'], [
  ['Owner / founder / GM (buyer)', 'A fast, trustworthy read on what customers think and what to fix first — without hiring a research team.'],
  ['Marketing / brand lead', 'Themes, sentiment, and verbatim quotes to guide messaging, positioning, and product decisions.'],
  ['CX / customer-success manager', 'Early warning on dissatisfaction, drivers of churn, and a way to close the loop with unhappy customers.'],
  ['Product manager', 'Prioritized signal on what customers want changed, backed by evidence and volume.'],
  ['Respondent (the customer)', 'A short, respectful, mobile-friendly way to give feedback — including a conversational option that feels heard.'],
], [3000, 6360]));

// ---- 3 PRINCIPLES ----
section('03', 'Product principles', 'Five commitments that shape every design decision.');
bullet('1', [{ t: 'Insight over dashboards. ', b: true }, { t: 'The default output is a plain-language answer to "what should I know and do," not a wall of charts.' }]);
bullet('2', [{ t: 'Every insight is traceable. ', b: true }, { t: 'No AI-generated theme, sentiment, or recommendation appears without a path to the verbatim responses that support it.' }]);
bullet('3', [{ t: 'Respect the respondent. ', b: true }, { t: 'Surveys are short, mobile-first, accessible, and privacy-respecting — optimized for completion and honesty.' }]);
bullet('4', [{ t: 'Trustworthy AI. ', b: true }, { t: 'AI analysis carries its confidence and its source data; it never fabricates a quote or a statistic, and it separates what respondents said from what the AI inferred.' }]);
bullet('5', [{ t: 'Start simple, grow deliberately. ', b: true }, { t: 'The MVP is a tight, buildable core; every later capability is added against this same specification discipline.' }]);

// ---- 4 INPUTS ----
section('04', 'Inputs', 'What the system receives.');
[
  ['I-1', 'Survey definition — built by an admin (questions, types, logic, branding) or AI-generated from a plain-language goal. Stored as structured survey config.'],
  ['I-2', 'Survey response — a respondent’s answers: ratings, multiple-choice, and open-text comments. May be partial if the respondent abandons midway.'],
  ['I-3', 'Conversational response — free-text turns in an AI-led adaptive interview, captured as a threaded transcript of probes and replies.'],
  ['I-4', 'Imported feedback — external reviews, ratings, and comments via CSV upload (MVP) and, later, connectors. Each carries source, timestamp, rating, and text.'],
  ['I-5', 'Respondent metadata — optional, non-identifying attributes (segment, channel, product line, region, language) used for filtering and comparison.'],
  ['I-6', 'Distribution request — an admin action to publish a survey via shareable link, email invitation list, or embeddable widget.'],
  ['I-7', 'Analysis query — a natural-language question asked of the feedback data ("why are enterprise customers unhappy this quarter?").'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 5 OUTPUTS ----
section('05', 'Outputs', 'What the system produces.');
[
  ['O-1', 'Collected response store — every response (survey, conversational, imported) persisted under a common schema, attributable to its source and campaign.'],
  ['O-2', 'Theme analysis — AI-generated themes for a chosen set of responses, each with a label, count/percentage, representative verbatim quotes, and trend vs. prior period.'],
  ['O-3', 'Sentiment analysis — positive / neutral / negative with intensity, at the individual-response level and aggregated by theme, segment, source, and time.'],
  ['O-4', 'Ratings & metrics — average ratings, distribution, response and completion rates, and standard indices (NPS, CSAT) where the questions qualify.'],
  ['O-5', 'Insight report — a plain-language narrative of what’s happening, why, and what to do, with a short list of recommended actions ranked by evidence and impact. Exportable.'],
  ['O-6', 'Answer to an analysis query — a natural-language response grounded strictly in the company’s own data, citing the specific responses used.'],
  ['O-7', 'Alerts — notifications when a monitored signal crosses a threshold (a negative-sentiment spike, an emerging theme, a rating floor).'],
  ['O-8', 'Respondent-facing survey — the rendered survey or conversational interview the customer actually sees and completes.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 6 REQUIREMENTS ----
section('06', 'Requirements (behaviors)', 'Each is a single, testable behavior. IDs are cited by the Phase-3 test suite.');
function reqGroup(title, items) {
  children.push(new Paragraph({ spacing: { before: 200, after: 90 }, children: [new TextRun({ text: title, font: BODY, bold: true, size: 22, color: INK })] }));
  items.forEach(([id, t]) => children.push(bullet(id, t)));
}
reqGroup('Survey creation & distribution', [
  ['R-1', 'An admin can create a survey with at least these question types: single-select, multi-select, rating/scale (configurable range), and open text.'],
  ['R-2', 'An admin can generate a draft survey from a plain-language objective; the system returns an editable survey to modify or discard before sending.'],
  ['R-3', 'A survey supports conditional logic: a question or branch is shown or skipped based on a previous answer.'],
  ['R-4', 'An admin can distribute by (a) shareable public link, (b) email invitation list, and (c) embeddable widget. (Email is a Phase-1 roadmap item; link and widget are MVP.)'],
  ['R-5', 'A respondent can complete a survey on mobile and desktop without creating an account.'],
  ['R-6', 'The system records partial responses and marks them incomplete rather than discarding them.'],
]);
reqGroup('Conversational (AI-led) surveys', [
  ['R-7', 'An admin can enable a "conversational" mode in which an AI interviewer asks questions in natural language and asks relevant follow-up probes based on the answers.'],
  ['R-8', 'The interviewer stays on the admin-defined objective and does not ask questions outside the configured topic scope.'],
  ['R-9', 'The interviewer ends after a configurable maximum number of exchanges or when the objective is met, whichever comes first.'],
  ['R-10', 'Every conversational transcript is stored and is analyzable by the same theme/sentiment engine as structured responses.'],
]);
reqGroup('Unified feedback hub', [
  ['R-11', 'An admin can import external feedback via CSV, mapping columns to the unified schema (source, date, rating, text, segment).'],
  ['R-12', 'All feedback — survey, conversational, imported — is queryable together, filterable by source, campaign, date range, segment, rating, and sentiment.'],
  ['R-13', 'The system de-duplicates obviously identical imported responses (same source + text + timestamp) so they are not double-counted.'],
]);
reqGroup('AI analysis & insight', [
  ['R-14', 'For any filtered set of responses, the system produces theme analysis with counts and representative quotes.'],
  ['R-15', 'The system assigns sentiment to each open-text response and aggregates it across the chosen dimensions.'],
  ['R-16', 'For every theme and sentiment aggregate, the user can open the exact underlying responses that produced it (traceability — INV-3).'],
  ['R-17', 'An admin can ask a natural-language question of their data and receive an answer grounded only in their own responses, with citations.'],
  ['R-18', 'The system generates an insight report for a chosen scope: narrative, key metrics, top themes, sentiment summary, quotes, and ranked recommended actions.'],
  ['R-19', 'The system computes response rate, completion rate, average rating, rating distribution, and at least NPS and CSAT when the questions qualify.'],
  ['R-20', 'An admin can configure an alert on a signal (negative-sentiment share, average rating, new theme) and be notified when the threshold is crossed.'],
]);
reqGroup('Accounts, roles & export', [
  ['R-21', 'At least two roles: an Owner/Admin who manages account, users, and billing, and a Member who builds surveys and views analysis but not billing/users.'],
  ['R-22', 'An admin can export any analysis view and the insight report in a portable format (CSV for raw data; PDF and/or slides for the report).'],
  ['R-23', 'An admin can delete a survey, campaign, or individual response, and can export or delete all data for the account.'],
]);

// ---- 7 INVARIANTS ----
section('07', 'Invariants', 'Conditions that must hold in every state of the system.');
[
  ['INV-1', 'A response is always attributable to exactly one source (link, campaign, conversational session, or named import batch). No response exists without a known origin.'],
  ['INV-2', 'Response counts are never negative and never exceed responses actually collected; percentages are computed from the current filter and each response is counted once per dimension.'],
  ['INV-3', 'Every AI-generated theme, aggregate, insight, recommendation, and query answer is traceable to the specific underlying responses. The UI never shows an AI claim without a path to its verbatim data.'],
  ['INV-4', 'The system never displays a quote or statistic absent from the collected data. AI output summarizes only what exists; it does not invent respondents, quotes, or numbers.'],
  ['INV-5', 'A respondent can complete a survey without providing personally identifying information; identity is never required to submit feedback.'],
  ['INV-6', 'Each account’s data is isolated: no account can see, query, or analyze another’s responses. AI analysis is grounded only in that account’s data.'],
  ['INV-7', 'Deleting a response, campaign, or account removes it from all future analysis and aggregates; deleted data never reappears in any report.'],
  ['INV-8', 'Respondent PII, when present, is stored securely and never written to logs or included in AI outputs unless the admin explicitly opts in.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 8 EDGE CASES ----
section('08', 'Edge cases', 'The unusual conditions the system must survive — defined now, tested in Phase 3.');
[
  ['E-1', 'Empty or tiny sample — the system states the sample is too small for reliable themes/sentiment rather than fabricating confident findings.'],
  ['E-2', 'Abandoned survey — the partial is retained, counted as incomplete in completion math, and flagged in analysis.'],
  ['E-3', 'Junk / abusive open text — captured, flagged, excluded from theme/sentiment by default, and reviewable by the admin.'],
  ['E-4', 'Non-English / mixed-language responses — language is detected and analyzed accordingly (supported languages are an open question — Q-4).'],
  ['E-5', 'Malformed CSV import — rejected or partially accepted with a per-row error report; no partial garbage is silently stored.'],
  ['E-6', 'Duplicate / repeated submissions — de-duplication (R-13) applies, plus link-level controls (e.g., one response per link).'],
  ['E-7', 'Conversational interview goes off the rails — the interviewer stays in scope, ignores injected instructions, and ends gracefully.'],
  ['E-8', 'Ambiguous analysis query — the system answers only what the data supports and states what it cannot determine, rather than guessing.'],
  ['E-9', 'Sudden volume spike — ingestion and analysis stay correct; real-time views may lag but never lose or double-count data.'],
  ['E-10', 'Sensitive disclosure — PII or safety concerns are stored under INV-8 and surfaced to the admin without broadcasting into shared outputs.'],
  ['E-11', 'Concurrent editing — two admins editing one survey do not silently overwrite each other without warning.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 9 EXCLUSIONS ----
section('09', 'Exclusions', 'Explicitly out of scope for v1 — the unwritten assumptions, made written.');
[
  ['X-1', 'Not a CRM or customer-record system; it stores feedback, not a system of record for customer accounts.'],
  ['X-2', 'No two-way case management / ticketing; closing the loop in v1 is export/notification, not an in-app resolution workflow.'],
  ['X-3', 'No scraping of review sites without authorization; external feedback enters via CSV in the MVP and sanctioned connectors later.'],
  ['X-4', 'No prediction of future business outcomes (churn, revenue) in v1; it analyzes feedback that exists.'],
  ['X-5', 'No public respondent panel / audience marketplace; the company brings its own audience.'],
  ['X-6', 'Does not replace human research judgment; it is decision support, with every AI output presented as such alongside its evidence.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 10 DATA/PRIVACY ----
section('10', 'Data, privacy & security', 'The handling bar this product is held to — enforced in IMPLEMENT and VERIFY.');
[
  ['DPS-1', 'The system is a data processor for the account’s feedback; the company is the controller. Roles, retention, and deletion honor that relationship.'],
  ['DPS-2', 'Respondent PII is minimized, encrypted at rest and in transit, access-controlled by role, and excluded from logs and AI outputs by default.'],
  ['DPS-3', 'Data-subject requests are supported: export and deletion of an individual respondent’s data on request.'],
  ['DPS-4', 'AI processing is isolated to the account; account data is not used to train shared/base models without explicit opt-in.'],
  ['DPS-5', 'A configurable retention period is supported; data past retention is deleted and drops out of analysis.'],
  ['DPS-6', 'The full security checklist (input validation, authz/authn, secret handling) is applied during build and verification.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 11 NFR ----
section('11', 'Non-functional requirements', 'Speed, reliability, access, and honesty — stated as testable budgets.');
[
  ['NFR-1', 'Performance — a survey page loads in under 2 seconds on a typical mobile connection; a submission acknowledges in under 1 second.'],
  ['NFR-2', 'Analysis latency — theme/sentiment analysis up to the MVP size (target ~5,000 responses, Q-6) returns within a stated budget; larger sets run as background jobs with progress shown.'],
  ['NFR-3', 'Availability — the collection endpoint targets a stated uptime so responses are never lost during a live window; ingestion is durable even if analysis is degraded.'],
  ['NFR-4', 'Accessibility — respondent-facing surveys meet WCAG 2.1 AA.'],
  ['NFR-5', 'Scalability path — the architecture grows from SMB volumes toward larger sets without a rewrite; the MVP need not deliver enterprise scale but must not preclude it.'],
  ['NFR-6', 'Explainability — every AI output carries an indication of the data behind it and, where meaningful, a confidence signal.'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- 12 ROADMAP ----
section('12', 'Scope & phased roadmap', 'Only Phase 0 is committed by this document. Each later phase re-enters the pipeline before it is built.');
children.push(calloutBox('Phase 0 — MVP (the focused, buildable core)', [
  'The smallest release that delivers the differentiated promise end-to-end for one SMB account.',
  '• Survey builder: four core question types + conditional logic (R-1, R-3)  •  AI-drafted survey from a goal (R-2)',
  '• Distribution by link + embeddable widget (R-4)  •  Mobile, account-free capture incl. partials (R-5, R-6)',
  '• Conversational AI survey with scope control + turn limits (R-7–R-10)  •  CSV import into the unified hub (R-11, R-13)',
  '• Unified analysis with filtering (R-12)  •  AI theme + sentiment with traceability (R-14–R-16)',
  '• Core metrics incl. NPS/CSAT (R-19)  •  Insight report with ranked actions, exportable (R-18, R-22)',
  '• Two roles, account isolation, data export/delete (R-21, R-23, INV-6, INV-7)',
]));
children.push(new Paragraph({ spacing: { after: 60 } }));
function phase(title, lines) {
  children.push(new Paragraph({ spacing: { before: 160, after: 70 }, children: [new TextRun({ text: title, font: BODY, bold: true, size: 22, color: INK })] }));
  lines.forEach(l => children.push(bullet('', l)));
}
phase('Phase 1 — Depth & distribution', [
  'Natural-language "ask your data" query with citations (R-17, O-6).',
  'Email invitation distribution and reminders (R-4 email).',
  'Configurable alerts on sentiment/rating/theme signals (R-20, O-7).',
  'Segment comparison and trend-over-time views; slides export.',
]);
phase('Phase 2 — Connectors & scale', [
  'Sanctioned connectors for external review/rating sources and helpdesk exports (replacing CSV-only).',
  'Larger-volume analysis with background processing at scale (NFR-5).',
  'Multi-language analysis expansion (per Q-4).',
  'Team collaboration: shared workspaces, comments on insights, saved views.',
]);
phase('Phase 3 — Advanced insight', [
  'Driver analysis — what most influences satisfaction or rating.',
  'Benchmarking against prior periods and optional, opt-in, anonymized peer norms.',
  'A research assistant that proposes surveys and follow-up studies from the gaps it finds.',
]);

// ---- 13 OPEN QUESTIONS ----
section('13', 'Open questions', 'Decisions we need from you before proceeding to CHALLENGE (Phase 2).');
[
  ['Q-1', 'Product name — is "AAA Insights" the intended name or a working title?'],
  ['Q-2', 'Build vs. buy the survey engine — build collection natively, or wrap an existing component and focus the build on the AI analysis layer? Materially affects timeline and cost.'],
  ['Q-3', 'AI models / hosting — any constraints on model provider or data residency to design to from day one?'],
  ['Q-4', 'Language coverage for v1 — English-only, or which additional languages at launch?'],
  ['Q-5', 'Compliance targets — which regimes must v1 satisfy (GDPR, CCPA, SOC 2 roadmap)?'],
  ['Q-6', 'MVP volume target — what response volume must the MVP handle comfortably? Sets NFR-2 budgets and the storage/analysis approach.'],
  ['Q-7', 'Commercial model — per-seat, per-response, per-survey, or tiered? Shapes account, quota, and billing needs.'],
  ['Q-8', 'First design partner — is there a specific first customer/segment to anchor the MVP to?'],
  ['Q-9', 'Brand-love research inputs — should the insight engine build in a specific research framework (e.g., brand-love / emotional-attachment constructs) as a lens, or stay framework-neutral in v1?'],
].forEach(([id, t]) => children.push(bullet(id, t)));

// ---- APPROVAL ----
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(eyebrow('Approval'));
children.push(shortRule());
children.push(h1('The Phase-1 gate'));
body('On your approval, we proceed to CHALLENGE (Phase 2) — an adversarial review that stress-tests this specification for gaps, contradictions, and edge cases before any code is written — and fold the results, plus your answers to Section 13, into Requirements v2.');
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
  styles: {
    default: {
      document: { run: { font: BODY, size: 21, color: INK } },
      heading1: { run: { font: DISPLAY, bold: true, size: 40, color: INK } },
      heading2: { run: { font: BODY, bold: true, size: 26, color: INK } },
    },
  },
  sections: [ {
    properties: { page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
    } },
    children,
  } ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/aaa-insights/AAA_Insights_PRD.docx', buf);
  console.log('WROTE', buf.length, 'bytes');
});
