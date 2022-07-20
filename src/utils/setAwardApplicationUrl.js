import qs from 'qs';

/**
 * Get the URL for an award application of set, if any.
 */

// @TODO This information should be moved to back-end (though
//       the award applications themselves will likely be
//       be brought into P2, making this all unnecessary).

/**
 * @param {number} setId
 * @param {Object} org
 * @returns {(number|null)}
 */
export default function setAwardApplicationUrl(setId, org) {
  if (!org) {
    return null;
  }

  setId = parseInt(setId, 10);

  switch (setId) {
    case 1:
      var baseUrl = '/take-action/schools/awards/welcome';
      var params = {
        organization_id: org.id,
        organization_name: org.name,
        grade_level_low: org.grade_level_low,
        grade_level_high: org.grade_level_high,
        parent_id: org.parent_id
      };
      var stringifiedParams = qs.stringify(params);
      return baseUrl + '?' + stringifiedParams;
    default:
      return null;
  }
}
