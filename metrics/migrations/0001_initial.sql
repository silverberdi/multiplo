CREATE TABLE IF NOT EXISTS daily_metrics (
  date TEXT NOT NULL,
  table_number INTEGER NOT NULL CHECK (table_number BETWEEN 1 AND 10),
  rounds_started INTEGER NOT NULL DEFAULT 0 CHECK (typeof(rounds_started) = 'integer' AND rounds_started BETWEEN 0 AND 9007199254740991),
  rounds_completed INTEGER NOT NULL DEFAULT 0 CHECK (typeof(rounds_completed) = 'integer' AND rounds_completed BETWEEN 0 AND 9007199254740991),
  rounds_abandoned INTEGER NOT NULL DEFAULT 0 CHECK (typeof(rounds_abandoned) = 'integer' AND rounds_abandoned BETWEEN 0 AND 9007199254740991),
  questions_answered INTEGER NOT NULL DEFAULT 0 CHECK (typeof(questions_answered) = 'integer' AND questions_answered BETWEEN 0 AND 9007199254740991),
  first_attempt_correct INTEGER NOT NULL DEFAULT 0 CHECK (typeof(first_attempt_correct) = 'integer' AND first_attempt_correct BETWEEN 0 AND 9007199254740991),
  questions_with_hints INTEGER NOT NULL DEFAULT 0 CHECK (typeof(questions_with_hints) = 'integer' AND questions_with_hints BETWEEN 0 AND 9007199254740991),
  additional_attempts INTEGER NOT NULL DEFAULT 0 CHECK (typeof(additional_attempts) = 'integer' AND additional_attempts BETWEEN 0 AND 9007199254740991),
  practice_seconds INTEGER NOT NULL DEFAULT 0 CHECK (typeof(practice_seconds) = 'integer' AND practice_seconds BETWEEN 0 AND 9007199254740991),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (date, table_number)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS daily_operation_metrics (
  date TEXT NOT NULL,
  a INTEGER NOT NULL CHECK (a BETWEEN 1 AND 10),
  b INTEGER NOT NULL CHECK (b BETWEEN 1 AND 10),
  questions_answered INTEGER NOT NULL DEFAULT 0 CHECK (typeof(questions_answered) = 'integer' AND questions_answered BETWEEN 0 AND 9007199254740991),
  first_attempt_correct INTEGER NOT NULL DEFAULT 0 CHECK (typeof(first_attempt_correct) = 'integer' AND first_attempt_correct BETWEEN 0 AND 9007199254740991),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (date, a, b)
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS processed_batches (
  batch_id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS processed_batches_expires_at_idx
  ON processed_batches (expires_at);
