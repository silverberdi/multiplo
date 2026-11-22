/**
 * Historial educativo local V3-01 (#42).
 * No comparte almacenamiento con la progresión ni transmite eventos.
 */

export const LEARNING_HISTORY_STORAGE_KEY = 'multiplo_learning_history_v1';
export const LEARNING_HISTORY_VERSION = 1;
export const MAX_HISTORY_BYTES = 256 * 1024;
export const MAX_HISTORY_DETAILS = 1200;
export const HISTORY_RETENTION_DAYS = 90;

const TABLES = Array.from({ length: 10 }, (_, index) => index + 1);
const SOURCES = ['actual', 'repaso'];
const COUNTERS = [
  'sessionsStarted', 'sessionsEnded', 'roundsStarted', 'roundsCompleted',
  'roundsAbandoned', 'roundsInterrupted', 'questionsAnswered',
  'firstAttemptCorrect', 'questionsWithHints', 'additionalAttempts',
  'practiceSeconds', 'resolutionSeconds'
];

function emptyCounters() {
  return Object.fromEntries(COUNTERS.map((key) => [key, 0]));
}

function emptySplitCounters() {
  return Object.fromEntries(SOURCES.map((source) => [source, emptyCounters()]));
}

function emptyAggregate() {
  return { totals: emptyCounters(), tables: {}, pairs: {} };
}

export function createEmptyLearningHistory() {
  return {
    version: LEARNING_HISTORY_VERSION,
    nextId: 1,
    sessions: [],
    daily: {},
    cumulative: emptyAggregate()
  };
}

function safeStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch (_error) {
    return null;
  }
}

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function finiteNonNegative(value) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function normalizeCounters(value) {
  const result = emptyCounters();
  if (isRecord(value)) {
    for (const key of COUNTERS) result[key] = finiteNonNegative(value[key]);
  }
  return result;
}

function normalizeAggregate(value) {
  const result = emptyAggregate();
  if (!isRecord(value)) return result;
  result.totals = normalizeCounters(value.totals);
  if (isRecord(value.tables)) {
    for (const [tableText, bySource] of Object.entries(value.tables)) {
      const table = Number(tableText);
      if (!TABLES.includes(table) || !isRecord(bySource)) continue;
      result.tables[table] = emptySplitCounters();
      for (const source of SOURCES) result.tables[table][source] = normalizeCounters(bySource[source]);
    }
  }
  if (isRecord(value.pairs)) {
    for (const [pair, bySource] of Object.entries(value.pairs)) {
      const [a, b] = pair.split(':').map(Number);
      if (!TABLES.includes(a) || !TABLES.includes(b) || !isRecord(bySource)) continue;
      result.pairs[pair] = emptySplitCounters();
      for (const source of SOURCES) result.pairs[pair][source] = normalizeCounters(bySource[source]);
    }
  }
  return result;
}

function normalizeQuestion(question) {
  if (!isRecord(question)) return null;
  const a = Number(question.a);
  const b = Number(question.b);
  if (!Number.isInteger(a) || !TABLES.includes(a) || !Number.isInteger(b) || !TABLES.includes(b)) return null;
  if (question.source !== 'actual' && question.source !== 'repaso') return null;
  if (typeof question.firstAttemptCorrect !== 'boolean' || !Number.isInteger(question.attemptsCount) || question.attemptsCount < 1) return null;
  return {
    index: Number.isInteger(question.index) ? question.index : 0,
    a,
    b,
    source: question.source,
    firstAttemptCorrect: question.firstAttemptCorrect,
    attemptsCount: question.attemptsCount,
    hintShown: question.hintShown === true,
    activeSeconds: finiteNonNegative(question.activeSeconds),
    occurredAtUtc: typeof question.occurredAtUtc === 'string' ? question.occurredAtUtc : null
  };
}

