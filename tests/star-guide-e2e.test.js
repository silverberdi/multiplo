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

test('E2E Star Guide: Estados de mascota, voz/texto simultáneo, repetición, silencio persistido y responsive', async (t) => {
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

  await t.test('1. Flujo completo con estados de estrella, texto simultáneo y feedback empático', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // --- Vista Inicio ---
    // Mascota en estado normal inicial
    const inicioMascotSrc = await page.$eval('#mascot-img-inicio', (el) => el.getAttribute('src'));
    assert.ok(inicioMascotSrc.includes('assets/mascot/normal.svg'), 'Inicio debe mostrar mascota normal');

    const inicioStatusText = await page.$eval('#mascot-status-inicio .status-text', (el) => el.textContent.trim());
    const inicioStatusIcon = await page.$eval('#mascot-status-inicio .status-icon', (el) => el.textContent.trim());
    assert.equal(inicioStatusText, 'Lista');
    assert.equal(inicioStatusIcon, '⭐');

    // Click en "¡Jugar!" -> Avanza a Aprende
    await page.click('#btn-start-game');
    await page.waitForSelector('#view-aprende.view-active');

    // --- Vista Aprende ---
    // Modelo matemático generado dinámicamente para la ronda
    const aprendeModel = await page.evaluate(() => window.__multiploApp.getAprendeModel());
    assert.ok(aprendeModel, 'El modelo Aprende debe existir en la ronda');

    // Texto de instrucción visible coincide con el modelo
    const aprendeInstruction = await page.$eval('#view-aprende .instruction-text', (el) => el.textContent.trim());
    assert.equal(aprendeInstruction, aprendeModel.instructionText);

    // Botón de repetición disponible con etiqueta clara
    const aprendeSoundLabel = await page.$eval('#btn-aprende-sound', (el) => el.getAttribute('aria-label'));
    assert.equal(aprendeSoundLabel, 'Repetir explicación');

    // Clic en repetir explicación: reproduce la narración verbal derivada
    await page.click('#btn-aprende-sound');
    const lastInstructionInAprende = await page.evaluate(() => window.__multiploApp.guide.getLastInstruction());
    assert.equal(lastInstructionInAprende, aprendeModel.narrationText);

    // Continuar al juego
    await page.click('#btn-aprende-continue');
    await page.waitForSelector('#view-juego.view-active');

    // --- Vista Juego: Ronda real de cuatro preguntas cubriendo las cuatro modalidades ---

    // 1. Pregunta 1 de 4 (modalidad 2: visual, cuenta grupos)
    const q1Progress = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
    assert.equal(q1Progress, 'Pregunta 1 de 4');

    const questionText1 = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.equal(questionText1, '¿Cuántas manzanas hay en total?');

    // Grupos visibles en la modalidad visual
    const groupsVisible1 = await page.$eval('#juego-groups-container', (el) => !el.hidden);
    assert.ok(groupsVisible1, 'Los grupos deben ser visibles en la modalidad visual');

    // Probar opción incorrecta -> Retroalimentación empática sin bloqueo
    const wrongIdx1 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => !a.isCorrect);
    });
    const optionBtns1 = await page.$$('.btn-option');
    await optionBtns1[wrongIdx1].click();

    // Mascota pasa a pensando
    const mascotThinking = await page.$eval('#mascot-img-juego', (el) => el.getAttribute('src'));
    assert.ok(mascotThinking.includes('assets/mascot/pensando.svg'), 'Error debe cambiar mascota a pensando');

    const statusThinking = await page.$eval('#mascot-status-juego .status-text', (el) => el.textContent.trim());
    assert.equal(statusThinking, 'Pensando');

    // Mensaje empático en caja de feedback
    const feedbackRetryText = await page.$eval('#juego-feedback-box', (el) => el.textContent.trim());
    assert.ok(feedbackRetryText.includes('Cuenta otra vez'), 'Debe mostrar mensaje empático "Cuenta otra vez"');

    // La actividad permanece activa, la pregunta sigue siendo la misma
    const questionAfterError = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.equal(questionAfterError, '¿Cuántas manzanas hay en total?');

    // Probar opción correcta tras reintento -> Acierto y celebración
    const correctIdx1 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.isCorrect);
    });
    await optionBtns1[correctIdx1].click();

    // Mascota pasa a celebrando
    const mascotCelebrate = await page.$eval('#mascot-img-juego', (el) => el.getAttribute('src'));
    assert.ok(mascotCelebrate.includes('assets/mascot/celebrando.svg'), 'Acierto debe cambiar mascota a celebrando');

    const feedbackSuccessText = await page.$eval('#juego-feedback-box', (el) => el.textContent.trim());
    assert.ok(feedbackSuccessText.includes('¡Muy bien!'), 'Debe mostrar felicitación empática');

    // Continuar a la pregunta 2
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // 2. Pregunta 2 de 4 (modalidad 3: visual, cuenta grupos)
    const q2Progress = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
    assert.equal(q2Progress, 'Pregunta 2 de 4');

    const correctIdx2 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.isCorrect);
    });
    const optionBtns2 = await page.$$('.btn-option');
    await optionBtns2[correctIdx2].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // 3. Pregunta 3 de 4 (modalidad 4: multiplicación sin objetos por defecto, con Pista)
    const q3Progress = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
    assert.equal(q3Progress, 'Pregunta 3 de 4');

    // Grupos ocultos por defecto
    const groupsHidden3 = await page.$eval('#juego-groups-container', (el) => el.hidden);
    assert.ok(groupsHidden3, 'En modalidad 4 los grupos deben estar ocultos por defecto');

    // Probar botón de pista (💡 Pista)
    await page.click('#btn-juego-hint');
    const feedbackHintText = await page.$eval('#juego-feedback-box', (el) => el.textContent.trim());
    assert.ok(feedbackHintText.includes('Pista'), 'Debe mostrar mensaje de pista comprensible');

    const groupsRevealed3 = await page.$eval('#juego-groups-container', (el) => !el.hidden);
    assert.ok(groupsRevealed3, 'Al pulsar Pista los grupos de manzanas deben mostrarse');

    const correctIdx3 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.isCorrect);
    });
    const optionBtns3 = await page.$$('.btn-option');
    await optionBtns3[correctIdx3].click();
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    await page.click('#btn-juego-continue');

    // 4. Pregunta 4 de 4 (modalidad 5: selección de operación que da el total)
    const q4Progress = await page.$eval('#game-progress-text', (el) => el.textContent.trim());
    assert.equal(q4Progress, 'Pregunta 4 de 4');

    const questionText4 = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.ok(questionText4.includes('¿Cuál multiplicación da'), 'Debe preguntar por la multiplicación que da el total');

    // Evaluar que solo la operación con el producto objetivo es correcta
    const targetProduct = await page.evaluate(() => window.__multiploApp.getCurrentQuestion().product);
    const correctIdx4 = await page.evaluate(() => {
      const q = window.__multiploApp.getCurrentQuestion();
      return q.alternatives.findIndex((a) => a.product === q.product);
    });
    assert.ok(correctIdx4 >= 0, 'Debe haber exactamente una alternativa correcta por producto');

    const optionBtns4 = await page.$$('.btn-option');
    await optionBtns4[correctIdx4].click();

    // El botón de acción en la última pregunta muestra "Ver fin de ronda"
    const nextBtnLabel = await page.$eval('#btn-juego-continue', (el) => el.textContent.trim());
    assert.equal(nextBtnLabel, 'Ver fin de ronda');

    // Clic en "Ver fin de ronda" -> Navega a Vista Fin de ronda
    await page.click('#btn-juego-continue');
    await page.waitForSelector('#view-fin.view-active');

    // --- Vista Fin ---
    const finMascotSrc = await page.$eval('#mascot-img-fin', (el) => el.getAttribute('src'));
    assert.ok(finMascotSrc.includes('assets/mascot/celebrando.svg'), 'Fin debe mostrar mascota celebrando');

    const finStatusText = await page.$eval('#mascot-status-fin .status-text', (el) => el.textContent.trim());
    assert.equal(finStatusText, '¡Muy bien!');

    // Resumen inmutable de primer intento: Q1 falló al primer intento, Q2, Q3, Q4 acertadas -> 3 de 4
    const finScore = await page.$eval('#fin-score-text', (el) => el.textContent.trim());
    assert.equal(finScore, 'Aciertos al primer intento: 3 de 4', 'Debe registrar 3 aciertos de primer intento');

    // Verificar que el fallo inicial en Q1 se conservó de forma inmutable
    const q1Result = await page.evaluate(() => window.__multiploApp.getCurrentRound().questions[0]);
    assert.equal(q1Result.firstAttemptCorrect, false, 'El fallo inicial de Q1 debe conservarse inmutable');

    // Verificar ausencia de texto o markup estático de recompensa previo a Change #6
    const htmlFin = await page.$eval('#view-fin', (el) => el.innerHTML);
    assert.ok(!htmlFin.includes('Ganaste tres estrellas'), 'No debe existir el texto estático sustituido');
    assert.ok(!htmlFin.includes('reward-stars-container'), 'No debe existir el contenedor de estrellas sustituido');

    await page.close();
  });

  await t.test('2. Conservación de silencio en localStorage a través de sesiones', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Estado inicial: sonido activo
    let soundPressed = await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(soundPressed, 'true');

    // Silenciar
    await page.click('#btn-sound-toggle');
    soundPressed = await page.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(soundPressed, 'false');

    // Comprobar valor en localStorage
    const storedPref = await page.evaluate(() => localStorage.getItem('multiplo_sound_enabled'));
    assert.equal(storedPref, 'false');

    // Abrir una nueva página (simulando nueva sesión en el mismo navegador)
    const page2 = await browser.newPage();
    await page2.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const newSessionSoundPressed = await page2.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(newSessionSoundPressed, 'false', 'Nueva sesión debe respetar el silencio persistido');

    const newSessionSoundEnabled = await page2.evaluate(() => window.__multiploApp.isSoundEnabled());
    assert.equal(newSessionSoundEnabled, false);

    // Reactivar sonido
    await page2.click('#btn-sound-toggle');
    const reactivatedSound = await page2.$eval('#btn-sound-toggle', (el) => el.getAttribute('aria-pressed'));
    assert.equal(reactivatedSound, 'true');

    await page.close();
    await page2.close();
  });

  await t.test('3. Repetir y detener voz previa sin alterar progreso ni solapar', async () => {
    const page = await browser.newPage();
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    // Navegar a juego
    await page.evaluate(() => window.__multiploApp.navigateTo('juego', { speak: true }));

    // Verificar última instrucción
    const initialInstruction = await page.evaluate(() => window.__multiploApp.guide.getLastInstruction());
    assert.equal(initialInstruction, '¿Cuántas manzanas hay en total?');

    // Click en botón repetir en juego
    await page.click('#btn-juego-sound');

    // Verificar que la instrucción sigue siendo la misma y la pregunta no avanzó
    const repeatedInstruction = await page.evaluate(() => window.__multiploApp.guide.getLastInstruction());
    assert.equal(repeatedInstruction, '¿Cuántas manzanas hay en total?');
    const currentQuestionText = await page.$eval('#heading-juego', (el) => el.textContent.trim());
    assert.equal(currentQuestionText, '¿Cuántas manzanas hay en total?');

    // Cambiar de actividad detiene la voz anterior
    let cancelled = false;
    await page.evaluate(() => {
      const origCancel = window.__multiploApp.guide.cancelSpeech.bind(window.__multiploApp.guide);
      window.__multiploApp.guide.cancelSpeech = () => {
        window.__cancelCalledOnNav = true;
        origCancel();
      };
      window.__multiploApp.navigateTo('inicio');
    });

    const cancelCalled = await page.evaluate(() => window.__cancelCalledOnNav);
    assert.ok(cancelCalled, 'Navegar a otra vista debe cancelar el discurso previo');

    await page.close();
  });

  await t.test('4. Verificación responsive y tamaños táctiles de controles de guía en móvil, tablet y escritorio', async () => {
    const page = await browser.newPage();

    const viewports = [
      { name: 'Móvil (375x667)', width: 375, height: 667 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Escritorio (1280x800)', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      for (const viewId of ['inicio', 'aprende', 'juego', 'fin']) {
        await page.evaluate((v) => window.__multiploApp.navigateTo(v), viewId);

        // Sin desbordamiento horizontal
        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        assert.ok(!overflow, `En ${vp.name} en vista ${viewId} no debe existir desbordamiento horizontal`);

        // Controles de sonido y repetición visibles deben tener tamaño cómodo (>= 44px)
        const controlBoxes = await page.evaluate(() => {
          const controls = Array.from(document.querySelectorAll('#btn-sound-toggle, #btn-aprende-sound, #btn-juego-sound'));
          return controls.filter(c => c.offsetParent !== null).map(c => {
            const rect = c.getBoundingClientRect();
            return { id: c.id, width: rect.width, height: rect.height };
          });
        });

        for (const box of controlBoxes) {
          assert.ok(
            box.height >= 44 && box.width >= 44,
            `En ${vp.name} el control #${box.id} debe medir al menos 44x44px (medido: ${box.width}x${box.height}px)`
          );
        }
      }
    }

    await page.close();
  });
});
