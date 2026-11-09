/**
 * Múltiplo — Módulo de Demostración y Aprendizaje Visual (Aprende)
 * Alcance: MVP-03 (Issue #3 - Aprendizaje visual: grupos y suma repetida)
 *
 * Cumple con:
 * - Convención matemática canónica: a × b = a grupos de b elementos
 * - Validación de límites: a en 2–5 (primer factor/nivel), b en 1–5 (segundo factor)
 * - Derivación estricta desde un modelo matemático único (sin discrepancia entre grupos, suma y producto)
 * - Explicación verbal y textual coordinada en español
 * - Renderizado en contenedor semántico sin markup estático duplicado
 * - Reutilización estricta de assets versionados (manzana.svg y hablando.svg)
 * - Sin backend, sin dependencias externas, sin analítica infantil
 */

export const SPANISH_NUMBER_WORDS = {
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco'
};

export const MANZANA_ASSET = 'assets/objects/manzana.svg';

/**
 * Convierte un número entero (1..25) a su palabra en español
 */
export function numberToWord(n) {
  return SPANISH_NUMBER_WORDS[n] || String(n);
}

/**
 * Pone en mayúscula la primera letra de un texto
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Valida los factores 'a' y 'b' según las reglas invariantes del MVP:
 * - 'a' entre 2 y 5 (tablas del 2, 3, 4 y 5)
 * - 'b' entre 1 y 5 (segundo factor de la ronda)
 */
export function validateAprendeFactors(a, b) {
  if (!Number.isInteger(a) || a < 2 || a > 5) {
    throw new RangeError(`Factor 'a' inválido: ${a}. Debe ser un entero entre 2 y 5.`);
  }
  if (!Number.isInteger(b) || b < 1 || b > 5) {
    throw new RangeError(`Factor 'b' inválido: ${b}. Debe ser un entero entre 1 y 5.`);
  }
  return true;
}

/**
 * Construye la frase de instrucción visible en la cabecera de la demo.
 * Ej: 3x2 -> "Tres grupos de dos manzanas"
 *     3x1 -> "Tres grupos de una manzana"
 */
export function formatAprendeInstruction(a, b) {
  const aWord = capitalize(numberToWord(a));
  const bWord = b === 1 ? 'una manzana' : `${numberToWord(b)} manzanas`;
  return `${aWord} grupos de ${bWord}`;
}

/**
 * Construye la narración verbal en español que conecta grupos, suma y producto.
 * Ej: 3x2 -> "Mira: tres grupos de dos manzanas. Dos más dos más dos son seis. Tres por dos son seis."
 *     3x1 -> "Mira: tres grupos de una manzana. Uno más uno más uno son tres. Tres por uno son tres."
 */
export function formatAprendeNarration(a, b) {
  const aWord = numberToWord(a);
  const bWord = b === 1 ? 'una manzana' : `${numberToWord(b)} manzanas`;
  const product = a * b;
  const productWord = numberToWord(product);

  const sumTermsWords = Array(a).fill(numberToWord(b)).join(' más ');
  const sumPhrase = `${capitalize(sumTermsWords)} son ${productWord}`;
  const multPhrase = `${capitalize(aWord)} por ${numberToWord(b)} son ${productWord}`;

  return `Mira: ${aWord} grupos de ${bWord}. ${sumPhrase}. ${multPhrase}.`;
}

/**
 * Crea el modelo inmutable para la actividad Aprende a partir del par (a, b).
 * Deriva grupos, suma repetida y producto desde la misma fuente.
 */
export function createAprendeModel(a, b) {
  validateAprendeFactors(a, b);

  const product = a * b;
  const sumTerms = Array(a).fill(b);
  const sumExpression = `${sumTerms.join(' + ')} = ${product}`;
  const multiplicationExpression = `${a} × ${b} = ${product}`;
  const instructionText = formatAprendeInstruction(a, b);
  const narrationText = formatAprendeNarration(a, b);

  const groupsAriaLabel = `Demostración visual de ${a} grupos de ${b} ${b === 1 ? 'manzana' : 'manzanas'}`;

  const groups = Array.from({ length: a }, (_, idx) => {
    const groupNum = idx + 1;
    const itemsLabel = b === 1 ? 'una manzana' : `${numberToWord(b)} manzanas`;
    return {
      index: groupNum,
      ariaLabel: `Grupo ${groupNum} con ${itemsLabel}`,
      itemCount: b,
      asset: MANZANA_ASSET
    };
  });

  return Object.freeze({
    a,
    b,
    product,
    groupCount: a,
    itemsPerGroup: b,
    sumTerms,
    sumExpression,
    multiplicationExpression,
    instructionText,
    narrationText,
    groupsAriaLabel,
    groups
  });
}

