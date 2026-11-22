import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { chromeExecutablePath } from './chrome-executable.js';

const projectRoot = process.cwd();

function createStaticServer() {
  return http.createServer((request, response) => {
    const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const filePath = path.join(projectRoot, requested.replace(/^\//, ''));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end();
      return;
    }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
    response.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  });
}

test('Request #45 E2E: atribución visible, accesible y sin overflow en viewports aprobados', async (t) => {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await puppeteer.launch({ executablePath: chromeExecutablePath(), args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'] });
  const baseUrl = `http://127.0.0.1:${server.address().port}/`;
  const evidenceDir = '/tmp/multiplo-request-45-evidence';
  fs.mkdirSync(evidenceDir, { recursive: true });

  t.after(async () => {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  });

  for (const viewport of [
    { name: 'mobile-360x667', width: 360, height: 667 },
    { name: 'tablet-768x1024', width: 768, height: 1024 },
    { name: 'desktop-1280x800', width: 1280, height: 800 },
  ]) {
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height });
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const footer = await page.$eval('.app-footer', (element) => {
      const attribution = element.querySelector('.footer-attribution');
      const phrases = [...attribution.querySelectorAll('span')].map((span) => span.textContent.trim());
      const footerBox = element.getBoundingClientRect();
      const attributionBox = attribution.getBoundingClientRect();
      return {
        phrases,
        text: element.textContent,
        footerBox: { top: footerBox.top, bottom: footerBox.bottom, left: footerBox.left, right: footerBox.right },
        attributionBox: { top: attributionBox.top, bottom: attributionBox.bottom, left: attributionBox.left, right: attributionBox.right },
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        role: element.getAttribute('role'),
        controls: attribution.querySelectorAll('button, a, input, select, textarea').length,
        animation: getComputedStyle(attribution).animationName,
      };
    });

    assert.deepEqual(footer.phrases, ['Desarrollado por Beastie Studio', 'Juegos hechos con cariño']);
    assert.match(footer.text, /Múltiplo — Juego educativo sin publicidad, sin cuentas y seguro para niños\./);
    assert.doesNotMatch(footer.text, /Beastie Studios|[®™]/i);
    assert.equal(footer.overflow, false, `${viewport.name} no debe tener overflow horizontal`);
    assert.equal(footer.controls, 0, `${viewport.name} no debe convertir la atribución en controles`);
    assert.equal(footer.animation, 'none', `${viewport.name} debe mantener la atribución estática`);
    assert.ok(footer.attributionBox.left >= footer.footerBox.left && footer.attributionBox.right <= footer.footerBox.right, `${viewport.name} debe contener el crédito dentro del footer`);
    assert.ok(footer.attributionBox.top >= footer.footerBox.top && footer.attributionBox.bottom <= footer.footerBox.bottom, `${viewport.name} debe contener verticalmente el crédito dentro del footer`);

    await page.screenshot({ path: path.join(evidenceDir, `${viewport.name}.png`), fullPage: true });
    await page.close();
  }
});
