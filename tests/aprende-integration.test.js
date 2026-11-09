import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const projectRoot = process.cwd();

// Servidor estático HTTP para pruebas E2E con soporte MIME completo
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

test('E2E Aprende: Demostración visual, correspondencia matemática, voz, degradación y responsive', async (t) => {
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

  await t.test('1. Caso canónico determinista 3×2: tres grupos de dos, 2+2+2=6, 3×2=6, sin demo estática duplicada', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Fijar factores deterministas 3×2 antes de abrir Aprende
    await page.evaluate(() => {
      window.__multiploApp.setAprendeFactors(3, 2);
    });

    // Iniciar actividad
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Verificar que solo hay un contenedor semántico y ninguna demo estática duplicada
    const demoContainers = await page.$$('#aprende-content');
    assert.equal(demoContainers.length, 1, 'Debe haber exactamente un contenedor semántico');
    const oldStaticContainers = await page.$$('.groups-container:not(#aprende-groups)');
    assert.equal(oldStaticContainers.length, 0, 'No debe existir un segundo contenedor de grupos estático');

    // Comprobar texto de instrucción
    const instruction = await page.$eval('#aprende-instruction', (el) => el.textContent.trim());
    assert.equal(instruction, 'Tres grupos de dos manzanas');

    // Comprobar grupos y manzanas
    const groups = await page.$$('#aprende-groups .item-group');
    assert.equal(groups.length, 3, 'Deben existir exactamente 3 grupos');

    for (const group of groups) {
      const apples = await group.$$('img.object-img');
      assert.equal(apples.length, 2, 'Cada grupo debe contener exactamente 2 manzanas');
      for (const apple of apples) {
        const src = await apple.evaluate((el) => el.getAttribute('src'));
        assert.equal(src, 'assets/objects/manzana.svg');
      }
    }

    // Comprobar expresiones matemáticas
    const sumExpr = await page.$eval('#aprende-sum-expression', (el) => el.textContent.trim());
    assert.equal(sumExpr, '2 + 2 + 2 = 6');

    const multExpr = await page.$eval('#aprende-mult-expression', (el) => el.textContent.trim());
    assert.equal(multExpr, '3 × 2 = 6');

    // Comprobar narración verbal derivada y equivalencia con lo visible
    const lastSpoken = await page.evaluate(() => window.__multiploApp.guide.getLastInstruction());
    assert.equal(
      lastSpoken,
      'Mira: tres grupos de dos manzanas. Dos más dos más dos son seis. Tres por dos son seis.'
    );

    await page.close();
  });

  await t.test('2. Variación de segundo factor: verificar con b distinto (3×4) que cantidades en DOM y voz son idénticas', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Fijar factores deterministas 3×4
    await page.evaluate(() => {
      window.__multiploApp.setAprendeFactors(3, 4);
    });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Verificar texto visible
    const instruction = await page.$eval('#aprende-instruction', (el) => el.textContent.trim());
    assert.equal(instruction, 'Tres grupos de cuatro manzanas');

    const sumExpr = await page.$eval('#aprende-sum-expression', (el) => el.textContent.trim());
    assert.equal(sumExpr, '4 + 4 + 4 = 12');

    const multExpr = await page.$eval('#aprende-mult-expression', (el) => el.textContent.trim());
    assert.equal(multExpr, '3 × 4 = 12');

    // Grupos y manzanas
    const groups = await page.$$('#aprende-groups .item-group');
    assert.equal(groups.length, 3);
    for (const group of groups) {
      const apples = await group.$$('img.object-img');
      assert.equal(apples.length, 4);
    }

    // Comprobar narración verbal y equivalencia
    const lastSpoken = await page.evaluate(() => window.__multiploApp.guide.getLastInstruction());
    assert.equal(
      lastSpoken,
      'Mira: tres grupos de cuatro manzanas. Cuatro más cuatro más cuatro son doce. Tres por cuatro son doce.'
    );

    // Ambas fuentes comunican las mismas cantidades: 3 grupos, 4 por grupo, producto 12
    assert.ok(lastSpoken.includes('tres grupos de cuatro'));
    assert.ok(lastSpoken.includes('son doce'));

    await page.close();
  });

  await t.test('3. Aprende ocurre una sola vez, transición mediante Continuar sin modificar estrellas ni evaluar', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Verificar estado de ronda en Aprende
    const roundBeforeContinue = await page.evaluate(() => {
      const r = window.__multiploApp.getCurrentRound();
      return { stars: r.stars, demoShown: r.demonstrationShown };
    });
    assert.equal(roundBeforeContinue.stars, 0, 'Aprende no otorga estrellas');
    assert.equal(roundBeforeContinue.demoShown, true);

    // Pulsar "Continuar al juego"
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Verificar que estrellas siguen en 0 y que la vista visible es juego
    const roundAfterContinue = await page.evaluate(() => {
      const r = window.__multiploApp.getCurrentRound();
      return { stars: r.stars, view: window.__multiploApp.getCurrentView() };
    });
    assert.equal(roundAfterContinue.stars, 0, 'Las estrellas permanecen intactas en 0 al pasar al juego');
    assert.equal(roundAfterContinue.view, 'juego');

    // Verificar que en la vista de juego no se vuelve a mostrar Aprende
    const isAprendeHidden = await page.$eval('#view-aprende', (el) => el.hidden);
    assert.ok(isAprendeHidden, 'La vista Aprende debe estar oculta mientras se juega');

    await page.close();
  });

  await t.test('4. Estado visual hablando.svg de la estrella durante la narración y recursos versionados', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Simular voz en speechSynthesis que mantiene el estado hablando
    await page.evaluate(() => {
      window.__multiploApp.setAprendeFactors(2, 3);
      // Mock de SpeechSynthesis que dispara onstart
      const originalSpeak = window.speechSynthesis ? window.speechSynthesis.speak : null;
      window.__multiploApp.guide.utteranceFactory = (text) => {
        const u = { text };
        setTimeout(() => {
          if (u.onstart) u.onstart();
        }, 10);
        return u;
      };
      window.__multiploApp.guide.speechSynthesis = {
        getVoices: () => [{ name: 'Voz ES', lang: 'es-ES' }],
        speak: () => {},
        cancel: () => {}
      };
    });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Dar un breve tiempo para que onstart se dispare
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verificar que la mascota en Aprende muestra hablando.svg
    const mascotSrc = await page.$eval('#mascot-img-aprende', (el) => el.getAttribute('src'));
    assert.equal(mascotSrc, 'assets/mascot/hablando.svg', 'La mascota debe usar assets/mascot/hablando.svg durante la narración');

    const mascotTagState = await page.$eval('#mascot-status-aprende', (el) => el.getAttribute('data-state'));
    assert.equal(mascotTagState, 'hablando');

    await page.close();
  });

  await t.test('5. Fallback no bloqueante: ejecución completa con speechSynthesis ausente (sin voz)', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Inhabilitar síntesis de voz completamente
    await page.evaluate(() => {
      window.__multiploApp.guide.speechSynthesis = null;
      window.__multiploApp.guide.utteranceFactory = null;
    });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Texto visible y botón Continuar disponibles inmediatamente
    const instruction = await page.$eval('#aprende-instruction', (el) => el.textContent.trim());
    assert.ok(instruction.length > 0, 'El texto debe estar visible');

    const continueBtnDisabled = await page.$eval('#btn-aprende-continue', (el) => el.disabled);
    assert.equal(continueBtnDisabled, false, 'El botón Continuar no debe bloquearse ante la ausencia de voz');

    // Avanzar sin error
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');
    const isJuegoActive = await page.$eval('#view-juego', (el) => !el.hidden && el.classList.contains('view-active'));
    assert.ok(isJuegoActive, 'Debe avanzar a juego sin interrupción');

    await page.close();
  });

  await t.test('6. Fallback no bloqueante: ejecución con sonido silenciado (modo silencioso)', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Silenciar sonido desde el botón de la cabecera
    await page.click('#btn-sound-toggle');
    const isMuted = await page.evaluate(() => !window.__multiploApp.isSoundEnabled());
    assert.ok(isMuted, 'El sonido debe estar silenciado');

    // Navegar a Aprende
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // El texto permanece visible
    const instruction = await page.$eval('#aprende-instruction', (el) => el.textContent.trim());
    assert.ok(instruction.length > 0);

    // Continuar al juego
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');
    const isJuego = await page.$eval('#view-juego', (el) => !el.hidden);
    assert.ok(isJuego, 'Debe poder continuar inmediatamente en modo silencioso');

    await page.close();
  });

  await t.test('7. Comprobación responsive sin desbordamiento horizontal en celular, tablet y computador (máximo 5×5)', async () => {
    const viewports = [
      { name: 'Celular', width: 360, height: 740 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Computador', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      // Probar el caso de máxima densidad: 5 grupos de 5 manzanas (25 manzanas)
      await page.evaluate(() => {
        window.__multiploApp.setAprendeFactors(5, 5);
      });

      await page.click('#btn-start-game');
      await page.waitForSelector('#view-aprende.view-active');

      // Verificar que no hay desbordamiento horizontal en body ni en contenedor de demo
      const overflowInfo = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const demo = document.getElementById('aprende-content');
        return {
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
          docScrollWidth: docEl.scrollWidth,
          docClientWidth: docEl.clientWidth,
          demoScrollWidth: demo ? demo.scrollWidth : 0,
          demoClientWidth: demo ? demo.clientWidth : 0,
        };
      });

      assert.ok(
        overflowInfo.bodyScrollWidth <= overflowInfo.bodyClientWidth + 1,
        `En ${vp.name} no debe haber scroll horizontal en body (scrollWidth: ${overflowInfo.bodyScrollWidth}, clientWidth: ${overflowInfo.bodyClientWidth})`
      );

      assert.ok(
        overflowInfo.demoScrollWidth <= overflowInfo.demoClientWidth + 1,
        `En ${vp.name} el contenedor de Aprende no debe desbordar horizontalmente (scrollWidth: ${overflowInfo.demoScrollWidth}, clientWidth: ${overflowInfo.demoClientWidth})`
      );

      // Botón Continuar debe tener tamaño táctil accesible (>= 44px)
      const btnRect = await page.$eval('#btn-aprende-continue', (el) => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });
      assert.ok(btnRect.height >= 44, `En ${vp.name} el botón Continuar debe medir al menos 44px de alto`);

      await page.close();
    }
  });

  await t.test('8. Accesibilidad: soporte de prefers-reduced-motion', async () => {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // Verificar que la animación está deshabilitada bajo movimiento reducido
    const animName = await page.$eval('#aprende-content', (el) => {
      const style = window.getComputedStyle(el);
      return style.animationName;
    });
    assert.equal(animName, 'none', 'Bajo prefers-reduced-motion, la animación debe estar desactivada');

    await page.close();
  });
});
