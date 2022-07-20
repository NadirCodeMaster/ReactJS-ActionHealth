import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'text_manual_long_v1'
});

const question = {
  required: true,
  value: {
    label: 'Cras vitae tortor sit and how do you personally feel about it?',
    variableName: 'cras_vitae_tortor_sit_long',
    prepopulate: '',
    replacementFormat: 'block'
  }
};

const answer = {
  response:
    'Ipsum, which has been my favorite since I was a lad. Once, dolor sit amet, consectetur adipiscing elit. Suspendisse in laoreet mauris. Mauris fringilla, odio vel mollis vulputate, enim tellus rutrum velit, sit amet vulputate augue dolor a neque. Proin nec fermentum sem. Nulla vestibulum urna non diam volutpat id viverra nisi semper. Vivamus nec diam vel turpis laoreet varius at in orci. Proin nibh nisi, volutpat sed condimentum id, sagittis scelerisque urna.\n\nDonec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
};

test('Non-empty string is always VALID', () => {
  let res;
  let questionMod = { ...question };
  questionMod.required = false;

  // On required question.
  res = AV.text_manual_long_v1(question, answer);
  expect(res).toBe(true);

  // On optional question.
  res = AV.text_manual_long_v1(questionMod, answer);
  expect(res).toBe(true);
});

test('Empty response VALID only if question is optional', () => {
  let res;
  let questionMod = { ...question };
  questionMod.required = false;
  let answerModNull = { ...answer };
  let answerModEmptyString = { ...answer };
  let answerModUndefined = { ...answer };
  answerModNull.response = null;
  answerModEmptyString.response = '';
  delete answerModUndefined.response;

  // --- REQUIRED QUESTION TESTS

  // Null on required question.
  res = AV.text_manual_long_v1(question, answerModNull);
  expect(res).toBe(false);

  // Empty string on required question.
  res = AV.text_manual_long_v1(question, answerModEmptyString);
  expect(res).toBe(false);

  // Undefined on required question.
  res = AV.text_manual_long_v1(question, answerModUndefined);
  expect(res).toBe(false);

  // --- OPTIONAL QUESTION TESTS

  // Null on optional question.
  res = AV.text_manual_long_v1(questionMod, answerModNull);
  expect(res).toBe(true);

  // Empty string on optional question.
  res = AV.text_manual_long_v1(questionMod, answerModEmptyString);
  expect(res).toBe(true);

  // Undefined on optional question.
  res = AV.text_manual_long_v1(questionMod, answerModUndefined);
  expect(res).toBe(true);
});
