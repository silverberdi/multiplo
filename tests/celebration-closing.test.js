import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  createQuestionRound,
  evaluateAnswer,
  advanceRound,
  MODALITIES
} from '../js/question-engine.js';

import {
  closeRoundProgression,
  evaluateProgressionUnlock,
  LEVELS_CATALOG
} from '../js/progression.js';

import {
  StarGuideCoordinator,
  GUIDE_STATES,
  GUIDE_SCRIPT,
  AUDIO_ASSETS,
  MASCOT_ASSETS
} from '../js/star-guide.js';

const projectRoot = process.cwd();

test('1. Contrato de resultado y coordinación de ronda', async (t) => {
  await t.test('1.1 Resultado único de ronda con nivel, 4 indicadores firstAttemptCorrect inmutables y total 0-4', () => {
    const round = createQuestionRound(1, { bValues: [1, 2, 3, 4] });

    // Q1: Primer intento fallido, segundo acertado -> firstAttemptCorrect debe ser FALSE
    const q0 = round.questions[0];
    const wrong0 = q0.alternatives.find((a) => !a.isCorrect);
    const correct0 = q0.alternatives.find((a) => a.isCorrect);
    evaluateAnswer(round, wrong0);
    assert.equal(q0.firstAttemptCorrect, false, 'Primer intento fallido');
    evaluateAnswer(round, correct0);
    assert.equal(q0.firstAttemptCorrect, false, 'Reintento exitoso no debe mutar firstAttemptCorrect a true');
    advanceRound(round);

    // Q2: Primer intento correcto
    const q1 = round.questions[1];
    const correct1 = q1.alternatives.find((a) => a.isCorrect);
    evaluateAnswer(round, correct1);
    assert.equal(q1.firstAttemptCorrect, true);
    advanceRound(round);

    // Q3: Primer intento correcto
    const q2 = round.questions[2];
    const correct2 = q2.alternatives.find((a) => a.isCorrect);
    evaluateAnswer(round, correct2);
    assert.equal(q2.firstAttemptCorrect, true);
    advanceRound(round);

    // Q4: Primer intento correcto
    const q3 = round.questions[3];
    const correct3 = q3.alternatives.find((a) => a.isCorrect);
    evaluateAnswer(round, correct3);
    assert.equal(q3.firstAttemptCorrect, true);
    const adv = advanceRound(round);

    assert.equal(adv.isFinished, true);
    const summary = round.summary;
    assert.ok(summary, 'Debe existir round.summary');
    assert.equal(summary.level, 1);
    assert.equal(summary.totalQuestions, 4);
    assert.equal(summary.firstAttemptSuccesses, 3);
    assert.equal(summary.stars, 3);
    assert.deepEqual(Array.from(summary.firstAttemptCorrect), [false, true, true, true]);
    assert.deepEqual(Array.from(summary.firstAttempts), [false, true, true, true]);
    assert.equal(summary.passed, true);

    // Invariante de congelación: summary no debe ser mutable
    assert.throws(() => {
      summary.firstAttemptSuccesses = 4;
    }, /TypeError/, 'round.summary debe ser inmutable (Object.freeze)');
  });

  await t.test('1.2 Verificación exhaustiva de casos de aciertos 0/4, 1/4, 2/4, 3/4 y 4/4', () => {
    for (let expectedScore = 0; expectedScore <= 4; expectedScore++) {
      const round = createQuestionRound(2, { bValues: [1, 2, 3, 4] });
      for (let i = 0; i < 4; i++) {
        const q = round.questions[i];
        if (i < expectedScore) {
          evaluateAnswer(round, q.alternatives.find((a) => a.isCorrect));
        } else {
          evaluateAnswer(round, q.alternatives.find((a) => !a.isCorrect));
          evaluateAnswer(round, q.alternatives.find((a) => a.isCorrect));
        }
        advanceRound(round);
      }
      assert.equal(round.summary.firstAttemptSuccesses, expectedScore);
      assert.equal(round.summary.stars, expectedScore);
      assert.equal(round.summary.passed, expectedScore >= 3);
      assert.equal(round.summary.firstAttemptCorrect.filter(Boolean).length, expectedScore);
    }
  });

  await t.test('1.3 Entrega una sola vez al terminar la cuarta pregunta y conexión con progresión', () => {
    const progressionState = { version: 1, highestUnlockedLevel: 1, soundEnabled: true };
    const round = createQuestionRound(1, { bValues: [1, 2, 3, 4] });

    for (let i = 0; i < 4; i++) {
      evaluateAnswer(round, round.questions[i].alternatives.find((a) => a.isCorrect));
      advanceRound(round);
    }

    const firstClose = closeRoundProgression(progressionState, round);
    assert.equal(firstClose.highestUnlockedLevel, 2);
    assert.equal(firstClose.unlockedNewLevel, true);
    assert.equal(firstClose.alreadyProcessed, false);

    // Segunda llamada debe ser idempotente
    const secondClose = closeRoundProgression(progressionState, round);
    assert.equal(secondClose.alreadyProcessed, true);
    assert.equal(secondClose.highestUnlockedLevel, 2);
  });
});

