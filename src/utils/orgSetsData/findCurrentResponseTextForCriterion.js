import findCurrentResponseForCriterion from './findCurrentResponseForCriterion';

/**
 * Get the response status text for a criterion for current organization.
 *
 * @param {Number} criterionId
 * @returns {String}
 */
export default function findCurrentResponseTextForCriterion(criterionId, orgSetsData) {
  // @TODO REWORK TO NOT DEPEND ON orgSetsData
  if (orgSetsData) {
    let resp = findCurrentResponseForCriterion(orgSetsData, criterionId);
    if (resp && resp.response_value && resp.response_value.label) {
      return resp.response_value.label;
    }
  }
  return 'Unanswered';
}
