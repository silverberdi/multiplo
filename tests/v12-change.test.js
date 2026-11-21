import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVELS_CATALOG, MAX_LEVEL, createInitialProgressionState, evaluateTableDomain,
  getTableDomainSummary, migrateLegacyProgression, recordRoundEvidence, loadProgressionState, saveProgressionState
} from '../js/progression.js';
import { createAprendeModel, validateAprendeFactors } from '../js/aprende.js';
import { createQuestionRound, getAllValidPairs, MODALITIES, generateNumericAlternatives, generateOperationAlternatives, selectRoundBValues } from '../js/question-engine.js';

const memoryStorage = () => {
  const map = new Map();
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, String(value)) };
};

test('v1.2 catálogo dirigido contiene exactamente 100 parejas y conserva orientación', () => {
  assert.equal(LEVELS_CATALOG.length, 10);
  assert.equal(getAllValidPairs().length, 100);
  assert.deepEqual(getAllValidPairs().filter((pair) => pair.a === 2 && pair.b === 3)[0], { level: 2, a: 2, b: 3, product: 6 });
  assert.deepEqual(getAllValidPairs().filter((pair) => pair.a === 3 && pair.b === 2)[0], { level: 3, a: 3, b: 2, product: 6 });
  assert.equal(new Set(getAllValidPairs().map(({ a, b }) => `${a}:${b}`)).size, 100);
});

test('v1.2 Aprende representa extremos y factores dirigidos', () => {
  for (const [a, b] of [[1, 1], [3, 2], [2, 3], [5, 5], [10, 10]]) {
    validateAprendeFactors(a, b);
    const model = createAprendeModel(a, b);
    assert.equal(model.groups.length, a);
    assert.equal(model.groups.reduce((sum, group) => sum + group.itemCount, 0), a * b);
    assert.equal(model.sumExpression, `${Array(a).fill(b).join(' + ')} = ${a * b}`);
    assert.equal(model.multiplicationExpression, `${a} × ${b} = ${a * b}`);
  }
});

test('v1.2 ronda de tabla 1 usa cuatro actuales; otras tablas usan tres actuales y un repaso', () => {
  const tableOne = createQuestionRound(1, { bValues: [1, 2, 3, 4], modalities: [2, 3, 4, 5] });
  assert.equal(tableOne.questions.filter((question) => question.source === 'actual').length, 4);
  assert.equal(tableOne.questions.filter((question) => question.source === 'repaso').length, 0);
  const tableSeven = createQuestionRound(7, { bValues: [1, 2, 3, 4], failedHistory: [{ a: 2, b: 9 }], modalities: [2, 3, 4, 5] });
  assert.equal(tableSeven.questions.filter((question) => question.source === 'actual').length, 3);
  assert.equal(tableSeven.questions.filter((question) => question.source === 'repaso').length, 1);
  assert.equal(tableSeven.questions.find((question) => question.source === 'repaso').a, 2);
  assert.equal(new Set(tableSeven.questions.map((question) => `${question.a}:${question.b}`)).size, 4);
});

test('v1.2 alternativas son tres, únicas y correctas por valor/producto', () => {
  for (const [a, b] of [[1, 1], [3, 2], [10, 10]]) {
    const numeric = generateNumericAlternatives(a, b, { distractorBValues: b === 10 ? [1, 2] : [b === 1 ? 2 : 1, b === 2 ? 3 : 2] });
    assert.equal(new Set(numeric.map((option) => option.value)).size, 3);
    assert.equal(numeric.filter((option) => option.isCorrect).length, 1);
    const operations = generateOperationAlternatives(a, b, { distractorBValues: b === 10 ? [1, 2] : [b === 1 ? 2 : 1, b === 2 ? 3 : 2] });
    assert.equal(operations.filter((option) => option.product === a * b).length, 1);
  }
});

test('v1.2 dominio requiere dos rondas calificadas y siete factores, no solo estrellas', () => {
  const state = createInitialProgressionState();
  const allCorrect = { table: 2, firstAttemptSuccesses: 4, currentInitialSuccesses: 3, currentFactors: [1, 2, 3, 4], currentFirstAttemptCorrect: [true, true, true, true] };
  let result = recordRoundEvidence(state, allCorrect);
  assert.equal(result.unlockedNewLevel, false);
  result = recordRoundEvidence(result.state, { ...allCorrect, currentFactors: [5, 6, 7, 8], currentFirstAttemptCorrect: [true, true, true, true] });
  assert.equal(result.domain.mastered, true);
  assert.equal(result.unlockedNewLevel, false, 'La tabla 2 no puede abrirse fuera de secuencia');
  assert.equal(result.state.highestUnlockedLevel, 1);
  assert.equal(evaluateTableDomain(2, result.state.tables[2]).coveredFactors.length, 8);
});

