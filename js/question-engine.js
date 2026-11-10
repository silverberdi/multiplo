/**
 * Múltiplo — Motor de Preguntas y Ronda de Ejercicios
 * Alcance: MVP-04 (Issue #4 - Motor de preguntas: tres ejercicios por ronda y lógica de validación)
 *
 * Cumple con:
 * - Correspondencia de niveles: Nivel 1 -> a=2, Nivel 2 -> a=3, Nivel 3 -> a=4, Nivel 4 -> a=5
 * - Segundo factor 'b' en 1..5, con la convención canónica a × b = a grupos de b
 * - 20 parejas válidas en total (5 por nivel)
 * - 4 preguntas evaluables después de Aprende, en orden obligatorio:
 *     Pregunta 2: visual (contar grupos)
 *     Pregunta 3: visual (contar grupos)
 *     Pregunta 4: multiplicación numérica (sin objetos por defecto, con Pista)
 *     Pregunta 5: selección de operación (tres operaciones con mismo 'a' y 'b' distinto, con Pista)
 * - Exactamente 3 alternativas por pregunta, 1 correcta y 2 distractores matemáticamente válidos
 * - Modalidad 4: 3 resultados numéricos distintos
 * - Modalidad 5: 3 operaciones con mismo primer factor y segundos factores distintos; evalúa por producto
 * - Registro inmutable de primer intento por pregunta (0..4 aciertos)
 * - Reintentos ilimitados sin penalización ni castigo
 * - Historial local tolerante de operaciones falladas para priorización limitada sin pérdida de variedad
 */

import {
  createAprendeModel,
  numberToWord,
  capitalize,
  validateAprendeFactors,
  MANZANA_ASSET
} from './aprende.js';

import {
  LEVELS_CATALOG
} from './progression.js';

export { LEVELS_CATALOG };

export const LEVEL_TO_TABLE = Object.freeze({
  1: 2,
  2: 3,
  3: 4,
  4: 5
});

export const VALID_LEVELS = Object.freeze([1, 2, 3, 4]);
export const VALID_B_VALUES = Object.freeze([1, 2, 3, 4, 5]);

export const MODALITIES = Object.freeze({
  PREGUNTA_2: 2, // visual
  PREGUNTA_3: 3, // visual
  PREGUNTA_4: 4, // multiplicación con pista
  PREGUNTA_5: 5  // selección de operación
});

export const FAILED_OPS_STORAGE_KEY = 'multiplo_failed_operations';

/**
 * Valida si una entrada de historial de operación fallada es válida.
 * Descarta elementos que no sean objetos con 'a' y 'b' válidos.
 */
function isValidFailedEntry(op) {
  return Boolean(
    op &&
    typeof op === 'object' &&
    Number.isInteger(op.a) &&
    VALID_B_VALUES.includes(op.b)
  );
}

/**
 * Obtiene el primer factor 'a' correspondiente al número de nivel (1..4).
 */
export function getLevelA(level) {
  const lvl = Number(level);
  if (!VALID_LEVELS.includes(lvl)) {
    throw new RangeError(`Nivel inválido: ${level}. Debe ser un número entre 1 y 4.`);
  }
  return LEVEL_TO_TABLE[lvl];
}

/**
 * Genera el inventario completo de las 20 parejas válidas del MVP.
 */
export function getAllValidPairs() {
  const pairs = [];
  for (const level of VALID_LEVELS) {
    const a = LEVEL_TO_TABLE[level];
    for (const b of VALID_B_VALUES) {
      pairs.push({ level, a, b, product: a * b });
    }
  }
  return pairs;
}

/**
 * Lee de forma segura el historial local de operaciones falladas.
 * Tolera almacenamiento ausente, corrupto o restringido.
 */
export function readFailedHistory(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) {
    return [];
  }
  try {
    const raw = storage.getItem(FAILED_OPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidFailedEntry);
  } catch (_e) {
    return [];
  }
}

/**
 * Registra una operación fallada en el historial local (tolerante a fallos).
 */
