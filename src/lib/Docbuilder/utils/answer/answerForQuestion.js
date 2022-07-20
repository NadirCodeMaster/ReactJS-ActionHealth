import { isArray } from 'lodash';

/**
 * Get answer from array of answers for a given question ID.
 *
 * No other checks are done. We simply look for the first answer with the
 * corresponding question ID.
 *
 * @param {array|null} answers
 * @param {number} questionId
 * @returns {object|null}
 */
export default function answerForQuestion(answers, questionId) {
  if (!isArray(answers) || answers.length < 1) {
    return null;
  }
  let resultAnswer = null;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i].docbuilder_question_id === questionId) {
      resultAnswer = answers[i];
      break;
    }
  }
  return resultAnswer;
}
