import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEVEL_TO_TABLE,
  VALID_LEVELS,
  VALID_B_VALUES,
  MODALITIES,
  getLevelA,
  getAllValidPairs,
  selectRoundBValues,
  generateNumericAlternatives,
  generateOperationAlternatives,
  createQuestion,
  createQuestionRound,
  evaluateAnswer,
  revealHint,
  advanceRound,
  readFailedHistory,
  recordFailedOperation,
  clearFailedOperation
} from '../js/question-engine.js';

test('1.1 Modelo local de preguntas y ronda para los 4 niveles numerados 1-4', () => {
  // Correspondencia de niveles
  assert.equal(getLevelA(1), 2, 'Nivel 1 -> a=2');
  assert.equal(getLevelA(2), 3, 'Nivel 2 -> a=3');
  assert.equal(getLevelA(3), 4, 'Nivel 3 -> a=4');
  assert.equal(getLevelA(4), 5, 'Nivel 4 -> a=5');

  assert.throws(() => getLevelA(0), /Nivel inválido/);
  assert.throws(() => getLevelA(5), /Nivel inválido/);

  // Crear una ronda para cada nivel y verificar que produce exactamente 4 preguntas
  for (const lvl of VALID_LEVELS) {
    const round = createQuestionRound(lvl);
    assert.equal(round.level, lvl);
    assert.equal(round.a, LEVEL_TO_TABLE[lvl]);
    assert.equal(round.questions.length, 4, 'Exactamente 4 preguntas por ronda');
    assert.equal(round.currentIndex, 0);
    assert.equal(round.isFinished, false);

    // Modalidades en el orden estricto 2, 3, 4, 5
    assert.equal(round.questions[0].modalidad, MODALITIES.PREGUNTA_2);
    assert.equal(round.questions[1].modalidad, MODALITIES.PREGUNTA_3);
    assert.equal(round.questions[2].modalidad, MODALITIES.PREGUNTA_4);
    assert.equal(round.questions[3].modalidad, MODALITIES.PREGUNTA_5);

    // Cada pregunta conserva a, b, producto y modalidad
    round.questions.forEach((q, idx) => {
      assert.equal(q.a, round.a);
      assert.ok(VALID_B_VALUES.includes(q.b));
      assert.equal(q.product, q.a * q.b);
      assert.equal(q.index, idx);
      assert.equal(q.questionNumber, idx + 2);
    });
  }
});

test('1.2 Generación exhaustiva de las 20 parejas válidas (5 por nivel, a fijo, b 1-5)', () => {
  const allPairs = getAllValidPairs();
  assert.equal(allPairs.length, 20, 'Deben existir exactamente 20 parejas evaluables');

  const pairsByLevel = { 1: 0, 2: 0, 3: 0, 4: 0 };
  allPairs.forEach((pair) => {
    assert.ok(VALID_LEVELS.includes(pair.level));
    assert.equal(pair.a, LEVEL_TO_TABLE[pair.level]);
    assert.ok(pair.b >= 1 && pair.b <= 5);
    assert.equal(pair.product, pair.a * pair.b);
    pairsByLevel[pair.level]++;
  });

  for (const lvl of VALID_LEVELS) {
    assert.equal(pairsByLevel[lvl], 5, `El nivel ${lvl} debe tener exactamente 5 parejas`);
  }

  // Comprobar que no aparecen tablas fuera de las tablas 2, 3, 4 y 5
  const uniqueAValues = new Set(allPairs.map((p) => p.a));
  assert.deepEqual(Array.from(uniqueAValues).sort(), [2, 3, 4, 5]);
});

