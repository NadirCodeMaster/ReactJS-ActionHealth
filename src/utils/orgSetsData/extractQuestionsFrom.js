import { forEach } from 'lodash';

/**
 * Get object with all questions (CriterionInstances) for this org, keyed by CI ID.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @param {(Number|null)} criterionId
 *  Optional criteironId to filter results by.
 * @return {Object} Keyed by criterionInstanceId
 */
export default function extractQuestionsFromOrgSetsData(
  orgSetsData,
  criterionId = null
) {
  let results = {};
  forEach(orgSetsData, (setData, idx) => {
    if (setData.criterion_instances) {
      forEach(setData.criterion_instances, ci => {
        if (criterionId && ci.criterion_id !== criterionId) {
          // if filtering by criterionId but this doesn't match it.
          return; // "continue" equivalent
        }
        results[ci.id] = ci;
      });
    }
  });
  return results;
}
