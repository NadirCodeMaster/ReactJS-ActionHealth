import { find } from 'lodash';

/**
 * Finds orgSetsData item representing a given set.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @param {Number} setId
 * @returns {Object}
 */
export default function extractSetFromOrgSetsData(orgSetsData, setId) {
  let result = null;
  result = find(orgSetsData, s => {
    return Number(s.id) === Number(setId);
  });
  return result;
}
