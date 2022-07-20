import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'text_checkboxes_v1'
});

const question = {
  required: true,
  value: {
    label: 'To what extent hendrerit feugiat?',
    variableName: 'extent_of_hendrerit_feugiat',
    options: [
      {
        key: 'another_a',
        label: 'Very much so',
        content:
          'We will prioritize donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae.'
      },
      {
        key: 'another_b',
        label: 'Sometimes we do that',
        content:
          'We will create a committee that vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
      },
      {
        key: 'another_c',
        label: 'Not so much',
        content:
          'Perhaps next year amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
      }
    ],
    otherOption: {
      key: 'another_other',
      label: 'Other'
    },
    prepopulate: [],
    replacementFormat: 'list'
  }
};

// Mock answer value that includes only non-"other" selections.
const answerUsingStandardOptions = {
  response: ['another_b', 'another_c']
};

// Mock answer value that includes only the "other" selection.
const answerUsingOtherOption = {
  response: ['another_other'],
  otherResponse: 'The administration decides this.'
};

test('Answers are valid only when response options are present in question', () => {
  let res;
  let questionRequired = { ...question };
  let questionOptional = { ...question };
  questionOptional.required = false;
  let answerWithValidOptions = { ...answerUsingStandardOptions };
  let answerWithInvalidOptions = { ...answerUsingStandardOptions };
  answerWithInvalidOptions.response = [
    'something_c', // <- valid
    'this_is_not_a_valid_option' // <- not valid
  ];

  // Required question, valid answer
  res = AV.text_checkboxes_v1(questionRequired, answerWithValidOptions);
  expect(res).toBe(true);

  // Optional question, valid answer
  res = AV.text_checkboxes_v1(questionOptional, answerWithValidOptions);
  expect(res).toBe(true);

  // Required question, invalid answer
  res = AV.text_checkboxes_v1(questionRequired, answerWithInvalidOptions);
  expect(res).toBe(false);

  // Optional question, invalid answer
  res = AV.text_checkboxes_v1(questionOptional, answerWithInvalidOptions);
  expect(res).toBe(false);
});

test('Empty answers are valid only question is optional', () => {
  let res;
  let questionRequired = { ...question };
  let questionOptional = { ...question };
  questionOptional.required = false;
  let answerNull = { ...answerUsingStandardOptions };
  let answerEmptyArray = { ...answerUsingStandardOptions };
  let answerUndefined = { ...answerUsingStandardOptions };
  answerNull.response = null;
  answerEmptyArray.response = [];
  delete answerUndefined.response;

  // --- REQUIRED QUESTIONS

  // Required question, null answer.
  res = AV.text_checkboxes_v1(questionRequired, answerNull);
  expect(res).toBe(false);

  // Required question, empty string answer.
  res = AV.text_checkboxes_v1(questionRequired, answerEmptyArray);
  expect(res).toBe(false);

  // Required question, undefined answer.
  res = AV.text_checkboxes_v1(questionRequired, answerUndefined);
  expect(res).toBe(false);

  // Required question, totally empty answer.
  res = AV.text_checkboxes_v1(questionRequired, null);
  expect(res).toBe(false);

  // --- OPTIONAL QUESTIONS

  // Optional question, null answer.
  res = AV.text_checkboxes_v1(questionOptional, answerNull);
  expect(res).toBe(true);

  // Optional question, empty string answer.
  res = AV.text_checkboxes_v1(questionOptional, answerEmptyArray);
  expect(res).toBe(true);

  // Optional question, undefined answer.
  res = AV.text_checkboxes_v1(questionOptional, answerUndefined);
  expect(res).toBe(true);

  // Optional question, totally empty answer.
  res = AV.text_checkboxes_v1(questionOptional, null);
  expect(res).toBe(true);
});

test('The "other" option requires corresponding text in both optional and required questions', () => {
  let res;
  let answerOk = { ...answerUsingOtherOption };
  let questionRequired = { ...question };
  let questionOptional = { ...question };
  questionOptional.required = false;

  // Answer that doesn't have _any_ option selected (including "other").
  let answerMissingSelection = { ...answerUsingOtherOption };
  answerMissingSelection.response = [];

  // Answer that has "other" option selected but no text to go with it.
  let answerMissingText = { ...answerUsingOtherOption };
  delete answerMissingText.otherResponse;

  // --- REQUIRED QUESTION TESTS

  // Required question, valid answer
  res = AV.text_checkboxes_v1(questionRequired, answerOk);
  expect(res).toBe(true);

  // Required question, answer missing "other" selection
  res = AV.text_checkboxes_v1(questionRequired, answerMissingSelection);
  expect(res).toBe(false);

  // Required question, answer missing "other" text
  res = AV.text_checkboxes_v1(questionRequired, answerMissingText);
  expect(res).toBe(false);

  // --- OPTIONAL QUESTION TESTS

  // Optional question, valid answer
  res = AV.text_checkboxes_v1(questionOptional, answerOk);
  expect(res).toBe(true);

  // Optional question, answer missing "other" selection (allowed)
  res = AV.text_checkboxes_v1(questionOptional, answerMissingSelection);
  expect(res).toBe(true);

  // Optional question, answer missing "other" text (_not_ allowed)
  res = AV.text_checkboxes_v1(questionOptional, answerMissingText);
  expect(res).toBe(false);
});
