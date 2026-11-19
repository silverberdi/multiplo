/**
 * Múltiplo — Coordinador de guía estrella, voz Fola y efectos sonoros
 * Alcance: MVP-02 (Issue #2 - Estrella guía e instrucciones con voz en español)
 * 
 * Cumple con:
 * - Selección de locuciones Fola con degradación elegante si falta el recurso
 * - Texto siempre visible como fuente de verdad
 * - Repetición de última instrucción sin alterar pregunta o progreso
 * - Ciclo de cancelación para evitar solapamiento de discursos
 * - Modo silencioso como interruptor único (persiste en localStorage tolerante)
 * - Efectos sonoros WAV discretos y no bloqueantes (absorbe rechazos y archivos faltantes)
 * - Estados de mascota: normal, hablando, celebrando, pensando (con iconografía + texto)
 * - Sin backend, sin dependencias externas, sin recopilación de datos de menores
 */

import { selectFolaClip, isMathTextCompatible, FOLA_BASE_PATH } from './fola-catalog.js';

export const MASCOT_ASSETS = {
  normal: 'assets/mascot/normal.svg',
  hablando: 'assets/mascot/hablando.svg',
  celebrando: 'assets/mascot/celebrando.svg',
  pensando: 'assets/mascot/pensando.svg'
};

export const AUDIO_ASSETS = {
  acierto: 'assets/audio/acierto.wav',
  intento: 'assets/audio/intento.wav',
  celebracion: 'assets/audio/celebracion.wav',
  clic: 'assets/audio/clic.wav'
};

export const GUIDE_STATES = {
  NORMAL: 'normal',
  HABLANDO: 'hablando',
  CELEBRANDO: 'celebrando',
  PENSANDO: 'pensando'
};

export const STATE_DESCRIPTIONS = {
  normal: { text: 'Lista', icon: '⭐', label: 'Mascota lista' },
  hablando: { text: 'Hablando', icon: '🗣️', label: 'Mascota explicando' },
  celebrando: { text: '¡Muy bien!', icon: '🎉', label: 'Mascota celebrando' },
  pensando: { text: 'Pensando', icon: '🤔', label: 'Mascota pensando' }
};

export const GUIDE_SCRIPT = {
  bienvenida: '¡Hola! Vamos a jugar',
  demostracion: 'Mira: tres grupos de dos',
  pregunta: '¿Cuántos hay en total?',
  acierto: '¡Muy bien!',
  reintento: 'Cuenta otra vez',
  cierre: '¡Terminaste la aventura!',
  pista: 'Mira los grupos: cada uno tiene dos manzanas.'
};

export const SOUND_STORAGE_KEY = 'multiplo_sound_enabled';

/**
 * Lee la preferencia de sonido de forma tolerante a fallos de almacenamiento local.
 * Si localStorage está ausente, restringido o corrupto, retorna el valor seguro por defecto (true).
 */
export function getStoredSoundPreference(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) return true;
  try {
    const val = storage.getItem(SOUND_STORAGE_KEY);
    if (val === 'false') return false;
    if (val === 'true') return true;
    return true; // Por defecto activado en primera sesión
  } catch (_e) {
    return true;
  }
}

/**
 * Guarda la preferencia de sonido de forma tolerante.
 * Si localStorage arroja error (ej. modo incógnito estricto o cuota), no bloquea la ejecución.
 */
export function setStoredSoundPreference(enabled, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) return false;
  try {
    storage.setItem(SOUND_STORAGE_KEY, String(Boolean(enabled)));
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * Reproduce un efecto de sonido discreto si el sonido está habilitado.
 * Absorbe silenciosamente errores de carga, archivos faltantes y restricciones de autoplay.
 */
export function playAudioEffect(effectName, soundEnabled = true, audioFactory = (typeof Audio !== 'undefined' ? (src) => new Audio(src) : null)) {
  if (!soundEnabled) return null;
  const assetPath = AUDIO_ASSETS[effectName];
  if (!assetPath || !audioFactory) return null;

  try {
    const audio = audioFactory(assetPath);
    if (audio && typeof audio.play === 'function') {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((_err) => {
          // Fallo de reproducción (ej. autoplay bloqueado) absorbido sin romper la UX
        });
      }
      return audio;
    }
  } catch (_e) {
    // Error al instanciar Audio absorbido
  }
  return null;
}

/**
 * Clase coordinadora de la guía estrella
 */