export function recordFailedOperation(a, b, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) return;
  try {
    const current = readFailedHistory(storage);
    const exists = current.some((op) => op.a === a && op.b === b);
    if (!exists) {
      const updated = [...current, { a, b, failedAt: Date.now() }];
      storage.setItem(FAILED_OPS_STORAGE_KEY, JSON.stringify(updated.slice(-20)));
    }
  } catch (_e) {
    // Tolerancia a fallos de almacenamiento
  }
}

/**
 * Limpia el registro de una operación una vez que se acierta al primer intento.
 */
export function clearFailedOperation(a, b, storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
  if (!storage) return;
  try {
    const current = readFailedHistory(storage);
    const updated = current.filter((op) => !(op.a === a && op.b === b));
    storage.setItem(FAILED_OPS_STORAGE_KEY, JSON.stringify(updated));
  } catch (_e) {
    // Tolerancia a fallos de almacenamiento
  }
}

/**
 * Selecciona cuatro valores de 'b' para una ronda de un nivel dado,
 * evitando repeticiones dentro de la ronda, variando la elección y
 * priorizando de forma limitada las operaciones previamente falladas.
 */
export function selectRoundBValues(level, options = {}) {
  const a = getLevelA(level);

  // Si se inyectan explícitamente los valores de b (útil para pruebas deterministas)
  if (Array.isArray(options.bValues) && options.bValues.length === 4) {
    options.bValues.forEach((val) => {
      if (!VALID_B_VALUES.includes(val)) {
        throw new RangeError(`Valor b inválido en bValues: ${val}`);
      }
    });
    return [...options.bValues];
  }

  const randomFn = typeof options.randomFn === 'function' ? options.randomFn : Math.random;

  // Determinar candidatos fallados para este factor 'a'
  const storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  const rawFailed = Array.isArray(options.failedHistory)
    ? options.failedHistory
    : readFailedHistory(storage);

  const failedOps = rawFailed.filter(isValidFailedEntry);

  const failedBSet = new Set(
    failedOps
      .filter((op) => op.a === a)
      .map((op) => op.b)
  );

  // Barajar valores disponibles usando randomFn
  const pool = [...VALID_B_VALUES];

  // Separar en fallados y no fallados
  const prioritized = pool.filter((b) => failedBSet.has(b));
  const normal = pool.filter((b) => !failedBSet.has(b));

  // Función interna para barajar
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Priorizar hasta 2 fallados para mantener variedad si hay muchos
  const selectedPrioritized = shuffle(prioritized).slice(0, 2);
  const remainingSlots = 4 - selectedPrioritized.length;

  const normalShuffled = shuffle(normal);
  const selectedNormal = normalShuffled.slice(0, remainingSlots);

  let combined = [...selectedPrioritized, ...selectedNormal];

  // Si aún no se completan 4 (por ejemplo si la suma dio menos), rellenar del pool restante
  if (combined.length < 4) {
    const remainingPool = shuffle(pool.filter((b) => !combined.includes(b)));
    combined = combined.concat(remainingPool.slice(0, 4 - combined.length));
  }

  // Barajar la lista final de 4 b para que la posición no sea predecible
  return shuffle(combined).slice(0, 4);
}

/**
 * Genera 3 alternativas numéricas para modalidades 2, 3 y 4.
 * Garantiza:
 * - Exactamente 3 resultados numéricos distintos
 * - Uno es el producto correcto a * b
 * - Dos distractores válidos pertenecientes a la misma tabla (a * b') distintos del correcto y entre sí
 * - Posición variable / barajada
 */
