import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEVELS_CATALOG,
  MIN_LEVEL,
  MAX_LEVEL,
  UNLOCK_THRESHOLD,
  PROGRESSION_STORAGE_KEY,
  SOUND_STORAGE_KEY,
  getLevelConfig,
  getAllCatalogPairs,
  normalizeHighestUnlockedLevel,
  createInitialProgressionState,
  isLevelUnlocked,
  getUnlockedLevels,
  validateAndNormalizeState,
  loadProgressionState,
  saveProgressionState,
  evaluateProgressionUnlock,
  closeRoundProgression
} from '../js/progression.js';

test('1. Catálogo de niveles, correspondencia de tablas y convención matemática', async (t) => {
  await t.test('1.1 Configuración de niveles 1 a 4 con tablas 2 a 5 y factores 1..5', () => {
    assert.equal(LEVELS_CATALOG.length, 4, 'Deben existir exactamente cuatro niveles en el catálogo');

    const expected = [
      { level: 1, table: 2, a: 2 },
      { level: 2, table: 3, a: 3 },
      { level: 3, table: 4, a: 4 },
      { level: 4, table: 5, a: 5 }
    ];

    expected.forEach((exp, idx) => {
      const cfg = LEVELS_CATALOG[idx];
      assert.equal(cfg.level, exp.level);
      assert.equal(cfg.table, exp.table);
      assert.equal(cfg.a, exp.a);
      assert.deepEqual(Array.from(cfg.factors), [1, 2, 3, 4, 5]);
      assert.equal(getLevelConfig(exp.level), cfg);
    });

    assert.throws(() => getLevelConfig(0), /RangeError/);
    assert.throws(() => getLevelConfig(5), /RangeError/);
  });

  await t.test('1.2 Verificación exhaustiva de las 20 parejas y convención a × b = a grupos de b', () => {
    const pairs = getAllCatalogPairs();
    assert.equal(pairs.length, 20, 'Deben existir exactamente 20 parejas (4 niveles × 5 factores)');

    const seen = new Set();
    pairs.forEach((p) => {
      assert.ok(p.level >= 1 && p.level <= 4);
      assert.ok(p.a >= 2 && p.a <= 5);
      assert.ok(p.b >= 1 && p.b <= 5);
      assert.equal(p.product, p.a * p.b);
      assert.equal(p.operationLabel, `${p.a} × ${p.b}`);
      assert.equal(p.groupsDescription, `${p.a} grupos de ${p.b}`);

      const key = `${p.a}x${p.b}`;
      assert.ok(!seen.has(key), `La pareja ${key} no debe estar duplicada`);
      seen.add(key);
    });
  });
});

test('2. Disponibilidad secuencial y estado inicial', async (t) => {
  await t.test('2.1 Estado inicial con solo Nivel 1 abierto y niveles 2, 3 y 4 bloqueados', () => {
    const initial = createInitialProgressionState();
    assert.equal(initial.version, 1);
    assert.equal(initial.highestUnlockedLevel, 1);
    assert.equal(initial.soundEnabled, true);

    assert.equal(isLevelUnlocked(1, initial.highestUnlockedLevel), true, 'Nivel 1 debe estar abierto');
    assert.equal(isLevelUnlocked(2, initial.highestUnlockedLevel), false, 'Nivel 2 debe estar bloqueado');
    assert.equal(isLevelUnlocked(3, initial.highestUnlockedLevel), false, 'Nivel 3 debe estar bloqueado');
    assert.equal(isLevelUnlocked(4, initial.highestUnlockedLevel), false, 'Nivel 4 debe estar bloqueado');
    assert.deepEqual(getUnlockedLevels(initial.highestUnlockedLevel), [1]);
  });

  await t.test('2.2 La disponibilidad es estrictamente prefija (imposible Nivel 4 abierto con Nivel 2 bloqueado)', () => {
    // Para cualquier valor máximo 1..4, el conjunto abierto siempre es [1..max]
    for (let max = 1; max <= 4; max++) {
      const unlocked = getUnlockedLevels(max);
      for (let lvl = 1; lvl <= max; lvl++) {
        assert.ok(unlocked.includes(lvl), `Nivel ${lvl} debe estar abierto cuando max es ${max}`);
      }
      for (let lvl = max + 1; lvl <= 4; lvl++) {
        assert.ok(!unlocked.includes(lvl), `Nivel ${lvl} debe estar bloqueado cuando max es ${max}`);
      }
    }

    // Normalización de valores fuera de rango o corruptos
    assert.equal(normalizeHighestUnlockedLevel(null), 1);
    assert.equal(normalizeHighestUnlockedLevel('abc'), 1);
    assert.equal(normalizeHighestUnlockedLevel(0), 1);
    assert.equal(normalizeHighestUnlockedLevel(5), 1);
    assert.equal(normalizeHighestUnlockedLevel(-1), 1);
  });
});

