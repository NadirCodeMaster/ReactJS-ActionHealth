import questionTypeForQuestion from '../questionTypeForQuestion';

const mockQuestionTypes = [
  { id: 10 },
  { id: 11 },
  { id: 12 },
  { id: 13 },
  { id: 14 }
];

test('Correct question type is located by a valid question object', () => {
  let q = { id: 100, docbuilder_question_type_id: 12 };
  let res = questionTypeForQuestion(mockQuestionTypes, q);
  expect(res).toEqual({ id: 12 });
});

test('Returns null if question has an invalid type', () => {
  let q = { id: 100, docbuilder_question_type_id: 'arugula' };
  let res = questionTypeForQuestion(mockQuestionTypes, q);
  expect(res).toBe(null);
});
