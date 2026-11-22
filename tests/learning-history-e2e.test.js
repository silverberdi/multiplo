import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';

const root = process.cwd();
function startServer() {
  return http.createServer((request, response) => {
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const file = path.join(root, requested.replace(/^\//, ''));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.webmanifest': 'application/manifest+json' };
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
}

async function answer(page, correct = true) {
  await page.evaluate((isCorrect) => {
    const question = window.__multiploApp.getCurrentQuestion();
    const option = question.alternatives.find((candidate) => candidate.isCorrect === isCorrect);
    const value = question.modalidad === 5 ? option.product : option.value;
    document.querySelector(`[data-option="${value}"]`).click();
  }, correct);
}

async function completeRound(page, { retryAndHint = false } = {}) {
  await page.waitForSelector('#view-juego.view-active');
  for (let index = 0; index < 4; index += 1) {
    if (retryAndHint && index === 0) {
      await answer(page, false);
      await answer(page, true);
    } else {
      if (retryAndHint && index === 2) await page.click('#btn-juego-hint');
      await answer(page, true);
    }
    await page.click('#btn-juego-continue');
  }
  await page.waitForSelector('#view-fin.view-active');
}

test('V3-01 E2E: una sesión con dos rondas conserva intentos/hints, opera offline y no transmite métricas', async (t) => {
  const server = startServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  const metricRequests = [];
  page.on('request', (request) => { if (/\/api\/metrics(?:\?|$)/.test(request.url())) metricRequests.push(request.url()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    window.__multiploApp.startNewRound(1, { bValues: [1, 2, 3, 4], modalities: [2, 3, 4, 5], randomFn: () => 0 });
    window.__multiploApp.navigateTo('aprende');
  });
  await page.click('#btn-aprende-continue');
  await page.setOfflineMode(true);
  await completeRound(page, { retryAndHint: true });
  await page.click('#btn-fin-repeat');
  await page.waitForSelector('#view-aprende.view-active');
  await page.click('#btn-aprende-continue');
  await completeRound(page);
  await page.click('#btn-fin-home');

  const result = await page.evaluate(() => ({
    metrics: window.__multiploApp.getLearningMetrics(),
    state: window.__multiploApp.getLearningHistory(),
    progression: localStorage.getItem('multiplo_progression_v1'),
    historyRaw: localStorage.getItem('multiplo_learning_history_v1')
  }));
  assert.equal(result.metrics.totals.sessionsStarted, 1);
  assert.equal(result.metrics.totals.sessionsEnded, 1);
  assert.equal(result.metrics.totals.roundsStarted, 2);
  assert.equal(result.metrics.totals.roundsCompleted, 2);
  assert.equal(result.metrics.totals.questionsAnswered, 8);
  assert.equal(result.metrics.totals.firstAttemptCorrect, 7);
  assert.equal(result.metrics.totals.additionalAttempts, 1);
  assert.equal(result.metrics.totals.questionsWithHints, 1);
  assert.equal(result.state.sessions[0].rounds.length, 2);
  assert.equal(result.state.sessions[0].rounds[0].questions[0].firstAttemptCorrect, false);
  assert.equal(result.state.sessions[0].rounds[0].questions[0].attemptsCount, 2);
  assert.equal(result.state.sessions[0].rounds[0].questions[2].hintShown, true);
  assert.ok(result.historyRaw);
  assert.ok(result.progression, 'la progresión del juego sigue su flujo existente');
  assert.equal(JSON.parse(result.progression).highestUnlockedLevel, 2);
  assert.deepEqual(metricRequests, []);
  await page.close();
});

test('V3-01 E2E: una recarga registra interrupción sin inventar hora de cierre ni migrar progresión', async (t) => {
  const server = startServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  const progressionBefore = await page.evaluate(() => localStorage.getItem('multiplo_progression_v1'));
  await page.evaluate(() => {
    window.__multiploApp.startNewRound(2, { bValues: [1, 2, 3, 4], modalities: [2, 3, 4, 5], randomFn: () => 0 });
    window.__multiploApp.navigateTo('aprende');
  });
  await page.click('#btn-aprende-continue');
  await answer(page, true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => ({
    state: window.__multiploApp.getLearningHistory(),
    metrics: window.__multiploApp.getLearningMetrics(),
    progression: localStorage.getItem('multiplo_progression_v1')
  }));
  const session = result.state.sessions[0];
  assert.equal(session.status, 'interrupted');
  assert.equal(session.endedAtUtc, null);
  assert.equal(session.rounds[0].status, 'interrupted');
  assert.ok(session.rounds[0].recoveredAtUtc);
  assert.equal(result.metrics.totals.roundsInterrupted, 1);
  assert.equal(result.metrics.totals.questionsAnswered, 1);
  assert.equal(result.progression, progressionBefore);
  await page.close();
});

test('V3-01 E2E: el tiempo de resolución no incluye el periodo con el documento oculto', async (t) => {
  const server = startServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    window.__multiploApp.startNewRound(3, { bValues: [1, 2, 3, 4], modalities: [2, 3, 4, 5], randomFn: () => 0 });
    window.__multiploApp.navigateTo('aprende');
  });
  await page.click('#btn-aprende-continue');
  await page.evaluate(() => {
    window.__testVisibility = 'hidden';
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => window.__testVisibility });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await new Promise((resolve) => setTimeout(resolve, 1200));
  await page.evaluate(() => {
    window.__testVisibility = 'visible';
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await answer(page, true);
  const activeSeconds = await page.evaluate(() => window.__multiploApp.getLearningHistory().sessions[0].rounds[0].questions[0].activeSeconds);
  assert.ok(activeSeconds < 0.8, `solo debe contar el breve tiempo visible, no los 1.2s ocultos (registró ${activeSeconds}s)`);
  await page.close();
});
