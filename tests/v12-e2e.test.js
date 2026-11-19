import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = process.cwd();
function server() {
  return http.createServer((request, response) => {
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const file = path.join(root, requested.replace(/^\//, ''));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end(); return; }
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
}

test('v1.2 E2E Chromium: tablas 1..10, Aprende 10×10, ronda mixta y responsive', async (t) => {
  const httpServer = server();
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-gpu'] });
  t.after(async () => { await browser.close(); await new Promise((resolve) => httpServer.close(resolve)); });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 667, isMobile: true });
  await page.goto(`http://127.0.0.1:${httpServer.address().port}/`, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.$$eval('[id^="btn-level-"]', (buttons) => buttons.length), 10);
  await page.evaluate(() => window.__multiploApp.setAprendeFactors(10, 10));
  await page.evaluate(() => window.__multiploApp.startNewRound(1));
  await page.evaluate(() => window.__multiploApp.navigateTo('aprende'));
  assert.equal(await page.$$eval('#aprende-groups .item-group', (groups) => groups.length), 10);
  assert.equal(await page.$$eval('#aprende-groups .object-img', (items) => items.length), 100);
  assert.equal(await page.$eval('#aprende-sum-expression', (element) => element.textContent), '10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 + 10 = 100');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
  await page.click('#btn-aprende-continue');
  await page.waitForSelector('#view-juego.view-active');
  const metadata = await page.evaluate(() => window.__multiploApp.getQuestionRound().questions.map(({ source, modalidad, a, b }) => ({ source, modalidad, a, b })));
  assert.equal(metadata.length, 4);
  assert.equal(metadata.filter((question) => question.source === 'actual').length, 4);
  assert.equal(new Set(metadata.map((question) => question.modalidad)).size, 4);
  await page.close();
});
