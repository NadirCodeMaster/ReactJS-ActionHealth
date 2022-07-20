import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'subsection_exclusion_radios_v1'
});

const question = {
  required: true,
  value: {
    label: 'Include this content?',
    options: {
      include: 'Yes, include this content',
      exclude: 'No, do not include this content'
    },
    prepopulate: 'include'
  }
};

const answer = {
  response: 'include'
};

test("'include' is VALID response", () => {
  let res;

  // With required question
  res = AV.subsection_exclusion_radios_v1(question, answer);
  expect(res).toBe(true);

  // With optional question
  let questionMod = { ...question };
  questionMod.required = false;
  res = AV.subsection_exclusion_radios_v1(questionMod, answer);
  expect(res).toBe(true);
});

test("'exclude' is valid response", () => {
  let res;
  let answerMod = { ...answer };
  answerMod.response = 'exclude';

  // With required question
  res = AV.subsection_exclusion_radios_v1(question, answerMod);
  expect(res).toBe(true);

  // With optional question
  let questionMod = { ...question };
  questionMod.required = false;
  res = AV.subsection_exclusion_radios_v1(questionMod, answerMod);
  expect(res).toBe(true);
});

test('Empty is valid response only when question is optional', () => {
  let res;
  let answerModNull = { ...answer };
  let answerModEmptyString = { ...answer };
  let answerModUndefined = { ...answer };

  answerModNull.response = null;
  answerModEmptyString.response = '';
  delete answerModUndefined.response;

  // Null with REQUIRED question
  res = AV.subsection_exclusion_radios_v1(question, answerModNull);
  expect(res).toBe(false);

  // Empty string with REQUIRED question
  res = AV.subsection_exclusion_radios_v1(question, answerModEmptyString);
  expect(res).toBe(false);

  // Undefined string with REQUIRED question
  res = AV.subsection_exclusion_radios_v1(question, answerModUndefined);
  expect(res).toBe(false);

  // Set-up OPTIONAL question
  let questionMod = { ...question };
  questionMod.required = false;

  // Null with OPTIONAL question
  res = AV.subsection_exclusion_radios_v1(questionMod, answerModNull);
  expect(res).toBe(true);

  // Empty string with OPTIONAL question
  res = AV.subsection_exclusion_radios_v1(questionMod, answerModEmptyString);
  expect(res).toBe(true);

  // Undefined string with OPTIONAL question
  res = AV.subsection_exclusion_radios_v1(questionMod, answerModUndefined);
  expect(res).toBe(true);
});

test('Bogus response value is never valid', () => {
  let res;
  let answerModWtf = { ...answer };
  answerModWtf.response = 'totally_not_a_valid_response';

  // With required question.
  res = AV.subsection_exclusion_radios_v1(question, answerModWtf);
  expect(res).toBe(false);

  // Set-up optional question
  let questionMod = { ...question };
  questionMod.required = false;

  // With optional question.
  res = AV.subsection_exclusion_radios_v1(questionMod, answerModWtf);
  expect(res).toBe(false);
});
