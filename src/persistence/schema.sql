-- AAA Insights — persistence schema (Postgres 16 + pgvector).
--
-- Design notes:
--  * Every tenant-owned row carries account_id; the application always filters by it
--    (INV-6). Row-Level Security is layered on in the infra tier as defence in depth.
--  * Deletions tombstone the id (INV-7) so a re-import cannot resurrect deleted data.
--  * Timestamps are stored UTC (E-22); the account timezone is applied at read time.
--  * The pgvector `embedding` column backs future semantic retrieval for the grounded
--    NL query (R-17); today's retrieval is keyword-based, so it is nullable.

CREATE EXTENSION IF NOT EXISTS vector;

-- One response about one brand from one source (INV-1). ---------------------------
CREATE TABLE IF NOT EXISTS feedback_records (
  account_id    text        NOT NULL,
  record_id     text        NOT NULL,
  brand_id      text        NOT NULL,               -- exactly one brand (INV-1)
  source_id     text        NOT NULL,               -- exactly one source (INV-1)
  source_type   text        NOT NULL,
  captured_at   timestamptz NOT NULL,               -- stored UTC (E-22)
  rating_raw    double precision,
  rating_scale  text,
  rating_norm   double precision,                   -- 1..5 or NULL when un-mappable (E-15)
  brand_love    text,
  trust         double precision,
  comment_text  text,
  language      text,
  segment       text,
  provenance    text,                               -- kept for DSR erasure by author (DPS-3)
  is_complete   boolean     NOT NULL DEFAULT false,
  flags         text[]      NOT NULL DEFAULT '{}',
  embedding     vector(1536),                        -- future semantic retrieval (R-17)
  PRIMARY KEY (account_id, record_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_account        ON feedback_records (account_id);
CREATE INDEX IF NOT EXISTS idx_feedback_account_brand  ON feedback_records (account_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_feedback_account_source ON feedback_records (account_id, source_id);
CREATE INDEX IF NOT EXISTS idx_feedback_provenance     ON feedback_records (account_id, provenance);

-- Internal closed-loop RecoveryCases (no external CRM push — X-2). ------------------
-- The domain case is account-agnostic; account_id here scopes it to a tenant (INV-6).
CREATE TABLE IF NOT EXISTS recovery_cases (
  account_id   text        NOT NULL,
  id           text        NOT NULL,
  record_ids   text[]      NOT NULL DEFAULT '{}',
  kind         text        NOT NULL,               -- 'contactable' | 'anonymous_triage'
  status       text        NOT NULL,               -- open | in_progress | resolved | closed
  grouping_key text        NOT NULL,
  opened_at    timestamptz NOT NULL,               -- stored UTC (E-22)
  customer_ref text,
  owner_id     text,
  quadrant     text,
  trust        double precision,
  PRIMARY KEY (account_id, id)
);

CREATE INDEX IF NOT EXISTS idx_cases_account        ON recovery_cases (account_id);
-- Fast "open cases" scan for the DPS-5 retention hold and dashboards.
CREATE INDEX IF NOT EXISTS idx_cases_account_open   ON recovery_cases (account_id) WHERE status <> 'closed';

-- Tombstones — deleted ids that must never reappear (INV-7). -----------------------
CREATE TABLE IF NOT EXISTS tombstones (
  account_id   text        NOT NULL,
  record_id    text        NOT NULL,
  deleted_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (account_id, record_id)
);
