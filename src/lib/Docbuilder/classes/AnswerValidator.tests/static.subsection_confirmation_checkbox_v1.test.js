import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'subsection_confirmation_checkbox_v1'
});

const question = Object.freeze({
  required: true,
  value: {
    label: 'The information here is complete.',
    prepopulate: 'unconfirmed'
  }
});

const answer = Object.freeze({
  response: 'confirmed'
});

test("'confirmed' is valid answer", () => {
  let res = AV.subsection_confirmation_checkbox_v1(question, answer);
  expect(res).toBe(true);
});

test("'unconfirmed' is INVALID for required question", () => {
  let answerMod = { ...answer };
  answerMod.response = 'unconfirmed';
  let res = AV.subsection_confirmation_checkbox_v1(question, answerMod);
  expect(res).toBe(false);
});

test("'unconfirmed' is VALID for optional question", () => {
  let questionMod = { ...question };
  questionMod.required = false;
  let answerMod = { ...answer };
  answerMod.response = 'unconfirmed';
  let res = AV.subsection_confirmation_checkbox_v1(questionMod, answerMod);
  expect(res).toBe(true);
});

test('Empty values are INVALID for optional question', () => {
  let res;
  let answerMod = { ...answer };

  // Answer response is empty string.
  answerMod.response = '';
  res = AV.subsection_confirmation_checkbox_v1(question, answerMod);
  expect(res).toBe(false);

  // Answer response is null.
  answerMod.response = null;
  res = AV.subsection_confirmation_checkbox_v1(question, answerMod);
  expect(res).toBe(false);

  // Answer response is undefined.
  delete answerMod.response;
  res = AV.subsection_confirmation_checkbox_v1(question, answerMod);
  expect(res).toBe(false);
});

test('Empty values are VALID for optional question', () => {
  let res;
  let questionMod = { ...question };
  questionMod.required = false;
  let answerMod = { ...answer };

  // Answer response is empty string.
  answerMod.response = '';
  res = AV.subsection_confirmation_checkbox_v1(questionMod, answerMod);
  expect(res).toBe(true);

  // Answer response is null.
  answerMod.response = null;
  res = AV.subsection_confirmation_checkbox_v1(questionMod, answerMod);
  expect(res).toBe(true);

  // Answer response is undefined.
  delete answerMod.response;
  res = AV.subsection_confirmation_checkbox_v1(questionMod, answerMod);
  expect(res).toBe(true);
});

test('Bogus values are always INVALID', () => {
  let res;
  let answerMod = { ...answer };
  answerMod.response = 'im_invalid_but_have_a_great_personality';
  let questionMod = { ...question };
  questionMod.required = false;

  // Required question
  res = AV.subsection_confirmation_checkbox_v1(question, answerMod);
  expect(res).toBe(false);

  // Optional question
  res = AV.subsection_confirmation_checkbox_v1(questionMod, answerMod);
  expect(res).toBe(false);
});
