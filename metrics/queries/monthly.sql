-- Reporte administrativo. Sustituir los marcadores solo con YYYY-MM validado.
-- Ejecutar con acceso D1 autenticado; esta consulta es exclusivamente SELECT.
SELECT
  date,
  table_number AS table,
  rounds_started,
  rounds_completed,
  rounds_abandoned,
  questions_answered,
  first_attempt_correct,
  questions_with_hints,
  additional_attempts,
  practice_seconds
FROM daily_metrics
WHERE date >= '{{START_DATE}}' AND date < '{{END_DATE}}'
ORDER BY date, table_number;

SELECT
  date,
  a AS table,
  b,
  questions_answered,
  first_attempt_correct
FROM daily_operation_metrics
WHERE date >= '{{START_DATE}}' AND date < '{{END_DATE}}'
ORDER BY date, a, b;

SELECT COUNT(*) AS accepted_batch_keys
FROM processed_batches
WHERE received_at >= '{{START_DATE}}' AND received_at < '{{END_DATE}}';
