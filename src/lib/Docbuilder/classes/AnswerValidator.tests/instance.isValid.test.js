import AV from '../AnswerValidator/index';

const mockQuestion = Object.freeze({
  docbuilder_question_type_machine_name: 'something_incorrect',
  required: true,
  value: {
    label: 'The information here is complete.',
    prepopulate: 'unconfirmed'
  }
});

const mockAnswerValue = Object.freeze({
  response: 'confirmed'
});

test('throws if question has invalid type', () => {
  let inst = new AV(mockQuestion, mockAnswerValue);
  expect(() => {
    inst.isValid();
  }).toThrow();
});
