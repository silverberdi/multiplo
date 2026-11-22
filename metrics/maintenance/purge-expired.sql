-- Execute only through authenticated Wrangler access, never from the public Worker.
DELETE FROM processed_batches
WHERE expires_at <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now');

DELETE FROM daily_metrics
WHERE date < date('now', '-24 months');

DELETE FROM daily_operation_metrics
WHERE date < date('now', '-24 months');
