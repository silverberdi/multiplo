import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';

const projectRoot = process.cwd();

function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.wav': 'audio/wav',
  };

  return http.createServer((request, response) => {
    let requestPath = decodeURI(request.url.split('?')[0]);
    if (requestPath === '/' || requestPath === '') requestPath = '/index.html';
    const filePath = path.join(projectRoot, requestPath.replace(/^\//, ''));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end('Not Found');
      return;
    }
    response.writeHead(200, { 'content-type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  });
}

async function openGame(page, baseUrl) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.click('#btn-start-game');
  if (await page.$eval('#btn-welcome-continue', (button) => !button.hidden)) {
    await page.$eval('#btn-welcome-continue', (button) => button.click());
  }
  await page.waitForSelector('#levels-section:not([hidden])');
  await page.click('#btn-level-1');
  await page.waitForSelector('#view-aprende.view-active');
  await page.click('#btn-aprende-continue');
  await page.waitForSelector('#view-juego.view-active');
}

function interactiveDescendants(element) {
  return [...element.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]')]
    .filter((child) => child !== element && !child.hasAttribute('disabled') && child.getAttribute('tabindex') !== '-1');
}

test('Request #46 E2E: cada alternativa es un único control y conserva la ronda', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await puppeteer.launch({
    executablePath: chromeExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  t.after(async () => {
    await browser.close();
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(8000);
  await page.setViewport({ width: 1280, height: 800 });
  await openGame(page, baseUrl);

  const initialQuestion = await page.evaluate(() => window.__multiploApp.getCurrentQuestion());
  assert.ok([2, 3, 4, 5].includes(initialQuestion.modalidad), 'La ronda debe comenzar en una modalidad evaluable');

  // Los controles externos siguen siendo los únicos puntos de audio de la pregunta.
  const beforeRepeat = await page.evaluate(() => ({
    question: window.__multiploApp.getCurrentQuestion(),
    pressed: document.getElementById('btn-sound-toggle').getAttribute('aria-pressed'),
  }));
  await page.click('#btn-juego-sound');
  const afterRepeat = await page.evaluate(() => ({
    question: window.__multiploApp.getCurrentQuestion(),
    pressed: document.getElementById('btn-sound-toggle').getAttribute('aria-pressed'),
  }));
  assert.equal(afterRepeat.question.index, beforeRepeat.question.index, 'Repetir consigna no debe cambiar la pregunta');
  assert.equal(afterRepeat.question.isResolved, beforeRepeat.question.isResolved, 'Repetir consigna no debe seleccionar una alternativa');
  assert.equal(afterRepeat.pressed, beforeRepeat.pressed, 'Repetir consigna no debe cambiar el sonido global');

  const modalitiesSeen = [];
  let hintCovered = false;
  for (let questionIndex = 0; questionIndex < 4; questionIndex += 1) {
    const question = await page.evaluate(() => window.__multiploApp.getCurrentQuestion());
    modalitiesSeen.push(question.modalidad);
    assert.ok([2, 3, 4, 5].includes(question.modalidad), `Debe recorrer una modalidad evaluable en pregunta ${questionIndex + 1}`);

    const structure = await page.$$eval('.btn-option', (buttons) => buttons.map((button) => ({
      ariaLabel: button.getAttribute('aria-label'),
      text: button.textContent.trim(),
      listenCount: button.querySelectorAll('.btn-option-listen').length,
      interactiveCount: [...button.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]')]
        .filter((child) => !child.hasAttribute('disabled') && child.getAttribute('tabindex') !== '-1').length,
    })));
    assert.equal(structure.length, 3, 'Cada pregunta debe mostrar exactamente tres opciones');
    assert.ok(structure.every((option) => option.ariaLabel && option.text), 'Cada opción conserva texto y aria-label');
    assert.ok(structure.every((option) => option.listenCount === 0 && option.interactiveCount === 0), 'No hay controles interactivos anidados');
    assert.equal(await page.$$eval('.btn-option-listen', (elements) => elements.length), 0, 'No deben existir altavoces individuales');

    const hintAvailableBeforeAnswer = await page.$eval('#btn-juego-hint', (button) => !button.hidden && !button.disabled);
    if (hintAvailableBeforeAnswer && !hintCovered) {
      await page.click('#btn-juego-hint');
      hintCovered = true;
      assert.equal(await page.$eval('#juego-groups-container', (element) => element.hidden), false, 'La pista conserva los grupos visibles');
    }

    const correctIndex = question.alternatives.findIndex((alternative) => alternative.isCorrect);
    const wrongIndex = question.alternatives.findIndex((alternative) => !alternative.isCorrect);
    const optionButtons = await page.$$('.btn-option');

    if (questionIndex === 0) {
      await optionButtons[wrongIndex].click();
      const afterWrong = await page.evaluate(() => ({
        question: window.__multiploApp.getCurrentQuestion(),
        feedback: document.getElementById('juego-feedback-box').textContent,
        stars: window.__multiploApp.getCurrentRound().stars,
      }));
      assert.equal(afterWrong.question.isResolved, false, 'Un error debe permitir reintentar');
      assert.match(afterWrong.feedback, /Cuenta otra vez|Inténtalo/, 'El error debe mostrar ayuda');
      assert.equal(afterWrong.stars, 0, 'Un primer intento incorrecto no suma estrella');
    }

    const freshButtons = await page.$$('.btn-option');
    await freshButtons[correctIndex].focus();
    await page.keyboard.press(questionIndex % 2 === 0 ? 'Enter' : 'Space');
    await page.waitForSelector('#btn-juego-continue:not([hidden])');
    const afterCorrect = await page.evaluate(() => ({
      question: window.__multiploApp.getCurrentQuestion(),
      feedback: document.getElementById('juego-feedback-box').textContent,
    }));
    assert.equal(afterCorrect.question.isResolved, true, 'La alternativa debe resolver la pregunta una sola vez');
    assert.equal(afterCorrect.question.firstAttemptCorrect, questionIndex === 0 ? false : true, 'La estrella depende del primer intento');
    assert.match(afterCorrect.feedback, /Respuesta correcta/, 'Debe conservar el feedback de acierto');

    const resolvedIndex = afterCorrect.question.index;
    await page.click('.btn-option');
    assert.equal((await page.evaluate(() => window.__multiploApp.getCurrentQuestion().index)), resolvedIndex, 'Una segunda activación no debe avanzar ni duplicar la transición');

    if (questionIndex < 3) await page.click('#btn-juego-continue');
  }

  await page.click('#btn-juego-continue');
  assert.deepEqual([...new Set(modalitiesSeen)].sort(), [2, 3, 4, 5], 'La ronda debe recorrer las cuatro modalidades');
  assert.equal(await page.$eval('#view-fin', (element) => !element.hidden), true, 'La ronda debe finalizar sin alterar la progresión');
  assert.equal(await page.$eval('#btn-aprende-sound', (element) => element.getAttribute('aria-label')), 'Repetir explicación');
  await page.click('#btn-sound-toggle');
  assert.equal(await page.$eval('#btn-sound-toggle', (element) => element.getAttribute('aria-pressed')), 'false', 'El sonido global conserva su contrato');
  await page.screenshot({ path: '/tmp/multiplo-request-46-desktop.png', fullPage: true });
});

test('Request #46 E2E: opciones legibles, enfocables y sin overflow en tres viewports', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const browser = await puppeteer.launch({
    executablePath: chromeExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  t.after(async () => {
    await browser.close();
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  });

  const viewports = [
    { name: 'mobile', width: 360, height: 667, isMobile: true, hasTouch: true },
    { name: 'tablet', width: 768, height: 1024, isMobile: false, hasTouch: true },
    { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false },
  ];

  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await openGame(page, baseUrl);
    const measurements = await page.$$eval('.btn-option', (buttons) => buttons.map((button) => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height, visible: Boolean(button.offsetParent) };
    }));
    assert.equal(measurements.length, 3, `${viewport.name}: tres opciones visibles`);
    assert.ok(measurements.every(({ width, height, visible }) => visible && width > 0 && height >= 44), `${viewport.name}: área táctil legible`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${viewport.name}: sin overflow horizontal`);
    const focused = await page.$eval('.btn-option', (button) => {
      button.focus();
      const style = getComputedStyle(button);
      return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
    });
    assert.equal(focused, true, `${viewport.name}: foco visible en alternativa`);
    await page.screenshot({ path: `/tmp/multiplo-request-46-${viewport.name}.png`, fullPage: true });
    await page.close();
  }
});
