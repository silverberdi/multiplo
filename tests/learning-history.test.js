import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_HISTORY_STORAGE_KEY,
  MAX_HISTORY_BYTES,
  MAX_HISTORY_DETAILS,
  calculateLearningMetrics,
  createEmptyLearningHistory,
  createLearningHistoryStore,
  getDailyLearningDeltas,
  readLearningHistory,
  writeLearningHistory
} from '../js/learning-history.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    values
  };
}

function controlledClock(start = '2026-11-22T10:00:00.000Z') {
  let wall = new Date(start);
  let monotonic = 0;
  let visible = true;
  return {
    storageOptions(storage) {
      return { storage, nowUtc: () => new Date(wall), monotonicNow: () => monotonic, isVisible: () => visible };
    },
    advance(seconds) { wall = new Date(wall.getTime() + seconds * 1000); monotonic += seconds * 1000; },
    setVisible(value) { visible = value; },
    setWall(value) { wall = new Date(value); }
  };
}

function resolvedQuestion(index, values = {}) {
  return {
    index,
    a: values.a ?? 2,
    b: values.b ?? index + 1,
    source: values.source ?? 'actual',
    firstAttemptCorrect: values.firstAttemptCorrect ?? true,
    attemptsCount: values.attemptsCount ?? 1,
    hintShown: values.hintShown ?? false,
    isResolved: true
  };
}

test('historial registra resolución una vez, origen, primer intento y métricas con denominador correcto', () => {
  const storage = memoryStorage({ multiplo_progression_v1: '{"version":1.2,"highestUnlockedLevel":4}' });
  const clock = controlledClock();
  const history = createLearningHistoryStore(clock.storageOptions(storage));
  history.startRound(2);

  for (let index = 0; index < 4; index++) {
    const question = resolvedQuestion(index, {
      a: index === 3 ? 5 : 2,
      b: index + 1,
      source: index === 3 ? 'repaso' : 'actual',
      firstAttemptCorrect: index !== 0,
      attemptsCount: index === 0 ? 3 : 1,
      hintShown: index === 0
    });
    history.startQuestion(index);
    clock.advance(1);
    assert.equal(history.recordResolvedQuestion(question), true);
    assert.equal(history.recordResolvedQuestion(question), false);
  }

  assert.equal(history.completeRound({ totalQuestions: 4, firstAttemptSuccesses: 3, currentInitialSuccesses: 2 }, {
    highestUnlockedLevel: 3,
    unlockedNewLevel: true,
    domain: { mastered: true }
  }, true), true);
  assert.equal(history.completeRound({}, {}, true), false);
  history.endSession();

  const state = readLearningHistory(storage);
  const metrics = calculateLearningMetrics(state);
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].rounds[0].questions.length, 4);
  assert.equal(state.sessions[0].rounds[0].questions[0].firstAttemptCorrect, false);
  assert.equal(state.sessions[0].rounds[0].questions[0].attemptsCount, 3);
  assert.equal(state.sessions[0].rounds[0].questions[3].source, 'repaso');
  assert.equal(state.sessions[0].rounds[0].summary.domainMastered, true);
  assert.equal(metrics.totals.questionsAnswered, 4);
  assert.equal(metrics.totals.firstAttemptCorrect, 3);
  assert.equal(metrics.totals.additionalAttempts, 2);
  assert.equal(metrics.totals.questionsWithHints, 1);
  assert.equal(metrics.totals.roundsStarted, 1);
  assert.equal(metrics.totals.roundsCompleted, 1);
  assert.equal(metrics.byTable[5].repaso.questionsAnswered, 1);
  assert.equal(metrics.byPair['5:4'].repaso.questionsAnswered, 1);
  assert.equal(storage.getItem('multiplo_progression_v1'), '{"version":1.2,"highestUnlockedLevel":4}');
});