test('2. Vista de celebración y acciones de cierre', async (t) => {
  await t.test('2.1 Recursos visuales del cierre: estrella-premio.svg y celebrando.svg existen y no son externos', () => {
    const starPremioPath = path.join(projectRoot, 'assets/icons/estrella-premio.svg');
    const celebrandoPath = path.join(projectRoot, 'assets/mascot/celebrando.svg');

    assert.ok(fs.existsSync(starPremioPath), 'estrella-premio.svg debe existir');
    assert.ok(fs.existsSync(celebrandoPath), 'celebrando.svg debe existir');

    const starPremioContent = fs.readFileSync(starPremioPath, 'utf-8');
    const celebrandoContent = fs.readFileSync(celebrandoPath, 'utf-8');

    assert.ok(!starPremioContent.includes('href="http') && !starPremioContent.includes('src="http') && !starPremioContent.includes('<image'), 'estrella-premio.svg no debe enlazar recursos externos');
    assert.ok(!celebrandoContent.includes('href="http') && !celebrandoContent.includes('src="http') && !celebrandoContent.includes('<image'), 'celebrando.svg no debe enlazar recursos externos');
  });

  await t.test('2.2 Desbloqueo y condicional de Siguiente nivel para 3/4 y 4/4 vs 0/4–2/4 y Nivel 4', () => {
    // Caso 3/4 en Nivel 1 -> desbloquea Nivel 2 y ofrece siguiente
    const unlock3 = evaluateProgressionUnlock(1, { level: 1, firstAttemptSuccesses: 3, passed: true });
    assert.equal(unlock3.highestUnlockedLevel, 2);
    assert.equal(unlock3.unlockedNewLevel, true);
    assert.equal(unlock3.nextLevel, 2);

    // Caso 4/4 en Nivel 2 -> desbloquea Nivel 3 y ofrece siguiente
    const unlock4 = evaluateProgressionUnlock(2, { level: 2, firstAttemptSuccesses: 4, passed: true });
    assert.equal(unlock4.highestUnlockedLevel, 3);
    assert.equal(unlock4.nextLevel, 3);

    // Caso 2/4 en Nivel 1 -> no desbloquea, no ofrece siguiente
    const noUnlock = evaluateProgressionUnlock(1, { level: 1, firstAttemptSuccesses: 2, passed: false });
    assert.equal(noUnlock.highestUnlockedLevel, 1);
    assert.equal(noUnlock.unlockedNewLevel, false);
    assert.equal(noUnlock.nextLevel, null);

    // Caso 4/4 en Nivel 4 -> NUNCA desbloquea Nivel 5 ni ofrece siguiente nivel
    const level4Complete = evaluateProgressionUnlock(4, { level: 4, firstAttemptSuccesses: 4, passed: true });
    assert.equal(level4Complete.highestUnlockedLevel, 4);
    assert.equal(level4Complete.unlockedNewLevel, false);
    assert.equal(level4Complete.nextLevel, null, 'Nivel 4 nunca ofrece Nivel 5');
  });

  await t.test('2.3 Conservación incondicional de niveles previos tras ronda con 0/4 aciertos', () => {
    // Si el niño ya tenía desbloqueado hasta el Nivel 3 y juega el Nivel 2 con 0 aciertos
    const res = evaluateProgressionUnlock(3, { level: 2, firstAttemptSuccesses: 0, passed: false });
    assert.equal(res.highestUnlockedLevel, 3, 'El progreso previo no se revierte ante una ronda de 0 estrellas');
    assert.equal(res.unlockedNewLevel, false);
  });
});

