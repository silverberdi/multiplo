/**
 * Múltiplo — Coordinador de guía estrella, voz (SpeechSynthesis) y efectos sonoros
 * Alcance: MVP-02 (Issue #2 - Estrella guía e instrucciones con voz en español)
 * 
 * Cumple con:
 * - Selección de voz nativa en español con degradación elegante si no existe API o voz
 * - Texto siempre visible como fuente de verdad
 * - Repetición de última instrucción sin alterar pregunta o progreso
 * - Ciclo de cancelación para evitar solapamiento de discursos
 * - Modo silencioso como interruptor único (persiste en localStorage tolerante)
 * - Efectos sonoros WAV discretos y no bloqueantes (absorbe rechazos y archivos faltantes)
 * - Estados de mascota: normal, hablando, celebrando, pensando (con iconografía + texto)
 * - Sin backend, sin dependencias externas, sin recopilación de datos de menores
 */

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
    this.speechSynthesis = options.speechSynthesis !== undefined ? options.speechSynthesis : (typeof window !== 'undefined' ? window.speechSynthesis : null);
    this.storage = options.storage !== undefined ? options.storage : (typeof localStorage !== 'undefined' ? localStorage : null);
    this.audioFactory = options.audioFactory !== undefined ? options.audioFactory : (typeof Audio !== 'undefined' ? (src) => new Audio(src) : null);
    this.utteranceFactory = options.utteranceFactory !== undefined ? options.utteranceFactory : (typeof SpeechSynthesisUtterance !== 'undefined' ? (text) => new SpeechSynthesisUtterance(text) : null);
    
    this.onStateChange = options.onStateChange || (() => {});
    this.onInstructionChange = options.onInstructionChange || (() => {});

    this.soundEnabled = getStoredSoundPreference(this.storage);
    this.currentState = GUIDE_STATES.NORMAL;
    this.lastInstruction = '';
    this.activeUtteranceId = 0;
    this.currentUtterance = null;
    this.spanishVoice = null;
    this._hasUserGesture = false;

    this.initVoice();
  }

  initVoice() {
    if (this.speechSynthesis && typeof this.speechSynthesis.getVoices === 'function') {
      this.selectSpanishVoice();
      if (typeof this.speechSynthesis.addEventListener === 'function') {
        this.speechSynthesis.addEventListener('voiceschanged', () => this.selectSpanishVoice());
      } else if ('onvoiceschanged' in this.speechSynthesis) {
        this.speechSynthesis.onvoiceschanged = () => this.selectSpanishVoice();
      }
    }
  }

  selectSpanishVoice() {
    if (!this.speechSynthesis || typeof this.speechSynthesis.getVoices !== 'function') return null;
    try {
      const voices = this.speechSynthesis.getVoices() || [];
      // Buscar voz con código español (es, es-ES, es-MX, es-419, es-US, etc.)
      const esVoice = voices.find((v) => v && v.lang && v.lang.toLowerCase().startsWith('es'));
      this.spanishVoice = esVoice || null;
      return this.spanishVoice;
    } catch (_e) {
      return null;
    }
  }

  notifyUserGesture() {
    this._hasUserGesture = true;
  }

  hasUserGesture() {
    return this._hasUserGesture;
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
    }
    return this.soundEnabled;
  }

  cancelSpeech() {
    this.activeUtteranceId++;
    if (this.speechSynthesis && typeof this.speechSynthesis.cancel === 'function') {
      try {
        this.speechSynthesis.cancel();
      } catch (_e) {}
    }
    this.currentUtterance = null;
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
    const utteranceId = ++this.activeUtteranceId;

    // Si el sonido está silenciado o no hay síntesis, no se sintetiza audio, pero el texto permanece
    if (!this.soundEnabled || !this.speechSynthesis || !this.utteranceFactory) {
      return;
    }

    try {
      const utterance = this.utteranceFactory(text);
      if (!utterance) return;

      utterance.lang = 'es-ES';
      if (!this.spanishVoice) {
        this.selectSpanishVoice();
      }
      if (this.spanishVoice) {
        utterance.voice = this.spanishVoice;
      }
      utterance.rate = 0.95; // Velocidad pausada y clara para un niño de 6 años

      utterance.onstart = () => {
        if (this.activeUtteranceId === utteranceId) {
          this.setState(GUIDE_STATES.HABLANDO);
        }
      };

      utterance.onend = () => {
        if (this.activeUtteranceId === utteranceId) {
          this.setState(returnState);
        }
      };

      utterance.onerror = () => {
        if (this.activeUtteranceId === utteranceId) {
          this.setState(returnState);
        }
      };

      this.currentUtterance = utterance;
      this.speechSynthesis.speak(utterance);
    } catch (_e) {
      // Degradar silenciosamente: texto visible, sin interrupción de la experiencia
      if (this.activeUtteranceId === utteranceId) {
        this.setState(returnState);
      }
    }
  }

  /**
   * Repite la última instrucción emitida sin alterar progreso ni preguntas.
   */
  repeatLastInstruction() {
    if (this.lastInstruction) {
      this.speakInstruction(this.lastInstruction);
    }
  }

  getLastInstruction() {
    return this.lastInstruction;
  }

  /**
   * Dispara un efecto sonoro respetando soundEnabled.
   */
  playEffect(name) {
    return playAudioEffect(name, this.soundEnabled, this.audioFactory);
  }
}
