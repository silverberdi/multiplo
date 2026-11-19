import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import childProcess from 'node:child_process';
import { validateManifest, validateZipEntries, preparePackage } from '../scripts/validate-fola-assets.mjs';
import { FOLA_SHA256, FOLA_APPLICATION_IDS, clipFile, selectFolaClip, isMathTextCompatible } from '../js/fola-catalog.js';
import { StarGuideCoordinator } from '../js/star-guide.js';

function fixturePackage() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fola-fixture-'));
  fs.mkdirSync(path.join(root, 'audios'), { recursive: true });
  fs.mkdirSync(path.join(root, 'catalogos'));
  const clips = Array.from({ length: 490 }, (_, i) => {
    const id = `clip_${String(i + 1).padStart(3, '0')}`;
    const file = `audios/${String(i + 1).padStart(3, '0')}_${id}.wav`;
    const audio = Buffer.from(`RIFF-fixture-${i}`);
    fs.writeFileSync(path.join(root, file), audio);
    return { index: i + 1, id, file, sha256: crypto.createHash('sha256').update(audio).digest('hex') };
  });
  fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify({ clip_count: 490, clips }));
  for (let i = 1; i <= 25; i++) fs.writeFileSync(path.join(root, 'catalogos', `paquete_${String(i).padStart(2, '0')}.json`), JSON.stringify({ id: 'clip_001' }));
  fs.writeFileSync(path.join(root, 'README.md'), 'fixture');
  fs.writeFileSync(path.join(root, 'AUDITORIA.txt'), 'fixture');
  return root;
}

test('Fola: el contrato de release conserva URL/digest inmutables', () => {
  assert.equal(FOLA_SHA256, '202f108b81331e54b53c46bc983b87b65719dc8d1cac3079a12327a2d2d86929');
});

test('Fola: manifiesto fixture valida 490 IDs, rutas, hashes y catálogos sin descargar', () => {
  const root = fixturePackage();
  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
    assert.deepEqual(validateManifest(manifest, root, { requiredIds: ['clip_001'] }), { clipCount: 490, catalogCount: 25 });
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Fola: ZIP seguro acepta fixture completo y rechaza ruta de escape/checksum alterado antes de extraer', () => {
  const root = fixturePackage();
  const zip = path.join(root, 'fixture.zip');
  try {
    childProcess.execFileSync('zip', ['-q', '-r', zip, '.'], { cwd: root });
    const entries = childProcess.execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).trim().split('\n');
    validateZipEntries(entries);
    const output = path.join(root, 'out');
    assert.throws(() => preparePackage(zip, output), /Checksum Fola incorrecto/);
    const digest = crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
    assert.equal(preparePackage(zip, output, { expectedSha256: digest, verifyHashes: true, requiredIds: ['clip_001'] }).clipCount, 490);
    assert.throws(() => validateZipEntries(['manifest.json', '../escape']), /Ruta insegura/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Fola: la cobertura de IDs de aplicación queda dentro del manifiesto versionado', () => {
  assert.equal(new Set(FOLA_APPLICATION_IDS).size, FOLA_APPLICATION_IDS.length);
  for (const id of FOLA_APPLICATION_IDS) assert.match(clipFile(id) || '', /assets\/audio\/fola\/audios\/\d{2,3}_.*\.wav$/);
});

test('Fola: selector matemático de 3×2 distingue explicación, pregunta y operación', () => {
  for (const event of ['aprende', 'pregunta', 'alternativa']) {
    const clip = selectFolaClip(event, { a: 3, b: 2, producto: 6 });
    assert.ok(clip?.id.includes('03x02'));
    assert.ok(clip.file.endsWith('.wav'));
  }
  assert.equal(selectFolaClip('aprende', { a: 3, b: 3, producto: 9 }).id, 'explicacion_03x03');
  assert.equal(isMathTextCompatible('Tres por dos son seis.', { a: 3, b: 2 }), true);
  assert.equal(isMathTextCompatible('Tres por tres son nueve.', { a: 3, b: 2 }), false);
  assert.equal(selectFolaClip('aprende', { a: 3, b: 2 }, { clipId: 'no_existe' }), null);
  assert.equal(clipFile('numero_1'), 'assets/audio/fola/audios/391_numero_001.wav');
  assert.equal(selectFolaClip('pregunta', { a: 3, b: 2, producto: 7 }), null);
  assert.equal(selectFolaClip('pregunta', { a: 3, b: 2 }, { expectedText: '¿Cuánto es tres por tres?' }), null);
  assert.equal(clipFile('pregunta_11x01'), null);
  assert.equal(clipFile('numero_101'), null);
  assert.equal(selectFolaClip('aprende', { a: 3, b: 2 }, { expectedText: 'Hay tres grupos de tres.' }), null);
});

test('Fola: coordinador cancela reproducción anterior, descarta callback tardío y respeta silencio', () => {
  const audios = [];
  const guide = new StarGuideCoordinator({ storage: null, audioFactory: (src) => {
    const audio = { src, play: () => Promise.resolve(), pause() { this.paused = true; } };
    audios.push(audio); return audio;
  }});
  guide.notifyUserGesture();
  guide.speakInstruction('Mira: hay tres grupos.', { event: 'aprende', context: { a: 3, b: 2 } });
  guide.speakInstruction('¿Cuánto es tres por dos?', { event: 'pregunta', context: { a: 3, b: 2, producto: 6 } });
  assert.equal(audios.length, 2);
  assert.equal(audios[0].paused, true);
  const stale = audios[0].onended;
  stale?.();
  assert.equal(guide.getState(), 'hablando');
  guide.setSoundEnabled(false);
  assert.equal(audios[1].paused, true);
  assert.equal(guide.speakInstruction('no debe sonar', { event: 'bienvenida' }), null);
});

test('Audio: playEffect no es cancelado por speakInstruction inmediata y respeta canales independientes', () => {
  const audios = [];
  const guide = new StarGuideCoordinator({ storage: null, audioFactory: (src) => {
    const audio = { src, play: () => Promise.resolve(), pause() { this.paused = true; } };
    audios.push(audio); return audio;
  }});
  guide.notifyUserGesture();
  const effectAudio = guide.playEffect('acierto');
  guide.speakInstruction('¡Muy bien!', { event: 'acierto', context: { a: 3, b: 2, producto: 6 } });
  
  assert.equal(effectAudio.paused, undefined, 'El efecto sonoro no debe ser pausado por speakInstruction');
  assert.equal(guide.currentEffectAudio, effectAudio);
  
  // Cuando se deshabilita el sonido, se deben pausar ambos canales
  guide.setSoundEnabled(false);
  assert.equal(effectAudio.paused, true, 'El efecto sonoro debe pausarse al apagar el sonido');
});
