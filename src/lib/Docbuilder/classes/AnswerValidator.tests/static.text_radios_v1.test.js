import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'text_radios_v1'
});

const question = {
  required: true,
  value: {
    label: 'Will your organization velit a arcu aliquam a malesuada?',
    variableName: 'will_you_aliquam_a_malesuada',
    options: [
      {
        key: 'yes',
        label: 'Yes',
        content:
          'We will prioritize donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae.'
      },
      {
        key: 'no',
        label: 'No',
        content:
          'Not likely that vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
      },
      {
        key: 'maybe',
        label: 'Maybe',
        content:
          'We may nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
      }
    ],
    otherOption: {
      key: 'other',
      label: 'Other'
    },
    prepopulate: '',
    replacementFormat: 'block'
  }
};

const answerUsingStandardOption = {
  response: 'yes',
  otherResponse: ''
};

const answerUsingOtherOption = {
  response: 'other',
  otherResponse: 'Vivamus egestas velit a arcu aliquam a malesuada velit malesuada.'
};

test('Answers are valid only when response is present in question', () => {
  let res;
  let answerValid = { ...answerUsingStandardOption };
  let answerInvalid = { ...answerUsingStandardOption };
  answerInvalid.response = 'not_a_valid_answer';
  let questionRequired = { ...question };
  let questionOptional = { ...question };
  questionOptional.required = false;

  // Required question, valid answer.
  res = AV.text_radios_v1(questionRequired, answerValid);
  expect(res).toBe(true);

  // Required question, invalid answer.
  res = AV.text_radios_v1(questionRequired, answerInvalid);
  expect(res).toBe(false);

  // Optional question, valid answer.
  res = AV.text_radios_v1(questionOptional, answerValid);
  expect(res).toBe(true);

  // Optional question, invalid answer.
  res = AV.text_radios_v1(questionOptional, answerInvalid);
  expect(res).toBe(false);
});

test('Empty answers are valid only when question is optional', () => {
  let res;
  let questionOptional = { ...question };
  questionOptional.required = false;
  let answerEmpty = { ...answerUsingStandardOption };
  answerEmpty.response = null;

  res = AV.text_radios_v1(question, answerEmpty);
  expect(res).toBe(false);

  res = AV.text_radios_v1(questionOptional, answerUsingStandardOption);
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
  answerMissingSelection.response = '';

  // Answer that has "other" option selected but no text to go with it.
  let answerMissingText = { ...answerUsingOtherOption };
  delete answerMissingText.otherResponse;

  // --- REQUIRED QUESTION TESTS

  // Required question, valid answer
  res = AV.text_radios_v1(questionRequired, answerOk);
  expect(res).toBe(true);

  // Required question, answer missing "other" selection
  res = AV.text_radios_v1(questionRequired, answerMissingSelection);
  expect(res).toBe(false);

  // Required question, answer missing "other" text
  res = AV.text_radios_v1(questionRequired, answerMissingText);
  expect(res).toBe(false);

  // --- OPTIONAL QUESTION TESTS

  // Optional question, valid answer
  res = AV.text_radios_v1(questionOptional, answerOk);
  expect(res).toBe(true);

  // Optional question, answer missing "other" selection (allowed)
  res = AV.text_radios_v1(questionOptional, answerMissingSelection);
  expect(res).toBe(true);

  // Optional question, answer missing "other" text (_not_ allowed)
  res = AV.text_radios_v1(questionOptional, answerMissingText);
  expect(res).toBe(false);
});
