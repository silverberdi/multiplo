const ENDPOINT_PATH = "/api/metrics";
const MAX_BODY_BYTES = 4 * 1024;
const MAX_COUNTER_DELTA = 1_000_000;
const MAX_DATE_AGE_DAYS = 100;
const DEDUPLICATION_DAYS = 30;

const COUNTER_FIELDS = [
  "roundsStarted",
  "roundsCompleted",
  "roundsAbandoned",
  "questionsAnswered",
  "firstAttemptCorrect",
  "questionsWithHints",
  "additionalAttempts",
  "practiceSeconds"
];

const REQUEST_FIELDS = [
  "schemaVersion",
  "batchId",
  "date",
  "table",
  ...COUNTER_FIELDS,
  "operations"
];

const OPERATION_FIELDS = ["b", "questionsAnswered", "firstAttemptCorrect"];
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DAILY_METRICS_UPSERT = `
  INSERT INTO daily_metrics (
    date, table_number, rounds_started, rounds_completed, rounds_abandoned,
    questions_answered, first_attempt_correct, questions_with_hints,
    additional_attempts, practice_seconds, updated_at
  )
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1
  ON CONFLICT(date, table_number) DO UPDATE SET
    rounds_started = rounds_started + excluded.rounds_started,
    rounds_completed = rounds_completed + excluded.rounds_completed,
    rounds_abandoned = rounds_abandoned + excluded.rounds_abandoned,
    questions_answered = questions_answered + excluded.questions_answered,
    first_attempt_correct = first_attempt_correct + excluded.first_attempt_correct,
    questions_with_hints = questions_with_hints + excluded.questions_with_hints,
    additional_attempts = additional_attempts + excluded.additional_attempts,
    practice_seconds = practice_seconds + excluded.practice_seconds,
    updated_at = excluded.updated_at
`;

const DAILY_OPERATION_UPSERT = `
  INSERT INTO daily_operation_metrics (
    date, a, b, questions_answered, first_attempt_correct, updated_at
  )
  SELECT ?, ?, ?, ?, ?, ? WHERE changes() = 1
  ON CONFLICT(date, a, b) DO UPDATE SET
    questions_answered = questions_answered + excluded.questions_answered,
    first_attempt_correct = first_attempt_correct + excluded.first_attempt_correct,
    updated_at = excluded.updated_at
`;

function jsonResponse(status, value, origin) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });

  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return new Response(JSON.stringify(value), { status, headers });
}

function parseAllowedOrigin(request, expectedHost) {
  const origin = request.headers.get("Origin");
  if (!origin) return { allowed: true, responseOrigin: null };

  try {
    const parsed = new URL(origin);
    const expectedOrigin = `https://${expectedHost}`;
    if (parsed.origin !== expectedOrigin) return { allowed: false, responseOrigin: null };
    return { allowed: true, responseOrigin: expectedOrigin };
  } catch {
    return { allowed: false, responseOrigin: null };
  }
}

async function readBoundedUtf8(request) {
  const declaredLength = request.headers.get("Content-Length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_BYTES) {
    throw new RangeError("body-too-large");
  }

  if (!request.body) throw new SyntaxError("empty-body");

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new RangeError("body-too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasExactKeys(value, keys) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function isCounter(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_COUNTER_DELTA;
}

function utcDateWithinWindow(value, now) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) return false;

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const earliest = new Date(today.valueOf() - MAX_DATE_AGE_DAYS * 24 * 60 * 60 * 1000);
  return parsed <= today && parsed >= earliest;
}

function validatePayload(payload, now = new Date()) {
  if (!isRecord(payload) || !hasExactKeys(payload, REQUEST_FIELDS)) return false;
  if (payload.schemaVersion !== 1 || typeof payload.batchId !== "string" || !UUID_V4.test(payload.batchId)) return false;
  if (!utcDateWithinWindow(payload.date, now)) return false;
  if (!Number.isInteger(payload.table) || payload.table < 1 || payload.table > 10) return false;

  for (const field of COUNTER_FIELDS) {
    if (!isCounter(payload[field])) return false;
  }

  if (payload.firstAttemptCorrect > payload.questionsAnswered) return false;
  if (payload.questionsWithHints > payload.questionsAnswered) return false;
  if (!Array.isArray(payload.operations) || payload.operations.length > 10) return false;

  const seenFactors = new Set();
  for (const operation of payload.operations) {
    if (!isRecord(operation) || !hasExactKeys(operation, OPERATION_FIELDS)) return false;
    if (!Number.isInteger(operation.b) || operation.b < 1 || operation.b > 10 || seenFactors.has(operation.b)) return false;
    if (!isCounter(operation.questionsAnswered) || !isCounter(operation.firstAttemptCorrect)) return false;
    if (operation.firstAttemptCorrect > operation.questionsAnswered) return false;
    seenFactors.add(operation.b);
  }

  // Starts and finishes may belong to different UTC-day batches; do not infer cohort consistency here.
  return true;
}

