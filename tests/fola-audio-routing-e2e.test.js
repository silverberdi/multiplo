import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';
import { selectFolaClip, EVENT_CLIPS } from '../js/fola-catalog.js';
import { MODALITIES } from '../js/question-engine.js';

const root = process.cwd();

function createServer() {
  return http.createServer((request, response) => {
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const file = path.join(root, requested.replace(/^\//, ''));
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404);
      response.end();
      return;
    }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.json': 'application/json' };
    response.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
}

test('E2E Fola: bienvenida, Aprende, ayuda y cierre solicitan los clips exactos tras interacción', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  let browser;
  t.after(async () => {
    if (browser) await browser.close();
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  });
  browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });

  const page = await browser.newPage();
  page.setDefaultTimeout(8000);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const folaRequests = [];
  page.on('request', (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.pathname.startsWith('/assets/audio/fola/audios/')) folaRequests.push(requestUrl.pathname);
  });
  await page.evaluateOnNewDocument(() => {
    window.__folaStarted = [];
    window.__folaPlayFailures = [];
    window.__folaRequests = [];
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const source = this.currentSrc || this.src;
      const result = nativePlay.apply(this, args);
      return result.then(() => {
        if (source.includes('/assets/audio/fola/')) window.__folaStarted.push(new URL(source).pathname);
      }).catch((error) => {
        if (source.includes('/assets/audio/fola/')) window.__folaPlayFailures.push({ source, name: error.name });
        throw error;
      });
    };
  });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__multiploApp?.isSoundEnabled());
  const assertClipStarted = async (clip) => {
    const expectedPath = `/${clip.file}`;
    try {
      await page.waitForFunction((file) => window.__folaStarted.includes(file) || window.__folaRequests.includes(file), {}, expectedPath);
    } catch (error) {
      const failures = await page.evaluate(() => window.__folaPlayFailures);
      throw new Error(`${error.message}; errores de play(): ${JSON.stringify(failures)}`);
    }
  };
  page.on('request', (request) => {
    const requestUrl = new URL(request.url());
    if (requestUrl.pathname.startsWith('/assets/audio/fola/audios/')) {
      page.evaluate((pathname) => window.__folaRequests.push(pathname), requestUrl.pathname).catch(() => {});
    }
  });
  const expectedQuestionClip = (question) => {
    const event = question.modalidad === MODALITIES.PREGUNTA_5 ? 'inversa'
      : question.modalidad === MODALITIES.PREGUNTA_4 ? 'preguntaResultado' : 'pregunta';
    return selectFolaClip(event, { a: question.a, b: question.b, producto: question.product }, { expectedText: question.spokenPrompt });
  };

  assert.deepEqual(await page.evaluate(() => window.__folaStarted), [], 'No debe solicitarse voz Fola antes del gesto');
  assert.deepEqual(folaRequests, [], 'No debe descargarse ningún WAV antes del gesto');
  await page.click('#btn-start-game');
  const firstWelcome = selectFolaClip('bienvenida');
  await assertClipStarted(firstWelcome);
  if (await page.$eval('#btn-welcome-continue', (button) => !button.hidden)) {
    await page.click('#btn-welcome-continue');
  }
  await page.waitForSelector('#levels-section:not([hidden])');
  await page.click('#btn-level-1');
  await page.waitForSelector('#view-aprende.view-active');
  assert.equal(await page.$eval('#heading-inicio', (node) => node.textContent), '¡Hola! Soy Múltiplo');

  const aprende = await page.evaluate(() => window.__multiploApp.getAprendeModel());
  const aprendeClip = selectFolaClip('aprende', aprende, { expectedText: aprende.narrationText });
  await assertClipStarted(aprendeClip);
  await page.click('#btn-aprende-continue');
  await page.waitForSelector('#view-juego.view-active');

  const firstQuestion = await page.evaluate(() => window.__multiploApp.getCurrentQuestion());
  const firstQuestionEvent = firstQuestion.modalidad === MODALITIES.PREGUNTA_5 ? 'inversa'
    : firstQuestion.modalidad === MODALITIES.PREGUNTA_4 ? 'preguntaResultado' : 'pregunta';
  const firstQuestionClip = selectFolaClip(firstQuestionEvent, { a: firstQuestion.a, b: firstQuestion.b, producto: firstQuestion.product }, { expectedText: firstQuestion.spokenPrompt });
  await assertClipStarted(firstQuestionClip);

  let hintCovered = false;
  for (let questionIndex = 0; questionIndex < 4; questionIndex++) {
    const question = await page.evaluate(() => window.__multiploApp.getCurrentQuestion());
    if (questionIndex > 0) await assertClipStarted(expectedQuestionClip(question));
    const hintVisible = await page.$eval('#btn-juego-hint', (button) => !button.hidden && !button.disabled);
    if (hintVisible && !hintCovered) {
      await page.click('#btn-juego-hint');
      await assertClipStarted(selectFolaClip('pistaPasoPaso'));
      hintCovered = true;
    }
    if (questionIndex === 0) {
      const wrongIndex = question.alternatives.findIndex((alternative) => !alternative.isCorrect);
      const optionButtons = await page.$$('.btn-option');
      await optionButtons[wrongIndex].click();
      await assertClipStarted(selectFolaClip('ayudaReintentar'));
    }
    const correctIndex = question.alternatives.findIndex((alternative) => alternative.isCorrect);
    const optionButtons = await page.$$('.btn-option');
    await optionButtons[correctIndex].click();
    await assertClipStarted(selectFolaClip('acierto', question));
    const continueButton = await page.$('#btn-juego-continue');
    const label = await continueButton.evaluate((button) => button.textContent.trim());
    await page.click('#btn-juego-continue');
    if (label.includes('Ver fin')) break;
  }

  await page.waitForSelector('#view-fin.view-active');
  assert.equal(hintCovered, true, 'La ronda debe recorrer una pista que pueda probarse');
  await assertClipStarted(selectFolaClip('finRonda'));
  const observed = await page.evaluate(() => [...new Set([...window.__folaStarted, ...window.__folaRequests])]);
  assert.ok(observed.includes(`/${firstWelcome.file}`));
  assert.ok(observed.includes(`/${aprendeClip.file}`));
  assert.ok(observed.includes(`/${firstQuestionClip.file}`));
  assert.ok(observed.includes(`/${selectFolaClip('finRonda').file}`));
  assert.ok(observed.every((url) => url.startsWith('/assets/audio/fola/audios/')), 'Efectos ajenos no pueden satisfacer la aserción Fola');

  await page.evaluate(() => window.__multiploApp.setHighestUnlockedLevel(2));
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  assert.deepEqual(await page.evaluate(() => window.__folaStarted), [], 'Tampoco debe iniciarse voz al cargar una visita posterior');
  await page.click('#btn-start-game');
  await assertClipStarted(selectFolaClip('bienvenidaRegreso'));
  assert.equal(await page.$eval('#heading-inicio', (node) => node.textContent), '¡Qué bueno verte de nuevo!');
});

test('Fola: el catálogo mantiene rutas distintas para despedida y cierre de tabla diez', () => {
  assert.equal(selectFolaClip('despedida').file, 'assets/audio/fola/audios/37_evento_despedida.wav');
  assert.equal(selectFolaClip('terminarTablaDiez').file, 'assets/audio/fola/audios/36_evento_terminar_tabla_diez.wav');
  assert.notEqual(EVENT_CLIPS.despedida, EVENT_CLIPS.terminarTablaDiez);
});
