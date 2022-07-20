import { get } from 'lodash';

// @TODO test coverage

/**
 * Get array of the subsections that have no questions from a docbuilder object.
 *
 * The docbuilder must have its sections property hydrated, and
 * those must each have their subsections property hydrated, and those must
 * have their questions property hydrated.
 *
 * @param {object} docbuilder
 * @param {string} format One of: "objects"|"ids"
 * @returns {array}
 */
export default function subsectionsWithoutQuestionsForDocbuilder(
  docbuilder,
  format = 'ids'
) {
  let res = [];
  for (let i = 0; i < docbuilder.docbuilder_sections.length; i++) {
    let section = docbuilder.docbuilder_sections[i];
    for (let i2 = 0; i2 < section.docbuilder_subsections.length; i2++) {
      let qArr = get(
        section.docbuilder_subsections[i2],
        'docbuilder_questions',
        []
      );
      if (0 === qArr.length) {
        if ('ids' === format) {
          res.push(section.docbuilder_subsections[i2].id);
        } else {
          res = res.concat(section.docbuilder_subsections);
        }
      }
    }
  }
  return res;
}
