import { isArray, values } from 'lodash';

/**
 * @param {Array|Object} sets
 * @return {Object}
 *  Returns object keyed by org type ID where each value is
 *  an array of the sets assigned to that org type.
 *  Only org types that are present in sets arg will have a
 *  corresponding entry, so check before referencing.
 */
export default function groupSetsByOrganizationType(sets) {
  // Convert sets to array if it isn't already.
  if (!isArray(sets)) {
    sets = values(sets);
  }

  let results = {};
  let i;
  for (i = 0; i < sets.length; i++) {
    let orgType = sets[i].organization_type_id;
    if (!results.hasOwnProperty(orgType)) {
      results[orgType] = [];
    }
    results[orgType].push(sets[i]);
  }
  return results;
}