test('1.3 Selección reproducible de operaciones y variación de parejas', () => {
  // Evitar parejas repetidas dentro de una ronda de 4 preguntas
  for (let i = 0; i < 50; i++) {
    const bValues = selectRoundBValues(1);
    assert.equal(bValues.length, 4);
    const unique = new Set(bValues);
    assert.equal(unique.size, 4, 'Las 4 preguntas de la ronda deben tener valores de b distintos');
  }

  // Priorización de falladas sin pérdida de variedad
  const mockFailedHistory = [
    { a: 2, b: 4, failedAt: 1000 },
    { a: 2, b: 5, failedAt: 1001 }
  ];

  // Con generador aleatorio inyectado
  let mockRandomCounter = 0;
  const predictableRandom = () => {
    mockRandomCounter += 0.2;
    return (mockRandomCounter % 1);
  };

  const selectedWithPriority = selectRoundBValues(1, {
    failedHistory: mockFailedHistory,
    randomFn: predictableRandom
  });

  assert.equal(selectedWithPriority.length, 4);
  assert.equal(new Set(selectedWithPriority).size, 4);
  // Al menos uno de los fallados debe estar incluido
  const includesFailed = selectedWithPriority.includes(4) || selectedWithPriority.includes(5);
  assert.ok(includesFailed, 'Debe incluir operaciones priorizadas');

  // Soporte determinista inyectable directo
  const deterministicB = [1, 3, 2, 5];
  const roundDet = createQuestionRound(2, { bValues: deterministicB });
  assert.deepEqual(roundDet.questions.map((q) => q.b), deterministicB);

  // Tolerancia estricta a localStorage ausente, corrupto o restringido (revisión OpenSpec)
  // Caso 1: entrada con '[null]'
  const mockStorageCorrupt1 = {
    getItem: () => '[null]',
    setItem: () => {}
  };
  const historyCorrupt1 = readFailedHistory(mockStorageCorrupt1);
  assert.deepEqual(historyCorrupt1, [], 'Historial con [null] debe sanearse y retornar array vacío');
  const bValuesCorrupt1 = selectRoundBValues(1, { storage: mockStorageCorrupt1 });
  assert.equal(bValuesCorrupt1.length, 4);
  assert.equal(new Set(bValuesCorrupt1).size, 4);
  const roundCorrupt1 = createQuestionRound(1, { storage: mockStorageCorrupt1 });
  assert.equal(roundCorrupt1.questions.length, 4);

  // Caso 2: entrada con '[{"a":2},null]'
  const mockStorageCorrupt2 = {
    getItem: () => '[{"a":2},null]',
    setItem: () => {}
  };
  const historyCorrupt2 = readFailedHistory(mockStorageCorrupt2);
  assert.deepEqual(historyCorrupt2, [], 'Historial con [{"a":2},null] debe sanearse y retornar array vacío');
  const bValuesCorrupt2 = selectRoundBValues(1, { storage: mockStorageCorrupt2 });
  assert.equal(bValuesCorrupt2.length, 4);
  assert.equal(new Set(bValuesCorrupt2).size, 4);
  const roundCorrupt2 = createQuestionRound(1, { storage: mockStorageCorrupt2 });
  assert.equal(roundCorrupt2.questions.length, 4);

  // Caso 3: inyección directa de failedHistory corrupto con nulls y objetos incompletos
  assert.doesNotThrow(() => {
    const bVals = selectRoundBValues(1, { failedHistory: [null, { a: 2 }, undefined, 123, 'corrupted'] });
    assert.equal(bVals.length, 4);
    assert.equal(new Set(bVals).size, 4);
  });

  // Caso 4: elementos mixtos válidos e inválidos (ej. [{"a":2,"b":3},null])
  const mockStorageMixed = {
    getItem: () => '[{"a":2,"b":3},null]',
    setItem: () => {}
  };
  const historyMixed = readFailedHistory(mockStorageMixed);
  assert.equal(historyMixed.length, 1);
  assert.equal(historyMixed[0].a, 2);
  assert.equal(historyMixed[0].b, 3);
  const roundMixed = createQuestionRound(1, { storage: mockStorageMixed });
  assert.equal(roundMixed.questions.length, 4);

  // Caso 5: emulación global de localStorage para verificar invocación sin storage explícito
  const prevGlobalStorage = globalThis.localStorage;
  try {
    globalThis.localStorage = {
      getItem: () => '[null]',
      setItem: () => {}
    };
    assert.deepEqual(readFailedHistory(), []);
    const rNull = createQuestionRound(1);
    assert.equal(rNull.questions.length, 4);

    globalThis.localStorage = {
      getItem: () => '[{"a":2},null]',
      setItem: () => {}
    };
    assert.deepEqual(readFailedHistory(), []);
    const rMissingB = createQuestionRound(1);
    assert.equal(rMissingB.questions.length, 4);
  } finally {
    if (prevGlobalStorage === undefined) {
      delete globalThis.localStorage;
    } else {
      globalThis.localStorage = prevGlobalStorage;
    }
  }
});

