/**
 * Múltiplo — Modelo de progresión de niveles, desbloqueo y persistencia local
 * Alcance: MVP-05 (Issue #5 - Progresión de niveles 1 a 4, desbloqueo por umbral y persistencia local)
 *
 * Cumple con:
 * - Catálogo canónico de cuatro niveles (1..4) correspondientes a las tablas del 2, 3, 4 y 5
 * - Factores b en 1..5, convención a × b = a grupos de b (20 parejas válidas)
 * - Estado inicial: solo Nivel 1 abierto (highestUnlockedLevel = 1)
 * - Disponibilidad estrictamente secuencial derivada de highestUnlockedLevel (1..4)
 * - Umbral de desbloqueo: >= 3 aciertos en el primer intento (3/4 o 4/4) de la ronda completada
 * - Cierre idempotente: consume una sola vez el resumen inmutable del motor
 * - Conservación incondicional de niveles ya abiertos ante fallos o repeticiones
 * - Persistencia mínima en localStorage (highestUnlockedLevel y soundEnabled)
 * - Tolerancia total a localStorage ausente, bloqueado (SecurityError), cuota excedida o JSON corrupto
 * - Aviso seguro para adulto si el almacenamiento falla, sin llamadas de red ni telemetría
 * - Sin nivel 5 (en Nivel 4 no se ofrece siguiente nivel)
 */

export const PROGRESSION_STORAGE_KEY = 'multiplo_progression_v1';
export const SOUND_STORAGE_KEY = 'multiplo_sound_enabled';

export const LEVELS_CATALOG = Object.freeze([
  Object.freeze({
    level: 1,
    table: 2,
    a: 2,
    factors: Object.freeze([1, 2, 3, 4, 5]),
    name: 'Tabla del 2',
    ariaLabel: 'Nivel 1: Tabla del 2'
  }),
  Object.freeze({
    level: 2,
    table: 3,
    a: 3,
    factors: Object.freeze([1, 2, 3, 4, 5]),
    name: 'Tabla del 3',
    ariaLabel: 'Nivel 2: Tabla del 3'
  }),
  Object.freeze({
    level: 3,
    table: 4,
    a: 4,
    factors: Object.freeze([1, 2, 3, 4, 5]),
    name: 'Tabla del 4',
    ariaLabel: 'Nivel 3: Tabla del 4'
  }),
  Object.freeze({
    level: 4,
    table: 5,
    a: 5,
    factors: Object.freeze([1, 2, 3, 4, 5]),
    name: 'Tabla del 5',
    ariaLabel: 'Nivel 4: Tabla del 5'
  })
]);

export const UNLOCK_THRESHOLD = 3; // 3 de 4 aciertos al primer intento
export const MAX_LEVEL = 4;
export const MIN_LEVEL = 1;

/**
 * Obtiene la configuración de un nivel desde el catálogo único.
 * @param {number} level
 * @returns {Object}
 */
export function getLevelConfig(level) {
  const lvl = Number(level);
  const found = LEVELS_CATALOG.find((item) => item.level === lvl);
  if (!found) {
    throw new RangeError(`Nivel inválido: ${level}. Los niveles del MVP van del 1 al 4.`);
  }
  return found;
}

/**
 * Genera exhaustivamente las 20 parejas del catálogo único (5 por nivel)
 * con la convención a × b = a grupos de b.
 * @returns {Array<Object>}
 */
export function getAllCatalogPairs() {
  const pairs = [];
  for (const cfg of LEVELS_CATALOG) {
    for (const b of cfg.factors) {
      pairs.push({
        level: cfg.level,
        a: cfg.a,
        b,
        product: cfg.a * b,
        operationLabel: `${cfg.a} × ${b}`,
        groupsDescription: `${cfg.a} grupos de ${b}`
      });
    }
  }
  return pairs;
}

/**
 * Normaliza y valida el nivel máximo desbloqueado (1..4).
 * Si el valor no es un entero en [1, 4], retorna 1 (estado inicial seguro).
 * @param {any} val
 * @returns {number}
 */
export function normalizeHighestUnlockedLevel(val) {
  const num = Number(val);
  if (Number.isInteger(num) && num >= MIN_LEVEL && num <= MAX_LEVEL) {
    return num;
  }
  return MIN_LEVEL;
}

/**
 * Crea el estado inicial por defecto de progresión.
 * @returns {Object}
 */
export function createInitialProgressionState() {
  return {
    version: 1,
    highestUnlockedLevel: MIN_LEVEL,
    soundEnabled: true
  };
}

