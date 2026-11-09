import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPANISH_NUMBER_WORDS,
  MANZANA_ASSET,
  numberToWord,
  capitalize,
  validateAprendeFactors,
  formatAprendeInstruction,
  formatAprendeNarration,
  createAprendeModel,
  selectAprendeFactors,
  renderAprende
} from '../js/aprende.js';

test('1.1 Validación de límites de factores a (2-5) y b (1-5)', () => {
  // Factores válidos
  for (let a = 2; a <= 5; a++) {
    for (let b = 1; b <= 5; b++) {
      assert.doesNotThrow(() => validateAprendeFactors(a, b));
    }
  }

  // Factor a inválido (< 2, > 5, no entero)
  assert.throws(() => validateAprendeFactors(1, 3), RangeError);
  assert.throws(() => validateAprendeFactors(0, 3), RangeError);
  assert.throws(() => validateAprendeFactors(6, 3), RangeError);
  assert.throws(() => validateAprendeFactors(2.5, 3), RangeError);
  assert.throws(() => validateAprendeFactors('2', 3), RangeError);

  // Factor b inválido (< 1, > 5, no entero)
  assert.throws(() => validateAprendeFactors(3, 0), RangeError);
  assert.throws(() => validateAprendeFactors(3, -1), RangeError);
  assert.throws(() => validateAprendeFactors(3, 6), RangeError);
  assert.throws(() => validateAprendeFactors(3, 2.5), RangeError);
  assert.throws(() => validateAprendeFactors(3, '2'), RangeError);
});

test('1.2 Verificación exhaustiva de todos los 20 pares 2-5 × 1-5 y convención a × b = a grupos de b', () => {
  let count = 0;
  for (let a = 2; a <= 5; a++) {
    for (let b = 1; b <= 5; b++) {
      count++;
      const model = createAprendeModel(a, b);

      // Invariantes matemáticas
      assert.equal(model.a, a);
      assert.equal(model.b, b);
      assert.equal(model.product, a * b);
      assert.equal(model.groupCount, a, 'Debe haber exactamente a grupos');
      assert.equal(model.itemsPerGroup, b, 'Cada grupo debe tener exactamente b elementos');
      assert.equal(model.groups.length, a);

      // Verificación de cada grupo
      model.groups.forEach((group, idx) => {
        assert.equal(group.index, idx + 1);
        assert.equal(group.itemCount, b);
        assert.equal(group.asset, MANZANA_ASSET);
        assert.ok(group.ariaLabel.includes(String(group.index)));
      });

      // Suma repetida: a términos de b
      assert.equal(model.sumTerms.length, a);
      model.sumTerms.forEach((term) => assert.equal(term, b));
      const expectedSumExpr = `${Array(a).fill(b).join(' + ')} = ${a * b}`;
      assert.equal(model.sumExpression, expectedSumExpr);

      // Multiplicación: a × b = producto
      assert.equal(model.multiplicationExpression, `${a} × ${b} = ${a * b}`);

      // Texto de instrucción visible
      const expectedInstruction = formatAprendeInstruction(a, b);
      assert.equal(model.instructionText, expectedInstruction);

      // Narración verbal en español que incluye grupos, suma y producto
      const narration = model.narrationText;
      assert.ok(narration.startsWith('Mira:'));
      assert.ok(narration.includes(`${numberToWord(a)} grupos`));
      assert.ok(narration.includes(numberToWord(a * b)));
    }
  }
  assert.equal(count, 20, 'Deben verificarse exactamente los 20 pares válidos del MVP');
});

test('1.3 Caso canónico 3 × 2: tres grupos de dos manzanas, 2+2+2=6, 3×2=6', () => {
  const model = createAprendeModel(3, 2);
  assert.equal(model.instructionText, 'Tres grupos de dos manzanas');
  assert.equal(model.sumExpression, '2 + 2 + 2 = 6');
  assert.equal(model.multiplicationExpression, '3 × 2 = 6');
  assert.equal(model.product, 6);
  assert.equal(model.groupCount, 3);
  assert.equal(model.itemsPerGroup, 2);
  assert.equal(model.groupsAriaLabel, 'Demostración visual de 3 grupos de 2 manzanas');
  assert.equal(
    model.narrationText,
    'Mira: tres grupos de dos manzanas. Dos más dos más dos son seis. Tres por dos son seis.'
  );
});

