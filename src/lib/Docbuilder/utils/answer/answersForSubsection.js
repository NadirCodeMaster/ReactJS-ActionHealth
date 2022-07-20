import { cloneDeep, includes } from 'lodash';

/**
 * Extract answers specific to a subsection from an array.
 *
 * @param {object} subsection
 *  A docbuilder subsection object with populated `questions` property.
 *
 * @param {array} answers
 *  An array of docbuilder answer objects. The array only needs to contain
 *  answers that belong to the specified subsection, but other answers will
 *  just be ignored. There must be only one answer object per question, though.
 *
 * @param {bool} returnCopies
 *  When true, answer objects in return value will be clones of the ones
 *  passed in via the `answers` parameter.
 *
 * @returns {object}
 *  Returns an object with keys for each question ID in the subsection; the
 *  values associated with those keys will be an answer object when available
 *  and null when not.
 */
export default function answersForSubsection(
  subsection,
  answers,
  returnCopies = false
) {
  let res = {};
  let i;

  // Get question IDs.
  let qIds = subsection.docbuilder_questions.map(q => q.id);

  // Initialize a result property for each of those.
  i = 0;
  while (i < qIds.length) {
    res[qIds[i]] = null;
    i++;
  }

  // Search the answers array for an entry for each question.
  i = 0;
  let matchCount = 0;
  while (i < answers.length) {
    let qIdForThisAnswer = answers[i].docbuilder_question_id;
    if (includes(qIds, qIdForThisAnswer)) {
      res[qIdForThisAnswer] = answers[i];
      matchCount++;
      if (matchCount === qIds.length) {
        // found everything, so get out
        break;
      }
    }
    i++;
  }
  return returnCopies ? cloneDeep(res) : res;
}