/**
 * Determina si un nivel dado está desbloqueado a partir del máximo actual.
 * El desbloqueo es estrictamente prefijo y secuencial: nunca puede haber un nivel abierto
 * si el anterior está bloqueado.
 * @param {number} level
 * @param {number} highestUnlockedLevel
 * @returns {boolean}
 */
export function isLevelUnlocked(level, highestUnlockedLevel) {
  const lvl = Number(level);
  const maxLvl = normalizeHighestUnlockedLevel(highestUnlockedLevel);
  return Number.isInteger(lvl) && lvl >= MIN_LEVEL && lvl <= maxLvl;
}

/**
 * Retorna la lista de niveles abiertos como enteros [1..highestUnlockedLevel].
 * @param {number} highestUnlockedLevel
 * @returns {Array<number>}
 */
export function getUnlockedLevels(highestUnlockedLevel) {
  const maxLvl = normalizeHighestUnlockedLevel(highestUnlockedLevel);
  const list = [];
  for (let i = MIN_LEVEL; i <= maxLvl; i++) {
    list.push(i);
  }
  return list;
}

/**
 * Valida y normaliza un objeto de estado persistido o en memoria.
 * Si contiene valores corruptos o fuera de rango, sanitiza de forma segura sin lanzar excepción.
 * @param {any} raw
 * @returns {Object}
 */
export function validateAndNormalizeState(raw) {
  const initial = createInitialProgressionState();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return initial;
  }

  const highestUnlockedLevel = normalizeHighestUnlockedLevel(raw.highestUnlockedLevel);
  const soundEnabled = typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : initial.soundEnabled;

  return {
    version: 1,
    highestUnlockedLevel,
    soundEnabled
  };
}

/**
 * Carga el estado de progresión de forma defensiva desde localStorage.
 * Tolera JSON inválido, datos incompletos, SecurityError o falta de soporte.
 * @param {Storage|null} storage
 * @returns {{ state: Object, storageAvailable: boolean, warning: string | null }}
 */
export function loadProgressionState(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  const defaultState = createInitialProgressionState();

  if (!storage) {
    return {
      state: defaultState,
      storageAvailable: false,
      warning: 'Almacenamiento no disponible en este entorno.'
    };
  }

  try {
    const raw = storage.getItem(PROGRESSION_STORAGE_KEY);
    if (!raw) {
      // Si no hay estado unificado, verificar si hay preferencia de sonido previa
      let soundPref = true;
      try {
        const legacySound = storage.getItem(SOUND_STORAGE_KEY);
        if (legacySound === 'false') soundPref = false;
      } catch (_e) {
        // Ignorar
      }
      return {
        state: {
          ...defaultState,
          soundEnabled: soundPref
        },
        storageAvailable: true,
        warning: null
      };
    }

    const parsed = JSON.parse(raw);
    const state = validateAndNormalizeState(parsed);
    return {
      state,
      storageAvailable: true,
      warning: null
    };
  } catch (_err) {
    // Error al leer o JSON corrupto -> usar estado seguro
    return {
      state: defaultState,
      storageAvailable: true,
      warning: 'No se pudo leer el progreso guardado; se iniciará en el Nivel 1.'
    };
  }
}

/**
 * Guarda el estado de progresión de forma defensiva en localStorage.
 * Captura y absorbe SecurityError, QuotaExceededError y entornos restringidos.
 * Sincroniza además la clave SOUND_STORAGE_KEY para compatibilidad con módulos existentes.
 * @param {Object} state
 * @param {Storage|null} storage
 * @returns {{ success: boolean, warning: string | null }}
 */
export function saveProgressionState(state, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) {
    return {
      success: false,
      warning: 'El almacenamiento local no está disponible. El juego continuará en esta sesión sin guardar progreso.'
    };
  }

  const normalized = validateAndNormalizeState(state);

  try {
    const payload = JSON.stringify(normalized);
    storage.setItem(PROGRESSION_STORAGE_KEY, payload);

    // Sincronizar clave heredada de sonido para retrocompatibilidad completa
    try {
      storage.setItem(SOUND_STORAGE_KEY, String(normalized.soundEnabled));
    } catch (_e) {
      // Ignorar si falla la clave secundaria
    }

    return {
      success: true,
      warning: null
    };
  } catch (_err) {
    return {
      success: false,
      warning: 'No se pudo guardar el progreso en este dispositivo. La partida continúa en memoria.'
    };
  }
}

