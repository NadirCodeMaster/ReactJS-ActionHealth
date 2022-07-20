import { has, isEmpty } from 'lodash';

/**
 * Check if a user is directly associated with an organization.
 *
 * This checks if the user has a relationship record with an organization
 * (unlike, for example, a user that may have _access_ to a school by
 * virtue of being associated with its district).
 *
 * The relationship must also be active (`access_approved_at` populated)
 * unless the allowPending argument is true.
 *
 * Requires the organization object have at least one of two properties
 * that describe the relationship:
 *
 * - `pivot`: Object describing user/org relationship. Included when
 *   object was retrieved from a user-specific organization endpoint
 *   (i.e., api/v1/users/x/organizations)
 * - `requester_pivot`: Same as `pivot`, but is included in all
 *   organization objects retrieved from the API.
 *
 * This method will check both of those properties to see if they
 * exist and have a `user_id` property that matches userId.
 *
 * @param {int} userId
 * @param {object} org
 * @parm {boolean} allowPending
 * @returns {boolean}
 */
export default function userBelongsToOrg(userId, org, allowPending = false) {
  let res = false;

  if (!has(org, 'pivot') && !has(org, 'requester_pivot')) {
    console.error(
      'userBelongsToOrg: org argument did not include a pivot or requester_pivot property'
    );
  }

  let checkProperty = property => {
    return (
      has(org, property) &&
      has(org[property], 'user_id') &&
      org[property].user_id &&
      parseInt(userId, 10) === parseInt(org[property].user_id, 10)
    );
  };

  let matchingPivotObj = null;

  if (checkProperty('pivot')) {
    matchingPivotObj = org.pivot;
  } else if (checkProperty('requester_pivot')) {
    matchingPivotObj = org.requester_pivot;
  }

  // Check for a winner.
  if (matchingPivotObj) {
    if (allowPending) {
      res = true;
    } else {
      res = !isEmpty(matchingPivotObj.access_approved_at);
    }
  }

  return res;
}
