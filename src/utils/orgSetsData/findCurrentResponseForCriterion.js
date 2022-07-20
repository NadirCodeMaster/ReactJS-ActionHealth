import { forEach } from 'lodash';

/**
 * Get organization's current response for a Criterion.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @param  {Number} criterionId
 * @return {mixed} Null or response object.
 */
export default function findCurrentResponseForCriterion(
  orgSetsData,
  criterionId
) {
  let returnResponse = null;
  forEach(orgSetsData, (setData, idx) => {
    if (!returnResponse && setData.responses) {
      forEach(setData.responses, resp => {
        if (resp.criterion_id === criterionId) {
          returnResponse = resp;
          return false; // break out of forEach();
        }
      });
    }
  });
  return returnResponse;
}
