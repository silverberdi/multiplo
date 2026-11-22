import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

const root = process.cwd();
const temporaryState = fs.mkdtempSync(path.join(os.tmpdir(), 'multiplo-d1-ci-'));
const wrangler = path.join(root, 'node_modules/.bin/wrangler');
const config = path.join(root, 'metrics/wrangler.jsonc');
const databaseName = 'multiplo-metrics-local';
let serverProcess;

function run(args) {
  const result = spawn(wrangler, args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
  let output = '';
  result.stdout.on('data', (chunk) => { output += chunk; });
  result.stderr.on('data', (chunk) => { output += chunk; });
  return { process: result, output: () => output };
}

async function waitUntilReady(url, child, output) {
  const until = Date.now() + 20_000;
  while (Date.now() < until) {
    if (child.exitCode !== null) throw new Error(`wrangler dev terminó antes de iniciar:\n${output()}`);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.status === 405 || response.status === 404) return;
    } catch { /* esperar el bind local */ }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timeout al iniciar wrangler dev:\n${output()}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  let portServer;
  portServer = net.createServer();
  portServer.listen(0, '127.0.0.1');
  await once(portServer, 'listening');
  const { port } = portServer.address();
  await new Promise((resolve) => portServer.close(resolve));

  const migrate = run(['d1', 'migrations', 'apply', databaseName, '--local', '--config', config, '--persist-to', temporaryState]);
  const migrationExit = await new Promise((resolve) => migrate.process.on('close', resolve));
  if (migrationExit !== 0) throw new Error(`Falló la migración D1 local:\n${migrate.output()}`);

  const worker = run(['dev', '--local', '--config', config, '--persist-to', temporaryState, '--port', String(port), '--var', 'METRICS_INGEST_ENABLED:true', '--var', 'METRICS_ALLOWED_HOST:127.0.0.1']);
  serverProcess = worker.process;
  await waitUntilReady(`http://127.0.0.1:${port}/api/metrics`, serverProcess, worker.output);

  const endpoint = `http://127.0.0.1:${port}/api/metrics`;
  const batchId = '8b899aa0-17ef-4a7a-a9c0-18c92f0a1234';
  const payload = {
    schemaVersion: 1, batchId, date: new Date().toISOString().slice(0, 10), table: 2,
    roundsStarted: 1, roundsCompleted: 1, roundsAbandoned: 0, questionsAnswered: 2,
    firstAttemptCorrect: 1, questionsWithHints: 0, additionalAttempts: 1, practiceSeconds: 30,
    operations: [{ b: 3, questionsAnswered: 2, firstAttemptCorrect: 1 }]
  };
  const headers = { 'Content-Type': 'application/json', 'CF-Connecting-IP': '198.51.100.8' };
  const first = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const firstBody = await first.json();
  assert(first.status === 202 && firstBody.accepted && firstBody.duplicate === false, 'primer lote debe persistir');
  const duplicate = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(payload) });
  const duplicateBody = await duplicate.json();
  assert(duplicate.status === 202 && duplicateBody.accepted && duplicateBody.duplicate === true, 'repetir batchId no debe duplicar');

  const invalidContentType = await fetch(endpoint, { method: 'POST', headers: { 'CF-Connecting-IP': '198.51.100.8' }, body: JSON.stringify(payload) });
  assert(invalidContentType.status === 415, 'el Worker debe rechazar content-type ausente');
  const adjacentPath = await fetch(`${endpoint}/other`, { method: 'POST', headers, body: JSON.stringify(payload) });
  assert(adjacentPath.status === 404, 'la ruta vecina debe quedar fuera del handler');

  const query = run(['d1', 'execute', databaseName, '--local', '--config', config, '--persist-to', temporaryState, '--json', '--command', "SELECT rounds_started, questions_answered FROM daily_metrics; SELECT COUNT(*) AS rows FROM processed_batches; SELECT COUNT(*) AS rows FROM daily_operation_metrics;"]);
  const queryExit = await new Promise((resolve) => query.process.on('close', resolve));
  if (queryExit !== 0) throw new Error(`No se pudo inspeccionar D1 local:\n${query.output()}`);
  const result = JSON.parse(query.output().trim());
  const normalized = JSON.stringify(result);
  assert(normalized.includes('"rounds_started":1') && normalized.includes('"questions_answered":2'), 'D1 debe reflejar los agregados una sola vez');
  assert(normalized.includes('"rows":1'), 'D1 debe guardar un solo batch y una operación');
  console.log('Worker/D1 local: persistencia, deduplicación, fallo cerrado y ruta aislada verificados.');
} finally {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
    await new Promise((resolve) => serverProcess.once('close', resolve));
  }
  fs.rmSync(temporaryState, { recursive: true, force: true });
}