function normalizeSession(session) {
  if (!isRecord(session) || !Array.isArray(session.rounds)) return null;
  const rounds = session.rounds.filter(isRecord).map((round) => {
    const questions = Array.isArray(round.questions) ? round.questions.map(normalizeQuestion).filter(Boolean) : [];
    const resolvedQuestionIndexes = Array.isArray(round.resolvedQuestionIndexes)
      ? round.resolvedQuestionIndexes.filter((index) => Number.isInteger(index) && index >= 0 && index < 4)
      : [];
    for (const question of questions) resolvedQuestionIndexes.push(question.index);
    return {
      id: Number.isInteger(round.id) ? round.id : 0,
      table: TABLES.includes(Number(round.table)) ? Number(round.table) : 1,
      startedAtUtc: typeof round.startedAtUtc === 'string' ? round.startedAtUtc : null,
      completedAtUtc: typeof round.completedAtUtc === 'string' ? round.completedAtUtc : null,
      abandonedAtUtc: typeof round.abandonedAtUtc === 'string' ? round.abandonedAtUtc : null,
      recoveredAtUtc: typeof round.recoveredAtUtc === 'string' ? round.recoveredAtUtc : null,
      status: ['active', 'completed', 'abandoned', 'interrupted'].includes(round.status) ? round.status : 'interrupted',
      activeSeconds: finiteNonNegative(round.activeSeconds),
      summary: isRecord(round.summary) ? round.summary : null,
      questions,
      resolvedQuestionIndexes: [...new Set(resolvedQuestionIndexes)]
    };
  });
  return {
    id: Number.isInteger(session.id) ? session.id : 0,
    startedAtUtc: typeof session.startedAtUtc === 'string' ? session.startedAtUtc : null,
    endedAtUtc: typeof session.endedAtUtc === 'string' ? session.endedAtUtc : null,
    status: ['active', 'completed', 'abandoned', 'interrupted'].includes(session.status) ? session.status : 'interrupted',
    activeSeconds: finiteNonNegative(session.activeSeconds),
    rounds
  };
}

export function normalizeLearningHistory(value) {
  if (!isRecord(value) || value.version !== LEARNING_HISTORY_VERSION || !Array.isArray(value.sessions)) {
    return createEmptyLearningHistory();
  }
  const result = createEmptyLearningHistory();
  result.nextId = Number.isInteger(value.nextId) && value.nextId > 0 ? value.nextId : 1;
  result.sessions = value.sessions.map(normalizeSession).filter(Boolean);
  if (isRecord(value.daily)) {
    for (const [date, aggregate] of Object.entries(value.daily)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) result.daily[date] = normalizeAggregate(aggregate);
    }
  }
  result.cumulative = normalizeAggregate(value.cumulative);
  return result;
}

export function readLearningHistory(storage = undefined) {
  storage = storage === undefined ? safeStorage() : storage;
  if (!storage) return createEmptyLearningHistory();
  try {
    const raw = storage.getItem(LEARNING_HISTORY_STORAGE_KEY);
    return raw ? normalizeLearningHistory(JSON.parse(raw)) : createEmptyLearningHistory();
  } catch (_error) {
    return createEmptyLearningHistory();
  }
}

