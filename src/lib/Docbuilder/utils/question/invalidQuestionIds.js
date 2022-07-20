import { get } from 'lodash';
import AnswerValidator from '../../classes/AnswerValidator/index';

/**
 * Identify questions with invalid answers.
 *
 * Primary usage is to look at a set of questions/answers for a specific
 * subsection.
 *
 * @param {array} questions
 *  Array of questions whose answers will be validated. Questions may be omitted
 *  if appropriate. This might be the case if "pre" processing made some
 *  questions moot.
 *
 * @param {object} answersObj
 *  An object keyed by question ID where the corresponding value is a
 *  docbuilder answer object. The object only needs questions/answers
 *  that belong to the subsection being evaluated (though other answers
 *  will just be ignored). There must be only one answer object per
 *  question, though.
 *
 * @param {string|null} stage
 *  The subsection processing stage to limit question validation to. Use
 *  null to validate all questions.
 *
 * @returns {array}
 *  Returns array of question IDs that have validation errors. That means an
 *  error-free subsection will result in an empty array.
 */
export default function invalidQuestionIds(questions, answersObj, stage = null) {
  // Loop through questions validating each.
  let invalid = [];
  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    // We only need to validate if the stage param says so.
    if (!stage || stage === q.value.subsectionProcessingStage) {
      let answerValue = get(answersObj[q.id], 'value', null);
      let av = new AnswerValidator(q, answerValue);
      let validity = av.isValid();
      if (!validity) {
        invalid.push(q.id);
      }
    }
  }
  return invalid;
}
