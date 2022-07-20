import subsectionsForDocbuilder from '../subsection/subsectionsForDocbuilder';
/**
 * Get array of questions from a docbuilder object.
 *
 * The docbuilder must have its properties leading to the questions
 * hydrated (they are typically returned like that from the API).
 *
 * @param {object} docbuilder
 * @param {string} format One of: "objects"|"ids"
 * @returns {array}
 */
export default function questionsForDocbuilder(docbuilder, format = 'ids') {
  let res = [];
  let subs = subsectionsForDocbuilder(docbuilder, 'objects');

  for (let i = 0; i < subs.length; i++) {
    for (let i2 = 0; i2 < subs[i].docbuilder_questions.length; i2++) {
      let q =
        'ids' === format
          ? subs[i].docbuilder_questions[i2].id
          : subs[i].docbuilder_questions[i2];
      res.push(q);
    }
  }
  return res;
}
