import sectionShouldShowInPreview from './sectionShouldShowInPreview';
import sectionHasIncludedSubs from './sectionHasIncludedSubs';

/**
 * Determine if a section should be numbered in preview.
 *
 * @param {object} docbuilderSection
 *  Section object must have its `docbuilder_subsections` hydrated.
 * @param {object} subsectionStatuses
 *  Object keyed by subsection IDs w/status values (per utils/subsection/constants.js).
 *  May contain subsections from other sections.
 * @returns {bool}
 */
export default function sectionShouldBeNumberedInPreview(s, subsectionStatuses) {
  return (
    !s.is_meta &&
    s.is_numbered &&
    sectionShouldShowInPreview(s) &&
    sectionHasIncludedSubs(s, subsectionStatuses)
  );
}
