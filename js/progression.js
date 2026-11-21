/**
 * Múltiplo — Modelo de progresión de niveles, desbloqueo y persistencia local
 * Alcance: MVP-05 / Request #29 (tablas 1 a 10, dominio y persistencia local)
 *
 * Cumple con:
 * - Catálogo canónico de diez tablas (1..10), con factores b en 1..10
 * - Estado inicial: solo Nivel 1 abierto (highestUnlockedLevel = 1)
 * - Disponibilidad estrictamente secuencial derivada de highestUnlockedLevel (1..10)
 * - Tabla 1: >= 3 aciertos iniciales en una ronda; tablas 2..10: dominio acumulado
 * - Cierre idempotente: consume una sola vez el resumen inmutable del motor
 * - Conservación incondicional de niveles ya abiertos ante fallos o repeticiones
 * - Persistencia mínima en localStorage (highestUnlockedLevel y soundEnabled)
 * - Tolerancia total a localStorage ausente, bloqueado (SecurityError), cuota excedida o JSON corrupto
 * - Aviso seguro para adulto si el almacenamiento falla, sin llamadas de red ni telemetría
 * - Sin tabla 11 (en Tabla 10 no se ofrece siguiente tabla)
 */

export const PROGRESSION_STORAGE_KEY = 'multiplo_progression_v1';
export const PROGRESSION_VERSION = 1.2;
export const FAILED_OPS_STORAGE_KEY = 'multiplo_failed_operations';
export const DOMAIN_ROUND_LIMIT = 3;
export const DOMAIN_FACTORS_REQUIRED = 7;
export const SOUND_STORAGE_KEY = 'multiplo_sound_enabled';

export const LEVELS_CATALOG = Object.freeze(Array.from({ length: 10 }, (_, index) => {
  const table = index + 1;
  return Object.freeze({ level: table, table, a: table,
    factors: Object.freeze(Array.from({ length: 10 }, (_, b) => b + 1)),
    name: `Tabla del ${table}`, ariaLabel: `Tabla del ${table}` });
}));

export const UNLOCK_THRESHOLD = 3;
export const MAX_LEVEL = 10;
export const MIN_LEVEL = 1;

function browserStorage() {
  try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (_error) { return null; }
}

/**
 * Obtiene la configuración de un nivel desde el catálogo único.
 * @param {number} level
 * @returns {Object}
 */