/**
 * Selecciona los factores para una ronda de un nivel dado.
 * Si options.b o options.a están presentes, los respeta (útil para pruebas deterministas).
 * Evita repetir previousB cuando no se fija un b explícito.
 */
export function selectAprendeFactors(levelNumber, options = {}) {
  const level = Number(levelNumber) || 1;
  const a = options.a !== undefined ? options.a : (level + 1);

  if (options.b !== undefined) {
    return { a, b: options.b };
  }

  const validBValues = [1, 2, 3, 4, 5];
  let candidateBValues = validBValues;
  if (options.previousB && validBValues.includes(options.previousB)) {
    candidateBValues = validBValues.filter((val) => val !== options.previousB);
  }

  const randomFn = typeof options.randomFn === 'function' ? options.randomFn : Math.random;
  const randomIndex = Math.floor(randomFn() * candidateBValues.length);
  const b = candidateBValues[randomIndex] || validBValues[0];

  return { a, b };
}

/**
 * Renderiza la demostración visual dentro del contenedor semántico en el DOM.
 * Genera la instrucción, los grupos de manzanas y la relación matemática.
 */
export function renderAprende(container, model) {
  if (!container) return;

  // Limpiar contenedor previo para garantizar que no haya demos duplicadas
  container.innerHTML = '';

  // 1. Texto de instrucción destacado
  const instructionP = document.createElement('p');
  instructionP.id = 'aprende-instruction';
  instructionP.className = 'instruction-text highlight-instruction';
  instructionP.textContent = model.instructionText;
  container.appendChild(instructionP);

  // 2. Contenedor de grupos visuales
  const groupsRegion = document.createElement('div');
  groupsRegion.id = 'aprende-groups';
  groupsRegion.className = 'groups-container';
  groupsRegion.setAttribute('role', 'region');
  groupsRegion.setAttribute('aria-label', model.groupsAriaLabel);

  model.groups.forEach((group) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'item-group';
    groupDiv.setAttribute('aria-label', group.ariaLabel);

    for (let i = 0; i < group.itemCount; i++) {
      const img = document.createElement('img');
      img.src = group.asset;
      img.alt = 'Manzana roja';
      img.className = 'object-img';
      img.width = 48;
      img.height = 48;
      groupDiv.appendChild(img);
    }

    groupsRegion.appendChild(groupDiv);
  });
  container.appendChild(groupsRegion);

  // 3. Relación matemática: suma repetida y multiplicación
  const mathBox = document.createElement('div');
  mathBox.id = 'aprende-math';
  mathBox.className = 'math-relation-box';

  // Fila suma repetida
  const sumRow = document.createElement('div');
  sumRow.className = 'math-row';
  const sumLabel = document.createElement('span');
  sumLabel.className = 'math-label';
  sumLabel.textContent = 'Suma repetida:';
  const sumExpr = document.createElement('span');
  sumExpr.id = 'aprende-sum-expression';
  sumExpr.className = 'math-expression';
  sumExpr.textContent = model.sumExpression;
  sumRow.appendChild(sumLabel);
  sumRow.appendChild(sumExpr);
  mathBox.appendChild(sumRow);

  // Fila multiplicación
  const multRow = document.createElement('div');
  multRow.className = 'math-row math-highlight';
  const multLabel = document.createElement('span');
  multLabel.className = 'math-label';
  multLabel.textContent = 'Multiplicación:';
  const multExpr = document.createElement('span');
  multExpr.id = 'aprende-mult-expression';
  multExpr.className = 'math-expression math-big';
  multExpr.textContent = model.multiplicationExpression;
  multRow.appendChild(multLabel);
  multRow.appendChild(multExpr);
  mathBox.appendChild(multRow);

  container.appendChild(mathBox);
}
