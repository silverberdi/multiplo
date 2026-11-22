import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('Request #45: el footer contiene una atribución semántica exacta y única', () => {
  const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
  const footerMatch = html.match(/<footer\b[^>]*class=["'][^"']*app-footer[^"']*["'][^>]*>([\s\S]*?)<\/footer>/i);

  assert.ok(footerMatch, 'Debe existir el footer.app-footer existente');
  const footer = footerMatch[1];
  assert.equal((footer.match(/Desarrollado por Beastie Studio/g) || []).length, 1);
  assert.equal((footer.match(/Juegos hechos con cariño/g) || []).length, 1);
  assert.doesNotMatch(footer, /Beastie Studios|[®™]/i);
  assert.doesNotMatch(footer, /<a\b/i, 'La atribución no debe ser un enlace');
  assert.match(footer, /class=["'][^"']*footer-attribution[^"']*["']/i);
  assert.equal((html.match(/<footer\b/gi) || []).length, 1, 'Debe conservarse una sola superficie footer');
});

test('Request #45: la regla de atribución no agrega movimiento, recurso o dependencia', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'css/styles.css'), 'utf8');
  const attributionRule = css.match(/\.footer-attribution\s*\{([\s\S]*?)\}/);

  assert.ok(attributionRule, 'Debe existir la regla local de atribución');
  assert.match(attributionRule[1], /flex-wrap\s*:\s*wrap/);
  assert.match(attributionRule[1], /overflow-wrap\s*:\s*anywhere/);
  assert.doesNotMatch(attributionRule[1], /animation|transition|background-image|url\(/i);
});