export class StarGuideCoordinator {
  constructor(options = {}) {
    this.storage = options.storage !== undefined ? options.storage : (typeof localStorage !== 'undefined' ? localStorage : null);
    this.audioFactory = options.audioFactory !== undefined ? options.audioFactory : (typeof Audio !== 'undefined' ? (src) => new Audio(src) : null);
    
    this.onStateChange = options.onStateChange || (() => {});
    this.onInstructionChange = options.onInstructionChange || (() => {});

    this.soundEnabled = getStoredSoundPreference(this.storage);
    this.currentState = GUIDE_STATES.NORMAL;
    this.lastInstruction = '';
    this.activeNarrationId = 0;
    this.lastNarration = null;
    this._hasUserGesture = false;
    this.folaAvailable = typeof document === 'undefined';
    this.currentSpeechAudio = null;
    this.currentEffectAudio = null;
  }

  get currentAudio() {
    return this.currentSpeechAudio;
  }

  set currentAudio(audio) {
    this.currentSpeechAudio = audio;
  }

  notifyUserGesture() {
    this._hasUserGesture = true;
  }

  hasUserGesture() {
    return this._hasUserGesture;
  }

  setFolaAvailable(available) {
    this.folaAvailable = Boolean(available);
  }

  setState(state) {
    if (!Object.values(GUIDE_STATES).includes(state)) return;
    this.currentState = state;
    this.onStateChange(state, STATE_DESCRIPTIONS[state]);
  }

  getState() {
    return this.currentState;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  toggleSound() {
    return this.setSoundEnabled(!this.soundEnabled);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    setStoredSoundPreference(this.soundEnabled, this.storage);
    if (!this.soundEnabled) {
      this.cancelSpeech();
      this.stopCurrentEffectAudio();
    }
    return this.soundEnabled;
  }

  stopCurrentAudio() {
    if (this.currentSpeechAudio && typeof this.currentSpeechAudio.pause === 'function') {
      try {
        this.currentSpeechAudio.pause();
        this.currentSpeechAudio.currentTime = 0;
      } catch (_e) {}
    }
    this.currentSpeechAudio = null;
  }

  stopCurrentEffectAudio() {
    if (this.currentEffectAudio && typeof this.currentEffectAudio.pause === 'function') {
      try {
        this.currentEffectAudio.pause();
        this.currentEffectAudio.currentTime = 0;
      } catch (_e) {}
    }
    this.currentEffectAudio = null;
  }

  cancelSpeech() {
    this.activeNarrationId++;
    this.stopCurrentAudio();
    if (this.currentState === GUIDE_STATES.HABLANDO) {
      this.setState(GUIDE_STATES.NORMAL);
    }
  }

  /**
   * Presenta una instrucción en texto y la narra si el navegador y la preferencia lo permiten.
   * La instrucción escrita siempre se actualiza.
   * Cancela cualquier narración previa antes de comenzar la nueva para evitar solapamientos.
   */
  speakInstruction(text, options = {}) {
    if (!text) return;
    this.lastInstruction = text;
    this.onInstructionChange(text);

    // Cancelar siempre cualquier discurso previo para evitar solapamientos
    this.cancelSpeech();

    const returnState = options.returnState || GUIDE_STATES.NORMAL;
    const narrationId = ++this.activeNarrationId;
    const clip = options.clip || selectFolaClip(options.event || 'custom', options.context || {}, { clipId: options.clipId });
    this.lastNarration = { text, options: { ...options }, clip };
    if (!this.soundEnabled || !this._hasUserGesture || !this.folaAvailable || !clip?.file || !isMathTextCompatible(clip.expectedText || text, options.context || {})) {
      // El fallback textual conserva el estado semántico del evento sin fingir audio.
      this.setState(returnState);
      return null;
    }
    let audio;
    try { audio = this.audioFactory?.(clip.file); } catch (_e) { audio = null; }
    if (!audio || typeof audio.play !== 'function') return null;
    this.currentAudio = audio;
    const finish = () => { if (this.activeNarrationId === narrationId) { this.currentAudio = null; this.setState(returnState); } };
    audio.onended = finish;
    audio.onerror = finish;
    if (returnState === GUIDE_STATES.NORMAL) {
      audio.onplay = () => { if (this.activeNarrationId === narrationId) this.setState(GUIDE_STATES.HABLANDO); };
      this.setState(GUIDE_STATES.HABLANDO);
    }
    try { const result = audio.play(); result?.catch?.(finish); } catch (_e) { finish(); }
    return audio;
  }

  /**
   * Repite la última instrucción emitida sin alterar progreso ni preguntas.
   */
  repeatLastInstruction() {
    if (this.lastNarration) return this.speakInstruction(this.lastNarration.text, this.lastNarration.options);
    return null;
  }

  getLastInstruction() {
    return this.lastInstruction;
  }

  /**
   * Dispara un efecto sonoro respetando soundEnabled sin interferir con el canal de narración.
   */
  playEffect(name) {
    const audio = playAudioEffect(name, this.soundEnabled, this.audioFactory);
    this.currentEffectAudio = audio;
    return audio;
  }
}

export { FOLA_BASE_PATH };
