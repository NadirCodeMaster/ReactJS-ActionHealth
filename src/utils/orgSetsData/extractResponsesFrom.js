import { forEach } from 'lodash';

/**
 * Get object with all responses for this org, keyed by criterionId.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @return {Object} Keyed by criterionId
 */
export default function extractResponsesFromOrgSetsData(orgSetsData) {
  let results = {};
  forEach(orgSetsData, (setData, idx) => {
    if (setData.responses) {
      forEach(setData.responses, resp => {
        results[resp.criterion_id] = resp;
      });
    }
  });
  return results;
}
