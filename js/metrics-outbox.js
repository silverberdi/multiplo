import { getDailyLearningDeltas } from './learning-history.js';

export const METRICS_OUTBOX_DATABASE = 'multiplo_metrics_outbox_v1';
export const METRICS_OUTBOX_STORE = 'queue';
export const METRICS_OUTBOX_LIMIT = 100;
export const METRICS_OUTBOX_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const METRICS_OUTBOX_ATTEMPT_LIMIT = 3;

const STORE_KEY = 'state';
const COUNTERS = [
  'roundsStarted', 'roundsCompleted', 'roundsAbandoned', 'questionsAnswered',
  'firstAttemptCorrect', 'questionsWithHints', 'additionalAttempts', 'practiceSeconds'
];
const BACKOFF_MS = [5_000, 30_000, 300_000];

function emptyCounter() {
  return Object.fromEntries(COUNTERS.map((name) => [name, 0]));
}

function counterValue(row, name) {
  return ['actual', 'repaso'].reduce((total, source) => total + (Number(row?.counters?.[source]?.[name]) || 0), 0);
}

function pairValue(pair, name) {
  return ['actual', 'repaso'].reduce((total, source) => total + (Number(pair?.[source]?.[name]) || 0), 0);
}

function rowsByKey(rows) {
  return new Map((Array.isArray(rows) ? rows : []).map((row) => [`${row.dateUtc}:${row.table}`, row]));
}

function deltaRows(previousRows, currentRows) {
  const previous = rowsByKey(previousRows);
  const current = rowsByKey(currentRows);
  const keys = new Set([...previous.keys(), ...current.keys()]);
  const result = [];

  for (const key of keys) {
    const oldRow = previous.get(key);
    const newRow = current.get(key);
    const [dateUtc, tableText] = key.split(':');
    const counters = emptyCounter();
    for (const name of COUNTERS) {
      const before = counterValue(oldRow, name);
      const after = counterValue(newRow, name);
      counters[name] = Math.max(0, name === 'practiceSeconds'
        ? Math.floor(after) - Math.floor(before)
        : after - before);
    }
    const oldPairs = oldRow?.pairs || {};
    const newPairs = newRow?.pairs || {};
    const operations = Object.keys({ ...oldPairs, ...newPairs }).map((pairKey) => {
      const b = Number(pairKey.split(':')[1]);
      return {
        b,
        questionsAnswered: Math.max(0, pairValue(newPairs[pairKey], 'questionsAnswered') - pairValue(oldPairs[pairKey], 'questionsAnswered')),
        firstAttemptCorrect: Math.max(0, pairValue(newPairs[pairKey], 'firstAttemptCorrect') - pairValue(oldPairs[pairKey], 'firstAttemptCorrect'))
      };
    }).filter((operation) => operation.questionsAnswered || operation.firstAttemptCorrect);

    if (COUNTERS.some((name) => counters[name] > 0) || operations.length) {
      result.push({ date: dateUtc, table: Number(tableText), ...counters, operations });
    }
  }
  return result;
}

function openDatabase(indexedDBImpl) {
  if (!indexedDBImpl) return Promise.reject(new Error('IndexedDB no disponible'));
  return new Promise((resolve, reject) => {
    const request = indexedDBImpl.open(METRICS_OUTBOX_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(METRICS_OUTBOX_STORE)) {
        request.result.createObjectStore(METRICS_OUTBOX_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('No se pudo abrir IndexedDB'));
  });
}

function writeState(database, update) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(METRICS_OUTBOX_STORE, 'readwrite');
    const store = transaction.objectStore(METRICS_OUTBOX_STORE);
    const request = store.get(STORE_KEY);
    request.onsuccess = () => {
      try {
        const current = request.result || null;
        const next = update(current);
        if (next) store.put({ ...next, key: STORE_KEY });
        else store.delete(STORE_KEY);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    };
    request.onerror = () => reject(request.error || new Error('No se pudo leer la cola'));
    transaction.oncomplete = () => resolve();
    transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error('No se pudo guardar la cola'));
  });
}

function newUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}

