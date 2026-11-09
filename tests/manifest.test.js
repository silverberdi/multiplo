import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

test('1. manifest.webmanifest es JSON válido con metadatos requeridos', () => {
  const manifestPath = path.join(projectRoot, 'manifest.webmanifest');
  assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest debe existir');

  const content = fs.readFileSync(manifestPath, 'utf-8');
  let manifest;
  assert.doesNotThrow(() => {
    manifest = JSON.parse(content);
  }, 'manifest.webmanifest debe ser JSON válido');

  assert.equal(manifest.short_name, 'Múltiplo');
  assert.ok(manifest.name.includes('Múltiplo'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.background_color, '#E6F5FF');
  assert.equal(manifest.theme_color, '#2D6CDF');
  assert.equal(manifest.lang, 'es');
  assert.ok(manifest.start_url);
});

test('2. Los iconos declarados en el manifest resuelven desde el paquete de la aplicación', () => {
  const manifestPath = path.join(projectRoot, 'manifest.webmanifest');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'Debe declarar al menos un icono');

  for (const icon of manifest.icons) {
    assert.ok(icon.src, 'El icono debe tener propiedad src');
    const resolvedPath = path.join(projectRoot, icon.src);
    assert.ok(fs.existsSync(resolvedPath), `El icono declarado (${icon.src}) debe existir en el paquete`);
  }
});