test('tiempo monotónico pausa con la pestaña oculta y deltas asignan el día UTC del evento', () => {
  const storage = memoryStorage();
  const clock = controlledClock('2026-11-22T23:59:58.000Z');
  const history = createLearningHistoryStore(clock.storageOptions(storage));
  history.startRound(3);
  history.startQuestion(0);
  clock.advance(2);
  clock.setVisible(false);
  history.pause();
  clock.advance(300);
  clock.setVisible(true);
  history.resume();
  clock.advance(3);
  history.recordResolvedQuestion(resolvedQuestion(0, { a: 3, b: 4 }));
  history.completeRound({ totalQuestions: 1 }, {}, true);

  const state = history.getState();
  const question = state.sessions[0].rounds[0].questions[0];
  assert.equal(question.activeSeconds, 5);
  assert.equal(state.daily['2026-11-23'].totals.practiceSeconds, 5);
  assert.equal(state.daily['2026-11-23'].totals.resolutionSeconds, 5);
  assert.equal(question.occurredAtUtc, '2026-11-23T00:05:03.000Z');
  const rows = getDailyLearningDeltas(state);
  assert.equal(rows.find((row) => row.dateUtc === '2026-11-23' && row.table === 3).pairs['3:4'].actual.questionsAnswered, 1);
  assert.equal(calculateLearningMetrics(createEmptyLearningHistory()).totals.firstAttemptAccuracy, null);
  assert.equal(calculateLearningMetrics(state, { fromUtc: '2026-11-22', toUtc: '2026-11-22' }).totals.questionsAnswered, 0);
});

test('retorno explícito abandona solo la ronda incompleta; reload marca interrupción sin hora de fin', () => {
  const storage = memoryStorage();
  const clock = controlledClock();
  const first = createLearningHistoryStore(clock.storageOptions(storage));
  first.startRound(4);
  first.startQuestion(0);
  clock.advance(10);
  first.endSession();
  let state = readLearningHistory(storage);
  assert.equal(state.sessions[0].rounds[0].status, 'abandoned');
  assert.equal(state.sessions[0].endedAtUtc, '2026-11-22T10:00:10.000Z');
  assert.equal(calculateLearningMetrics(state).totals.roundsCompleted, 0);

  const second = createLearningHistoryStore(clock.storageOptions(storage));
  second.startRound(4);
  clock.advance(15);
  second.pause();
  const recovered = createLearningHistoryStore(clock.storageOptions(storage));
  state = readLearningHistory(storage);
  const interrupted = state.sessions.at(-1);
  assert.equal(interrupted.status, 'interrupted');
  assert.equal(interrupted.endedAtUtc, null);
  assert.equal(interrupted.rounds[0].status, 'interrupted');
  assert.equal(interrupted.rounds[0].recoveredAtUtc, '2026-11-22T10:00:25.000Z');
  assert.equal(calculateLearningMetrics(state).totals.roundsInterrupted, 1);
  assert.equal(calculateLearningMetrics(state).totals.practiceSeconds, 25);
  assert.equal(recovered.hasActiveSession(), false);
});

test('JSON corrupto, versión desconocida y storage bloqueado no detienen el juego ni alteran progreso', () => {
  const broken = memoryStorage({
    [LEARNING_HISTORY_STORAGE_KEY]: '{invalid',
    multiplo_progression_v1: 'legacy-progression'
  });
  const clock = controlledClock();
  const store = createLearningHistoryStore(clock.storageOptions(broken));
  store.startRound(1);
  assert.equal(store.hasActiveSession(), true);
  assert.equal(broken.getItem('multiplo_progression_v1'), 'legacy-progression');
  broken.values.set(LEARNING_HISTORY_STORAGE_KEY, JSON.stringify({ version: 999, sessions: [] }));
  assert.equal(readLearningHistory(broken).version, 1);

  const blocked = {
    getItem() { throw new DOMException('blocked', 'SecurityError'); },
    setItem() { throw new DOMException('full', 'QuotaExceededError'); }
  };
  const fallback = createLearningHistoryStore(clock.storageOptions(blocked));
  assert.doesNotThrow(() => fallback.startRound(2));
  assert.equal(fallback.hasActiveSession(), true);
  assert.equal(fallback.getState().sessions.length, 1);
});

