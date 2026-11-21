import test from 'node:test';
import assert from 'node:assert/strict';
import { AUDIO_ASSETS, GUIDE_STATES, StarGuideCoordinator } from '../js/star-guide.js';

function fakeAudioFactory(log) {
  return (src) => {
    const audio = {
      src,
      play() { log.push(`play:${src}`); this.onplay?.(); return Promise.resolve(); },
      pause() { this.paused = true; log.push(`pause:${src}`); },
    };
    return audio;
  };
}

test('Request #33: el acierto ordinario usa acierto.wav sin felicitación hablada repetitiva', () => {
  const log = [];
  const guide = new StarGuideCoordinator({ storage: null, audioFactory: fakeAudioFactory(log) });
  guide.notifyUserGesture();

  const effect = guide.playEffect('acierto');
  guide.setState(GUIDE_STATES.CELEBRANDO);

  assert.equal(effect.src, AUDIO_ASSETS.acierto);
  assert.deepEqual(log, [`play:${AUDIO_ASSETS.acierto}`]);
  assert.equal(guide.getState(), GUIDE_STATES.CELEBRANDO);
});

test('Request #33: contenido valioso conserva voz y los callbacks cancelados no reaniman la guía', () => {
  const audios = [];
  const guide = new StarGuideCoordinator({
    storage: null,
    audioFactory: (src) => {
      const audio = { src, play() { this.onplay?.(); return Promise.resolve(); }, pause() { this.paused = true; } };
      audios.push(audio);
      return audio;
    },
  });
  guide.notifyUserGesture();
  guide.speakInstruction('Mira: tres grupos de dos.', { event: 'aprende', context: { a: 3, b: 2 } });
  const staleEnded = audios[0].onended;
  guide.playEffect('acierto');
  staleEnded?.();

  assert.equal(audios[0].paused, true);
  assert.notEqual(guide.getState(), GUIDE_STATES.HABLANDO);
});

test('Request #33: silencio y fallos de reproducción conservan texto y flujo', async () => {
  const guide = new StarGuideCoordinator({
    storage: new Map(),
    audioFactory: () => ({ play: () => Promise.reject(new Error('blocked')), pause() {} }),
  });
  guide.notifyUserGesture();
  guide.speakInstruction('Cuenta otra vez', { event: 'ayudaReintentar' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(guide.getLastInstruction(), 'Cuenta otra vez');
  guide.setSoundEnabled(false);
  assert.equal(guide.playEffect('acierto'), null);
  assert.equal(guide.getState(), GUIDE_STATES.NORMAL);
});
