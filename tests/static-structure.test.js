import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. index.html contiene configuración base requerida', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html debe existir en la raíz');

  const content = fs.readFileSync(htmlPath, 'utf-8');

  // Idioma español
  assert.match(content, /<html[^>]*lang=["']es["']/i, 'El atributo lang debe ser "es"');

  // Viewport responsive
  assert.match(content, /<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i, 'Debe incluir viewport responsive');

  // Enlace a estilos y script
  assert.match(content, /<link[^>]*href=["']css\/styles\.css["']/i, 'Debe enlazar css/styles.css');
  assert.match(content, /<script[^>]*src=["']js\/app\.js["']/i, 'Debe enlazar js/app.js');

  // PWA Manifest y favicon derivado de estrella
  assert.match(content, /<link[^>]*rel=["']manifest["'][^>]*href=["']manifest\.webmanifest["']/i, 'Debe enlazar manifest.webmanifest');
  assert.match(content, /<link[^>]*rel=["']icon["'][^>]*href=["']assets\/icons\/estrella-premio\.svg["']/i, 'Debe enlazar favicon de estrella');
});

test('2. index.html expone exactamente las cuatro vistas aprobadas del MVP', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const content = fs.readFileSync(htmlPath, 'utf-8');

  // Cuatro vistas aprobadas
  assert.ok(content.includes('id="view-inicio"'), 'Debe existir #view-inicio');
  assert.ok(content.includes('id="view-aprende"'), 'Debe existir #view-aprende');
  assert.ok(content.includes('id="view-juego"'), 'Debe existir #view-juego');
  assert.ok(content.includes('id="view-fin"'), 'Debe existir #view-fin');

  // Ninguna vista no aprobada (fuera de MVP-01)
  const viewMatches = content.match(/id="view-[a-z0-9_-]+"/gi) || [];
  const viewIds = viewMatches.map((m) => m.replace(/id="|"/gi, ''));
  assert.deepEqual(
    viewIds.sort(),
    ['view-aprende', 'view-fin', 'view-inicio', 'view-juego'],
    'Solo deben existir las cuatro vistas aprobadas (inicio, aprende, juego, fin)'
  );
});

test('3. index.html reutiliza assets versionados y cada uso tiene texto accesible', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const content = fs.readFileSync(htmlPath, 'utf-8');

  // Assets referenciados en index.html
  assert.ok(content.includes('assets/mascot/normal.svg'), 'Debe referenciar normal.svg');
  assert.ok(content.includes('assets/mascot/celebrando.svg'), 'Debe referenciar celebrando.svg');
  assert.ok(content.includes('assets/icons/estrella-premio.svg'), 'Debe referenciar estrella-premio.svg');
  assert.ok(content.includes('assets/objects/manzana.svg'), 'Debe referenciar manzana.svg');

  // Verificar que los archivos referenciados realmente existen en el repositorio
  const expectedFiles = [
    'assets/mascot/normal.svg',
    'assets/mascot/celebrando.svg',
    'assets/icons/estrella-premio.svg',
    'assets/objects/manzana.svg',
  ];
  for (const file of expectedFiles) {
    assert.ok(fs.existsSync(path.join(projectRoot, file)), `El asset ${file} debe existir en el repositorio`);
  }

  // Verificar que todas las etiquetas <img> tienen atributo alt no vacío
  const imgTags = content.match(/<img[^>]+>/g) || [];
  assert.ok(imgTags.length > 0, 'Debe haber etiquetas img');
  for (const img of imgTags) {
    assert.match(img, /alt=["'][^"']+["']/, `La imagen debe tener texto alternativo accesible: ${img}`);
  }
});

test('4. Niveles 1 a 4: solo nivel 1 disponible, niveles 2 a 4 bloqueados sin progreso ficticio', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const content = fs.readFileSync(htmlPath, 'utf-8');

  // Nivel 1 desbloqueado/disponible
  assert.match(content, /id="btn-level-1"[^>]*class="[^"]*level-unlocked/i, 'Nivel 1 debe tener clase level-unlocked');
  assert.doesNotMatch(content, /id="btn-level-1"[^>]*disabled/i, 'Nivel 1 no debe estar deshabilitado');

  // Niveles 2, 3 y 4 bloqueados con disabled y aria-disabled
  for (const num of [2, 3, 4]) {
    const regex = new RegExp(`id="btn-level-${num}"[^>]*disabled`, 'i');
    assert.match(content, regex, `Nivel ${num} debe tener atributo disabled`);
    const ariaRegex = new RegExp(`id="btn-level-${num}"[^>]*aria-disabled="true"`, 'i');
    assert.match(content, ariaRegex, `Nivel ${num} debe tener aria-disabled="true"`);
  }

  // No debe existir un nivel 5 (invariante de MVP: tablas 2 a 5)
  assert.ok(!content.includes('btn-level-5'), 'No debe existir nivel 5');
});

test('5. Sin servicios remotos, backend, telemetría ni recopilación infantil', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const jsPath = path.join(projectRoot, 'js/app.js');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  const jsContent = fs.readFileSync(jsPath, 'utf-8');

  const forbiddenTerms = [
    'google-analytics',
    'gtag',
    'segment',
    'mixpanel',
    'firebase',
    'facebook',
    'adservice',
    'doubleclick',
    'login',
    'password',
    'register',
  ];

  for (const term of forbiddenTerms) {
    assert.ok(!htmlContent.toLowerCase().includes(term), `index.html no debe contener ${term}`);
    assert.ok(!jsContent.toLowerCase().includes(term), `app.js no debe contener ${term}`);
  }
});