test('3. Umbral de desbloqueo, reintentos y conservación', async (t) => {
  await t.test('3.1 Umbral exacto: 3 aciertos en primer intento desbloquea el siguiente nivel', () => {
    const summary = { level: 1, firstAttemptSuccesses: 3, passed: true };
    const res = evaluateProgressionUnlock(1, summary);
    assert.equal(res.highestUnlockedLevel, 2);
    assert.equal(res.unlockedNewLevel, true);
    assert.equal(res.nextLevel, 2);
  });

  await t.test('3.2 Desbloqueo con 4 de 4 aciertos en primer intento', () => {
    const summary = { level: 1, firstAttemptSuccesses: 4, passed: true };
    const res = evaluateProgressionUnlock(1, summary);
    assert.equal(res.highestUnlockedLevel, 2);
    assert.equal(res.unlockedNewLevel, true);
    assert.equal(res.nextLevel, 2);
  });

  await t.test('3.3 Umbral insuficiente con respuestas corregidas (2 aciertos iniciales + 2 corregidos)', () => {
    // 2 aciertos al primer intento (las 2 preguntas restantes fueron corregidas en reintento)
    const summary = { level: 1, firstAttemptSuccesses: 2, passed: false };
    const res = evaluateProgressionUnlock(1, summary);
    assert.equal(res.highestUnlockedLevel, 1, 'Nivel 2 no debe desbloquearse');
    assert.equal(res.unlockedNewLevel, false);
    assert.equal(res.nextLevel, null);
  });

  await t.test('3.4 Conservación: un nivel ya abierto nunca se bloquea ante fallos posteriores', () => {
    // Jugador tiene desbloqueado hasta el Nivel 3 y juega el Nivel 2 con 0 aciertos
    const summary = { level: 2, firstAttemptSuccesses: 0, passed: false };
    const res = evaluateProgressionUnlock(3, summary);
    assert.equal(res.highestUnlockedLevel, 3, 'Los niveles ya abiertos deben conservarse');
    assert.equal(res.unlockedNewLevel, false);
  });

  await t.test('3.5 Cierre de Nivel 4: nunca ofrece Nivel 5 ni supera 4', () => {
    const summary = { level: 4, firstAttemptSuccesses: 4, passed: true };
    const res = evaluateProgressionUnlock(4, summary);
    assert.equal(res.highestUnlockedLevel, 4, 'El nivel máximo permanece en 4');
    assert.equal(res.unlockedNewLevel, false);
    assert.equal(res.nextLevel, null, 'No debe existir siguiente nivel tras Nivel 4');
  });

  await t.test('3.6 No desbloquea si el nivel jugado estaba bloqueado', () => {
    // Intento de reportar ronda del Nivel 3 cuando solo el Nivel 1 está abierto
    const summary = { level: 3, firstAttemptSuccesses: 4, passed: true };
    const res = evaluateProgressionUnlock(1, summary);
    assert.equal(res.highestUnlockedLevel, 1);
    assert.equal(res.unlockedNewLevel, false);
  });
});

