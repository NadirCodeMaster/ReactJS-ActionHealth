/**
 * Given a docbuilder object and a section ID, return the section object.
 *
 * The docbuilder must have its `sections` property (an array) populated,
 * which is how most of the API endpoints return them.
 *
 * @param {object} docbuilder
 * @param {number} sectionId
 * @returns {object|null} Returns the section, or null if not found.
 */
export default function sectionFromDocbuilder(docbuilder, sectionId) {
  let resultSection = null;
  for (let i = 0; i < docbuilder.docbuilder_sections.length; i++) {
    if (docbuilder.docbuilder_sections[i].id === sectionId) {
      resultSection = docbuilder.docbuilder_sections[i];
      break;
    }
  }
  return resultSection;
}