test('1.4 Caso singular b = 1: concordancia gramatical en español (una manzana, no un manzanas)', () => {
  const model = createAprendeModel(4, 1);
  assert.equal(model.instructionText, 'Cuatro grupos de una manzana');
  assert.equal(model.sumExpression, '1 + 1 + 1 + 1 = 4');
  assert.equal(model.multiplicationExpression, '4 × 1 = 4');
  assert.equal(model.groupsAriaLabel, 'Demostración visual de 4 grupos de 1 manzana');
  assert.equal(
    model.narrationText,
    'Mira: cuatro grupos de una manzana. Uno más uno más uno más uno son cuatro. Cuatro por uno son cuatro.'
  );
});

test('1.5 Selección de factores para ronda: respeta opciones deterministas y evita repetición inmediata de b', () => {
  // Determinista
  const fixed = selectAprendeFactors(1, { a: 3, b: 2 });
  assert.equal(fixed.a, 3);
  assert.equal(fixed.b, 2);

  // Deriva a a partir del nivel (nivel 1 -> a=2, nivel 2 -> a=3, etc.)
  assert.equal(selectAprendeFactors(1, { b: 3 }).a, 2);
  assert.equal(selectAprendeFactors(2, { b: 3 }).a, 3);
  assert.equal(selectAprendeFactors(3, { b: 3 }).a, 4);
  assert.equal(selectAprendeFactors(4, { b: 3 }).a, 5);

  // Evita previousB cuando se selecciona aleatoriamente
  const previousB = 3;
  for (let i = 0; i < 50; i++) {
    const selected = selectAprendeFactors(1, { previousB });
    assert.notEqual(selected.b, previousB, 'No debe repetir el b inmediatamente anterior');
    assert.ok(selected.b >= 1 && selected.b <= 5);
  }
});

test('1.6 Renderizado semántico en DOM simulado sin demos duplicadas', () => {
  // Mock simple de DOM para verificar la estructura generada
  const createdElements = [];
  const fakeElement = (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      attributes: {},
      children: [],
      textContent: '',
      innerHTML: '',
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k]; },
      appendChild(child) { this.children.push(child); }
    };
    createdElements.push(el);
    return el;
  };

  const originalDocument = globalThis.document;
  globalThis.document = {
    createElement: fakeElement
  };

  try {
    const container = fakeElement('div');
    const model = createAprendeModel(3, 2);
    renderAprende(container, model);

    // Contenedor debe tener instrucción, grupos y math box
    assert.equal(container.children.length, 3);

    const [instructionEl, groupsEl, mathEl] = container.children;
    assert.equal(instructionEl.id, 'aprende-instruction');
    assert.equal(instructionEl.textContent, 'Tres grupos de dos manzanas');

    assert.equal(groupsEl.id, 'aprende-groups');
    assert.equal(groupsEl.getAttribute('role'), 'region');
    assert.equal(groupsEl.getAttribute('aria-label'), 'Demostración visual de 3 grupos de 2 manzanas');
    assert.equal(groupsEl.children.length, 3, 'Debe contener 3 grupos');

    groupsEl.children.forEach((groupDiv) => {
      assert.equal(groupDiv.className, 'item-group');
      assert.equal(groupDiv.children.length, 2, 'Cada grupo debe contener 2 imágenes de manzana');
      groupDiv.children.forEach((img) => {
        assert.equal(img.src, MANZANA_ASSET);
        assert.equal(img.alt, 'Manzana roja');
      });
    });

    assert.equal(mathEl.id, 'aprende-math');
    assert.equal(mathEl.children.length, 2);
  } finally {
    globalThis.document = originalDocument;
  }
});