/**
 * Aplica el umbral pedagógico (>= 3 aciertos en primer intento) sobre un resumen de ronda.
 * Invariantes:
 * - Solo se desbloquea si el nivel jugado estaba entre los niveles desbloqueados.
 * - Desbloquea como máximo el nivel inmediatamente posterior (level + 1).
 * - En ningún caso se desbloquea un nivel > 4 (no existe Nivel 5).
 * - Los niveles ya abiertos NUNCA se vuelven a bloquear ante fallos posteriores.
 * - Una respuesta corregida no incrementa el umbral ni desbloquea si firstAttemptSuccesses < 3.
 *
 * @param {number} currentHighestUnlocked
 * @param {Object} roundSummary - Resumen inmutable del motor { level, firstAttemptSuccesses, passed }
 * @returns {{
 *   highestUnlockedLevel: number,
 *   unlockedNewLevel: boolean,
 *   nextLevel: number | null,
 *   eligibleForNext: boolean
 * }}
 */
export function evaluateProgressionUnlock(currentHighestUnlocked, roundSummary) {
  const currentMax = normalizeHighestUnlockedLevel(currentHighestUnlocked);

  if (!roundSummary || typeof roundSummary !== 'object') {
    return {
      highestUnlockedLevel: currentMax,
      unlockedNewLevel: false,
      nextLevel: null,
      eligibleForNext: false
    };
  }

  const playedLevel = Number(roundSummary.level);
  const firstAttempts = Number(roundSummary.firstAttemptSuccesses);

  // El nivel jugado debe ser válido y estar actualmente disponible
  if (!isLevelUnlocked(playedLevel, currentMax)) {
    return {
      highestUnlockedLevel: currentMax,
      unlockedNewLevel: false,
      nextLevel: null,
      eligibleForNext: false
    };
  }

  const metThreshold = Number.isInteger(firstAttempts) && firstAttempts >= UNLOCK_THRESHOLD;
  const targetNextLevel = playedLevel + 1;
  const hasSubsequentLevel = targetNextLevel <= MAX_LEVEL;

  if (metThreshold && hasSubsequentLevel) {
    const newMax = Math.max(currentMax, targetNextLevel);
    const unlockedNewLevel = newMax > currentMax;
    return {
      highestUnlockedLevel: newMax,
      unlockedNewLevel,
      nextLevel: targetNextLevel,
      eligibleForNext: true
    };
  }

  // Si superó el Nivel 4 (metThreshold && !hasSubsequentLevel), no hay Nivel 5
  return {
    highestUnlockedLevel: currentMax,
    unlockedNewLevel: false,
    nextLevel: null,
    eligibleForNext: metThreshold && !hasSubsequentLevel
  };
}

/**
 * Cierre idempotente de ronda integrado con el estado de progresión.
 * Garantiza que una misma ronda se consume exactamente una vez.
 * Doble clic o invocaciones repetidas devuelven el resultado previamente calculado.
 *
 * @param {Object} progressionState - Estado mutable o contenedor { highestUnlockedLevel, soundEnabled }
 * @param {Object} round - Objeto de ronda que contiene questionRound y summary
 * @param {Storage|null} [storage] - Almacenamiento local para persistir el resultado
 * @returns {{
 *   highestUnlockedLevel: number,
 *   unlockedNewLevel: boolean,
 *   nextLevel: number | null,
 *   alreadyProcessed: boolean,
 *   summary: Object | null
 * }}
 */
export function closeRoundProgression(progressionState, round, storage = null) {
  if (!round) {
    return {
      highestUnlockedLevel: normalizeHighestUnlockedLevel(progressionState?.highestUnlockedLevel),
      unlockedNewLevel: false,
      nextLevel: null,
      alreadyProcessed: false,
      summary: null
    };
  }

  // Idempotencia: si la ronda ya fue cerrada para progresión, retornar resultado previo sin re-procesar
  if (round._progressionClosed && round._progressionResult) {
    return {
      ...round._progressionResult,
      alreadyProcessed: true
    };
  }

  const summary = round.summary || (round.questionRound ? round.questionRound.summary : null);
  const result = evaluateProgressionUnlock(progressionState.highestUnlockedLevel, summary);

  if (result.unlockedNewLevel) {
    progressionState.highestUnlockedLevel = result.highestUnlockedLevel;
    if (storage) {
      saveProgressionState(progressionState, storage);
    }
  }

  const finalResult = {
    highestUnlockedLevel: progressionState.highestUnlockedLevel,
    unlockedNewLevel: result.unlockedNewLevel,
    nextLevel: result.nextLevel,
    alreadyProcessed: false,
    summary
  };

  // Marcar ronda como consumida
  round._progressionClosed = true;
  round._progressionResult = Object.freeze({ ...finalResult });

  return finalResult;
}
