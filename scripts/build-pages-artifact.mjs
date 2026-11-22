import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist', 'pages');
const allowedFiles = ['index.html', 'manifest.webmanifest'];
const allowedDirectories = ['css', 'js', 'assets'];
const directoryExtensions = { css: new Set(['.css']), js: new Set(['.js']), assets: new Set(['.svg', '.wav', '.json']) };
const requiredFiles = [
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'js/app.js',
  'assets/icons/estrella-premio.svg',
  'assets/audio/fola/manifest.json'
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) {
    throw new Error(`Falta un archivo requerido por Pages: ${relative}`);
  }
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const relative of allowedFiles) {
  fs.copyFileSync(path.join(root, relative), path.join(output, relative));
}

function copyAllowedDirectory(relative) {
  const source = path.join(root, relative);
  const destination = path.join(output, relative);
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`No se admiten symlinks en el artefacto Pages: ${child}`);
    if (entry.isDirectory()) {
      copyAllowedDirectory(child);
    } else if (directoryExtensions[relative.split('/')[0]].has(path.extname(entry.name).toLowerCase())) {
      fs.copyFileSync(path.join(root, child), path.join(output, child));
    }
  }
}

for (const relative of allowedDirectories) {
  copyAllowedDirectory(relative);
}

fs.writeFileSync(path.join(output, 'CNAME'), 'multiplo.silverman.pro\n');
if (fs.readFileSync(path.join(output, 'CNAME'), 'utf8') !== 'multiplo.silverman.pro\n') {
  throw new Error('El CNAME de Pages no coincide con el dominio público esperado');
}

const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.webmanifest'), 'utf8'));
for (const icon of manifest.icons || []) {
  const iconPath = path.resolve(output, icon.src);
  if (!iconPath.startsWith(`${output}${path.sep}`) || !fs.existsSync(iconPath)) {
    throw new Error(`Icono de manifest ausente o fuera del artefacto: ${icon.src}`);
  }
}

const folaManifest = JSON.parse(fs.readFileSync(path.join(output, 'assets/audio/fola/manifest.json'), 'utf8'));
if (folaManifest.clip_count !== 490 || !Array.isArray(folaManifest.clips) || folaManifest.clips.length !== 490) {
  throw new Error('El inventario Fola del artefacto debe incluir los 490 clips declarados');
}
for (const clip of folaManifest.clips) {
  const audioPath = path.resolve(output, 'assets/audio/fola', clip.file);
  if (!audioPath.startsWith(`${path.resolve(output, 'assets/audio/fola')}${path.sep}`) || !fs.existsSync(audioPath)) {
    throw new Error(`Clip Fola ausente o fuera del paquete: ${clip.file}`);
  }
}

const sourceFiles = ['index.html', 'manifest.webmanifest', ...['css', 'js'].flatMap((directory) => {
  const walk = (current) => fs.readdirSync(path.join(output, current), { withFileTypes: true })
    .flatMap((entry) => {
      const relative = path.posix.join(current, entry.name);
      return entry.isDirectory() ? walk(relative) : [relative];
    });
  return walk(directory);
})];
for (const sourceFile of sourceFiles) {
  const source = fs.readFileSync(path.join(output, sourceFile), 'utf8');
  const references = /(?:src|href)\s*=\s*["']((?:assets|css|js)\/[^"']+)|url\(["']?((?:assets|css|js)\/[^"')]+)/g;
  for (const match of source.matchAll(references)) {
    const asset = (match[1] || match[2]).split(/[?#]/, 1)[0];
    if (!fs.existsSync(path.resolve(output, asset))) throw new Error(`Recurso local ausente en ${sourceFile}: ${asset}`);
  }
}

const entries = fs.readdirSync(output).sort();
const expected = [...allowedDirectories, ...allowedFiles, 'CNAME'].sort();
if (entries.length !== expected.length || entries.some((entry, index) => entry !== expected[index])) {
  throw new Error(`El artefacto Pages excede la allowlist: ${entries.join(', ')}`);
}

console.log(`Artefacto Pages allowlisted creado en ${path.relative(root, output)} (${entries.join(', ')})`);
