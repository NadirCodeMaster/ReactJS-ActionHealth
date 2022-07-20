import { cloneDeep, isArray } from 'lodash';

/**
 * Get the docbuilder question type for a given question.
 *
 * @param {array|object} questionTypes
 *  Array or object of all question type objects to evaluate. If provided
 *  as an object, it should be keyed by question type ID.
 * @param {object} question The question to evaluate.
 * @returns {object|null}
 *  Returns the corresponding questionType object or null if unable
 *  to locate a match.
 */
export default function questionTypeForQuestion(questionTypes, question) {
  // Stash the question type in the question object...
  let qtId = question.docbuilder_question_type_id;

  // If questionTypes was provided as array.
  if (isArray(questionTypes)) {
    // Search the QT array to find the question type object for that ID.
    let i = 0;
    while (i < questionTypes.length) {
      if (qtId === questionTypes[i].id) {
        return cloneDeep(questionTypes[i]);
      }
      i++;
    }
  }

  // If questionTypes was provided as object...
  else if (questionTypes.hasOwnProperty(qtId)) {
    return cloneDeep(questionTypes[qtId]);
  }

  // If we're here, we didn't find the question type or we
  // were provided invalid parameters.
  return null;
}
