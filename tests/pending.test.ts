/**
 * Pending behaviors — the executable backlog for Phase 4 (IMPLEMENT).
 *
 * These are the requirements NOT yet built. Each is a Vitest `todo`: it shows in
 * the report as pending (never failing, so the suite stays green) and carries its
 * requirement ID for traceability. As each behavior is built, move it out of here
 * into a real test (see tests/domain/* for the pattern) and turn it green.
 *
 * The plain-English contract for all of these is docs/03_test_plan.md.
 * Built so far (increment 1): R-13, R-30, R-32, INV-2, INV-4, INV-14, E-6, E-15, E-24.
 */
import { describe, it } from 'vitest';

type Pending = readonly (readonly [string, string])[];
const todos = (items: Pending) => {
  for (const [id, label] of items) it.todo(`${id}: ${label}`);
};

describe('Survey creation & distribution (pending)', () => {
  todos([
    ['R-2', 'AI-draft a survey from a plain-language objective'],
    ['R-4', 'distribute by link and embeddable widget (email Phase-1)'],
    ['R-5', 'respondent completes on mobile/desktop without an account'],
    ['R-6', 'partial responses saved and marked incomplete'],
  ]);
});

describe('Conversational surveys (pending)', () => {
  todos([
    ['R-7', 'AI interviewer asks relevant follow-up probes'],
    ['R-8', 'interviewer stays in scope and ignores injected instructions'],
    ['R-9', 'interview ends at max exchanges or when objective met'],
    ['R-10', 'transcript stored and analysed by the same engine'],
  ]);
});

describe('Emotion & experience — v7 (pending)', () => {
  todos([
    ['R-47', 'drill down from a headline emotion to sub-emotions + verbatims'],
    ['R-49', 'competitive emotion & strengths/gripes comparison (Phase 1)'],
    ['R-50', 'publish taxonomy; carry confidence; never blend into headline'],
  ]);
});

describe('Unified customer & competitive insight (pending)', () => {
  todos([
    ['R-24', 'define and manage competitor brands'],
    ['R-25', 'collect public reviews under DPS-7 + legal gate'],
  ]);
});

describe('Closed-loop & service recovery (pending)', () => {
  todos([
    ['R-37', 'notify owner/team; no external CRM push'],
    ['R-39', 'reinforcement — audience-neutral public-review prompts'],
  ]);
});

describe('Security, privacy & integrity (pending)', () => {
  todos([
    ['R-42', 'admin auth SSO/MFA + managed sessions'],
  ]);
});

describe('AI analysis, accounts, roles, export (pending)', () => {
  todos([
    ['R-17', 'NL query grounded only in the account data, with citations'],
    ['R-23', 'delete and export all account data'],
  ]);
});

describe('Invariants (pending)', () => {
  todos([
    ['INV-5', 'survey completable without identifying information'],
    ['INV-6', 'account data isolated; analysis grounded only in that account'],
    ['INV-7', 'deleted data never reappears (subject to DPS-5 hold)'],
    ['INV-9', 'no general identity profile; RecoveryCase is the sole exception'],
    ['INV-10', 'external data lawful and public, provenance kept'],
    ['INV-11', 'public-review PII minimised, never profiled'],
  ]);
});

describe('Edge cases (pending)', () => {
  todos([
    ['E-2', 'abandoned survey retained, flagged incomplete'],
    ['E-7', 'conversation off the rails recovers and ends gracefully'],
    ['E-8', 'ambiguous query answers only what the data supports'],
    ['E-9', 'volume spike stays correct; abuse defenses distinguish stuffing'],
    ['E-10', 'sensitive disclosure surfaced behind role/audit'],
    ['E-12', 'source block backs off and records the gap'],
    ['E-13', 'competitor ambiguity excluded from headline until confirmed'],
    ['E-14', 'sparse competitor data shows insufficient data'],
    ['E-16', 'trust read category- and period-relative'],
    ['E-17', 'consent withdrawn purges contact; keeps de-identified aggregate'],
    ['E-18', 'notification failure never drops a case'],
  ]);
});

describe('Data/privacy, non-functional & exclusions (pending)', () => {
  todos([
    ['DPS-1', 'processor/controller roles'],
    ['DPS-2', 'PII encrypted, access-controlled'],
    ['DPS-3', 'DSR export/delete for own + scraped third-party authors'],
    ['DPS-4', 'account data never trains shared models'],
    ['DPS-5', 'retention with open-case hold'],
    ['DPS-6', 'security checklist applied'],
    ['DPS-7', 'collection compliance gate (public-only, robots.txt, legal sign-off)'],
    ['DPS-8', 'GDPR + CCPA targets'],
    ['DPS-9', 'provider-abstracted hosting, US residency'],
    ['DPS-10', 'contact consent scoped internal, no external sharing'],
    ['DPS-11', 'admin auth + vaulted secrets'],
    ['NFR-1', 'survey page < 2s mobile; submit ack < 1s'],
    ['NFR-2', 'analysis p95 <= 60s; larger sets background'],
    ['NFR-3', '99.9% uptime; durable ingestion'],
    ['NFR-4', 'WCAG 2.1 AA'],
    ['NFR-5', 'scales without a rewrite'],
    ['NFR-6', 'AI outputs carry source + confidence'],
    ['NFR-7', 'collection freshness & politeness'],
    ['NFR-8', 'trigger opens a case within <= 60s'],
    ['NFR-9', 'durability RPO <= 1h, RTO <= 8h'],
    ['X-1', 'not a CRM / general profile (RecoveryCase aside)'],
    ['X-2', 'no external push or native workbench in v1'],
    ['X-3', 'no private/paywalled collection'],
    ['X-4', 'no future-outcome prediction'],
    ['X-5', 'no respondent panel / marketplace'],
    ['X-6', 'decision support, not a replacement for judgment'],
    ['X-7', 'no re-identifying or contacting scraped reviewers'],
  ]);
});