export function getLevelConfig(level) {
  const lvl = Number(level);
  const found = LEVELS_CATALOG.find((item) => item.level === lvl);
  if (!found) {
    throw new RangeError(`Nivel inválido: ${level}. Las tablas del MVP van del 1 al 10.`);
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
 * Resume la evidencia de dominio que necesita una tabla para avanzar.
 * Las estrellas de la ronda nunca se mezclan con este resumen.
 */
export function getTableDomainSummary(table, evidence = {}) {
  const normalizedTable = Number(table);
  const domain = evaluateTableDomain(normalizedTable, evidence);
  const coveredFactors = domain.coveredFactors;
  const pendingFactors = LEVELS_CATALOG.find((item) => item.table === normalizedTable)?.factors
    .filter((b) => !coveredFactors.includes(b)) || [];
  const nextLevel = normalizedTable + 1;
  const requiresAccumulatedDomain = normalizedTable >= 2;
  const requirements = {
    rounds: {
      current: domain.qualifyingRounds,
      target: requiresAccumulatedDomain ? 2 : 1,
      met: requiresAccumulatedDomain ? domain.hasEnoughRounds : domain.hasEnoughRounds
    },
    factors: {
      current: coveredFactors.length,
      target: DOMAIN_FACTORS_REQUIRED,
      met: requiresAccumulatedDomain ? domain.hasEnoughFactors : true
    }
  };
  const mastered = requiresAccumulatedDomain
    ? domain.hasEnoughRounds && domain.hasEnoughFactors
    : domain.hasEnoughRounds;
  return {
    table: normalizedTable,
    coveredFactors,
    pendingFactors,
    qualifyingRounds: domain.qualifyingRounds,
    requirements,
    mastered,
    tableComplete: mastered,
    nextLevel: nextLevel <= MAX_LEVEL ? nextLevel : null,
    action: nextLevel <= MAX_LEVEL && mastered ? 'avanzar' : 'repetir'
  };
}

export function emptyTableEvidence() {
  return { recentRounds: [], coveredFactors: [], failedOperations: [] };
}

/**
 * Normaliza y valida el nivel máximo desbloqueado (1..10).
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
    version: PROGRESSION_VERSION,
    highestUnlockedLevel: MIN_LEVEL,
    openTables: [MIN_LEVEL],
    tables: Object.fromEntries(LEVELS_CATALOG.map(({ table }) => [table, emptyTableEvidence()])),
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

  const highestUnlockedLevel = normalizeHighestUnlockedLevel(raw.highestUnlockedLevel ?? raw.openTables?.length);
  const soundEnabled = typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : initial.soundEnabled;
  const normalizeEvidence = (value) => {
    const evidence = value && typeof value === 'object' ? value : {};
    const recentRounds = Array.isArray(evidence.recentRounds) ? evidence.recentRounds
      .filter((round) => round && Number.isInteger(round.initialSuccesses))
      .slice(-DOMAIN_ROUND_LIMIT).map((round) => ({
        initialSuccesses: Math.max(0, Math.min(4, round.initialSuccesses)),
        currentInitialSuccesses: Math.max(0, Math.min(3, Number(round.currentInitialSuccesses ?? round.initialSuccesses))),
        review: Boolean(round.review), factors: Array.isArray(round.factors) ? round.factors.filter((b) => Number.isInteger(b) && b >= 1 && b <= 10) : []
      })) : [];
    const coveredFactors = Array.isArray(evidence.coveredFactors) ? [...new Set(evidence.coveredFactors.filter((b) => Number.isInteger(b) && b >= 1 && b <= 10))].sort((a, b) => a - b) : [];
    const failedOperations = Array.isArray(evidence.failedOperations) ? evidence.failedOperations.filter((op) => op && Number.isInteger(op.a) && Number.isInteger(op.b) && op.a >= 1 && op.a <= 10 && op.b >= 1 && op.b <= 10).slice(-20) : [];
    return { recentRounds, coveredFactors, failedOperations };
  };

  return {
    version: PROGRESSION_VERSION,
    highestUnlockedLevel,
    openTables: getUnlockedLevels(highestUnlockedLevel),
    tables: Object.fromEntries(LEVELS_CATALOG.map(({ table }) => [table, normalizeEvidence(raw.tables?.[table])])),
    soundEnabled
  };
}

export function migrateLegacyProgression(raw, soundEnabled = true, failedOperations = []) {
  const state = createInitialProgressionState();
  const legacy = raw && typeof raw === 'object' ? raw : {};
  const old = Number(legacy.highestUnlockedLevel ?? legacy.currentLevel ?? 1);
  const highest = Number.isInteger(old) ? Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, old + (old <= 4 ? 1 : 0))) : 1;
  state.highestUnlockedLevel = highest;
  state.openTables = getUnlockedLevels(highest);
  state.soundEnabled = soundEnabled;
  for (const op of Array.isArray(failedOperations) ? failedOperations : []) {
    if (op && Number.isInteger(op.a) && Number.isInteger(op.b) && op.a >= 1 && op.a <= 10 && op.b >= 1 && op.b <= 10) state.tables[op.a].failedOperations.push({ a: op.a, b: op.b });
  }
  return state;
}

/**
 * Carga el estado de progresión de forma defensiva desde localStorage.
 * Tolera JSON inválido, datos incompletos, SecurityError o falta de soporte.
 * @param {Storage|null} storage
 * @returns {{ state: Object, storageAvailable: boolean, warning: string | null }}
 */
export function loadProgressionState(storage = undefined) {
  storage = storage === undefined ? browserStorage() : storage;
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
    const soundPref = storage.getItem(SOUND_STORAGE_KEY) !== 'false';
    const legacyFailed = JSON.parse(storage.getItem(FAILED_OPS_STORAGE_KEY) || '[]');
    const state = parsed?.version === PROGRESSION_VERSION
      ? validateAndNormalizeState(parsed)
      : migrateLegacyProgression(parsed, soundPref, legacyFailed);
    if (parsed?.version !== PROGRESSION_VERSION) saveProgressionState(state, storage);
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
export function saveProgressionState(state, storage = undefined) {
  storage = storage === undefined ? browserStorage() : storage;
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
 * - En ningún caso se desbloquea un nivel > 10 (no existe Tabla 11).
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

  const playedLevel = Number(roundSummary.table ?? roundSummary.level ?? roundSummary.a);
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

  const currentAttempts = Number(roundSummary.currentInitialSuccesses ?? firstAttempts);
  const metThreshold = Number.isInteger(currentAttempts) && currentAttempts >= (playedLevel === 1 ? 3 : 2);
  const targetNextLevel = playedLevel + 1;
  const hasSubsequentLevel = targetNextLevel <= MAX_LEVEL;

  const domain = roundSummary.domain || null;
  const canAdvance = playedLevel === 1 ? metThreshold : metThreshold && domain?.mastered;
  if (canAdvance && hasSubsequentLevel) {
    const newMax = Math.max(currentMax, targetNextLevel);
    const unlockedNewLevel = newMax > currentMax;
    return {
      highestUnlockedLevel: newMax,
      unlockedNewLevel,
      nextLevel: targetNextLevel,
      eligibleForNext: true,
      domain
    };
  }

  // Si superó la Tabla 10 (metThreshold && !hasSubsequentLevel), no hay Tabla 11.
  return {
    highestUnlockedLevel: currentMax,
    unlockedNewLevel: false,
    nextLevel: null,
    eligibleForNext: metThreshold && !hasSubsequentLevel,
    domain
  };
}

export function domainThreshold(table) { return Number(table) === 1 ? 3 : 2; }

export function evaluateTableDomain(table, evidence) {
  const rounds = Array.isArray(evidence?.recentRounds) ? evidence.recentRounds : [];
  const factors = Array.isArray(evidence?.coveredFactors) ? [...new Set(evidence.coveredFactors)] : [];
  const qualifyingRounds = rounds.filter((round) => !round.review && Number(round.currentInitialSuccesses ?? round.initialSuccesses) >= domainThreshold(table)).length;
  const normalizedTable = Number(table);
  const hasEnoughRounds = qualifyingRounds >= (normalizedTable === 1 ? 1 : 2);
  const hasEnoughFactors = factors.length >= DOMAIN_FACTORS_REQUIRED;
  return { table: normalizedTable, qualifyingRounds, coveredFactors: factors, hasEnoughRounds, hasEnoughFactors, mastered: normalizedTable === 1 ? hasEnoughRounds : hasEnoughRounds && hasEnoughFactors };
}

export function recordRoundEvidence(state, summary) {
  const table = Number(summary?.table ?? summary?.a ?? summary?.level);
  const next = validateAndNormalizeState(state);
  if (!Number.isInteger(table) || !next.tables[table]) return { state: next, domain: null, unlockedNewLevel: false, nextLevel: null };
  const evidence = next.tables[table];
  const factors = Array.isArray(summary.currentFactors)
    ? [...new Set(summary.currentFactors.filter((b) => Number.isInteger(b) && b >= 1 && b <= 10))]
    : [];
  const correct = Array.isArray(summary.currentFirstAttemptCorrect) ? summary.currentFirstAttemptCorrect : [];
  evidence.recentRounds.push({ initialSuccesses: Number(summary.firstAttemptSuccesses || 0), currentInitialSuccesses: Number(summary.currentInitialSuccesses ?? summary.firstAttemptSuccesses ?? 0), review: false, factors });
  evidence.recentRounds = evidence.recentRounds.slice(-DOMAIN_ROUND_LIMIT);
  factors.forEach((b, index) => { if (correct[index] && !evidence.coveredFactors.includes(b)) evidence.coveredFactors.push(b); });
  evidence.coveredFactors.sort((a, b) => a - b);
  for (const operation of Array.isArray(summary.failedOperations) ? summary.failedOperations : []) {
    if (!evidence.failedOperations.some((item) => item.a === operation.a && item.b === operation.b)) evidence.failedOperations.push({ a: operation.a, b: operation.b, source: operation.source });
  }
  evidence.failedOperations = evidence.failedOperations.slice(-20);
  const domain = getTableDomainSummary(table, evidence);
  const nextLevel = table + 1;
  const unlockedNewLevel = domain.mastered && nextLevel <= MAX_LEVEL && next.highestUnlockedLevel === table;
  if (unlockedNewLevel) { next.highestUnlockedLevel = nextLevel; next.openTables = getUnlockedLevels(nextLevel); }
  return { state: next, domain, unlockedNewLevel, nextLevel: unlockedNewLevel ? nextLevel : null };
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
export function closeRoundProgression(progressionState, round, storage = undefined) {
  storage = storage === undefined ? browserStorage() : storage;
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
  const result = recordRoundEvidence(progressionState, summary || {});
  Object.assign(progressionState, result.state);
  if (storage) saveProgressionState(progressionState, storage);

  const finalResult = {
    highestUnlockedLevel: progressionState.highestUnlockedLevel,
    unlockedNewLevel: result.unlockedNewLevel,
    nextLevel: result.nextLevel,
    alreadyProcessed: false,
    summary,
    domain: result.domain
  };

  // Marcar ronda como consumida
  round._progressionClosed = true;
  round._progressionResult = Object.freeze({ ...finalResult });

  return finalResult;
}
