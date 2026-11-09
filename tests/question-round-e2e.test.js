import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const projectRoot = process.cwd();

function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.wav': 'audio/wav',
  };

  const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const filePath = path.join(projectRoot, reqPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return server;
}

test('E2E Question Round Engine: Modalidades, pistas, primer intento inmutable, fallback y responsive', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/`;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  t.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  await t.test('1. Ronda completa: cuatro modalidades en orden, pista en Q4 y Q5, evaluación por producto y resumen 3/4', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Iniciar juego desde inicio
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Continuar al juego
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // --- Pregunta 1 (Modalidad 2: visual) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 1 de 4');
    assert.equal(await page.$eval('#juego-groups-container', (el) => !el.hidden), true, 'Grupos visibles en Q1');

    // Forzar fallo inicial, luego acierto (para verificar primer intento fallido)
    const q1WrongIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => !a.isCorrect);
    });
    const q1Btns = await page.$$('.btn-option');
    await q1Btns[q1WrongIdx].click();

    // Feedback de error no punitivo
    assert.equal(await page.$eval('#mascot-status-juego .status-text', (el) => el.textContent.trim()), 'Pensando');
    assert.ok((await page.$eval('#juego-feedback-box', (el) => el.textContent.trim())).includes('Cuenta otra vez'));

    // Acierto tras reintento
    const q1CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    await q1Btns[q1CorrIdx].click();
    assert.equal(await page.$eval('#mascot-status-juego .status-text', (el) => el.textContent.trim()), '¡Muy bien!');

    // Continuar a Q2
    await page.click('#btn-juego-continue');

    // --- Pregunta 2 (Modalidad 3: visual) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 2 de 4');
    assert.equal(await page.$eval('#juego-groups-container', (el) => !el.hidden), true, 'Grupos visibles en Q2');
    const q2CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    const q2Btns = await page.$$('.btn-option');
    await q2Btns[q2CorrIdx].click();
    await page.click('#btn-juego-continue');

    // --- Pregunta 3 (Modalidad 4: multiplicación sin objetos, con pista) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 3 de 4');
    assert.equal(await page.$eval('#juego-groups-container', (el) => el.hidden), true, 'Grupos ocultos por defecto en Q3');
    assert.equal(await page.$eval('#btn-juego-hint', (el) => !el.hidden), true, 'Botón Pista visible en Q3');

    // Pulsar pista
    await page.click('#btn-juego-hint');
    assert.equal(await page.$eval('#juego-groups-container', (el) => !el.hidden), true, 'Grupos mostrados tras pulsar Pista');
    assert.ok((await page.$eval('#juego-feedback-box', (el) => el.textContent.trim())).includes('Pista'));

    const q3CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    const q3Btns = await page.$$('.btn-option');
    await q3Btns[q3CorrIdx].click();
    await page.click('#btn-juego-continue');

    // --- Pregunta 4 (Modalidad 5: selección de operación por producto) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 4 de 4');
    const q4Prompt = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.ok(q4Prompt.includes('¿Cuál multiplicación da'), 'Consigna de modalidad 5');

    // Pista en pregunta 5
    await page.click('#btn-juego-hint');
    assert.equal(await page.$eval('#juego-groups-container', (el) => !el.hidden), true, 'Grupos de la operación objetivo mostrados');

    // Verificar que solo la opción con el producto correcto es aceptada
    const q4CorrIdx = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.product === q.product);
    });
    const q4Btns = await page.$$('.btn-option');
    await q4Btns[q4CorrIdx].click();

    // Botón para finalizar ronda
    assert.equal(await page.$eval('#btn-juego-continue', (el) => el.textContent.trim()), 'Ver fin de ronda');
    await page.click('#btn-juego-continue');
    await page.waitForSelector('#view-fin.view-active');

    // --- Vista Fin: Resumen inmutable ---
    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 3 de 4');

    // Invariante: Q1 no fue acertada al primer intento a pesar del reintento exitoso
    const q1Data = await page.evaluate(() => window.__multiploApp.getCurrentRound().questions[0]);
    assert.equal(q1Data.firstAttemptCorrect, false, 'Primer intento de Q1 permanece false');

    await page.close();
  });

  await t.test('2. Ronda incompleta y retorno a Inicio: no corrompe la siguiente ronda', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Volver a inicio desde el juego antes de terminar la ronda
    await page.click('#btn-juego-back');
    await page.waitForSelector('#view-inicio.view-active');

    // Iniciar nueva ronda limpia
    await page.click('#btn-level-1');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 1 de 4');
    await page.close();
  });

  await t.test('3. Degradación elegante: ejecución completa en modo silencioso y sin speechSynthesis', async () => {
    const page = await browser.newPage();
    // Simular ausencia de speechSynthesis
    await page.evaluateOnNewDocument(() => {
      delete window.speechSynthesis;
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Activar modo silencioso
    await page.click('#btn-sound-toggle');
    assert.equal(await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed')), 'false');

    // Jugar ronda completa sin sonido ni voz
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    for (let i = 0; i < 4; i++) {
      const corrIdx = await page.evaluate(() => {
        const q = window.__multiploApp.getCurrentQuestion();
        return q.alternatives.findIndex((a) => a.isCorrect);
      });
      const btns = await page.$$('.btn-option');
      await btns[corrIdx].click();
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    await page.waitForSelector('#view-fin.view-active');
    const score = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(score, 'Aciertos al primer intento: 4 de 4');

    await page.close();
  });

  await t.test('4. Verificación responsive en celular (375x667), tablet (768x1024) y computador (1280x800) en todos los estados de Juego', async () => {
    const page = await browser.newPage();
    const viewports = [
      { name: 'Celular (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Computador (1280x800)', width: 1280, height: 800 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => window.__multiploApp.navigateTo('juego'));

      // 1. Estado pregunta visual (Q1)
      const noOverflowQ1 = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowQ1, `Sin overflow horizontal en ${vp.name} durante pregunta visual`);

      // 2. Estado Pista mostrada
      await page.click('#btn-juego-hint');
      const noOverflowHint = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowHint, `Sin overflow horizontal en ${vp.name} durante pista`);

      // 3. Estado error/reintento
      const wrongIdx = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => !a.isCorrect));
      const btns = await page.$$('.btn-option');
      await btns[wrongIdx].click();
      const noOverflowError = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowError, `Sin overflow horizontal en ${vp.name} durante error`);

      // 4. Estado acierto
      const corrIdx = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => a.isCorrect));
      await btns[corrIdx].click();
      const noOverflowSuccess = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowSuccess, `Sin overflow horizontal en ${vp.name} durante acierto`);

      // 5. Estado cierre / Fin de ronda
      await page.evaluate(() => window.__multiploApp.navigateTo('fin'));
      const noOverflowFin = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowFin, `Sin overflow horizontal en ${vp.name} durante fin`);
    }

    await page.close();
  });
});