test('Request #29 separa 4/4 de dominio y desbloqueo de tabla 1', () => {
  const state = createInitialProgressionState();
  const perfect = { table: 1, firstAttemptSuccesses: 4, currentInitialSuccesses: 4, currentFactors: [1, 2, 3, 4], currentFirstAttemptCorrect: [true, true, true, true] };
  const result = recordRoundEvidence(state, perfect);
  assert.equal(result.domain.mastered, true);
  assert.equal(result.unlockedNewLevel, true);
  assert.equal(result.state.highestUnlockedLevel, 2);
  assert.equal(getTableDomainSummary(2, result.state.tables[2]).pendingFactors.length, 10);
});

test('Request #29 no muestra factores pendientes cuando la tabla ya está dominada', () => {
  const state = createInitialProgressionState();
  const round = { table: 2, firstAttemptSuccesses: 3, currentInitialSuccesses: 3, currentFactors: [1, 2, 3, 4], currentFirstAttemptCorrect: [true, true, true, true] };
  let result = recordRoundEvidence(state, round);
  result = recordRoundEvidence(result.state, { ...round, currentFactors: [5, 6, 7], currentFirstAttemptCorrect: [true, true, true] });
  const summary = getTableDomainSummary(2, result.state.tables[2]);
  assert.equal(summary.mastered, true);
  assert.deepEqual(summary.pendingFactors, []);
});

test('Request #29 selecciona pendientes primero y cubre siete factores sin sorteo indefinido', () => {
  const pending = [7, 8, 9, 10];
  const first = selectRoundBValues(2, { pendingFactors: pending, randomFn: () => 0 });
  const second = selectRoundBValues(2, { pendingFactors: [3, 4, 5, 6, 7, 8, 9], coveredFactors: [1, 2], randomFn: () => 0.999 });
  assert.deepEqual(new Set(first), new Set(pending));
  assert.ok(second.every((b) => [3, 4, 5, 6, 7, 8, 9].includes(b)));
  assert.equal(new Set([...second, 1, 2]).size, 6);
});

test('Request #29 no duplica evidencia por reintento ni por factor repetido', () => {
  const state = createInitialProgressionState();
  const result = recordRoundEvidence(state, {
    table: 2,
    firstAttemptSuccesses: 2,
    currentInitialSuccesses: 2,
    currentFactors: [4, 4],
    currentFirstAttemptCorrect: [true, true]
  });
  assert.deepEqual(result.state.tables[2].coveredFactors, [4]);
  assert.equal(result.domain.qualifyingRounds, 1);
});

test('v1.2 migración legacy es idempotente, conserva sonido y fallos válidos', () => {
  const legacy = { version: 1, highestUnlockedLevel: 3, soundEnabled: false };
  const migrated = migrateLegacyProgression(legacy, false, [{ a: 3, b: 2 }, { a: 99, b: 1 }, null]);
  assert.equal(migrated.version, 1.2);
  assert.equal(migrated.highestUnlockedLevel, 4);
  assert.equal(migrated.soundEnabled, false);
  assert.deepEqual(migrated.tables[3].failedOperations, [{ a: 3, b: 2 }]);
  const storage = memoryStorage();
  assert.equal(saveProgressionState(migrated, storage).success, true);
  assert.equal(loadProgressionState(storage).state.version, 1.2);
  assert.equal(loadProgressionState(storage).state.highestUnlockedLevel, 4);
});

test('v1.2 almacenamiento corrupto o ausente degrada a memoria sin lanzar', () => {
  const corrupt = { getItem: () => '{', setItem: () => { throw new Error('quota'); } };
  const result = loadProgressionState(corrupt);
  assert.equal(result.state.highestUnlockedLevel, 1);
  assert.ok(result.warning);
  assert.equal(loadProgressionState(null).storageAvailable, false);
  const securityError = { getItem: () => { throw new DOMException('denied', 'SecurityError'); } };
  assert.equal(loadProgressionState(securityError).state.highestUnlockedLevel, 1);
});

test('v1.2 no existe tabla 11 y se conservan límites de catálogo', () => {
  assert.equal(MAX_LEVEL, 10);
  assert.equal(LEVELS_CATALOG.at(-1).table, 10);
  assert.equal(LEVELS_CATALOG.some((item) => item.table === 11), false);
  assert.deepEqual(Object.values(MODALITIES), [2, 3, 4, 5]);
});
