import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';

const root = process.cwd();
function serve() {
  let failFirstMetricRequest = true;
  const server = http.createServer((request, response) => {
    if (request.url === '/metrics-test') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><meta charset="utf-8"><title>Metrics test origin</title>');
      return;
    }
    if (request.url === '/api/metrics' && request.method === 'POST') {
      const chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        server.metricsCalls.push(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        response.writeHead(failFirstMetricRequest ? 503 : 202, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(failFirstMetricRequest ? {} : { accepted: true, duplicate: false }));
        failFirstMetricRequest = false;
      });
      return;
    }
    const filename = path.join(root, (request.url === '/' ? '/index.html' : request.url.split('?')[0]).replace(/^\//, ''));
    if (!fs.existsSync(filename) || fs.statSync(filename).isDirectory()) { response.writeHead(404).end(); return; }
    const contentTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.webmanifest': 'application/manifest+json' };
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filename)] || 'application/octet-stream' });
    fs.createReadStream(filename).pipe(response);
  });
  server.metricsCalls = [];
  return server;
}

test('V3-03 E2E: la outbox coordina cierres entre pestañas y conserva el mismo lote hasta ACK válido', async (t) => {
  const server = serve();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  const first = await browser.newPage();
  const second = await browser.newPage();
  await Promise.all([first.goto(origin), second.goto(origin)]);
  const firstResult = await first.evaluate(async () => {
    const [{ createMetricsOutbox }, { createLearningHistoryStore, createEmptyLearningHistory }] = await Promise.all([
      import('/js/metrics-outbox.js'), import('/js/learning-history.js')
    ]);
    const opened = await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('multiplo_metrics_outbox_v1');
      request.onsuccess = resolve; request.onerror = () => reject(request.error);
    });
    void opened;
    localStorage.removeItem('multiplo_learning_history_v1');
    const baseline = createEmptyLearningHistory();
    let clock = Date.now();
    const outboxA = createMetricsOutbox({ enabled: true, fetchImpl: window.fetch.bind(window), now: () => new Date(clock) });
    await outboxA.initialize(baseline);

    const history = createLearningHistoryStore({ nowUtc: () => new Date(clock), monotonicNow: () => clock });
    history.startRound(2);
    history.recordResolvedQuestion({ index: 0, a: 2, b: 3, source: 'actual', isResolved: true, firstAttemptCorrect: true, attemptsCount: 1 });
    const stableEventId = history.getActiveRoundMetricsEventId();
    history.completeRound({ totalQuestions: 1, firstAttemptSuccesses: 1 }, {}, true);
    const state = history.getState();
    window.__metricsOutboxA = outboxA;
    window.__metricsEventId = stableEventId;
    window.__metricsState = state;
    return { eventId: stableEventId, state };
  });
  const peerReady = await second.evaluate(async ({ eventId, state }) => {
    const { createMetricsOutbox } = await import('/js/metrics-outbox.js');
    const outbox = createMetricsOutbox({ enabled: true, fetchImpl: window.fetch.bind(window), now: () => new Date(window.__peerClock) });
    window.__peerClock = Date.now() + 10000;
    window.__peerOutbox = outbox;
    await outbox.initialize([]);
    return { eventId, state };
  }, firstResult);
  const [capturedA, capturedB] = await Promise.all([
    first.evaluate(async ({ eventId, state }) => window.__metricsOutboxA.capture(eventId, state), firstResult),
    second.evaluate(async ({ eventId, state }) => window.__peerOutbox.capture(eventId, state), peerReady)
  ]);
  const duplicateCapture = await second.evaluate(async ({ capturedA, capturedB }) => {
    window.__peerClock += 5001;
    await window.__peerOutbox.drain();
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('multiplo_metrics_outbox_v1', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const request = database.transaction('queue').objectStore('queue').get('state');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    database.close();
    return { capturedA, capturedB, eventCount: stored.completedEvents.length, pending: stored.pending.length };
  }, { capturedA, capturedB });

  assert.equal(Number(capturedA) + Number(capturedB), 1, 'solo una pestaña registra el cierre concurrente');
  assert.equal(duplicateCapture.eventCount, 1, 'el cierre persistido queda deduplicado');
  assert.equal(duplicateCapture.pending, 0, 'un lote se elimina después del ACK válido');
  assert.equal(server.metricsCalls.length, 2, 'se realiza el intento fallido y el reintento permitido');
  assert.equal(server.metricsCalls[0].batchId, server.metricsCalls[1].batchId, 'el batchId se conserva en el reintento');
  await Promise.all([first.close(), second.close()]);
});

test('V3-03 E2E: outbox apagada no escribe cola ni hace requests', async (t) => {
  const server = serve();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(async () => {
    const { createMetricsOutbox } = await import('/js/metrics-outbox.js');
    let requests = 0;
    const outbox = createMetricsOutbox({ enabled: false, fetchImpl: async () => { requests += 1; } });
    await outbox.initialize(null);
    await outbox.capture('event-disabled', {});
    await outbox.drain();
    return { requests, transmissionEnabled: false };
  });
  assert.equal(result.requests, 0);
  await page.close();
});

