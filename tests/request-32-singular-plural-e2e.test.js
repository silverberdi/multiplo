import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';

const root = process.cwd();
function createServer() {
  return http.createServer((request, response) => {
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const file = path.join(root, requested.replace(/^\//, ''));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.json': 'application/json' };
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
}

test('Request #32 E2E: Aprende y pista muestran singular/plural dirigido sin bloquear fallback', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => server.close(resolve)); });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    window.__multiploApp.setAprendeFactors(1, 8);
    window.__multiploApp.startNewRound(1, { bValues: [8, 8, 8, 8], modalities: [2, 3, 4, 5] });
    window.__multiploApp.navigateTo('aprende');
  });
  await page.waitForSelector('#view-aprende.view-active');
  assert.equal(await page.$eval('#aprende-instruction', (el) => el.textContent), 'Un grupo de ocho manzanas');
  assert.equal(await page.$$eval('#aprende-groups .item-group', (groups) => groups.length), 1);
  assert.equal(await page.$$eval('#aprende-groups .object-img', (items) => items.length), 8);

  await page.click('#btn-aprende-continue');
  await page.waitForSelector('#view-juego.view-active');
  await page.evaluate(() => {
    const round = window.__multiploApp.getQuestionRound();
    round.currentIndex = 2;
    window.__multiploApp.renderCurrentQuestion();
  });
  await page.click('#btn-juego-hint');
  const hint = await page.$eval('#juego-feedback-box', (el) => el.textContent);
  assert.match(hint, /Un grupo de ocho manzanas/);
  assert.equal(await page.$eval('#heading-juego', (el) => el.textContent), '¿Cuánto es 1 × 8?');
  assert.equal(await page.$eval('#juego-groups-container', (el) => el.hidden), false);
  await page.close();
});
