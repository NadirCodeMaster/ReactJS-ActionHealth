import extractCriteriaFromOrgSetsData from 'utils/orgSetsData/extractCriteriaFrom';

/**
 * Get single criterion object orgSetsData.
 *
 * @see api/requests/requestOrganizationSets()
 *
 * @param {Object} orgSetsData
 *  Object returned from requestOrganizationSets() API request.
 * @param {Number} criterionId
 * @return {Object|null}
 */
export default function extractCriterionFromOrgSetsData(
  orgSetsData,
  criterionId
) {
  let criteria = extractCriteriaFromOrgSetsData(orgSetsData);
  if (criteria && criteria[criterionId]) {
    return criteria[criterionId];
  }
  return null;
}
