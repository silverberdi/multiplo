import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. Tokens de diseño coinciden con la paleta canónica de ASSETS.md', () => {
  const cssPath = path.join(projectRoot, 'css/styles.css');
  assert.ok(fs.existsSync(cssPath), 'css/styles.css debe existir');

  const css = fs.readFileSync(cssPath, 'utf-8');

  // Paleta canónica
  const expectedTokens = [
    '#2D6CDF', // Azul
    '#FFD83D', // Amarillo
    '#34C759', // Verde
    '#FF6868', // Coral
    '#A66DFF', // Morado
    '#E6F5FF', // Azul claro
    '#17336F', // Texto azul profundo
  ];

  for (const token of expectedTokens) {
    assert.ok(
      css.toUpperCase().includes(token.toUpperCase()),
      `El CSS debe contener el token canónico ${token}`
    );
  }
});

test('2. Tipografía declara fallback del sistema (system-ui, sans-serif)', () => {
  const cssPath = path.join(projectRoot, 'css/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  // Baloo 2 y Nunito con fallback system-ui
  assert.match(css, /Baloo 2.*system-ui/s, 'La fuente de títulos debe degradar a system-ui');
  assert.match(css, /Nunito.*system-ui/s, 'La fuente de lectura y cifras debe degradar a system-ui');
});

test('3. Prevención de desbordamiento horizontal y tamaño táctil para niños', () => {
  const cssPath = path.join(projectRoot, 'css/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  assert.match(css, /overflow-x:\s*hidden/i, 'Debe asegurar ausencia de scroll horizontal');
  assert.match(css, /box-sizing:\s*border-box/i, 'Debe usar box-sizing border-box');

  // Tamaño de controles táctiles grandes (mínimo 52px / 64px)
  assert.match(css, /--touch-target-min:\s*52px/i, 'Debe definir tamaño mínimo de control');
  assert.match(css, /--touch-target-large:\s*64px/i, 'Debe definir tamaño grande de control');
});

test('4. Declaración de media queries responsive para móvil, tablet y escritorio', () => {
  const cssPath = path.join(projectRoot, 'css/styles.css');
  const css = fs.readFileSync(cssPath, 'utf-8');

  assert.match(css, /@media\s*\(\s*max-width:\s*480px\s*\)/i, 'Debe incluir breakpoint para móvil');
  assert.match(css, /@media\s*\(\s*min-width:\s*481px\s*\)/i, 'Debe incluir breakpoint para tablet');
  assert.match(css, /@media\s*\(\s*min-width:\s*841px\s*\)/i, 'Debe incluir breakpoint para escritorio');
  assert.match(css, /prefers-reduced-motion/i, 'Debe contemplar preferencia de reducción de movimiento');
});
