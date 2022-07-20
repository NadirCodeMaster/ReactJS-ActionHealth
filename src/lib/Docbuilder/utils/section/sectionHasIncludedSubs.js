import { get, isArray } from 'lodash';
import memoizee from 'memoizee';
import { statuses } from '../subsection/constants';

/**
 * Determine if a section has any subsections that are _not_ "excluding".
 *
 * - A section with no subsections returns false.
 * - A section where all subsections have status "EXCLUDING" returns false.
 * - A section where at least one subsection status is not known returns true.
 *
 * @param {object} docbuilderSection
 *  Section object must have its `docbuilder_subsections` hydrated.
 * @param {object} subsectionStatuses
 *  Object keyed by subsection IDs w/status values (per utils/subsection/constants.js).
 *  May contain subsections from other sections.
 * @returns {bool}
 */
export default memoizee((docbuilderSection, subsectionStatuses) => {
  let res = false;

  if (!docbuilderSection.is_meta) {
    let subs = get(docbuilderSection, 'docbuilder_subsections', null);
    if (isArray(subs)) {
      for (let i = 0; i < subs.length; i++) {
        if (!subsectionStatuses[subs[i].id]) {
          // No status info available for current subsections. This means we
          // don't know the situation and should therefore consider it "included".
          res = true;
          break; // break from loop
        } else {
          // Found status info. If sub is NOT being excluded, we can return true.
          if (statuses.EXCLUDING !== subsectionStatuses[subs[i].id]) {
            res = true;
            break; // break from loop now that we know we need to show section.
          }
        }
      }
    }
  }
  return res;
});
