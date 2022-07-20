import AV from '../AnswerValidator/index';

const questionType = Object.freeze({
  machine_name: 'file_uploads_v1'
});

const question = {
  required: true,
  value: {
    label: 'Please attach something something something',
    variableName: 'test_var',
    // Note: allowedFileTypes is only enforced during upload, not as
    // part of the answer validation (because only the file ID is
    // available at that time).
    allowedFileTypes: ['jpeg', 'pdf'],
    itemFormat: 'linked_name',
    groupFormat: 'list',
    replacementFormat: 'block',
    subsectionProcessingStage: 'normal',
    minFiles: 2,
    maxFiles: 4
  }
};

const validAnswer = {
  response: {
    '123': { name: 'File 123' },
    '1333': { name: 'File 1333' },
    '3000': { name: 'File 3000' },
    '5000': { name: 'File 5000' }
  }
};

test('Typical valid answer returns true for required, optional questions', () => {
  let requiredQuestion = { ...question };
  let optionalQuestion = { ...question, required: false };
  let res;

  res = AV.file_uploads_v1(requiredQuestion, validAnswer);
  expect(res).toBe(true);

  res = AV.file_uploads_v1(optionalQuestion, validAnswer);
  expect(res).toBe(true);
});

test('Empty answers are valid only if question is optional', () => {
  let requiredQuestion = { ...question };
  let optionalQuestion = { ...question, required: false };
  let res;

  let emptyAnswerVariations = [null, {}, { response: {} }, { response: null }];

  for (let i = 0; i < emptyAnswerVariations.length; i++) {
    // Required question should be false...
    res = AV.file_uploads_v1(requiredQuestion, emptyAnswerVariations[i]);
    expect(res).toBe(false);
    // Optional question should be true...
    res = AV.file_uploads_v1(optionalQuestion, emptyAnswerVariations[i]);
    expect(res).toBe(true);
  }
});

test('Min no. of files is correctly enforced', () => {
  let requiredQuestion = { ...question };
  let optionalQuestion = { ...question, required: false };
  let invalidAnswerTooFew = { response: { '123': { name: 'File 123' } } };

  let res;

  // Required question, invalid answer: too few files.
  res = AV.file_uploads_v1(requiredQuestion, invalidAnswerTooFew);
  expect(res).toBe(false);

  // Optional question, valid answer.
  res = AV.file_uploads_v1(optionalQuestion, validAnswer);
  expect(res).toBe(true);

  // Optional question, invalid answer: too few files, but not zero.
  // (Invalid because an optional q still needs the min if answered)
  res = AV.file_uploads_v1(optionalQuestion, invalidAnswerTooFew);
  expect(res).toBe(false);

  // Prep array of possibilities for zero files.
  let zeroFileAnswerVariations = [null, {}, { response: {} }, { response: null }];

  for (let i = 0; i < zeroFileAnswerVariations.length; i++) {
    // Optional question, zero files (valid)
    res = AV.file_uploads_v1(optionalQuestion, zeroFileAnswerVariations[i]);
    expect(res).toBe(true);
    // Required question, zero files (invalid)
    res = AV.file_uploads_v1(requiredQuestion, zeroFileAnswerVariations[i]);
    expect(res).toBe(false);
  }
});

test('Max no. of files is correctly enforced', () => {
  let requiredQuestion = { ...question };
  let optionalQuestion = { ...question, required: false };
  let invalidAnswerTooMany = { ...validAnswer };
  invalidAnswerTooMany.response['9000'] = { name: 'file 9000' };
  invalidAnswerTooMany.response['9001'] = { name: 'file 9001' };
  invalidAnswerTooMany.response['9002'] = { name: 'file 9002' };
  invalidAnswerTooMany.response['9003'] = { name: 'file 9003' };
  let res;

  // Required question, invalid answer: too many files.
  res = AV.file_uploads_v1(requiredQuestion, invalidAnswerTooMany);
  expect(res).toBe(false);

  // Optional question, invalid answer: too many files.
  res = AV.file_uploads_v1(optionalQuestion, invalidAnswerTooMany);
  expect(res).toBe(false);
});