test('retención, cantidad de detalles y tamaño persistido se mantienen acotados', () => {
  const history = createEmptyLearningHistory();
  history.daily['2026-01-01'] = createEmptyLearningHistory().cumulative;
  history.daily['2026-01-01'].totals.questionsAnswered = 7;
  history.daily['2026-01-01'].totals.firstAttemptCorrect = 5;
  history.daily['2026-01-01'].tables[2] = {
    actual: { ...createEmptyLearningHistory().cumulative.totals, questionsAnswered: 7, firstAttemptCorrect: 5 },
    repaso: createEmptyLearningHistory().cumulative.totals
  };
  history.daily['2026-01-01'].pairs['2:3'] = {
    actual: { ...createEmptyLearningHistory().cumulative.totals, questionsAnswered: 7, firstAttemptCorrect: 5 },
    repaso: createEmptyLearningHistory().cumulative.totals
  };
  history.daily['2026-11-22'] = createEmptyLearningHistory().cumulative;
  history.sessions = Array.from({ length: MAX_HISTORY_DETAILS }, (_, index) => ({
    id: index + 1,
    startedAtUtc: '2026-11-22T10:00:00.000Z',
    endedAtUtc: '2026-11-22T10:01:00.000Z',
    status: 'completed',
    activeSeconds: 60,
    rounds: [{
      id: index + 1, table: 1, startedAtUtc: '2026-11-22T10:00:00.000Z',
      completedAtUtc: '2026-11-22T10:01:00.000Z', status: 'completed', activeSeconds: 60,
      summary: null, questions: []
    }]
  }));
  const storage = memoryStorage();
  assert.equal(writeLearningHistory(history, storage, new Date('2026-11-22T00:00:00.000Z')), true);
  const saved = storage.getItem(LEARNING_HISTORY_STORAGE_KEY);
  assert.ok(new TextEncoder().encode(saved).length <= MAX_HISTORY_BYTES);
  const normalized = readLearningHistory(storage);
  assert.ok(!normalized.daily['2026-01-01']);
  assert.ok(normalized.sessions.length <= MAX_HISTORY_DETAILS);
  assert.equal(normalized.cumulative.totals.questionsAnswered, 7);
  assert.equal(calculateLearningMetrics(normalized).totals.questionsAnswered, 7);
  assert.equal(calculateLearningMetrics(normalized).byPair['2:3'].actual.firstAttemptAccuracy, 5 / 7);
});

test('retención expira cada evento por fecha dentro de sesión activa antigua sin duplicar agregados', () => {
  const storage = memoryStorage();
  const clock = controlledClock('2026-01-01T10:00:00.000Z');
  const history = createLearningHistoryStore(clock.storageOptions(storage));
  history.startRound(2);
  history.startQuestion(0);
  clock.advance(5);
  const expiredQuestion = resolvedQuestion(0, { a: 2, b: 1 });
  history.recordResolvedQuestion(expiredQuestion);

  clock.setVisible(false);
  history.pause();
  clock.setWall('2026-04-01T10:00:05.000Z');
  clock.setVisible(true);
  history.resume();
  history.startQuestion(1);
  clock.advance(1);
  history.recordResolvedQuestion(resolvedQuestion(1, { a: 2, b: 2 }));

  let state = readLearningHistory(storage);
  let session = state.sessions[0];
  let round = session.rounds.find((item) => item.status === 'active');
  assert.equal(session.status, 'active');
  assert.equal(session.startedAtUtc, null);
  assert.equal(session.activeSeconds, 0);
  assert.equal(round.startedAtUtc, null);
  assert.deepEqual(round.questions.map((question) => question.index), [1]);
  assert.deepEqual(round.resolvedQuestionIndexes, [0, 1]);
  assert.equal(state.daily['2026-01-01'].totals.questionsAnswered, 1);
  assert.equal(calculateLearningMetrics(state).totals.questionsAnswered, 2);
  assert.equal(history.recordResolvedQuestion(expiredQuestion), false);

  assert.equal(history.completeRound({ totalQuestions: 4 }, { highestUnlockedLevel: 1 }, true), true);
  history.endSession();
  state = readLearningHistory(storage);
  session = state.sessions[0];
  round = session.rounds[0];
  assert.equal(session.status, 'completed');
  assert.equal(session.startedAtUtc, null);
  assert.ok(session.endedAtUtc);
  assert.equal(round.startedAtUtc, null);
  assert.ok(round.completedAtUtc);
  assert.deepEqual(round.questions.map((question) => question.index), [1]);
  assert.equal(calculateLearningMetrics(state).totals.questionsAnswered, 2);
});