test('3. Voz, efectos discretos y degradación no bloqueante', async (t) => {
  await t.test('3.1 acierto.wav se dispara en acierto y celebracion.wav una vez al cierre', () => {
    const effectsPlayed = [];
    const mockAudioFactory = (src) => {
      effectsPlayed.push(src);
      return {
        play: () => Promise.resolve(),
        pause: () => {},
        currentTime: 0
      };
    };

    const guide = new StarGuideCoordinator({
      audioFactory: mockAudioFactory,
      speechSynthesis: null,
      storage: null
    });

    // En acierto
    guide.playEffect('acierto');
    assert.equal(effectsPlayed[effectsPlayed.length - 1], AUDIO_ASSETS.acierto);

    // Al cierre
    guide.playEffect('celebracion');
    assert.equal(effectsPlayed[effectsPlayed.length - 1], AUDIO_ASSETS.celebracion);
  });

  await t.test('3.2 Modo silenciado: no reproduce acierto ni celebracion', () => {
    const effectsPlayed = [];
    const mockAudioFactory = (src) => {
      effectsPlayed.push(src);
      return { play: () => Promise.resolve() };
    };

    const guide = new StarGuideCoordinator({
      audioFactory: mockAudioFactory,
      speechSynthesis: null,
      storage: null
    });

    guide.setSoundEnabled(false);
    assert.equal(guide.isSoundEnabled(), false);

    const resAcierto = guide.playEffect('acierto');
    const resCelebracion = guide.playEffect('celebracion');
    assert.equal(resAcierto, null);
    assert.equal(resCelebracion, null);
    assert.equal(effectsPlayed.length, 0, 'No debe reproducir ningún efecto con sonido desactivado');
  });

  await t.test('3.3 Cancelación de voz y audio activo al cambiar de actividad', () => {
    let audioPaused = false;
    let speechCancelled = false;

    const mockAudio = {
      play: () => Promise.resolve(),
      pause: () => {
        audioPaused = true;
      },
      currentTime: 0
    };

    const mockSpeech = {
      cancel: () => {
        speechCancelled = true;
      },
      getVoices: () => []
    };

    const guide = new StarGuideCoordinator({
      audioFactory: () => mockAudio,
      speechSynthesis: mockSpeech,
      storage: null
    });

    guide.playEffect('celebracion');
    guide.cancelSpeech();

    assert.equal(speechCancelled, true, 'cancelSpeech debe cancelar síntesis de voz');
    assert.equal(audioPaused, true, 'cancelSpeech debe pausar audio activo');
  });

  await t.test('3.4 Tolerancia a rechazo de reproducción de audio (autoplay bloqueado)', () => {
    const failingAudio = {
      play: () => Promise.reject(new Error('NotAllowedError: play() failed')),
      pause: () => {},
      currentTime: 0
    };

    const guide = new StarGuideCoordinator({
      audioFactory: () => failingAudio,
      speechSynthesis: null,
      storage: null
    });

    // No debe lanzar excepción
    assert.doesNotThrow(() => {
      guide.playEffect('celebracion');
    });
  });
});

test('4. Retiro seguro (safe retirement) y consistencia de cierre', () => {
  const htmlPath = path.join(projectRoot, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');

  // No debe existir el contenedor estático de recompensa obsoleto
  assert.ok(!html.includes('reward-stars-container'), 'No debe quedar reward-stars-container');

  // No debe haber más de un contenedor fin
  const finSections = html.match(/id="view-fin"/g) || [];
  assert.equal(finSections.length, 1, 'Debe haber exactamente una vista fin de ronda');

  // El contenedor de estrellas dinámicas debe estar presente
  assert.ok(html.includes('id="fin-stars-container"'), 'Debe existir #fin-stars-container');
  assert.ok(html.includes('id="fin-stars-count"'), 'Debe existir #fin-stars-count');
});
