import { forEach, isEmpty } from 'lodash';

/**
 * Get object with all criteria applicable to org, keyed by criterionId.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @return {Object} Keyed by criterionId
 */
export default function extractCriteriaFromOrgSetsData(orgSetsData) {
  let results = {};
  forEach(orgSetsData, (setData, idx) => {
    if (setData.criterion_instances) {
      forEach(setData.criterion_instances, ci => {
        if (ci.criterion_id && !isEmpty(ci.criterion)) {
          results[ci.criterion_id] = ci.criterion;
        }
      });
    }
  });
  return results;
}
