import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  MASCOT_ASSETS,
  AUDIO_ASSETS,
  GUIDE_STATES,
  GUIDE_SCRIPT,
  STATE_DESCRIPTIONS,
  SOUND_STORAGE_KEY,
  getStoredSoundPreference,
  setStoredSoundPreference,
  playAudioEffect,
  StarGuideCoordinator
} from '../js/star-guide.js';

const projectRoot = process.cwd();

// --- 1. INTEGRACIÓN DE RECURSOS Y ESTADO DE GUÍA ---

test('1.1 Inventario de recursos multimedia: los 4 SVG y 4 WAV existen y no hay dependencias externas', () => {
  // 4 SVG de mascota
  const expectedMascotKeys = ['normal', 'hablando', 'celebrando', 'pensando'];
  assert.deepEqual(Object.keys(MASCOT_ASSETS).sort(), expectedMascotKeys.sort());

  for (const [key, relPath] of Object.entries(MASCOT_ASSETS)) {
    const fullPath = path.join(projectRoot, relPath);
    assert.ok(fs.existsSync(fullPath), `El SVG de mascota "${key}" (${relPath}) debe existir físicamente`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert.ok(content.includes('<svg'), `El archivo ${relPath} debe ser un SVG válido`);
    // Asegurar que no carga recursos externos enlazados (ej. image href, external scripts o styles)
    assert.ok(!content.includes('href="http') && !content.includes('src="http') && !content.includes('<image'), `El SVG ${relPath} no debe enlazar imágenes o recursos externos`);
  }

  // 4 WAV de audio
  const expectedAudioKeys = ['acierto', 'intento', 'celebracion', 'clic'];
  assert.deepEqual(Object.keys(AUDIO_ASSETS).sort(), expectedAudioKeys.sort());

  for (const [key, relPath] of Object.entries(AUDIO_ASSETS)) {
    const fullPath = path.join(projectRoot, relPath);
    assert.ok(fs.existsSync(fullPath), `El WAV "${key}" (${relPath}) debe existir físicamente`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 100, `El archivo ${relPath} debe tener contenido de audio real`);
  }
});

test('1.2 Definición de estados mínimos de la guía e iconografía accesible además de color', () => {
  const states = [GUIDE_STATES.NORMAL, GUIDE_STATES.HABLANDO, GUIDE_STATES.CELEBRANDO, GUIDE_STATES.PENSANDO];
  assert.deepEqual(states, ['normal', 'hablando', 'celebrando', 'pensando']);

  for (const state of states) {
    const desc = STATE_DESCRIPTIONS[state];
    assert.ok(desc, `Cada estado debe tener descripción asociada: ${state}`);
    assert.ok(desc.text && desc.text.length > 0, `El estado ${state} debe tener texto legible`);
    assert.ok(desc.icon && desc.icon.length > 0, `El estado ${state} debe tener iconografía distintiva`);
    assert.ok(desc.label && desc.label.length > 0, `El estado ${state} debe tener etiqueta accesible`);
  }

  // Comprobar que los textos e iconos son distintos entre estados
  const icons = states.map((s) => STATE_DESCRIPTIONS[s].icon);
  const texts = states.map((s) => STATE_DESCRIPTIONS[s].text);
  assert.equal(new Set(icons).size, 4, 'Los 4 estados deben tener iconos diferentes para no depender solo del color');
  assert.equal(new Set(texts).size, 4, 'Los 4 estados deben tener textos diferentes para no depender solo del color');
});

test('1.3 Lectura y escritura tolerantes de preferencia local de sonido (respeto de silencio y tolerancia a fallos)', () => {
  // Simulación de localStorage funcional
  const mockStorage = {
    store: {},
    getItem(k) { return this.store[k] ?? null; },
    setItem(k, v) { this.store[k] = String(v); }
  };

  // Valor por defecto sin almacenamiento previo debe ser true
  assert.equal(getStoredSoundPreference(mockStorage), true);

  // Guardar silencio
  setStoredSoundPreference(false, mockStorage);
  assert.equal(mockStorage.getItem(SOUND_STORAGE_KEY), 'false');
  assert.equal(getStoredSoundPreference(mockStorage), false, 'Una nueva sesión debe respetar el silencio conservado');

  // Reactivar sonido
  setStoredSoundPreference(true, mockStorage);
  assert.equal(mockStorage.getItem(SOUND_STORAGE_KEY), 'true');
  assert.equal(getStoredSoundPreference(mockStorage), true);

  // Tolerancia a null/undefined storage
  assert.equal(getStoredSoundPreference(null), true);
  assert.equal(setStoredSoundPreference(true, null), false);

  // Tolerancia a errores de localStorage (ej. cuota excedida o modo privado estricto)
  const throwingStorage = {
    getItem() { throw new Error('SecurityError: Access is denied'); },
    setItem() { throw new Error('QuotaExceededError'); }
  };
  assert.doesNotThrow(() => {
    const pref = getStoredSoundPreference(throwingStorage);
    assert.equal(pref, true, 'Debe devolver valor por defecto ante error de lectura');
  });

  assert.doesNotThrow(() => {
    const res = setStoredSoundPreference(false, throwingStorage);
    assert.equal(res, false, 'No debe arrojar excepción ante error de escritura');
  });

  // Tolerancia a valores corruptos
  mockStorage.store[SOUND_STORAGE_KEY] = 'invalido_corrupto_123';
  assert.equal(getStoredSoundPreference(mockStorage), true, 'Valor corrupto debe degradar a true de forma segura');
});

// --- 2. NARRACIÓN Y EFECTOS NO BLOQUEANTES ---

test('2.1 Coordinador de instrucciones: selección de voz española y fallback sin voz', () => {
  let spokenUtterances = [];
  const mockSpeechSynthesis = {
    voices: [
      { name: 'English Voice', lang: 'en-US' },
      { name: 'Voz Española México', lang: 'es-MX' },
      { name: 'Voz Española España', lang: 'es-ES' }
    ],
    getVoices() { return this.voices; },
    speak(utt) { spokenUtterances.push(utt); },
    cancel() {},
    addEventListener() {}
  };

  const mockUtteranceFactory = (text) => ({
    text,
    lang: '',
    voice: null,
    rate: 1,
    onstart: null,
    onend: null,
    onerror: null
  });

  const guide = new StarGuideCoordinator({
    speechSynthesis: mockSpeechSynthesis,
    utteranceFactory: mockUtteranceFactory,
    storage: null
  });

  // Debe haber seleccionado una voz en español
  const selectedVoice = guide.selectSpanishVoice();
  assert.ok(selectedVoice, 'Debe seleccionar una voz en español');
  assert.match(selectedVoice.lang, /^es/i, 'La voz seleccionada debe tener código español');

  // Hablar una consigna
  guide.speakInstruction('Mira: tres grupos de dos');
  assert.equal(guide.getLastInstruction(), 'Mira: tres grupos de dos');
  assert.equal(spokenUtterances.length, 1);
  assert.equal(spokenUtterances[0].text, 'Mira: tres grupos de dos');
  assert.equal(spokenUtterances[0].voice.lang, 'es-MX');

  // Degradación cuando NO hay síntesis de voz (ej. navegador sin API)
  const guideWithoutSpeech = new StarGuideCoordinator({
    speechSynthesis: null,
    utteranceFactory: null,
    storage: null
  });

  assert.doesNotThrow(() => {
    guideWithoutSpeech.speakInstruction('¿Cuántos hay en total?');
  });
  // La instrucción textual se conserva sin bloqueo
  assert.equal(guideWithoutSpeech.getLastInstruction(), '¿Cuántos hay en total?');
});

test('2.2 Repetición de última instrucción, cancelación y prevención de solapamientos', () => {
  let cancelCalledCount = 0;
  let spokenUtterances = [];

  const mockSpeechSynthesis = {
    getVoices() { return [{ name: 'Voz ES', lang: 'es-ES' }]; },
    speak(utt) { spokenUtterances.push(utt); },
    cancel() { cancelCalledCount++; },
    addEventListener() {}
  };

  const mockUtteranceFactory = (text) => ({
    text,
    lang: 'es-ES',
    voice: null,
    onstart: null,
    onend: null,
    onerror: null
  });

  let stateChanges = [];
  const guide = new StarGuideCoordinator({
    speechSynthesis: mockSpeechSynthesis,
    utteranceFactory: mockUtteranceFactory,
    storage: null,
    onStateChange: (st) => stateChanges.push(st)
  });

  // 1. Primera instrucción
  guide.speakInstruction('Instrucción Uno');
  assert.equal(cancelCalledCount, 1, 'Debe cancelar discurso previo antes de empezar');
  assert.equal(guide.getLastInstruction(), 'Instrucción Uno');

  // 2. Segunda instrucción cancela la anterior inmediatamente (no solapamiento)
  guide.speakInstruction('Instrucción Dos');
  assert.equal(cancelCalledCount, 2, 'Nueva instrucción debe cancelar la anterior');
  assert.equal(guide.getLastInstruction(), 'Instrucción Dos');

  // 3. Repetir última instrucción
  guide.repeatLastInstruction();
  assert.equal(cancelCalledCount, 3, 'Repetir debe cancelar el discurso previo');
  assert.equal(guide.getLastInstruction(), 'Instrucción Dos', 'Repetir no debe alterar el contenido de la instrucción');

  // 4. Cambiar de actividad detiene la voz anterior
  guide.cancelSpeech();
  assert.equal(cancelCalledCount, 4, 'Cancelar discurso al cambiar de actividad debe llamar a cancel()');
});

test('2.3 Manejo de gestos iniciales y excepciones de síntesis de voz', () => {
  const guide = new StarGuideCoordinator({
    speechSynthesis: {
      getVoices() { return []; },
      speak() { throw new Error('NotAllowedError: user gesture required'); },
      cancel() {}
    },
    utteranceFactory: (text) => ({ text }),
    storage: null
  });

  // Antes de gesto
  assert.equal(guide.hasUserGesture(), false);
  guide.notifyUserGesture();
  assert.equal(guide.hasUserGesture(), true);

  // Si la síntesis arroja error por autoplay bloqueado, no debe lanzar excepción
  assert.doesNotThrow(() => {
    guide.speakInstruction('¡Hola! Vamos a jugar');
  });
  assert.equal(guide.getLastInstruction(), '¡Hola! Vamos a jugar');
});

test('2.4 Modo silencioso como interruptor único: silencia voz y efectos sonoros', () => {
  let cancelCalled = 0;
  let speakCalls = 0;
  let audioPlayed = 0;

  const mockStorage = {
    store: { [SOUND_STORAGE_KEY]: 'true' },
    getItem(k) { return this.store[k]; },
    setItem(k, v) { this.store[k] = String(v); }
  };

  const mockAudioFactory = () => ({
    play() {
      audioPlayed++;
      return Promise.resolve();
    }
  });

  const guide = new StarGuideCoordinator({
    speechSynthesis: {
      getVoices() { return []; },
      speak() { speakCalls++; },
      cancel() { cancelCalled++; }
    },
    utteranceFactory: (text) => ({ text }),
    storage: mockStorage,
    audioFactory: mockAudioFactory
  });

  assert.equal(guide.isSoundEnabled(), true);

  // Con sonido activo: se emite voz y efecto
  guide.speakInstruction('Hablando');
  assert.equal(speakCalls, 1);
  guide.playEffect('acierto');
  assert.equal(audioPlayed, 1);

  // Silenciar sonido
  guide.setSoundEnabled(false);
  assert.equal(guide.isSoundEnabled(), false);
  assert.ok(cancelCalled >= 1, 'Silenciar debe cancelar la voz en curso');

  // Con sonido silenciado: no se llama a speak ni se reproduce audio
  guide.speakInstruction('Silencio');
  assert.equal(speakCalls, 1, 'No debe hablar si está silenciado');
  guide.playEffect('intento');
  assert.equal(audioPlayed, 1, 'No debe reproducir efectos si está silenciado');

  // Reactivar sonido
  guide.toggleSound();
  assert.equal(guide.isSoundEnabled(), true);
  guide.playEffect('clic');
  assert.equal(audioPlayed, 2, 'Al reactivar sonido debe poder reproducir efectos nuevamente');
});

test('2.5 Efectos sonoros discretos (clic, acierto, intento, celebracion) y absorción de fallos', () => {
  const playedFiles = [];
  const mockAudioFactory = (src) => {
    playedFiles.push(src);
    return {
      play() {
        return Promise.resolve();
      }
    };
  };

  // 1. Cada evento asociado al WAV correcto
  for (const effect of ['clic', 'acierto', 'intento', 'celebracion']) {
    playAudioEffect(effect, true, mockAudioFactory);
    assert.equal(playedFiles[playedFiles.length - 1], AUDIO_ASSETS[effect]);
  }

  // 2. Error al reproducir audio (ej. rechazo de autoplay o archivo corrupto) se absorbe silenciosamente
  const rejectingAudioFactory = () => ({
    play() {
      return Promise.reject(new Error('DOMException: The play() request was interrupted'));
    }
  });

  assert.doesNotThrow(() => {
    playAudioEffect('acierto', true, rejectingAudioFactory);
  });

  // 3. Constructor Audio inexistente o que arroja error
  const throwingAudioFactory = () => {
    throw new Error('Audio not supported');
  };

  assert.doesNotThrow(() => {
    playAudioEffect('acierto', true, throwingAudioFactory);
  });

  // 4. Nombre de efecto desconocido retorna null sin error
  assert.equal(playAudioEffect('desconocido', true, mockAudioFactory), null);
});

// --- 3. GUION Y EXPERIENCIA DE LA ACTIVIDAD ---

test('3.1 Catálogo de frases breves cubre el recorrido completo del MVP', () => {
  const requiredPhrases = [
    '¡Hola! Vamos a jugar',
    'Mira: tres grupos de dos',
    '¿Cuántos hay en total?',
    '¡Muy bien!',
    'Cuenta otra vez',
    '¡Terminaste la aventura!'
  ];

  const scriptValues = Object.values(GUIDE_SCRIPT);
  for (const phrase of requiredPhrases) {
    assert.ok(
      scriptValues.includes(phrase),
      `El guion debe incluir la frase canónica: "${phrase}"`
    );
  }
});

test('3.2 Retroalimentación empática ante error: invita a reintentar y no castiga', () => {
  const guide = new StarGuideCoordinator({ storage: null });

  // Error de respuesta: pasa a estado pensando con mensaje amable
  guide.setState(GUIDE_STATES.PENSANDO);
  assert.equal(guide.getState(), GUIDE_STATES.PENSANDO);

  const desc = STATE_DESCRIPTIONS[guide.getState()];
  assert.equal(desc.text, 'Pensando');
  assert.equal(desc.icon, '🤔');

  // La frase empática de reintento existe y es respetuosa
  assert.equal(GUIDE_SCRIPT.reintento, 'Cuenta otra vez');

  // Acierto: pasa a estado celebrando
  guide.setState(GUIDE_STATES.CELEBRANDO);
  assert.equal(guide.getState(), GUIDE_STATES.CELEBRANDO);
  assert.equal(STATE_DESCRIPTIONS[guide.getState()].icon, '🎉');
});
