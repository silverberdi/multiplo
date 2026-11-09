import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const projectRoot = process.cwd();

// Servidor HTTP estático simple para pruebas E2E
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

test('E2E Real Browser: Recorrido completo, responsive, accesibilidad y degradación elegante', async (t) => {
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

  await t.test('1. Recorrido completo por las cuatro vistas (inicio -> aprende -> juego -> fin -> inicio)', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // 1. Vista Inicio visible inicialmente
    const isInicioVisible = await page.$eval('#view-inicio', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isInicioVisible, 'La vista Inicio debe estar activa inicialmente');

    // 2. Clic en "¡Jugar!" -> Navega a Vista Aprende
    await page.click('#btn-start-game');
    const isAprendeVisible = await page.$eval('#view-aprende', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isAprendeVisible, 'Al pulsar ¡Jugar!, debe mostrarse la vista Aprende');

    // 3. Clic en "Continuar al juego" -> Navega a Vista Juego
    await page.click('#btn-aprende-continue');
    const isJuegoVisible = await page.$eval('#view-juego', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isJuegoVisible, 'Al continuar desde Aprende, debe mostrarse la vista Juego');

    // 4. Completar las cuatro preguntas de la ronda respondiendo correctamente
    for (let q = 0; q < 4; q++) {
      const qProgress = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
      assert.equal(qProgress, `Pregunta ${q + 1} de 4`);

      const optionBtns = await page.$$('.btn-option');
      assert.equal(optionBtns.length, 3, 'Deben existir exactamente 3 opciones grandes de respuesta');

      const correctIdx = await page.evaluate(() => {
        const curQ = window.__multiploApp.getCurrentQuestion();
        return curQ.alternatives.findIndex((a) => a.isCorrect);
      });
      await optionBtns[correctIdx].click();

      // Clic en Continuar (o Ver fin de ronda en la 4ª)
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    // 5. Cierre de ronda -> Navega a Vista Fin de ronda
    const isFinVisible = await page.$eval('#view-fin', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isFinVisible, 'Al finalizar las cuatro preguntas, debe mostrarse la vista Fin de ronda');

    // 6. Clic en "Volver a niveles" -> Regresa a Vista Inicio
    await page.click('#btn-fin-home');
    const isInicioBack = await page.$eval('#view-inicio', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isInicioBack, 'Al pulsar volver a niveles, debe regresar a la vista Inicio');

    // 7. Navegación directa desde Nivel 1 disponible -> Aprende -> Volver a niveles
    await page.click('#btn-level-1');
    const isAprendeFromLevel1 = await page.$eval('#view-aprende', (el) => !el.hidden);
    assert.ok(isAprendeFromLevel1, 'Pulsar nivel 1 debe abrir Aprende');
    await page.click('#btn-aprende-back');
    const isBackAgain = await page.$eval('#view-inicio', (el) => !el.hidden);
    assert.ok(isBackAgain, 'Pulsar volver en Aprende debe regresar a Inicio');

    await page.close();
  });

  await t.test('2. Comprobación responsive sin desbordamiento en celular, tablet y computador', async () => {
    const page = await browser.newPage();

    const viewports = [
      { name: 'Celular vertical (375x667)', width: 375, height: 667 },
      { name: 'Celular horizontal (667x375)', width: 667, height: 375 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Computador (1280x800)', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      // Verificar en las 4 vistas que scrollWidth <= clientWidth (cero desbordamiento)
      for (const viewId of ['inicio', 'aprende', 'juego', 'fin']) {
        await page.evaluate((v) => window.__multiploApp.navigateTo(v), viewId);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        assert.ok(
          !hasHorizontalOverflow,
          `En ${vp.name} en vista ${viewId} no debe existir desbordamiento horizontal (scrollWidth > clientWidth)`
        );

        // Verificar que los botones primarios son grandes y cómodos para tocar
        const buttonBoxes = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('.btn-primary, .btn-secondary, .btn-option, .level-card'));
          return btns.filter(b => b.offsetParent !== null).map(b => {
            const rect = b.getBoundingClientRect();
            return { width: rect.width, height: rect.height, tag: b.tagName, id: b.id };
          });
        });

        for (const box of buttonBoxes) {
          assert.ok(
            box.height >= 44,
            `En ${vp.name} el botón ${box.id || box.tag} debe tener altura cómoda para tacto (esperado >= 44px, medido ${box.height}px)`
          );
        }
      }
    }

    await page.close();
  });

  await t.test('3. Niveles 2, 3 y 4 bloqueados: no reaccionan a clic ni avanzan', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    for (const levelNum of [2, 3, 4]) {
      const isDisabled = await page.$eval(`#btn-level-${levelNum}`, (el) => el.disabled && el.getAttribute('aria-disabled') === 'true');
      assert.ok(isDisabled, `Nivel ${levelNum} debe estar marcado como disabled y aria-disabled="true"`);

      // Intentar clic y verificar que la vista sigue siendo 'inicio'
      await page.$eval(`#btn-level-${levelNum}`, (el) => el.click());
      const currentView = await page.evaluate(() => window.__multiploApp.getCurrentView());
      assert.equal(currentView, 'inicio', `Hacer clic en nivel ${levelNum} bloqueado no debe cambiar de vista`);
    }

    await page.close();
  });

  await t.test('4. Fallback tipográfico y degradación cuando Google Fonts está bloqueado', async () => {
    const page = await browser.newPage();
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Verificar que la página abre y funciona sin errores
    const titleText = await page.$eval('#heading-inicio', (el) => el.textContent);
    assert.ok(titleText.includes('¡Hola! Soy Múltiplo'));

    // Verificar navegación funcionando bajo fallback
    await page.click('#btn-start-game');
    const isAprendeVisible = await page.$eval('#view-aprende', (el) => !el.hidden);
    assert.ok(isAprendeVisible, 'La navegación debe funcionar normalmente con webfonts bloqueadas');

    await page.close();
  });

  await t.test('5. Conmutador de sonido accesible', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const initialSoundState = await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(initialSoundState, 'true', 'Sonido debe estar activado por defecto');

    await page.click('#btn-sound-toggle');
    const toggledSoundState = await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(toggledSoundState, 'false', 'Al pulsar, sonido debe marcarse como desactivado');

    await page.close();
  });
});