function serializedBytes(value) {
  const text = JSON.stringify(value);
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

function addCounters(target, source) {
  for (const key of COUNTERS) target[key] += finiteNonNegative(source[key]);
}

function addAggregate(target, source) {
  addCounters(target.totals, source.totals);
  for (const [table, bySource] of Object.entries(source.tables)) {
    target.tables[table] ||= emptySplitCounters();
    for (const sourceName of SOURCES) addCounters(target.tables[table][sourceName], bySource[sourceName]);
  }
  for (const [pair, bySource] of Object.entries(source.pairs)) {
    target.pairs[pair] ||= emptySplitCounters();
    for (const sourceName of SOURCES) addCounters(target.pairs[pair][sourceName], bySource[sourceName]);
  }
}

function tableCounters(aggregate, table) {
  aggregate.tables[table] ||= emptySplitCounters();
  return aggregate.tables[table];
}

function pairCounters(aggregate, a, b) {
  const key = `${a}:${b}`;
  aggregate.pairs[key] ||= emptySplitCounters();
  return aggregate.pairs[key];
}

function addDayToCumulative(history, day) {
  addAggregate(history.cumulative, day);
}

function dateKey(date) {
  const parsed = date instanceof Date ? date : new Date(date);
  return Number.isNaN(parsed.getTime()) ? '1970-01-01' : parsed.toISOString().slice(0, 10);
}

function cutoffDate(nowUtc, days = HISTORY_RETENTION_DAYS) {
  const date = new Date(nowUtc);
  date.setUTCDate(date.getUTCDate() - days);
  return dateKey(date);
}

function detailCount(history) {
  return history.sessions.reduce((count, session) => count + session.rounds.reduce((sum, round) => sum + 1 + round.questions.length, 0), 0);
}

function isBeforeCutoff(timestamp, cutoffInstant) {
  if (typeof timestamp !== 'string') return true;
  const occurredAt = Date.parse(timestamp);
  return !Number.isFinite(occurredAt) || occurredAt <= cutoffInstant;
}

function isExpiredEvent(timestamp, cutoffInstant) {
  return isBeforeCutoff(timestamp, cutoffInstant);
}

function removeOldestRoundDetail(history) {
  for (const session of history.sessions) {
    const index = session.rounds.findIndex((round) => round.status !== 'active');
    if (index >= 0) {
      session.rounds.splice(index, 1);
      if (!session.rounds.length && session.status !== 'active') {
        history.sessions.splice(history.sessions.indexOf(session), 1);
      }
      return true;
    }
  }
  return false;
}

function compactHistory(history, nowUtc) {
  const cutoff = cutoffDate(nowUtc);
  const cutoffInstant = new Date(nowUtc).getTime() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  for (const [date, aggregate] of Object.entries(history.daily)) {
    if (date < cutoff) {
      addDayToCumulative(history, aggregate);
      delete history.daily[date];
    }
  }
  history.sessions = history.sessions.filter((session) => {
    if (!session.startedAtUtc || isBeforeCutoff(session.startedAtUtc, cutoffInstant)) {
      session.startedAtUtc = null;
      session.activeSeconds = 0;
    }
    if (isBeforeCutoff(session.endedAtUtc, cutoffInstant)) session.endedAtUtc = null;

    session.rounds = session.rounds.filter((round) => {
      const terminalDates = [round.completedAtUtc, round.abandonedAtUtc, round.recoveredAtUtc];
      const hasRecentTerminalEvent = terminalDates.some((date) => !isExpiredEvent(date, cutoffInstant));
      const hasRecentQuestion = round.questions.some((question) => !isExpiredEvent(question.occurredAtUtc, cutoffInstant));
      if (round.status !== 'active' && !hasRecentTerminalEvent && !hasRecentQuestion) return false;

      if (!round.startedAtUtc || isBeforeCutoff(round.startedAtUtc, cutoffInstant)) {
        round.startedAtUtc = null;
        round.activeSeconds = 0;
      }
      for (const key of ['completedAtUtc', 'abandonedAtUtc', 'recoveredAtUtc']) {
        if (isBeforeCutoff(round[key], cutoffInstant)) round[key] = null;
      }
      if (!hasRecentTerminalEvent) round.summary = null;
      round.questions = round.questions.filter((question) => !isExpiredEvent(question.occurredAtUtc, cutoffInstant));
      return true;
    });

    return session.status === 'active' || session.startedAtUtc || session.endedAtUtc || session.rounds.length > 0;
  });
  while (detailCount(history) > MAX_HISTORY_DETAILS) {
    if (!removeOldestRoundDetail(history)) break;
  }
  while (serializedBytes(history) > MAX_HISTORY_BYTES) {
    const oldestDate = Object.keys(history.daily).sort()[0];
    if (oldestDate) {
      addDayToCumulative(history, history.daily[oldestDate]);
      delete history.daily[oldestDate];
      continue;
    }
    if (!removeOldestRoundDetail(history)) {
      const removable = history.sessions.findIndex((session) => session.status !== 'active');
      if (removable < 0) break;
      history.sessions.splice(removable, 1);
    }
  }
}

function incrementCounters(aggregate, table, source, patch) {
  const normalizedSource = source === 'repaso' ? 'repaso' : 'actual';
  const tableSplit = tableCounters(aggregate, table);
  const targetTableCounters = tableSplit[normalizedSource];
  const totalCounters = tableSplit.actual;
  // Session/ronda counters are attributed to the current table; question counters to their source.
  for (const [key, value] of Object.entries(patch)) {
    const amount = finiteNonNegative(value);
    aggregate.totals[key] += amount;
    if (['questionsAnswered', 'firstAttemptCorrect', 'questionsWithHints', 'additionalAttempts', 'resolutionSeconds'].includes(key)) {
      targetTableCounters[key] += amount;
      pairCounters(aggregate, table, patch.b ?? 1)[normalizedSource][key] += amount;
    } else {
      totalCounters[key] += amount;
    }
  }
}

function ensureDay(history, date) {
  history.daily[date] ||= emptyAggregate();
  return history.daily[date];
}

function aggregateQuestion(history, question) {
  const day = ensureDay(history, question.occurredAtUtc.slice(0, 10));
  const source = question.source;
  const tableTarget = tableCounters(day, question.a)[source];
  const pairTarget = pairCounters(day, question.a, question.b)[source];
  const changes = {
    questionsAnswered: 1,
    firstAttemptCorrect: question.firstAttemptCorrect ? 1 : 0,
    questionsWithHints: question.hintShown ? 1 : 0,
    additionalAttempts: Math.max(question.attemptsCount - 1, 0),
    resolutionSeconds: question.activeSeconds
  };
  for (const [key, value] of Object.entries(changes)) {
    day.totals[key] += value;
    tableTarget[key] += value;
    pairTarget[key] += value;
  }
}

function aggregateRound(history, round, counter) {
  const day = ensureDay(history, counter.date);
  incrementCounters(day, round.table, 'actual', { [counter.key]: 1 });
}

function aggregateActiveSeconds(history, round, seconds, date) {
  if (!(seconds > 0)) return;
  const day = ensureDay(history, date);
  day.totals.practiceSeconds += seconds;
  tableCounters(day, round.table).actual.practiceSeconds += seconds;
}

function ensureAggregateRange(aggregate) {
  const result = normalizeAggregate(aggregate);
  return result;
}

function calculateRates(counters) {
  const answered = counters.questionsAnswered;
  const started = counters.roundsStarted;
  return {
    ...counters,
    firstAttemptAccuracy: answered === 0 ? null : counters.firstAttemptCorrect / answered,
    roundFinalizationRatio: started === 0 ? null : counters.roundsCompleted / started,
    hintRate: answered === 0 ? null : counters.questionsWithHints / answered,
    additionalAttemptsPerQuestion: answered === 0 ? null : counters.additionalAttempts / answered
  };
}

export function calculateLearningMetrics(history, { fromUtc = null, toUtc = null } = {}) {
  const normalized = normalizeLearningHistory(history);
  // Compactado no conserva su fecha; solo se incluye en una consulta de vida completa.
  const aggregate = fromUtc || toUtc ? emptyAggregate() : ensureAggregateRange(normalized.cumulative);
  const days = Object.keys(normalized.daily).sort();
  for (const date of days) {
    if (fromUtc && date < fromUtc) continue;
    if (toUtc && date > toUtc) continue;
    addAggregate(aggregate, normalized.daily[date]);
  }
  return {
    totals: calculateRates(aggregate.totals),
    byTable: Object.fromEntries(TABLES.map((table) => [
      table,
      Object.fromEntries(SOURCES.map((source) => [source, calculateRates(aggregate.tables[table]?.[source] || emptyCounters())]))
    ])),
    byPair: Object.fromEntries(TABLES.flatMap((a) => TABLES.map((b) => [
      `${a}:${b}`,
      Object.fromEntries(SOURCES.map((source) => [source, calculateRates(aggregate.pairs[`${a}:${b}`]?.[source] || emptyCounters())]))
    ])))
  };
}

export function getDailyLearningDeltas(history, { fromUtc = null, toUtc = null } = {}) {
  const normalized = normalizeLearningHistory(history);
  const rows = [];
  for (const date of Object.keys(normalized.daily).sort()) {
    if (fromUtc && date < fromUtc) continue;
    if (toUtc && date > toUtc) continue;
    for (const table of TABLES) {
      const countersBySource = normalized.daily[date].tables[table] || emptySplitCounters();
      const pairs = Object.fromEntries(Object.entries(normalized.daily[date].pairs)
        .filter(([pair, sources]) => Number(pair.split(':')[0]) === table
          && SOURCES.some((source) => COUNTERS.some((key) => sources[source][key] > 0)))
        .map(([pair, sources]) => [pair, sources]));
      rows.push({ dateUtc: date, table, counters: countersBySource, pairs });
    }
  }
  return rows;
}

export function writeLearningHistory(history, storage = undefined, nowUtc = new Date()) {
  storage = storage === undefined ? safeStorage() : storage;
  if (!storage) return false;
  try {
    const normalized = normalizeLearningHistory(history);
    compactHistory(normalized, nowUtc);
    const serialized = JSON.stringify(normalized);
    if (serializedBytes(normalized) > MAX_HISTORY_BYTES) return false;
    storage.setItem(LEARNING_HISTORY_STORAGE_KEY, serialized);
    return true;
  } catch (_error) {
    return false;
  }
}

export function createLearningHistoryStore(options = {}) {
  const storage = options.storage === undefined ? safeStorage() : options.storage;
  const nowUtc = options.nowUtc || (() => new Date());
  const monotonicNow = options.monotonicNow || (() => globalThis.performance?.now?.() ?? Date.now());
  const isVisible = options.isVisible || (() => globalThis.document?.visibilityState !== 'hidden');
  const state = readLearningHistory(storage);
  let activeSession = state.sessions.find((session) => session.status === 'active') || null;
  let activeRound = activeSession?.rounds.find((round) => round.status === 'active') || null;
  let activeQuestionIndex = null;
  let activeQuestionSeconds = 0;
  let segmentStartedAt = null;
  let sessionStarted = false;

  function persist() {
    compactHistory(state, nowUtc());
    return writeLearningHistory(state, storage, nowUtc());
  }

  function flushSegment() {
    if (!activeSession || !activeRound || segmentStartedAt === null) return;
    const seconds = Math.max(0, (monotonicNow() - segmentStartedAt) / 1000);
    segmentStartedAt = null;
    if (seconds <= 0) return;
    activeSession.activeSeconds += seconds;
    activeRound.activeSeconds += seconds;
    activeQuestionSeconds += activeQuestionIndex === null ? 0 : seconds;
    aggregateActiveSeconds(state, activeRound, seconds, dateKey(nowUtc()));
  }

  function startSegment() {
    if (activeSession && activeRound && isVisible() && segmentStartedAt === null) segmentStartedAt = monotonicNow();
  }

  function recoverInterruptedSession() {
    if (!activeSession) return;
    const recoveredAtUtc = nowUtc().toISOString();
    activeSession.status = 'interrupted';
    activeSession.endedAtUtc = null;
    if (activeRound) {
      activeRound.status = 'interrupted';
      activeRound.recoveredAtUtc = recoveredAtUtc;
      aggregateRound(state, activeRound, { key: 'roundsInterrupted', date: dateKey(nowUtc()) });
    }
    activeSession = null;
    activeRound = null;
    persist();
  }

  // Una sesión activa persistida al cargar una nueva página solo puede ser una interrupción.
  recoverInterruptedSession();

  function startRound(table) {
    flushSegment();
    if (!activeSession) {
      activeSession = {
        id: state.nextId++,
        startedAtUtc: nowUtc().toISOString(),
        endedAtUtc: null,
        status: 'active',
        activeSeconds: 0,
        rounds: []
      };
      state.sessions.push(activeSession);
      const day = ensureDay(state, dateKey(nowUtc()));
      day.totals.sessionsStarted += 1;
      tableCounters(day, table).actual.sessionsStarted += 1;
    }
    const lastActive = activeSession.rounds.find((round) => round.status === 'active');
    if (lastActive) {
      lastActive.status = 'abandoned';
      lastActive.abandonedAtUtc = nowUtc().toISOString();
      aggregateRound(state, lastActive, { key: 'roundsAbandoned', date: dateKey(nowUtc()) });
    }
    activeRound = {
      id: state.nextId++,
      table,
      startedAtUtc: nowUtc().toISOString(),
      completedAtUtc: null,
      abandonedAtUtc: null,
      recoveredAtUtc: null,
      status: 'active',
      activeSeconds: 0,
      summary: null,
      questions: [],
      resolvedQuestionIndexes: []
    };
    activeSession.rounds.push(activeRound);
    aggregateRound(state, activeRound, { key: 'roundsStarted', date: dateKey(nowUtc()) });
    activeQuestionIndex = null;
    activeQuestionSeconds = 0;
    sessionStarted = true;
    startSegment();
    persist();
    return activeRound.id;
  }

  function startQuestion(index) {
    if (!activeRound || activeRound.status !== 'active') return;
    if (activeQuestionIndex !== index) {
      flushSegment();
      activeQuestionIndex = index;
      activeQuestionSeconds = 0;
      startSegment();
      persist();
    }
  }

  function recordResolvedQuestion(question) {
    if (!activeRound || activeRound.status !== 'active' || !question?.isResolved) return false;
    if (!Number.isInteger(question.index) || question.index < 0 || question.index >= 4) return false;
    if (activeRound.resolvedQuestionIndexes.includes(question.index)) return false;
    flushSegment();
    const occurredAtUtc = nowUtc().toISOString();
    const event = {
      index: question.index,
      a: question.a,
      b: question.b,
      source: question.source === 'repaso' ? 'repaso' : 'actual',
      firstAttemptCorrect: question.firstAttemptCorrect === true,
      attemptsCount: Math.max(1, Number(question.attemptsCount) || 1),
      hintShown: question.hintShown === true,
      activeSeconds: activeQuestionSeconds,
      occurredAtUtc
    };
    activeRound.questions.push(event);
    activeRound.resolvedQuestionIndexes.push(question.index);
    aggregateQuestion(state, event);
    activeQuestionIndex = null;
    activeQuestionSeconds = 0;
    startSegment();
    persist();
    return true;
  }

  function completeRound(summary, progressionResult, confirmedFinished) {
    if (!confirmedFinished || !activeRound || activeRound.status !== 'active') return false;
    flushSegment();
    activeRound.status = 'completed';
    activeRound.completedAtUtc = nowUtc().toISOString();
    activeRound.summary = {
      totalQuestions: Number(summary?.totalQuestions) || activeRound.resolvedQuestionIndexes.length,
      firstAttemptSuccesses: Number(summary?.firstAttemptSuccesses) || 0,
      currentInitialSuccesses: Number(summary?.currentInitialSuccesses) || 0,
      domainMastered: progressionResult?.domain?.mastered === true,
      highestUnlockedLevel: Number(progressionResult?.highestUnlockedLevel) || null,
      unlockedNewLevel: progressionResult?.unlockedNewLevel === true
    };
    aggregateRound(state, activeRound, { key: 'roundsCompleted', date: dateKey(nowUtc()) });
    activeQuestionIndex = null;
    persist();
    return true;
  }

  function endSession(status = 'completed') {
    if (!activeSession) return false;
    flushSegment();
    if (activeRound?.status === 'active') {
      activeRound.status = 'abandoned';
      activeRound.abandonedAtUtc = nowUtc().toISOString();
      aggregateRound(state, activeRound, { key: 'roundsAbandoned', date: dateKey(nowUtc()) });
    }
    activeSession.status = status;
    activeSession.endedAtUtc = nowUtc().toISOString();
    const day = ensureDay(state, dateKey(nowUtc()));
    day.totals.sessionsEnded += 1;
    if (activeRound) tableCounters(day, activeRound.table).actual.sessionsEnded += 1;
    activeSession = null;
    activeRound = null;
    activeQuestionIndex = null;
    activeQuestionSeconds = 0;
    segmentStartedAt = null;
    persist();
    return true;
  }

  function pause() {
    flushSegment();
    persist();
  }

  function resume() {
    startSegment();
  }

  function getState() {
    flushSegment();
    return normalizeLearningHistory(state);
  }

  return {
    startRound,
    startQuestion,
    recordResolvedQuestion,
    completeRound,
    endSession,
    pause,
    resume,
    getState,
    hasActiveSession: () => Boolean(activeSession),
    wasStarted: () => sessionStarted
  };
}
