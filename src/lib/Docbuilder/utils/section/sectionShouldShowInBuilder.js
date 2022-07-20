import { get, isArray } from 'lodash';

/**
 * Determine if a section should be rendered in the builder.
 *
 * This essentially amounts to checking the subsections to see if there are any
 * that have `exclude_from_builder=false`.
 *
 * @param {object} docbuilderSection
 * @returns {bool}
 */
export default function sectionShouldShowInBuilder(docbuilderSection) {
  let shouldShow = false;
  let subs = get(docbuilderSection, 'docbuilder_subsections', null);
  if (isArray(subs)) {
    for (let i = 0; i < subs.length; i++) {
      if (!subs[i].exclude_from_builder) {
        shouldShow = true;
        break;
      }
    }
  }
  return shouldShow;
}
