import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'multiplo-report-ci-'));
try {
  const emptyInput = path.join(temporary, 'empty.json');
  fs.writeFileSync(emptyInput, JSON.stringify({
    sourceLabel: 'SINTÉTICO: periodo sin eventos', extractedAtUtc: '2026-11-22T00:00:00.000Z',
    periodStartUtc: '2026-11-01', periodEndExclusiveUtc: '2026-12-01',
    traffic: { periodStartUtc: '2026-11-01', periodEndExclusiveUtc: '2026-12-01', requests: 0, visits: 0, errors: 0, estimatedCostUsd: 0 },
    daily: [], operations: [], health: { workerErrors: 0, workerRequests: 0, d1ReadUnits: 0, d1WriteUnits: 0, d1StorageBytes: 0 }
  }));
  const reportDirectory = path.join(temporary, 'report');
  const result = spawnSync(process.execPath, ['scripts/generate-monthly-report.mjs', '--month=2026-11', `--input=${emptyInput}`, `--out-dir=${reportDirectory}`], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const markdown = fs.readFileSync(path.join(reportDirectory, '2026-11-multiplo.md'), 'utf8');
  const csv = fs.readFileSync(path.join(reportDirectory, '2026-11-multiplo.csv'), 'utf8');
  assert.match(markdown, /Sin datos/);
  assert.match(markdown, /0\/0/);
  assert.match(csv, /first_attempt_accuracy/);
  const sampleDirectory = path.join(temporary, 'sample');
  const sample = spawnSync(process.execPath, ['scripts/generate-monthly-report.mjs', '--month=2026-10', `--out-dir=${sampleDirectory}`], { encoding: 'utf8' });
  assert.equal(sample.status, 0, sample.stderr);
  const sampleMarkdown = fs.readFileSync(path.join(sampleDirectory, '2026-10-multiplo.md'), 'utf8');
  const sampleCsv = fs.readFileSync(path.join(sampleDirectory, '2026-10-multiplo.csv'), 'utf8');
  assert.match(sampleMarkdown, /<10 \(suprimido\)/, 'celda de menos de 10 eventos se suprime');
  assert.match(sampleCsv, /operation_error_rate/, 'CSV contiene tasa de error con denominador');
  console.log('Informe mensual: fixture sintético y periodo vacío generan Markdown/CSV con denominadores explícitos.');
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