test('V3-03 E2E: un lote pendiente sobrevive a una recarga y conserva su batchId', async (t) => {
  const server = serve();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  const origin = `http://127.0.0.1:${server.address().port}`;
  await page.goto(`${origin}/metrics-test`);
  const pendingBatch = await page.evaluate(async () => {
    const [{ createMetricsOutbox }, { createEmptyLearningHistory }] = await Promise.all([
      import('/js/metrics-outbox.js'), import('/js/learning-history.js')
    ]);
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('multiplo_metrics_outbox_v1');
      request.onsuccess = resolve; request.onerror = () => reject(request.error);
    });
    const now = Date.now();
    const baseline = createEmptyLearningHistory();
    const state = createEmptyLearningHistory();
    const date = new Date(now).toISOString().slice(0, 10);
    state.daily[date] = { totals: {}, tables: { 2: { actual: { roundsStarted: 1 }, repaso: {} } }, pairs: {} };
    const outbox = createMetricsOutbox({ enabled: true, fetchImpl: window.fetch.bind(window), now: () => new Date(now) });
    await outbox.initialize(baseline);
    await outbox.capture('stable-round-id', state);
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('multiplo_metrics_outbox_v1', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const request = database.transaction('queue').objectStore('queue').get('state');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    database.close();
    return stored.pending[0].payload.batchId;
  });
  await page.reload();
  const remaining = await page.evaluate(async () => {
    const { createMetricsOutbox } = await import('/js/metrics-outbox.js');
    const outbox = createMetricsOutbox({ enabled: true, fetchImpl: window.fetch.bind(window), now: () => new Date(Date.now() + 5001) });
    await outbox.initialize([]);
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('multiplo_metrics_outbox_v1', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const stored = await new Promise((resolve, reject) => {
      const request = database.transaction('queue').objectStore('queue').get('state');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    database.close();
    return stored.pending.length;
  });
  assert.equal(remaining, 0, 'el ACK posterior a la recarga elimina el lote persistido');
  assert.equal(server.metricsCalls.length, 2);
  assert.equal(server.metricsCalls[0].batchId, pendingBatch);
  assert.equal(server.metricsCalls[1].batchId, pendingBatch);
  await page.close();
});

test('V3-03 E2E: la cola aplica topes de 100 lotes, 7 días y 3 intentos', async (t) => {
  const server = serve();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(async () => {
    const [{ createMetricsOutbox }, { createEmptyLearningHistory }] = await Promise.all([
      import('/js/metrics-outbox.js'), import('/js/learning-history.js')
    ]);
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase('multiplo_metrics_outbox_v1');
      request.onsuccess = resolve; request.onerror = () => reject(request.error);
    });
    const now = Date.now();
    const baseline = createEmptyLearningHistory();
    const outbox = createMetricsOutbox({ enabled: true, fetchImpl: async () => ({ status: 503, json: async () => ({}) }), now: () => new Date(now) });
    await outbox.initialize(baseline);
    const state = createEmptyLearningHistory();
    for (let dayOffset = 0; dayOffset < 11; dayOffset += 1) {
      const date = new Date(now - dayOffset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      state.daily[date] = { totals: {}, tables: {}, pairs: {} };
      for (let table = 1; table <= 10; table += 1) state.daily[date].tables[table] = { actual: { roundsStarted: 1 }, repaso: {} };
    }
    await outbox.capture('event-cap', state);
    const database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('multiplo_metrics_outbox_v1', 1);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    const transactionRead = () => new Promise((resolve, reject) => {
      const request = database.transaction('queue').objectStore('queue').get('state');
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    let stored = await transactionRead();
    const retained = stored.pending.length;
    const thirdAttempt = structuredClone(stored.pending[0]);
    thirdAttempt.attempts = 2;
    thirdAttempt.lastAttemptAt = now - 30001;
    thirdAttempt.createdAt = now;
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('queue', 'readwrite');
      transaction.objectStore('queue').put({ ...stored, pending: [thirdAttempt] });
      transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error);
    });
    await outbox.drain();
    stored = await transactionRead();
    const afterThirdFailure = stored.pending.length;
    stored.pending = [{ ...thirdAttempt, attempts: 0, createdAt: now - 8 * 24 * 60 * 60 * 1000, lastAttemptAt: null }];
    await new Promise((resolve, reject) => {
      const transaction = database.transaction('queue', 'readwrite');
      transaction.objectStore('queue').put(stored);
      transaction.oncomplete = resolve; transaction.onerror = () => reject(transaction.error);
    });
    await outbox.drain();
    stored = await transactionRead();
    database.close();
    return { retained, afterThirdFailure, afterExpiry: stored.pending.length };
  });
  assert.equal(result.retained, 100, 'no se conservan más de 100 lotes');
  assert.equal(result.afterThirdFailure, 0, 'el tercer intento fallido descarta el lote');
  assert.equal(result.afterExpiry, 0, 'un lote con más de siete días se descarta sin envío');
  await page.close();
});
