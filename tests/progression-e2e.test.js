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

test('E2E Level Progression: Umbral 3/4, persistencia en localStorage, aislamiento y Nivel 4', async (t) => {
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

  await t.test('1. Ronda Nivel 1 con 3/4 aciertos en primer intento: desbloquea Nivel 2 y persiste tras recarga', async () => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Estado inicial: solo Nivel 1 disponible
    const lvl1Disabled = await page.$eval('#btn-level-1', (el) => el.disabled);
    const lvl2Disabled = await page.$eval('#btn-level-2', (el) => el.disabled);
    assert.equal(lvl1Disabled, false, 'Nivel 1 debe estar disponible');
    assert.equal(lvl2Disabled, true, 'Nivel 2 debe estar bloqueado inicialmente');

    // Iniciar Nivel 1
    await page.click('#btn-level-1');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Responder las cuatro preguntas: Q0 correcta, Q1 fallo + reintento correcto, Q2 correcta, Q3 correcta (total 3/4 en primer intento)
    for (let q = 0; q < 4; q++) {
      await page.waitForSelector('#juego-options-grid .btn-option');
      const optionBtns = await page.$$('#juego-options-grid .btn-option');

      const { correctIdx, wrongIdx } = await page.evaluate(() => {
        const curQ = window.__multiploApp.getCurrentQuestion();
        const cIdx = curQ.alternatives.findIndex((a) => a.isCorrect);
        const wIdx = curQ.alternatives.findIndex((a) => !a.isCorrect);
        return { correctIdx: cIdx, wrongIdx: wIdx };
      });

      if (q === 1) {
        // En Q1: primero fallar a propósito para verificar reintento
        await optionBtns[wrongIdx].click();
        await page.waitForSelector('.feedback-retry');
        // Luego acertar
        await optionBtns[correctIdx].click();
      } else {
        await optionBtns[correctIdx].click();
      }

      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    // Llegada a vista Fin
    await page.waitForSelector('#view-fin.view-active');
    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 3 de 4');

    const unlockText = await page.$eval('#fin-unlock-text', (el) => el.textContent.trim());
    assert.match(unlockText, /Nivel 2/, 'Debe notificar el desbloqueo del Nivel 2');

    const btnNextVisible = await page.$eval('#btn-fin-next', (el) => !el.hidden);
    assert.equal(btnNextVisible, true, 'Debe ofrecer botón de jugar Nivel 2');

    // Volver a inicio
    await page.click('#btn-fin-home');
    await page.waitForSelector('#view-inicio.view-active');

    // Nivel 2 ahora debe estar desbloqueado y disponible
    const lvl2AfterUnlock = await page.$eval('#btn-level-2', (el) => ({
      disabled: el.disabled,
      ariaDisabled: el.getAttribute('aria-disabled'),
      isUnlockedClass: el.classList.contains('level-unlocked'),
      badgeText: el.querySelector('.level-badge')?.textContent.trim()
    }));
    assert.equal(lvl2AfterUnlock.disabled, false, 'Nivel 2 no debe estar deshabilitado');
    assert.equal(lvl2AfterUnlock.ariaDisabled, null, 'Nivel 2 no debe tener aria-disabled="true"');
    assert.equal(lvl2AfterUnlock.isUnlockedClass, true, 'Nivel 2 debe tener clase level-unlocked');
    assert.equal(lvl2AfterUnlock.badgeText, 'Disponible');

    // Recargar la página en el mismo contexto de navegador para verificar persistencia en localStorage
    await page.reload({ waitUntil: 'domcontentloaded' });
    const lvl2AfterReload = await page.$eval('#btn-level-2', (el) => ({
      disabled: el.disabled,
      isUnlockedClass: el.classList.contains('level-unlocked')
    }));
    assert.equal(lvl2AfterReload.disabled, false, 'Nivel 2 debe conservarse abierto tras recargar');
    assert.equal(lvl2AfterReload.isUnlockedClass, true);

    await page.close();
    await context.close();
  });

  await t.test('2. Aislamiento entre navegadores: el progreso no se comparte entre contextos separados', async () => {
    // Contexto A: desbloquea Nivel 2
    const contextA = await browser.createBrowserContext();
    const pageA = await contextA.newPage();
    await pageA.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await pageA.evaluate(() => {
      window.__multiploApp.setHighestUnlockedLevel(2);
    });
    const lvl2InA = await pageA.$eval('#btn-level-2', (el) => el.disabled);
    assert.equal(lvl2InA, false, 'En contexto A el Nivel 2 debe estar disponible');

    // Contexto B: navegador independiente / incógnito sin progreso
    const contextB = await browser.createBrowserContext();
    const pageB = await contextB.newPage();
    await pageB.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const lvl2InB = await pageB.$eval('#btn-level-2', (el) => el.disabled);
    assert.equal(lvl2InB, true, 'En contexto B independiente el Nivel 2 debe permanecer bloqueado');

    await pageA.close();
    await pageB.close();
    await contextA.close();
    await contextB.close();
  });

  await t.test('3. Caso de umbral insuficiente: 2 aciertos iniciales + 2 corregidos no desbloquean Nivel 2', async () => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.click('#btn-level-1');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Responder: Q0 correcta, Q1 correcta, Q2 fallo + corrección, Q3 fallo + corrección (2/4 en primer intento)
    for (let q = 0; q < 4; q++) {
      await page.waitForSelector('#juego-options-grid .btn-option');
      const optionBtns = await page.$$('#juego-options-grid .btn-option');

      const { correctIdx, wrongIdx } = await page.evaluate(() => {
        const curQ = window.__multiploApp.getCurrentQuestion();
        const cIdx = curQ.alternatives.findIndex((a) => a.isCorrect);
        const wIdx = curQ.alternatives.findIndex((a) => !a.isCorrect);
        return { correctIdx: cIdx, wrongIdx: wIdx };
      });

      if (q >= 2) {
        // Preguntas 2 y 3: fallo inicial + reintento correcto
        await optionBtns[wrongIdx].click();
        await page.waitForSelector('.feedback-retry');
        await optionBtns[correctIdx].click();
      } else {
        await optionBtns[correctIdx].click();
      }

      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    await page.waitForSelector('#view-fin.view-active');
    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 2 de 4');

    const btnNextHidden = await page.$eval('#btn-fin-next', (el) => el.hidden);
    assert.equal(btnNextHidden, true, 'No debe ofrecer pasar al siguiente nivel con 2/4');

    await page.click('#btn-fin-home');
    await page.waitForSelector('#view-inicio.view-active');

    const lvl2Disabled = await page.$eval('#btn-level-2', (el) => el.disabled);
    assert.equal(lvl2Disabled, true, 'Nivel 2 debe permanecer bloqueado tras ronda insuficiente');

    await page.close();
    await context.close();
  });

  await t.test('4. Cierre en Nivel 4: no ofrece Nivel 5 y permite repetir sin bloquear niveles ya abiertos', async () => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Habilitar todos los niveles hasta el 4
    await page.evaluate(() => {
      window.__multiploApp.setHighestUnlockedLevel(4);
    });

    // Iniciar Nivel 4
    await page.click('#btn-level-4');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Responder 4/4 correctas en Nivel 4
    for (let q = 0; q < 4; q++) {
      await page.waitForSelector('#juego-options-grid .btn-option');
      const optionBtns = await page.$$('#juego-options-grid .btn-option');

      const correctIdx = await page.evaluate(() => {
        const curQ = window.__multiploApp.getCurrentQuestion();
        return curQ.alternatives.findIndex((a) => a.isCorrect);
      });

      await optionBtns[correctIdx].click();
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    await page.waitForSelector('#view-fin.view-active');

    // Botón de siguiente nivel debe estar oculto (invariante: MVP tiene exactamente 4 niveles, sin Nivel 5)
    const btnNextHidden = await page.$eval('#btn-fin-next', (el) => el.hidden);
    assert.equal(btnNextHidden, true, 'No debe existir ni ofrecerse Nivel 5');

    const existsBtnLevel5 = await page.evaluate(() => Boolean(document.getElementById('btn-level-5')));
    assert.equal(existsBtnLevel5, false, 'No debe existir el elemento #btn-level-5');

    // Probar acción de repetir ronda
    await page.click('#btn-fin-repeat');
    await page.waitForSelector('#view-aprende.view-active');
    const roundLevel = await page.evaluate(() => window.__multiploApp.getCurrentRound().level);
    assert.equal(roundLevel, 4, 'Repetir ronda debe reiniciar el nivel 4');

    // Volver a inicio y verificar que todos los 4 niveles siguen abiertos
    await page.click('#btn-aprende-back');
    await page.waitForSelector('#view-inicio.view-active');

    for (const lvl of [1, 2, 3, 4]) {
      const isUnlocked = await page.$eval(`#btn-level-${lvl}`, (el) => !el.disabled);
      assert.equal(isUnlocked, true, `Nivel ${lvl} debe permanecer desbloqueado tras repetición`);
    }

    await page.close();
    await context.close();
  });

  await t.test('5. Tolerancia a localStorage corrupto o almacenamiento ausente', async () => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    // Inyectar datos corruptos antes de cargar la aplicación
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('multiplo_progression_v1', '{corrupt-json-123!!!');
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // La aplicación debe arrancar de forma segura en Nivel 1 sin colapsar
    const lvl1Disabled = await page.$eval('#btn-level-1', (el) => el.disabled);
    const lvl2Disabled = await page.$eval('#btn-level-2', (el) => el.disabled);
    assert.equal(lvl1Disabled, false);
    assert.equal(lvl2Disabled, true);

    // Debe mostrar advertencia segura para adulto
    const bannerVisible = await page.$eval('#storage-status-banner', (el) => !el.hidden && el.textContent.length > 0);
    assert.equal(bannerVisible, true, 'Debe mostrar aviso apto para adulto ante datos corruptos');

    // El juego continúa siendo 100% jugable
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    await page.close();
    await context.close();
  });
});
