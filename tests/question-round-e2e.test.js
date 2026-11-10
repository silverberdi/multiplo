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

/**
 * Comprueba la visibilidad computada real de un elemento en el navegador (display, visibility y rect)
 */
async function isElementVisible(page, selector) {
  return page.$eval(selector, (el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0 &&
      !el.hasAttribute('hidden')
    );
  });
}

/**
 * Comprueba que un elemento está oculto en el navegador según sus estilos computados reales
 */
async function isElementHidden(page, selector) {
  return page.$eval(selector, (el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      rect.width === 0 ||
      rect.height === 0 ||
      el.hasAttribute('hidden')
    );
  });
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
    assert.ok(await isElementVisible(page, '#juego-groups-container'), 'Grupos computados visibles en Q1');
    assert.ok(await isElementHidden(page, '#btn-juego-hint'), 'Botón Pista oculto en Q1 (no hay pista)');
    assert.ok(await isElementHidden(page, '#btn-juego-continue'), 'Botón Continuar oculto antes de responder');

    // Forzar fallo inicial, luego acierto (para verificar primer intento fallido)
    const q1WrongIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => !a.isCorrect);
    });
    const q1Btns = await page.$$('.btn-option');
    await q1Btns[q1WrongIdx].click();

    // Feedback de error no punitivo
    assert.equal(await page.$eval('#mascot-status-juego .status-text', (el) => el.textContent.trim()), 'Pensando');
    assert.ok(await isElementVisible(page, '#juego-feedback-box'), 'Caja de feedback visible tras fallo');
    assert.ok((await page.$eval('#juego-feedback-box', (el) => el.textContent.trim())).includes('Cuenta otra vez'));
    assert.ok(await isElementHidden(page, '#btn-juego-continue'), 'Botón Continuar permanece oculto tras error');

    // Acierto tras reintento
    const q1CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    await q1Btns[q1CorrIdx].click();
    assert.equal(await page.$eval('#mascot-status-juego .status-text', (el) => el.textContent.trim()), '¡Muy bien!');
    assert.ok(await isElementVisible(page, '#btn-juego-continue'), 'Botón Continuar computado visible tras acierto');

    // Continuar a Q2
    await page.click('#btn-juego-continue');

    // --- Pregunta 2 (Modalidad 3: visual) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 2 de 4');
    assert.ok(await isElementVisible(page, '#juego-groups-container'), 'Grupos computados visibles en Q2');
    assert.ok(await isElementHidden(page, '#btn-juego-hint'), 'Botón Pista oculto en Q2 (no hay pista)');
    assert.ok(await isElementHidden(page, '#btn-juego-continue'), 'Botón Continuar oculto antes de responder en Q2');

    const q2CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    const q2Btns = await page.$$('.btn-option');
    await q2Btns[q2CorrIdx].click();
    assert.ok(await isElementVisible(page, '#btn-juego-continue'), 'Botón Continuar visible tras acierto en Q2');
    await page.click('#btn-juego-continue');

    // --- Pregunta 3 (Modalidad 4: multiplicación sin objetos, con pista) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 3 de 4');
    const q3Prompt = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.match(q3Prompt, /^¿Cuánto es \d+ × \d+\?$/, 'Consigna de modalidad 4 debe mostrar notación matemática a × b');
    assert.ok(await isElementHidden(page, '#juego-groups-container'), 'Grupos computados ocultos por defecto en Q3');
    assert.ok(await isElementVisible(page, '#btn-juego-hint'), 'Botón Pista computado visible en Q3');
    assert.ok(await isElementHidden(page, '#btn-juego-continue'), 'Botón Continuar oculto antes de responder en Q3');

    // Pulsar pista en pregunta 3 (modalidad 4)
    await page.click('#btn-juego-hint');
    assert.ok(await isElementVisible(page, '#juego-groups-container'), 'Grupos mostrados computados tras pulsar Pista');
    assert.ok(await isElementVisible(page, '#juego-feedback-box'), 'Caja de feedback visible tras pista');
    assert.ok((await page.$eval('#juego-feedback-box', (el) => el.textContent.trim())).includes('Pista'));

    // Invariante: El encabezado conserva la expresión matemática y no es sobreescrito por la locución
    const q3PromptAfterHint = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.equal(q3PromptAfterHint, q3Prompt, 'Encabezado visible conserva "¿Cuánto es a × b?" tras pista y locución');

    const q3CorrIdx = await page.evaluate(() => {
      return window.__multiploApp.getCurrentQuestion().alternatives.findIndex((a) => a.isCorrect);
    });
    const q3Btns = await page.$$('.btn-option');
    await q3Btns[q3CorrIdx].click();
    assert.ok(await isElementVisible(page, '#btn-juego-continue'), 'Botón Continuar visible tras acierto en Q3');
    await page.click('#btn-juego-continue');

    // --- Pregunta 4 (Modalidad 5: selección de operación por producto) ---
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 4 de 4');
    const q4Prompt = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.match(q4Prompt, /^¿Cuál multiplicación da \d+\?$/, 'Consigna de modalidad 5 debe mostrar total numérico');
    assert.ok(await isElementHidden(page, '#juego-groups-container'), 'Grupos computados ocultos por defecto en Q4');
    assert.ok(await isElementVisible(page, '#btn-juego-hint'), 'Botón Pista computado visible en Q4');
    assert.ok(await isElementHidden(page, '#btn-juego-continue'), 'Botón Continuar oculto antes de responder en Q4');

    // Pista en pregunta 4 (modalidad 5)
    await page.click('#btn-juego-hint');
    assert.ok(await isElementVisible(page, '#juego-groups-container'), 'Grupos de la operación objetivo mostrados tras pista');
    assert.ok(await isElementVisible(page, '#juego-feedback-box'), 'Caja de feedback visible tras pista en Q4');
    assert.ok((await page.$eval('#juego-feedback-box', (el) => el.textContent.trim())).includes('Pista'));

    // Invariante: Encabezado conserva el total numérico y no es sobreescrito por spokenPrompt
    const q4PromptAfterHint = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.equal(q4PromptAfterHint, q4Prompt, 'Encabezado visible conserva total numérico tras pista y locución');

    // Verificar que solo la opción con el producto correcto es aceptada
    const q4CorrIdx = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.product === q.product);
    });
    const q4Btns = await page.$$('.btn-option');
    await q4Btns[q4CorrIdx].click();

    // Botón para finalizar ronda
    assert.ok(await isElementVisible(page, '#btn-juego-continue'), 'Botón Continuar visible tras acierto');
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
      assert.ok(await isElementVisible(page, '#btn-juego-continue'), 'Continuar es visible tras acierto');
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

      // 1. Estado Pregunta 1 visual (Q1)
      const noOverflowQ1 = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowQ1, `Sin overflow horizontal en ${vp.name} durante pregunta visual`);
      assert.ok(await isElementHidden(page, '#btn-juego-hint'), `Botón Pista computado oculto en ${vp.name} en Q1 (sin pista)`);
      assert.ok(await isElementVisible(page, '#juego-groups-container'), `Grupos visibles en ${vp.name} en Q1`);
      assert.ok(await isElementHidden(page, '#btn-juego-continue'), `Continuar oculto en ${vp.name} antes de responder`);

      // 2. Estado error/reintento en Q1
      const wrongIdx = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => !a.isCorrect));
      const btnsQ1 = await page.$$('.btn-option');
      await btnsQ1[wrongIdx].click();
      assert.ok(await isElementVisible(page, '#juego-feedback-box'), `Feedback visible en error en ${vp.name}`);
      assert.ok(await isElementHidden(page, '#btn-juego-continue'), `Continuar sigue oculto tras error en ${vp.name}`);
      const noOverflowError = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowError, `Sin overflow horizontal en ${vp.name} durante error`);

      // 3. Estado acierto en Q1
      const corrIdxQ1 = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => a.isCorrect));
      await btnsQ1[corrIdxQ1].click();
      assert.ok(await isElementVisible(page, '#btn-juego-continue'), `Continuar visible tras acierto en ${vp.name}`);
      const noOverflowSuccess = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowSuccess, `Sin overflow horizontal en ${vp.name} durante acierto`);

      // Avanzar a Q2
      await page.click('#btn-juego-continue');

      // 4. Pregunta 2 visual (Q2)
      assert.ok(await isElementHidden(page, '#btn-juego-hint'), `Botón Pista computado oculto en ${vp.name} en Q2 (sin pista)`);
      const corrIdxQ2 = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => a.isCorrect));
      const btnsQ2 = await page.$$('.btn-option');
      await btnsQ2[corrIdxQ2].click();
      await page.click('#btn-juego-continue');

      // 5. Pregunta 3 (Modalidad 4: multiplicación sin objetos, con pista)
      assert.ok(await isElementHidden(page, '#juego-groups-container'), `Grupos computados ocultos en modalidad 4 en ${vp.name}`);
      assert.ok(await isElementVisible(page, '#btn-juego-hint'), `Botón Pista computado visible en modalidad 4 en ${vp.name}`);
      // Pulsar Pista en modalidad 4
      await page.click('#btn-juego-hint');
      assert.ok(await isElementVisible(page, '#juego-groups-container'), `Grupos computados visibles tras pista en modalidad 4 en ${vp.name}`);
      const noOverflowHintQ3 = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowHintQ3, `Sin overflow horizontal en ${vp.name} durante pista en modalidad 4`);

      const corrIdxQ3 = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().alternatives.findIndex(a => a.isCorrect));
      const btnsQ3 = await page.$$('.btn-option');
      await btnsQ3[corrIdxQ3].click();
      await page.click('#btn-juego-continue');

      // 6. Pregunta 4 (Modalidad 5: selección de operación, con pista)
      assert.ok(await isElementHidden(page, '#juego-groups-container'), `Grupos computados ocultos en modalidad 5 en ${vp.name}`);
      assert.ok(await isElementVisible(page, '#btn-juego-hint'), `Botón Pista computado visible en modalidad 5 en ${vp.name}`);
      // Pulsar Pista en modalidad 5
      await page.click('#btn-juego-hint');
      assert.ok(await isElementVisible(page, '#juego-groups-container'), `Grupos computados visibles tras pista en modalidad 5 en ${vp.name}`);
      const noOverflowHintQ4 = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowHintQ4, `Sin overflow horizontal en ${vp.name} durante pista en modalidad 5`);

      const corrIdxQ4 = await page.evaluate(() => {
        const q = window.__multiploApp.getCurrentQuestion();
        return q.alternatives.findIndex(a => a.product === q.product);
      });
      const btnsQ4 = await page.$$('.btn-option');
      await btnsQ4[corrIdxQ4].click();
      assert.ok(await isElementVisible(page, '#btn-juego-continue'), `Continuar visible tras acierto en modalidad 5`);
      await page.click('#btn-juego-continue');

      // 7. Estado cierre / Fin de ronda
      await page.waitForSelector('#view-fin.view-active');
      const noOverflowFin = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      assert.ok(noOverflowFin, `Sin overflow horizontal en ${vp.name} durante fin`);
    }

    await page.close();
  });

  await t.test('5. Tolerancia a localStorage corrupto: inicio de juego y creación de ronda con "[null]" y "[{\\"a\\":2},null]"', async () => {
    const page = await browser.newPage();

    // Probar con '[null]'
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.setItem('multiplo_failed_operations', '[null]');
    });

    // Iniciar juego desde inicio: no debe lanzar TypeError y debe crear la ronda
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Continuar a la vista Juego
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Verificar que la ronda y preguntas se crearon correctamente
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 1 de 4');
    const qCount1 = await page.evaluate(() => window.__multiploApp.getCurrentRound().questions.length);
    assert.equal(qCount1, 4, 'La ronda debe tener 4 preguntas a pesar de "[null]" en localStorage');

    // Volver a inicio
    await page.click('#btn-juego-back');
    await page.waitForSelector('#view-inicio.view-active');

    // Probar con '[{"a":2},null]'
    await page.evaluate(() => {
      localStorage.setItem('multiplo_failed_operations', '[{"a":2},null]');
    });

    // Iniciar juego nuevamente
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Continuar a Juego
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Verificar que la ronda y preguntas se crearon correctamente
    assert.equal(await page.$eval('#game-progress-text', (el) => el.textContent.trim()), 'Pregunta 1 de 4');
    const qCount2 = await page.evaluate(() => window.__multiploApp.getCurrentRound().questions.length);
    assert.equal(qCount2, 4, 'La ronda debe tener 4 preguntas a pesar de "[{\\"a\\":2},null]" en localStorage');

    // Limpiar localStorage
    await page.evaluate(() => {
      localStorage.removeItem('multiplo_failed_operations');
    });

    await page.close();
  });
});