function pruneState(state, now) {
  const cutoff = now.valueOf() - METRICS_OUTBOX_RETENTION_MS;
  state.pending = (state.pending || []).filter((batch) => batch.createdAt >= cutoff && batch.attempts < METRICS_OUTBOX_ATTEMPT_LIMIT);
  state.completedEvents = (state.completedEvents || []).slice(-1200);
  return state;
}

export function createMetricsOutbox({
  enabled = false,
  indexedDB: indexedDBImpl = globalThis.indexedDB,
  fetchImpl = globalThis.fetch?.bind(globalThis),
  endpoint = '/api/metrics',
  now = () => new Date(),
  uuid = newUuid
} = {}) {
  async function mutate(operation) {
    const database = await openDatabase(indexedDBImpl);
    try {
      await writeState(database, operation);
    } finally {
      database.close();
    }
  }

  async function initialize(historyState) {
    if (!enabled) return clear();
    const baseline = getDailyLearningDeltas(historyState);
    await mutate((state) => state || ({ version: 1, cursor: baseline, pending: [], completedEvents: [] }));
    await drain();
  }

  async function capture(eventId, historyState) {
    if (!enabled || typeof eventId !== 'string' || !eventId) return false;
    const currentRows = getDailyLearningDeltas(historyState);
    let captured = false;
    await mutate((state) => {
      const current = state || { version: 1, cursor: currentRows, pending: [], completedEvents: [] };
      pruneState(current, now());
      if (current.completedEvents.includes(eventId)) return current;

      const deltas = deltaRows(current.cursor, currentRows);
      for (const row of deltas) {
        current.pending.push({
          payload: { schemaVersion: 1, batchId: uuid(), ...row },
          createdAt: now().valueOf(),
          attempts: 0,
          lastAttemptAt: null
        });
      }
      while (current.pending.length > METRICS_OUTBOX_LIMIT) current.pending.shift();
      current.cursor = currentRows;
      current.completedEvents.push(eventId);
      current.completedEvents = current.completedEvents.slice(-1200);
      captured = true;
      return current;
    });
    if (captured) await drain();
    return captured;
  }

  async function takeNextAttempt() {
    let selected = null;
    await mutate((state) => {
      if (!state) return null;
      const current = pruneState(state, now());
      const timestamp = now().valueOf();
      const index = current.pending.findIndex((batch) => {
        if (batch.attempts >= METRICS_OUTBOX_ATTEMPT_LIMIT) return false;
        const delay = batch.attempts === 0 ? 0 : BACKOFF_MS[Math.min(batch.attempts - 1, BACKOFF_MS.length - 1)];
        return batch.lastAttemptAt === null || timestamp - batch.lastAttemptAt >= delay;
      });
      if (index < 0) return current;
      const batch = current.pending[index];
      batch.attempts += 1;
      batch.lastAttemptAt = timestamp;
      selected = JSON.parse(JSON.stringify(batch));
      return current;
    });
    return selected;
  }

  async function settle(batchId, accepted) {
    await mutate((state) => {
      if (!state) return null;
      const current = pruneState(state, now());
      current.pending = current.pending.filter((batch) => batch.payload.batchId !== batchId
        || (!accepted && batch.attempts < METRICS_OUTBOX_ATTEMPT_LIMIT));
      return current;
    });
  }

  async function drain() {
    if (!enabled || typeof fetchImpl !== 'function') return false;
    let batch;
    try { batch = await takeNextAttempt(); } catch { return false; }
    if (!batch) return false;
    let accepted = false;
    try {
      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch.payload)
      });
      if (response.status === 202) {
        const body = await response.json();
        accepted = body?.accepted === true && typeof body?.duplicate === 'boolean';
      }
    } catch { /* The next ordinary app event can retry the same batch. */ }
    try { await settle(batch.payload.batchId, accepted); } catch { return false; }
    return accepted;
  }

  async function clear() {
    try {
      const database = await openDatabase(indexedDBImpl);
      try { await writeState(database, () => null); } finally { database.close(); }
    } catch { /* Storage failure must not affect the game. */ }
  }

  return { initialize, capture, drain, clear };
}