function dedupWindow(now) {
  const receivedAt = now.toISOString();
  const expiresAt = new Date(now.valueOf() + DEDUPLICATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return { receivedAt, expiresAt };
}

async function persistBatch(db, payload, now = new Date()) {
  const { receivedAt, expiresAt } = dedupWindow(now);
  const statements = [
    db.prepare(`
      DELETE FROM daily_metrics WHERE date < date(?, '-24 months');
    `).bind(receivedAt),
    db.prepare(`
      DELETE FROM daily_operation_metrics WHERE date < date(?, '-24 months');
    `).bind(receivedAt),
    db.prepare(`
      DELETE FROM processed_batches WHERE expires_at <= ?
    `).bind(receivedAt),
    db.prepare(`
      INSERT INTO processed_batches (batch_id, received_at, expires_at)
      VALUES (?, ?, ?)
      ON CONFLICT(batch_id) DO UPDATE SET
        received_at = excluded.received_at,
        expires_at = excluded.expires_at
      WHERE processed_batches.expires_at <= excluded.received_at
    `).bind(payload.batchId, receivedAt, expiresAt),
    db.prepare(DAILY_METRICS_UPSERT).bind(
      payload.date,
      payload.table,
      payload.roundsStarted,
      payload.roundsCompleted,
      payload.roundsAbandoned,
      payload.questionsAnswered,
      payload.firstAttemptCorrect,
      payload.questionsWithHints,
      payload.additionalAttempts,
      payload.practiceSeconds,
      receivedAt
    )
  ];

  for (const operation of payload.operations) {
    statements.push(db.prepare(DAILY_OPERATION_UPSERT).bind(
      payload.date,
      payload.table,
      operation.b,
      operation.questionsAnswered,
      operation.firstAttemptCorrect,
      receivedAt
    ));
  }

  const result = await db.batch(statements);
  return result[3]?.meta?.changes === 1;
}

function isJsonContentType(request) {
  const contentType = request.headers.get("Content-Type");
  if (!contentType) return false;
  const [mediaType, ...parameters] = contentType.split(";").map(part => part.trim().toLowerCase());
  if (mediaType !== "application/json") return false;
  return parameters.every(parameter => parameter === "charset=utf-8");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedHost = env.METRICS_ALLOWED_HOST || "multiplo.silverman.pro";

    if (url.pathname !== ENDPOINT_PATH || url.search !== "") return jsonResponse(404, { error: "not_found" });
    if (url.hostname !== allowedHost) return jsonResponse(404, { error: "not_found" });
    if (request.method !== "POST") return jsonResponse(405, { error: "method_not_allowed" });

    const { allowed, responseOrigin } = parseAllowedOrigin(request, allowedHost);
    if (!allowed) return jsonResponse(403, { error: "origin_not_allowed" });
    if (env.METRICS_INGEST_ENABLED !== "true") {
      return jsonResponse(503, { error: "ingestion_disabled" }, responseOrigin);
    }

    if (!env.METRICS_RATE_LIMITER || !env.DB) {
      return jsonResponse(503, { error: "service_unavailable" }, responseOrigin);
    }

    try {
      const clientIp = request.headers.get("CF-Connecting-IP");
      if (!clientIp) return jsonResponse(503, { error: "service_unavailable" }, responseOrigin);

      const rate = await env.METRICS_RATE_LIMITER.limit({ key: `metrics:${clientIp}` });
      if (!rate.success) return jsonResponse(429, { error: "rate_limited" }, responseOrigin);

      if (!isJsonContentType(request)) return jsonResponse(415, { error: "unsupported_media_type" }, responseOrigin);

      let bodyText;
      try {
        bodyText = await readBoundedUtf8(request);
      } catch (error) {
        const status = error instanceof RangeError ? 413 : 400;
        const code = error instanceof RangeError ? "payload_too_large" : "invalid_payload";
        return jsonResponse(status, { error: code }, responseOrigin);
      }

      let payload;
      try {
        payload = JSON.parse(bodyText);
      } catch {
        return jsonResponse(400, { error: "invalid_payload" }, responseOrigin);
      }

      if (!validatePayload(payload)) return jsonResponse(400, { error: "invalid_payload" }, responseOrigin);

      const accepted = await persistBatch(env.DB, payload);
      return jsonResponse(202, { accepted: true, duplicate: !accepted }, responseOrigin);
    } catch {
      return jsonResponse(503, { error: "service_unavailable" }, responseOrigin);
    }
  }
};