test('1.4 Alternativas con cardinalidad y unicidad garantizadas', () => {
  // Modalidades 2, 3 y 4: 3 resultados numéricos distintos
  for (const lvl of VALID_LEVELS) {
    const a = LEVEL_TO_TABLE[lvl];
    for (const b of VALID_B_VALUES) {
      const alts = generateNumericAlternatives(a, b);
      assert.equal(alts.length, 3, 'Exactamente 3 alternativas');

      const values = alts.map((opt) => opt.value);
      assert.equal(new Set(values).size, 3, 'Los tres valores deben ser distintos');

      const correctList = alts.filter((opt) => opt.isCorrect);
      assert.equal(correctList.length, 1, 'Exactamente una alternativa correcta');
      assert.equal(correctList[0].value, a * b, 'El valor correcto debe ser a * b');

      const distractors = alts.filter((opt) => !opt.isCorrect);
      assert.equal(distractors.length, 2, 'Exactamente dos distractores');
      distractors.forEach((d) => {
        assert.notEqual(d.value, a * b, 'El distractor debe diferir del producto');
        // Debe ser un producto válido de la tabla
        assert.equal(d.value % a, 0, 'El distractor debe pertenecer a la tabla');
      });
    }
  }

  // Modalidad 5: 3 operaciones con mismo primer factor 'a' y 'b' distintos
  for (const lvl of VALID_LEVELS) {
    const a = LEVEL_TO_TABLE[lvl];
    for (const b of VALID_B_VALUES) {
      const targetProduct = a * b;
      const opAlts = generateOperationAlternatives(a, b);
      assert.equal(opAlts.length, 3, 'Exactamente 3 operaciones candidatas');

      // Las 3 comparten primer factor a
      opAlts.forEach((op) => {
        assert.equal(op.a, a, 'Debe compartir el primer factor del nivel');
      });

      // Segundos factores distintos
      const bSet = new Set(opAlts.map((op) => op.b));
      assert.equal(bSet.size, 3, 'Los segundos factores b deben ser todos distintos');

      // Solo una produce targetProduct
      const matchingProduct = opAlts.filter((op) => op.product === targetProduct);
      assert.equal(matchingProduct.length, 1, 'Solo una operación debe producir el total');
      assert.equal(matchingProduct[0].isCorrect, true);
    }
  }

  // Posición variable de la correcta
  const foundPositions = new Set();
  for (let i = 0; i < 40; i++) {
    const alts = generateNumericAlternatives(2, 3);
    const correctIdx = alts.findIndex((a) => a.isCorrect);
    foundPositions.add(correctIdx);
  }
  assert.ok(foundPositions.size >= 2, 'La posición de la correcta debe ser variable');
});

test('2.1 Registro inmutable de primer intento y reintentos sin penalización', () => {
  const round = createQuestionRound(1, { bValues: [1, 2, 3, 4] });
  const q0 = round.questions[0];

  assert.equal(q0.firstAttemptMade, false);
  assert.equal(q0.firstAttemptCorrect, null);

  // Intentar con una respuesta incorrecta
  const wrongOption = q0.alternatives.find((opt) => !opt.isCorrect);
  const evalResult1 = evaluateAnswer(round, wrongOption);

  assert.equal(evalResult1.isCorrect, false);
  assert.equal(evalResult1.firstAttemptCorrect, false);
  assert.equal(q0.firstAttemptMade, true);
  assert.equal(q0.firstAttemptCorrect, false);
  assert.equal(q0.isResolved, false);
  assert.equal(q0.attemptsCount, 1);

  // Reintentar con la respuesta correcta
  const correctOption = q0.alternatives.find((opt) => opt.isCorrect);
  const evalResult2 = evaluateAnswer(round, correctOption);

  assert.equal(evalResult2.isCorrect, true);
  // Invariante: firstAttemptCorrect permanece false aunque ahora acierte
  assert.equal(evalResult2.firstAttemptCorrect, false);
  assert.equal(q0.firstAttemptCorrect, false);
  assert.equal(q0.isResolved, true);
  assert.equal(q0.attemptsCount, 2);
});

test('2.2 Evaluación por producto en modalidad 5 independientemente de posición visual', () => {
  // Fijar correcta en la posición 2 (última)
  const round = createQuestionRound(1, {
    bValues: [1, 2, 3, 4],
    perQuestionOptions: {
      3: { correctIndex: 2, distractorBValues: [1, 2] }
    }
  });

  round.currentIndex = 3; // Pregunta 5 (modalidad 5)
  const q5 = round.questions[3];
  assert.equal(q5.modalidad, MODALITIES.PREGUNTA_5);
  assert.equal(q5.product, 2 * 4); // 8

  // Comprobar que solo la que produce 8 es correcta
  q5.alternatives.forEach((alt) => {
    if (alt.product === 8) {
      assert.equal(alt.isCorrect, true);
    } else {
      assert.equal(alt.isCorrect, false);
    }
  });

  // Elegir una incorrecta
  const incorrect = q5.alternatives.find((a) => a.product !== 8);
  const resWrong = evaluateAnswer(round, incorrect);
  assert.equal(resWrong.isCorrect, false);

  // Elegir la correcta
  const correct = q5.alternatives.find((a) => a.product === 8);
  const resCorrect = evaluateAnswer(round, correct);
  assert.equal(resCorrect.isCorrect, true);
});

