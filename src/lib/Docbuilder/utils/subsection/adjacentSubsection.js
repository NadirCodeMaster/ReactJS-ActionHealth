/**
 * Get the previous or next subsection in a docbuilder.
 *
 * Note that the sections and subsections properties
 * of the docbuilder object must be populated and correctly
 * sorted. Docbuilder objects from the API are typically
 * ready to use.
 *
 * @param {object} docbuilder
 * @param {integer} currentSubsectionId
 * @param {string} prevOrNext "prev"|"next"
 * @param {string} setting "all"|"builder|preview"
 * @returns {integer|null}
 *  Returns the adjacent subsection ID or null.
 */
export default function adjacentSubsection(
  docbuilder,
  currentSubsectionId,
  prevOrNext,
  setting = 'all'
) {
  // Ensure we've got an integer.
  currentSubsectionId = parseInt(currentSubsectionId, 10);

  // Create a flattened array of all subsection IDs in docbuilder
  // that are applicable for the requested setting.
  //
  // The subsections will remain in the same order.
  let sections = docbuilder.docbuilder_sections;
  let subsectionIds = [];
  for (let s = 0; s < sections.length; s++) {
    let thisSection = sections[s];

    // If setting is "preview", skip meta sections.
    if (thisSection.is_meta && 'preview' === setting) {
      continue;
    }

    // Loop thru subsections in this section.
    let sSubsections = sections[s].docbuilder_subsections;
    for (let ss = 0; ss < sSubsections.length; ss++) {
      let thisSubsection = sSubsections[ss];

      // If setting is "builder", skip excluded subsections.
      if (thisSubsection.exclude_from_builder && 'builder' === setting) {
        continue;
      }
      subsectionIds.push(thisSubsection.id);
    }
  }

  // Locate the current subsection in there so we can find what's next to it.
  let res = null;
  for (let i = 0; i < subsectionIds.length; i++) {
    // Locate the correct adjacent ID.
    if (subsectionIds[i] === currentSubsectionId) {
      // Locate specified adjacent ID, if any.
      if ('prev' === prevOrNext && i > 0) {
        res = subsectionIds[i - 1];
        break;
      } else if ('next' === prevOrNext && i < subsectionIds.length - 1) {
        res = subsectionIds[i + 1];
        break;
      }
    }
  }

  return res;
}
