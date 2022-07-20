import { forEach, has, isEmpty } from 'lodash';
import userBelongsToOrg from './userBelongsToOrg';

/**
 * Check if a user is pending approval to join an organization.
 *
 * This only returns true if user has a direct relationship
 * with the organization, and that relationship has an empty
 * `access_approved_at` value.
 *
 * This method will check for an object's requester_pivot and
 * pivot properties. The first one that includes a user_id
 * that matches the userId argument will be used.
 *
 * Users already associated with the organization will generate
 * a false return value.
 *
 * @param {int} userId
 * @param {object} org
 * @returns {boolean}
 */
export default function userIsPendingApprovalForOrg(userId, org) {
  let res = false;
  let belongs = userBelongsToOrg(userId, org, true);

  if (belongs) {
    let check = ['pivot', 'requester_pivot'];

    forEach(check, propName => {
      if (
        has(org, propName) &&
        !isEmpty(org[propName]) &&
        has(org[propName], 'user_id') &&
        parseInt(org[propName].user_id, 10) === parseInt(userId, 10) &&
        isEmpty(org[propName].access_approved_at)
      ) {
        res = true;
      }
      if (res) {
        return false; // break loop
      }
    });
  }
  return res;
}