test('2.3 Pistas contextuales: caso 2x4, grupos visibles vs ocultos, y pista en pregunta 5', () => {
  const round = createQuestionRound(1, { bValues: [2, 3, 4, 5] });

  // Pregunta 2 (visual): grupos visibles por defecto
  const q2 = round.questions[0];
  assert.equal(q2.hasVisualGroups, true);
  assert.equal(q2.hintAvailable, false);
  assert.equal(q2.groups.length, 2); // a=2

  // Pregunta 4 (multiplicación, 2x4): sin grupos por defecto, pista disponible
  round.currentIndex = 2;
  const q4 = round.questions[2];
  assert.equal(q4.hasVisualGroups, false);
  assert.equal(q4.hintAvailable, true);
  assert.equal(q4.hintShown, false);

  const hintInfo4 = revealHint(round);
  assert.ok(hintInfo4);
  assert.equal(q4.hintShown, true);
  assert.equal(hintInfo4.groups.length, 2, '2 grupos');
  assert.equal(hintInfo4.groups[0].itemCount, 4, '4 manzanas por grupo');
  assert.ok(hintInfo4.hintText.includes('Dos grupos de cuatro manzanas'));

  // Pregunta 5 (selección de operación, 2x5): pista opcional muestra a grupos de b sin mutar alternativas
  round.currentIndex = 3;
  const q5 = round.questions[3];
  assert.equal(q5.hintAvailable, true);
  const origAlts = [...q5.alternatives];

  const hintInfo5 = revealHint(round);
  assert.ok(hintInfo5);
  assert.equal(hintInfo5.groups.length, 2);
  assert.equal(hintInfo5.groups[0].itemCount, 5);
  // Las alternativas no mutan
  assert.deepEqual(q5.alternatives, origAlts);
});

test('2.4 Integración de continuar, cierre de ronda y sin avance automático de nivel', () => {
  const round = createQuestionRound(1, { bValues: [1, 2, 3, 4] });

  // No avanza si no está resuelta
  const tryAdvance = advanceRound(round);
  assert.equal(tryAdvance.advanced, false);
  assert.equal(round.currentIndex, 0);

  // Responder Q1 correctamente al primer intento
  const q0Correct = round.questions[0].alternatives.find((a) => a.isCorrect);
  evaluateAnswer(round, q0Correct);
  const adv1 = advanceRound(round);
  assert.equal(adv1.advanced, true);
  assert.equal(round.currentIndex, 1);

  // Responder Q2 con fallo luego acierto
  const q1Wrong = round.questions[1].alternatives.find((a) => !a.isCorrect);
  evaluateAnswer(round, q1Wrong);
  const q1Correct = round.questions[1].alternatives.find((a) => a.isCorrect);
  evaluateAnswer(round, q1Correct);
  advanceRound(round);
  assert.equal(round.currentIndex, 2);

  // Responder Q3 correctamente al primer intento
  const q2Correct = round.questions[2].alternatives.find((a) => a.isCorrect);
  evaluateAnswer(round, q2Correct);
  advanceRound(round);
  assert.equal(round.currentIndex, 3);

  // Responder Q4 correctamente al primer intento
  const q3Correct = round.questions[3].alternatives.find((a) => a.isCorrect);
  evaluateAnswer(round, q3Correct);
  const finalAdv = advanceRound(round);

  assert.equal(finalAdv.isFinished, true);
  assert.ok(round.summary);
  assert.equal(round.summary.totalQuestions, 4);
  assert.equal(round.summary.firstAttemptSuccesses, 3, 'Q1, Q3, Q4 acertadas al primer intento = 3');
  assert.equal(round.summary.level, 1, 'Permanece en Nivel 1, nunca salta a Nivel 2 automáticamente');
});

test('2.5 Resumen inmutable de 0 a 4 aciertos de primer intento', () => {
  // Probar los 5 casos posibles de aciertos: 0, 1, 2, 3, 4
  for (let desiredScore = 0; desiredScore <= 4; desiredScore++) {
    const round = createQuestionRound(1, { bValues: [1, 2, 3, 4] });
    for (let i = 0; i < 4; i++) {
      const q = round.questions[i];
      if (i < desiredScore) {
        // Acierto al primer intento
        const corr = q.alternatives.find((a) => a.isCorrect);
        evaluateAnswer(round, corr);
      } else {
        // Fallo al primer intento, luego reintento acertado
        const wrong = q.alternatives.find((a) => !a.isCorrect);
        evaluateAnswer(round, wrong);
        const corr = q.alternatives.find((a) => a.isCorrect);
        evaluateAnswer(round, corr);
      }
      advanceRound(round);
    }
    assert.equal(round.summary.firstAttemptSuccesses, desiredScore, `Puntuación debe ser ${desiredScore}`);
  }
});
