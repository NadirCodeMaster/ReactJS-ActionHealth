import { find, reject } from 'lodash';
import answersForSubsection from '../answersForSubsection';

const mockSubsection = {
  id: 888,
  // ...
  docbuilder_questions: [
    { id: 20, docbuilder_subsection_id: 888 },
    { id: 21, docbuilder_subsection_id: 888 },
    { id: 22, docbuilder_subsection_id: 888 },
    { id: 23, docbuilder_subsection_id: 888 }
  ]
};

// Answers that apply to mock subsection.
const mockMatchingAnswers = [
  { id: 30, docbuilder_question_id: 20 },
  { id: 31, docbuilder_question_id: 21 },
  { id: 32, docbuilder_question_id: 22 },
  { id: 33, docbuilder_question_id: 23 }
];

// Answers that do NOT apply to mock subsection.
const mockNotMatchingAnswers = [
  { id: 40, docbuilder_question_id: 90 },
  { id: 41, docbuilder_question_id: 91 }
];

// The expected result object based on the questions and answer mocks.
const correctResult = {
  20: { id: 30, docbuilder_question_id: 20 },
  21: { id: 31, docbuilder_question_id: 21 },
  22: { id: 32, docbuilder_question_id: 22 },
  23: { id: 33, docbuilder_question_id: 23 }
};

// Mix of answers that are applicable and not to subsection.
const mockMixedAnswersArray = mockMatchingAnswers.concat(
  mockNotMatchingAnswers
);

test('All and only associated answers are correctly identified', () => {
  let res = answersForSubsection(mockSubsection, mockMixedAnswersArray);
  expect(res).toEqual(correctResult);
});

test('Questions with missing answers have null values in returned object', () => {
  let qIdToOmit = 22;

  // Copy the array of correct answers sans the question to be omitted.
  let answersArray = reject(mockMatchingAnswers, function(a) {
    return a.docbuilder_question_id == qIdToOmit;
  });

  // Copy the correct results object.
  let expectedResult = { ...correctResult };

  // Nullify the answer we deleted.
  expectedResult[qIdToOmit] = null;

  let res = answersForSubsection(mockSubsection, answersArray);
  expect(res).toEqual(expectedResult);
});

test('returnCopies=true uses clones of the submitted answer objects', () => {
  let res = answersForSubsection(mockSubsection, mockMixedAnswersArray, true);

  // Find the answer objects for question 21.
  // -- In the original array.
  let aFromBefore = find(mockMixedAnswersArray, ['docbuilder_question_id', 21]);
  let aFromAfter = res[21];

  // Make sure they are different object references.
  expect(aFromAfter).not.toBe(aFromBefore);
});

test('returnCopies=false uses original submitted answer object references', () => {
  let res = answersForSubsection(mockSubsection, mockMixedAnswersArray, false);

  // Find the answer objects for question 21.
  // -- In the original array.
  let aFromBefore = find(mockMixedAnswersArray, ['docbuilder_question_id', 21]);
  let aFromAfter = res[21];

  // See if they are the same reference.
  expect(aFromAfter).toBe(aFromBefore);
});
