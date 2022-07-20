import answerForQuestion from '../answerForQuestion';

const mockAnswersArray1 = [
  { id: 10, docbuilder_question_id: 20 },
  { id: 11, docbuilder_question_id: 21 },
  { id: 12, docbuilder_question_id: 22 },
  { id: 13, docbuilder_question_id: 23 }
];

const mockAnswersArray2 = [
  { id: 10, docbuilder_question_id: 20 },
  { id: 11, docbuilder_question_id: 21 },
  { id: 12, docbuilder_question_id: 22 },
  { id: 13, docbuilder_question_id: 22 }
];

test('Correct answer is located by question ID', () => {
  let res = answerForQuestion(mockAnswersArray1, 22);
  expect(res.id).toBe(12);
});

test('Only return first answer for a question ID', () => {
  let res = answerForQuestion(mockAnswersArray2, 22);
  expect(res.id).toBe(12);
});

test('null is returned when question ID is absent from array', () => {
  let res = answerForQuestion(mockAnswersArray1, 100);
  expect(res).toBe(null);
});

test('null is returned when answers array is empty', () => {
  let res = answerForQuestion([], 20);
  expect(res).toBe(null);
});

test('null is returned when answers array is invalid', () => {
  let res = answerForQuestion('hey now', 20);
  expect(res).toBe(null);
});
