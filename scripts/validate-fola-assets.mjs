import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import childProcess from 'node:child_process';
import os from 'node:os';
import { FOLA_APPLICATION_IDS } from '../js/fola-catalog.js';

export const REQUIRED_SHA256 = '202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929';
export const RELEASE_URL = 'https://github.com/silverberdi/multiplo/releases/download/assets-fola-v1.1.0/multiplo-fola-v1.1.0-audios-490.zip';
export const OUTPUT_DIR = path.resolve('assets/audio/fola');

function catalogIds(value, result = new Set()) {
  if (Array.isArray(value)) value.forEach((item) => catalogIds(item, result));
  else if (value && typeof value === 'object') {
    if (typeof value.id === 'string') result.add(value.id);
    Object.values(value).forEach((item) => catalogIds(item, result));
  }
  return result;
}

export function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function requiredPath(value) {
  if (typeof value !== 'string' || value.startsWith('/') || value.includes('\\') || value.split('/').includes('..')) throw new Error(`Ruta insegura en manifest: ${value}`);
  return value;
}

export function validateManifest(manifest, root, { verifyHashes = true, requiredIds = [] } = {}) {
  if (!manifest || manifest.clip_count !== 490 || !Array.isArray(manifest.clips) || manifest.clips.length !== 490) throw new Error('manifest.json debe contener exactamente 490 clips');
  const ids = new Set();
  for (const [i, clip] of manifest.clips.entries()) {
    if (!Number.isInteger(clip.index) || clip.index !== i + 1 || !clip.id || ids.has(clip.id)) throw new Error(`ID/index inválido o duplicado en clip ${i + 1}`);
    ids.add(clip.id);
    const rel = requiredPath(clip.file);
    if (!rel.startsWith('audios/') || !rel.endsWith('.wav')) throw new Error(`Archivo de audio inválido: ${rel}`);
    const full = path.resolve(root, rel);
    if (!full.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error(`Ruta de audio fuera del paquete: ${rel}`);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) throw new Error(`Falta audio declarado: ${rel}`);
    if (typeof clip.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(clip.sha256)) throw new Error(`SHA-256 inválido para ${rel}`);
    if (verifyHashes && sha256File(full) !== clip.sha256) throw new Error(`SHA-256 incorrecto para ${rel}`);
  }
  for (let i = 1; i <= 25; i++) {
    const catalog = path.join(root, 'catalogos', `paquete_${String(i).padStart(2, '0')}.json`);
    if (!fs.existsSync(catalog)) throw new Error(`Falta catálogo requerido: ${path.basename(catalog)}`);
    let catalogData;
    try { catalogData = JSON.parse(fs.readFileSync(catalog, 'utf8')); }
    catch (error) { throw new Error(`Catálogo inválido: ${path.basename(catalog)} (${error.message})`); }
    const catalogClipIds = catalogIds(catalogData);
    for (const id of catalogClipIds) if (!ids.has(id)) throw new Error(`Catálogo ${path.basename(catalog)} referencia ID inexistente: ${id}`);
    for (const item of findCatalogClips(catalogData)) {
      const catalogFile = item.file || item.archivo_real || item.archivo;
      const normalizedCatalogFile = catalogFile && (catalogFile.includes('/') ? catalogFile : `audios/${catalogFile}`);
      const manifestFile = manifest.clips.find((clip) => clip.id === item.id)?.file;
      if (normalizedCatalogFile !== undefined && requiredPath(normalizedCatalogFile) !== requiredPath(manifestFile)) {
        throw new Error(`Catálogo ${path.basename(catalog)} desalineado para ID: ${item.id}`);
      }
    }
  }
  for (const id of requiredIds) if (!ids.has(id)) throw new Error(`Falta ID Fola usado por la aplicación: ${id}`);
  return { clipCount: ids.size, catalogCount: 25 };
}

function findCatalogClips(value, result = []) {
  if (Array.isArray(value)) value.forEach((item) => findCatalogClips(item, result));
  else if (value && typeof value === 'object') {
    if (typeof value.id === 'string' && (typeof value.file === 'string' || typeof value.archivo_real === 'string' || typeof value.archivo === 'string')) result.push(value);
    Object.values(value).forEach((item) => findCatalogClips(item, result));
  }
  return result;
}

export function safeZipEntries(zipFile) {
  const output = childProcess.execFileSync('unzip', ['-Z1', zipFile], { encoding: 'utf8' }).trim();
  return output ? output.split('\n') : [];
}

export function validateZipEntries(entries) {
  const unique = new Set();
  for (const entry of entries) {
    requiredPath(entry);
    if (unique.has(entry)) throw new Error(`ZIP duplicado: ${entry}`);
    unique.add(entry);
  }
  const required = ['manifest.json', 'README.md', 'AUDITORIA.txt', ...Array.from({ length: 25 }, (_, i) => `catalogos/paquete_${String(i + 1).padStart(2, '0')}.json`), 'audios/'];
  for (const item of required) if (!entries.some((entry) => entry === item || entry.startsWith(item.endsWith('/') ? item : `${item}/`))) throw new Error(`ZIP incompleto: falta ${item}`);
  const audios = entries.filter((entry) => /^audios\/[^/]+\.wav$/.test(entry));
  if (audios.length !== 490) throw new Error(`ZIP incompleto: se esperaban 490 WAV y hay ${audios.length}`);
}

export function preparePackage(zipFile, outputDir = OUTPUT_DIR, { expectedSha256 = REQUIRED_SHA256, verifyHashes = true, requiredIds = FOLA_APPLICATION_IDS } = {}) {
  if (!fs.existsSync(zipFile)) throw new Error(`ZIP no encontrado: ${zipFile}`);
  const digest = sha256File(zipFile);
  if (digest !== expectedSha256) throw new Error(`Checksum Fola incorrecto: ${digest}; esperado ${expectedSha256}`);
  const entries = safeZipEntries(zipFile);
  validateZipEntries(entries);
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'multiplo-fola-'));
  try {
    childProcess.execFileSync('unzip', ['-q', zipFile, '-d', temp]);
    const manifest = JSON.parse(fs.readFileSync(path.join(temp, 'manifest.json'), 'utf8'));
    validateManifest(manifest, temp, { verifyHashes, requiredIds });
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(path.dirname(outputDir), { recursive: true });
    // El directorio temporal puede estar en otro filesystem dentro del runner.
    fs.cpSync(temp, outputDir, { recursive: true });
    fs.rmSync(temp, { recursive: true, force: true });
    return { outputDir, digest, ...validateManifest(manifest, outputDir, { verifyHashes, requiredIds }) };
  } catch (error) {
    fs.rmSync(temp, { recursive: true, force: true });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const zip = process.argv[2] || path.resolve('.cache/multiplo-fola-v1.1.0-audios-490.zip');
  if (!fs.existsSync(zip)) {
    fs.mkdirSync(path.dirname(zip), { recursive: true });
    childProcess.execFileSync('curl', ['-fL', '--retry', '2', '-o', zip, RELEASE_URL], { stdio: 'inherit' });
  }
  try { console.log(JSON.stringify(preparePackage(zip), null, 2)); }
  catch (error) { console.error(`Fola no preparada: ${error.message}`); process.exitCode = 1; }
}