test('4. Cierre idempotente de ronda', async (t) => {
  await t.test('4.1 Doble activación del cierre consume la ronda una sola vez', () => {
    const state = { version: 1, highestUnlockedLevel: 1, soundEnabled: true };
    const mockRound = {
      level: 1,
      summary: { level: 1, firstAttemptSuccesses: 3, passed: true }
    };

    // Primera invocación
    const firstCall = closeRoundProgression(state, mockRound);
    assert.equal(firstCall.highestUnlockedLevel, 2);
    assert.equal(firstCall.unlockedNewLevel, true);
    assert.equal(firstCall.alreadyProcessed, false);
    assert.equal(state.highestUnlockedLevel, 2);

    // Segunda invocación (doble clic o evento repetido)
    const secondCall = closeRoundProgression(state, mockRound);
    assert.equal(secondCall.highestUnlockedLevel, 2, 'No debe saltar al Nivel 3');
    assert.equal(secondCall.alreadyProcessed, true);
    assert.equal(state.highestUnlockedLevel, 2);
  });
});

test('5. Persistencia local defensiva y tolerancia a fallos', async (t) => {
  function createMockStorage(initStore = {}) {
    const store = { ...initStore };
    return {
      store,
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem(key, val) {
        store[key] = String(val);
      },
      removeItem(key) {
        delete store[key];
      }
    };
  }

  await t.test('5.1 Serialización mínima versionable y restauración de Nivel 2 y sonido', () => {
    const mock = createMockStorage();
    const state = { version: 1, highestUnlockedLevel: 2, soundEnabled: false };

    const saveRes = saveProgressionState(state, mock);
    assert.equal(saveRes.success, true);
    assert.equal(saveRes.warning, null);

    // Verificar contenido serializado
    const raw = JSON.parse(mock.getItem(PROGRESSION_STORAGE_KEY));
    assert.equal(raw.version, 1);
    assert.equal(raw.highestUnlockedLevel, 2);
    assert.equal(raw.soundEnabled, false);
    // Verificar que no se guardan datos de respuestas, preguntas o identidad
    assert.equal(raw.answers, undefined);
    assert.equal(raw.name, undefined);

    // Sincronización de sonido con clave histórica
    assert.equal(mock.getItem(SOUND_STORAGE_KEY), 'false');

    // Cargar en sesión posterior
    const loadRes = loadProgressionState(mock);
    assert.equal(loadRes.storageAvailable, true);
    assert.equal(loadRes.state.highestUnlockedLevel, 2);
    assert.equal(loadRes.state.soundEnabled, false);
  });

  await t.test('5.2 Tolerancia a JSON corrupto, tipos inválidos y rangos imposibles', () => {
    const corruptCases = [
      '{malformed json',
      JSON.stringify({ highestUnlockedLevel: 99, soundEnabled: true }),
      JSON.stringify({ highestUnlockedLevel: -5, soundEnabled: 'si' }),
      JSON.stringify([1, 2, 3]),
      'null',
      ''
    ];

    corruptCases.forEach((corruptVal) => {
      const mock = createMockStorage({ [PROGRESSION_STORAGE_KEY]: corruptVal });
      const loadRes = loadProgressionState(mock);
      // Debe volver al estado inicial seguro sin arrojar excepciones
      assert.equal(loadRes.state.highestUnlockedLevel, 1);
      assert.equal(typeof loadRes.state.soundEnabled, 'boolean');
    });
  });

  await t.test('5.3 Tolerancia a SecurityError o ausencia de localStorage', () => {
    // Almacenamiento restringido que arroja excepción (modo incógnito estricto o permisos bloqueados)
    const restrictedStorage = {
      getItem() {
        throw new Error('SecurityError: The operation is insecure.');
      },
      setItem() {
        throw new Error('SecurityError: The operation is insecure.');
      }
    };

    const loadRes = loadProgressionState(restrictedStorage);
    assert.equal(loadRes.state.highestUnlockedLevel, 1);
    assert.ok(loadRes.warning !== null);

    const saveRes = saveProgressionState({ version: 1, highestUnlockedLevel: 2, soundEnabled: true }, restrictedStorage);
    assert.equal(saveRes.success, false);
    assert.ok(saveRes.warning !== null);

    // Almacenamiento null
    const nullLoad = loadProgressionState(null);
    assert.equal(nullLoad.state.highestUnlockedLevel, 1);
    assert.equal(nullLoad.storageAvailable, false);
  });
});
