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

test('E2E Celebración de aciertos, cuatro estrellas y cierre de ronda', async (t) => {
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

  await t.test('1. Ronda completa 4/4 estrellas: acierto inmediato, 4 posiciones estrella premio, Siguiente nivel', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Iniciar Nivel 1
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Responder las 4 preguntas correctamente al primer intento
    for (let i = 0; i < 4; i++) {
      const corrIdx = await page.evaluate(() => {
        const q = window.__multiploApp.getCurrentQuestion();
        if (q.modalidad === 5) {
          return q.alternatives.findIndex((a) => a.product === q.product);
        }
        return q.alternatives.findIndex((a) => a.isCorrect);
      });

      const btns = await page.$$('.btn-option');
      await btns[corrIdx].click();

      // Continuar inmediatamente disponible sin bloqueo
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      const isContinueVisible = await page.$eval('#btn-juego-continue', (el) => !el.hidden);
      assert.equal(isContinueVisible, true, `Botón Continuar debe estar disponible de inmediato en Q${i + 1}`);

      await page.click('#btn-juego-continue');
    }

    // Llegada a vista Fin
    await page.waitForSelector('#view-fin.view-active');

    // 1. Mascota celebrando
    const finMascotSrc = await page.$eval('#mascot-img-fin', (el) => el.getAttribute('src'));
    assert.ok(finMascotSrc.includes('assets/mascot/celebrando.svg'), 'Debe usar celebrando.svg');

    // 2. Cuatro posiciones de estrella premio
    const starSlots = await page.$$eval('#fin-stars-container .star-slot', (els) =>
      els.map((el) => ({
        earned: el.getAttribute('data-earned'),
        index: el.getAttribute('data-star-index'),
        hasEarnedClass: el.classList.contains('star-slot-earned'),
        imgSrc: el.querySelector('img')?.getAttribute('src'),
        altText: el.querySelector('img')?.getAttribute('alt'),
        badgeText: el.querySelector('.star-badge')?.textContent.trim()
      }))
    );

    assert.equal(starSlots.length, 4, 'Deben existir exactamente 4 posiciones de estrella');
    for (let i = 0; i < 4; i++) {
      assert.equal(starSlots[i].earned, 'true', `Estrella ${i + 1} debe estar obtenida`);
      assert.equal(starSlots[i].hasEarnedClass, true);
      assert.ok(starSlots[i].imgSrc.includes('assets/icons/estrella-premio.svg'));
      assert.match(starSlots[i].altText, /estrella obtenida/i);
      assert.match(starSlots[i].badgeText, /Obtenida/i);
    }

    // 3. Conteo visible de estrellas y resumen de primer intento
    const starsCount = await page.$eval('#fin-stars-count', (el) => el.textContent.trim());
    assert.equal(starsCount, '4 de 4 estrellas');

    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 4 de 4');

    // 4. Botón Siguiente nivel visible
    const nextBtnVisible = await page.$eval('#btn-fin-next', (el) => !el.hidden);
    assert.equal(nextBtnVisible, true, 'Debe ofrecer botón Siguiente nivel');
    const nextBtnText = await page.$eval('#btn-fin-next', (el) => el.textContent.trim());
    assert.match(nextBtnText, /Siguiente nivel/i);

    await page.close();
  });

  await t.test('2. Caso 2/4 aciertos (reintentos corregidos): 2 estrellas, mensaje positivo, sin Siguiente nivel y Repetir', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Q1: Error primero, luego acierto
    let wrongIdx0 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product !== q.product : !a.isCorrect));
    });
    let corrIdx0 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
    });
    let btns = await page.$$('.btn-option');
    await btns[wrongIdx0].click();
    await btns[corrIdx0].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // Q2: Error primero, luego acierto
    let wrongIdx1 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product !== q.product : !a.isCorrect));
    });
    let corrIdx1 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
    });
    btns = await page.$$('.btn-option');
    await btns[wrongIdx1].click();
    await btns[corrIdx1].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // Q3: Acierto al primer intento
    let corrIdx2 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
    });
    btns = await page.$$('.btn-option');
    await btns[corrIdx2].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // Q4: Acierto al primer intento
    let corrIdx3 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
    });
    btns = await page.$$('.btn-option');
    await btns[corrIdx3].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    await page.waitForSelector('#view-fin.view-active');

    // Verificación de estrellas en el cierre
    const starSlots = await page.$$eval('#fin-stars-container .star-slot', (els) =>
      els.map((el) => ({
        earned: el.getAttribute('data-earned'),
        index: el.getAttribute('data-star-index'),
        hasEarnedClass: el.classList.contains('star-slot-earned'),
        hasUnearnedClass: el.classList.contains('star-slot-unearned')
      }))
    );

    assert.equal(starSlots.length, 4);
    assert.equal(starSlots[0].earned, 'false', 'Q1 falló al primer intento');
    assert.equal(starSlots[1].earned, 'false', 'Q2 falló al primer intento');
    assert.equal(starSlots[2].earned, 'true', 'Q3 acertada al primer intento');
    assert.equal(starSlots[3].earned, 'true', 'Q4 acertada al primer intento');

    // Conteo y mensaje
    const starsCount = await page.$eval('#fin-stars-count', (el) => el.textContent.trim());
    assert.equal(starsCount, '2 de 4 estrellas');

    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 2 de 4');

    const message = await page.$eval('#fin-summary-message', (el) => el.textContent.trim());
    assert.match(message, /buen esfuerzo/i);
    assert.ok(!message.includes('fallaste') && !message.includes('perdiste'), 'No debe contener palabras punitivas');

    // Botón Siguiente nivel NO debe aparecer con 2/4
    const nextBtnHidden = await page.$eval('#btn-fin-next', (el) => el.hidden);
    assert.equal(nextBtnHidden, true, 'Siguiente nivel debe estar oculto con 2/4');

    // Clic en Repetir inicia una nueva ronda limpia del mismo nivel
    await page.click('#btn-fin-repeat');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    const progressText = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
    assert.equal(progressText, 'Pregunta 1 de 4');

    const newRoundQ0 = await page.evaluate(() => window.__multiploApp.getCurrentRound().questions[0]);
    assert.equal(newRoundQ0.firstAttemptMade, false, 'Nueva ronda limpia no hereda intentos');
    assert.equal(newRoundQ0.isResolved, false);

    await page.close();
  });

  await t.test('3. Cierre en Nivel 4 con 4/4: nunca ofrece Nivel 5', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Desbloquear Nivel 4 directamente
    await page.evaluate(() => {
      window.__multiploApp.setHighestUnlockedLevel(4);
    });

    await page.click('#btn-level-4');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // Responder 4/4
    for (let i = 0; i < 4; i++) {
      const corrIdx = await page.evaluate(() => {
        const q = window.__multiploApp.getCurrentQuestion();
        return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
      });
      const btns = await page.$$('.btn-option');
      await btns[corrIdx].click();
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    await page.waitForSelector('#view-fin.view-active');

    // Verificar que NUNCA aparece botón de siguiente nivel (no hay Nivel 5)
    const btnNextHidden = await page.$eval('#btn-fin-next', (el) => el.hidden);
    assert.equal(btnNextHidden, true, 'En Nivel 4 nunca debe ofrecerse Nivel 5');

    // Botones de repetir y volver a niveles siguen operativos
    const repeatVisible = await page.$eval('#btn-fin-repeat', (el) => !el.hidden);
    const homeVisible = await page.$eval('#btn-fin-home', (el) => !el.hidden);
    assert.equal(repeatVisible, true);
    assert.equal(homeVisible, true);

    await page.close();
  });

  await t.test('4. Modo silenciado: ejecución completa del cierre sin errores', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Activar modo silencioso
    await page.click('#btn-sound-toggle');
    assert.equal(await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed')), 'false');

    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    for (let i = 0; i < 4; i++) {
      const corrIdx = await page.evaluate(() => {
        const q = window.__multiploApp.getCurrentQuestion();
        return q.alternatives.findIndex((a) => (q.modalidad === 5 ? a.product === q.product : a.isCorrect));
      });
      const btns = await page.$$('.btn-option');
      await btns[corrIdx].click();
      await page.waitForSelector('#btn-juego-continue:not([hidden])');
      await page.click('#btn-juego-continue');
    }

    await page.waitForSelector('#view-fin.view-active');
    const scoreText = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(scoreText, 'Aciertos al primer intento: 4 de 4');

    const starSlots = await page.$$eval('#fin-stars-container .star-slot', (els) => els.length);
    assert.equal(starSlots, 4);

    await page.close();
  });

  await t.test('5. Verificación responsive en celular (375x667), tablet (768x1024) y computador (1280x800) en vista Fin', async () => {
    const page = await browser.newPage();
    const viewports = [
      { name: 'Celular (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Computador (1280x800)', width: 1280, height: 800 }
    ];

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Navegar directamente a vista Fin con resumen para probar el layout en todas las resoluciones
    await page.evaluate(() => {
      window.__multiploApp.startNewRound(1);
      window.__multiploApp.renderFinView({
        level: 1,
        totalQuestions: 4,
        firstAttemptCorrect: [true, true, true, true],
        firstAttemptSuccesses: 4,
        stars: 4,
        passed: true
      });
      window.__multiploApp.navigateTo('fin');
    });

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.waitForSelector('#view-fin.view-active');

      const dimensions = await page.evaluate(() => {
        const doc = document.documentElement;
        const main = document.getElementById('app-main');
        const card = document.querySelector('#view-fin .view-card');
        const starsBox = document.getElementById('fin-stars-container');

        return {
          windowInnerWidth: window.innerWidth,
          docScrollWidth: doc.scrollWidth,
          docClientWidth: doc.clientWidth,
          mainScrollWidth: main ? main.scrollWidth : 0,
          mainClientWidth: main ? main.clientWidth : 0,
          cardScrollWidth: card ? card.scrollWidth : 0,
          cardClientWidth: card ? card.clientWidth : 0,
          starsScrollWidth: starsBox ? starsBox.scrollWidth : 0,
          starsClientWidth: starsBox ? starsBox.clientWidth : 0
        };
      });

      assert.ok(
        dimensions.docScrollWidth <= dimensions.docClientWidth + 1,
        `En ${vp.name}, el documento no debe tener desbordamiento horizontal: scrollWidth=${dimensions.docScrollWidth}, clientWidth=${dimensions.docClientWidth}`
      );

      assert.ok(
        dimensions.starsScrollWidth <= dimensions.cardClientWidth + 1,
        `En ${vp.name}, el contenedor de estrellas debe caber en la tarjeta: stars=${dimensions.starsScrollWidth}, card=${dimensions.cardClientWidth}`
      );
    }

    await page.close();
  });
});
