import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAprendeModel,
  formatGroupDescription,
  formatAprendeInstruction,
  formatAprendeNarration
} from '../js/aprende.js';
import { createQuestion, MODALITIES, revealHint } from '../js/question-engine.js';
import { StarGuideCoordinator } from '../js/star-guide.js';

test('Request #32: compositor dirigido cubre singulares, plurales y orientación', () => {
  assert.equal(formatGroupDescription(1, 1), 'un grupo de una manzana');
  assert.equal(formatGroupDescription(1, 8), 'un grupo de ocho manzanas');
  assert.equal(formatGroupDescription(2, 1), 'dos grupos de una manzana');
  assert.equal(formatGroupDescription(3, 2), 'tres grupos de dos manzanas');
  assert.equal(formatAprendeInstruction(1, 8), 'Un grupo de ocho manzanas');
  assert.equal(formatAprendeNarration(1, 1), 'Mira: un grupo de una manzana. Uno son uno. Uno por uno son uno.');
  assert.doesNotMatch(formatAprendeNarration(1, 8), /uno grupos|un grupos/);
});

test('Request #32: Aprende conserva grupos, suma y producto para casos singulares y plurales', () => {
  for (const [a, b] of [[1, 1], [1, 8], [2, 3], [3, 2], [4, 1]]) {
    const model = createAprendeModel(a, b);
    assert.equal(model.groups.length, a);
    assert.ok(model.groups.every((group) => group.itemCount === b));
    assert.equal(model.sumTerms.length, a);
    assert.equal(model.sumTerms.reduce((sum, term) => sum + term, 0), a * b);
    assert.equal(model.product, a * b);
    assert.doesNotMatch(`${model.instructionText} ${model.narrationText}`, /uno grupos|un grupos/);
  }
});

test('Request #32: pistas reutilizan el compositor y no mutan alternativas', () => {
  for (const [a, b] of [[1, 1], [1, 8], [2, 3]]) {
    const question = createQuestion(MODALITIES.PREGUNTA_4, a, b, 0);
    const round = { questions: [question], currentIndex: 0 };
    const alternatives = [...question.alternatives];
    const hint = revealHint(round);
    assert.match(hint.hintText, new RegExp(a === 1 ? 'Un grupo' : `${a === 2 ? 'Dos' : 'tres'} grupos`, 'i'));
    const bWord = b === 1 ? 'una' : { 3: 'tres', 8: 'ocho' }[b];
    assert.ok(hint.hintText.includes(`${bWord} manzana`));
    assert.deepEqual(question.alternatives, alternatives);
  }
});

test('Request #32: fallo de reproducción conserva texto y no bloquea la guía', async () => {
  const guide = new StarGuideCoordinator({
    storage: null,
    audioFactory: () => ({ play: () => Promise.reject(new Error('simulated playback failure')), pause() {} })
  });
  guide.notifyUserGesture();
  const text = 'Un grupo de ocho manzanas';
  guide.speakInstruction(text, { event: 'aprende', context: { a: 1, b: 8, producto: 8 } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(guide.getLastInstruction(), text);
  assert.equal(guide.getState(), 'normal');
});
