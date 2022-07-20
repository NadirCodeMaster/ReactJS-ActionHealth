import { get } from 'lodash';

/**
 * Given a docbuilder obj and subsection slug, return the subsection object.
 *
 * The docbuilder must have its `docbuilder_sections` property (an array)
 * populated, and those section objects must have their subsections arrays
 * populated.
 * (That's how most of the API endpoints return them.)
 *
 * @param {object} docbuilder
 * @param {number} subsectionId
 * @returns {object|null} Returns the subsection, or null if not found.
 */
export default function subsectionFromDocbuilder(docbuilder, subsectionId) {
  let resultSubsection = null;

  let sections = get(docbuilder, 'docbuilder_sections', null);
  if (null === sections) {
    throw new Error(
      'Docbuilder parameter is missing required property "docbuilder_sections"'
    );
  }

  for (let i = 0; i < sections.length; i++) {
    for (let i2 = 0; i2 < sections[i].docbuilder_subsections.length; i2++) {
      if (sections[i].docbuilder_subsections[i2].id === subsectionId) {
        resultSubsection = sections[i].docbuilder_subsections[i2];
        break;
      }
    }
    if (null !== resultSubsection) {
      break;
    }
  }
  return resultSubsection;
}