export function generateNumericAlternatives(a, b, options = {}) {
  const correctProduct = a * b;
  const otherBValues = VALID_B_VALUES.filter((val) => val !== b);

  const randomFn = typeof options.randomFn === 'function' ? options.randomFn : Math.random;

  // Seleccionar 2 distractores de la misma tabla
  let distractorB1, distractorB2;
  if (options.distractorBValues && options.distractorBValues.length === 2) {
    [distractorB1, distractorB2] = options.distractorBValues;
  } else {
    // Barajar otherBValues y tomar los 2 primeros
    const shuffledOthers = [...otherBValues];
    for (let i = shuffledOthers.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [shuffledOthers[i], shuffledOthers[j]] = [shuffledOthers[j], shuffledOthers[i]];
    }
    distractorB1 = shuffledOthers[0];
    distractorB2 = shuffledOthers[1];
  }

  const d1Product = a * distractorB1;
  const d2Product = a * distractorB2;

  const choices = [
    { value: correctProduct, label: String(correctProduct), isCorrect: true, b: b },
    { value: d1Product, label: String(d1Product), isCorrect: false, b: distractorB1 },
    { value: d2Product, label: String(d2Product), isCorrect: false, b: distractorB2 }
  ];

  // Verificar unicidad estricta
  const uniqueValues = new Set(choices.map((c) => c.value));
  if (uniqueValues.size !== 3) {
    throw new Error(`Condición inválida: alternativas duplicadas para a=${a}, b=${b}`);
  }

  // Si se pide fijar el índice de la correcta (para pruebas deterministas)
  if (typeof options.correctIndex === 'number' && options.correctIndex >= 0 && options.correctIndex <= 2) {
    const targetIdx = options.correctIndex;
    const correctItem = choices.find((c) => c.isCorrect);
    const distractors = choices.filter((c) => !c.isCorrect);
    const result = [];
    let dIdx = 0;
    for (let i = 0; i < 3; i++) {
      if (i === targetIdx) {
        result.push(correctItem);
      } else {
        result.push(distractors[dIdx++]);
      }
    }
    return result;
  }

  // Barajar alternativas
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Genera 3 alternativas de operación para la modalidad 5 (Encuentra la operación).
 * Reglas:
 * - Las tres operaciones tienen el mismo primer factor 'a' del nivel
 * - Los tres segundos factores 'b' son distintos entre sí
 * - Exactamente una operación produce el total objetivo (a * b)
 * - Posición variable / barajada
 */
export function generateOperationAlternatives(a, b, options = {}) {
  const targetProduct = a * b;
  const otherBValues = VALID_B_VALUES.filter((val) => val !== b);

  const randomFn = typeof options.randomFn === 'function' ? options.randomFn : Math.random;

  let distractorB1, distractorB2;
  if (options.distractorBValues && options.distractorBValues.length === 2) {
    [distractorB1, distractorB2] = options.distractorBValues;
  } else {
    const shuffledOthers = [...otherBValues];
    for (let i = shuffledOthers.length - 1; i > 0; i--) {
      const j = Math.floor(randomFn() * (i + 1));
      [shuffledOthers[i], shuffledOthers[j]] = [shuffledOthers[j], shuffledOthers[i]];
    }
    distractorB1 = shuffledOthers[0];
    distractorB2 = shuffledOthers[1];
  }

  const choices = [
    {
      label: `${a} × ${b}`,
      ariaLabel: `${a} por ${b}`,
      a,
      b,
      product: a * b,
      isCorrect: true
    },
    {
      label: `${a} × ${distractorB1}`,
      ariaLabel: `${a} por ${distractorB1}`,
      a,
      b: distractorB1,
      product: a * distractorB1,
      isCorrect: false
    },
    {
      label: `${a} × ${distractorB2}`,
      ariaLabel: `${a} por ${distractorB2}`,
      a,
      b: distractorB2,
      product: a * distractorB2,
      isCorrect: false
    }
  ];

  // Verificar que solo una da targetProduct
  const correctCount = choices.filter((c) => c.product === targetProduct).length;
  if (correctCount !== 1) {
    throw new Error(`Condición inválida en modalidad 5: ${correctCount} operaciones dan ${targetProduct}`);
  }

  // Verificar unicidad de b
  const uniqueB = new Set(choices.map((c) => c.b));
  if (uniqueB.size !== 3) {
    throw new Error(`Condición inválida: factores b duplicados en modalidad 5`);
  }

  // Fijar índice determinista si se solicita
  if (typeof options.correctIndex === 'number' && options.correctIndex >= 0 && options.correctIndex <= 2) {
    const targetIdx = options.correctIndex;
    const correctItem = choices.find((c) => c.isCorrect);
    const distractors = choices.filter((c) => !c.isCorrect);
    const result = [];
    let dIdx = 0;
    for (let i = 0; i < 3; i++) {
      if (i === targetIdx) {
        result.push(correctItem);
      } else {
        result.push(distractors[dIdx++]);
      }
    }
    return result;
  }

  // Barajar
  const shuffled = [...choices];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Crea una pregunta individual evaluable para la ronda.
 * @param {number} modalidad - 2, 3, 4 o 5
 * @param {number} a - Primer factor (fijo por nivel)
 * @param {number} b - Segundo factor (1..5)
 * @param {number} questionIndex - Índice 0..3 en la ronda evaluable
 * @param {Object} [options] - Opciones de inyección
 */
export function createQuestion(modalidad, a, b, questionIndex, options = {}) {
  validateAprendeFactors(a, b);
  const product = a * b;
  const questionNumber = questionIndex + 2; // Numeradas 2, 3, 4, 5 en la ronda

  let prompt = '';
  let spokenPrompt = '';
  let instruction = 'Toca la respuesta correcta:';
  let alternatives = [];
  let hasVisualGroups = false;
  let hintAvailable = false;
  let hintText = '';

  // Representación visual de grupos reutilizando la convención de Aprende
  const visualModel = createAprendeModel(a, b);

  if (modalidad === MODALITIES.PREGUNTA_2 || modalidad === MODALITIES.PREGUNTA_3) {
    prompt = '¿Cuántas manzanas hay en total?';
    spokenPrompt = '¿Cuántas manzanas hay en total?';
    hasVisualGroups = true;
    hintAvailable = false; // Ya tiene los grupos visibles
    alternatives = generateNumericAlternatives(a, b, options);
  } else if (modalidad === MODALITIES.PREGUNTA_4) {
    prompt = `¿Cuánto es ${a} × ${b}?`;
    spokenPrompt = `¿Cuánto es ${numberToWord(a)} por ${numberToWord(b)}?`;
    hasVisualGroups = false; // Sin objetos visibles por defecto
    hintAvailable = true;
    const bWord = b === 1 ? 'una manzana' : `${numberToWord(b)} manzanas`;
    hintText = `💡 Pista: ${capitalize(numberToWord(a))} grupos de ${bWord}.`;
    alternatives = generateNumericAlternatives(a, b, options);
  } else if (modalidad === MODALITIES.PREGUNTA_5) {
    prompt = `¿Cuál multiplicación da ${product}?`;
    spokenPrompt = `¿Cuál multiplicación da ${numberToWord(product)}?`;
    hasVisualGroups = false;
    hintAvailable = true;
    const bWord = b === 1 ? 'una manzana' : `${numberToWord(b)} manzanas`;
    hintText = `💡 Pista: El total ${product} se forma con ${numberToWord(a)} grupos de ${bWord}.`;
    alternatives = generateOperationAlternatives(a, b, options);
  } else {
    throw new RangeError(`Modalidad no soportada: ${modalidad}`);
  }

  return {
    index: questionIndex,
    questionNumber,
    modalidad,
    a,
    b,
    product,
    prompt,
    spokenPrompt,
    instruction,
    alternatives,
    hasVisualGroups,
    hintAvailable,
    hintShown: false,
    hintText,
    groups: visualModel.groups,
    groupsAriaLabel: visualModel.groupsAriaLabel,
    firstAttemptMade: false,
    firstAttemptCorrect: null,
    isResolved: false,
    attemptsCount: 0
  };
}

/**
 * Crea una ronda evaluable completa de cuatro preguntas para un nivel dado.
 */
export function createQuestionRound(level = 1, options = {}) {
  const lvl = Number(level);
  if (!VALID_LEVELS.includes(lvl)) {
    throw new RangeError(`Nivel inválido para ronda: ${level}`);
  }

  const a = getLevelA(lvl);
  const bList = selectRoundBValues(lvl, options);

  const orderedModalities = [
    MODALITIES.PREGUNTA_2,
    MODALITIES.PREGUNTA_3,
    MODALITIES.PREGUNTA_4,
    MODALITIES.PREGUNTA_5
  ];

  const questions = orderedModalities.map((modalidad, idx) => {
    const qOptions = (options.perQuestionOptions && options.perQuestionOptions[idx]) || options;
    return createQuestion(modalidad, a, bList[idx], idx, qOptions);
  });

  return {
    level: lvl,
    a,
    bList,
    questions,
    currentIndex: 0,
    isFinished: false,
    summary: null
  };
}

/**
 * Evalúa una respuesta seleccionada en la pregunta actual de la ronda.
 * Invariantes:
 * - El primer intento fija `firstAttemptCorrect` de forma inmutable.
 * - Los fallos no penalizan y el niño puede reintentar ilimitadamente.
 * - En modalidad 5, se evalúa por `option.product === question.product`, independiente del índice.
 */
export function evaluateAnswer(round, selectedOption) {
  if (!round || round.isFinished) {
    throw new Error('Ronda no disponible o ya finalizada');
  }

  const question = round.questions[round.currentIndex];
  if (!question) {
    throw new Error('Pregunta no disponible');
  }

  // Determinar si es correcto
  let isCorrect = false;
  if (question.modalidad === MODALITIES.PREGUNTA_5) {
    // Evaluar por producto de la operación
    isCorrect = selectedOption.product === question.product;
  } else {
    // Evaluar por coincidencia de valor numérico
    isCorrect = Number(selectedOption.value) === question.product;
  }

  question.attemptsCount++;

  // Registro inmutable del primer intento
  if (!question.firstAttemptMade) {
    question.firstAttemptMade = true;
    question.firstAttemptCorrect = isCorrect;

    // Actualizar historial local
    if (!isCorrect) {
      recordFailedOperation(question.a, question.b);
    } else {
      clearFailedOperation(question.a, question.b);
    }
  }

  if (isCorrect) {
    question.isResolved = true;
  }

  return {
    isCorrect,
    firstAttemptCorrect: question.firstAttemptCorrect,
    isResolved: question.isResolved,
    questionIndex: question.index,
    questionNumber: question.questionNumber,
    isLastQuestion: round.currentIndex === round.questions.length - 1
  };
}

/**
 * Activa la pista contextual en la pregunta actual.
 */
export function revealHint(round) {
  if (!round || round.isFinished) return null;
  const question = round.questions[round.currentIndex];
  if (!question || !question.hintAvailable) return null;

  question.hintShown = true;
  return {
    hintText: question.hintText,
    groups: question.groups,
    groupsAriaLabel: question.groupsAriaLabel,
    a: question.a,
    b: question.b
  };
}

/**
 * Avanza a la siguiente pregunta o finaliza la ronda si es la última.
 * Devuelve el estado actualizado y el resumen si la ronda termina.
 */
export function advanceRound(round) {
  if (!round || round.isFinished) {
    return { isFinished: true, round };
  }

  const currentQ = round.questions[round.currentIndex];
  if (!currentQ || !currentQ.isResolved) {
    // No avanzar si la pregunta actual no fue resuelta
    return { isFinished: false, advanced: false, round };
  }

  if (round.currentIndex < round.questions.length - 1) {
    round.currentIndex++;
    return {
      isFinished: false,
      advanced: true,
      currentQuestion: round.questions[round.currentIndex],
      round
    };
  }

  // Finalizar ronda: calcular resumen inmutable
  round.isFinished = true;
  const firstAttemptCorrect = Object.freeze(round.questions.map((q) => Boolean(q.firstAttemptCorrect)));
  const firstAttemptSuccesses = firstAttemptCorrect.filter(Boolean).length;
  round.summary = Object.freeze({
    level: round.level,
    a: round.a,
    totalQuestions: round.questions.length, // 4
    firstAttemptCorrect,                    // Cuatro indicadores inmutables de primer intento
    firstAttempts: firstAttemptCorrect,     // Alias de conveniencia
    firstAttemptSuccesses,                  // 0..4 aciertos al primer intento
    stars: firstAttemptSuccesses,           // 0..4 estrellas equivalentes
    passed: firstAttemptSuccesses >= 3      // Umbral 3/4 para información pedagógica
  });

  return {
    isFinished: true,
    advanced: true,
    summary: round.summary,
    round
  };
}
