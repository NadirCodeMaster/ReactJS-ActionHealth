import { get, includes, isObjectLike, isString } from 'lodash';
import userIsPendingApprovalForOrg from 'utils/userIsPendingApprovalForOrg';

/**
 * Check if a user is allowed to perform a given action for an organization.
 *
 * The organization object must contain the `requester_permissions` property.
 *
 * @param {object} currentUser object with `data` property (at currentUser.data)
 * @param {object} organization
 * @param {string} action
 * @returns {boolean} userCan or userCan't, that is the question
 */
export default function userCan(currentUser, organization, action) {
  // Sanity check the parameters.
  if (!isObjectLike(currentUser) || !isObjectLike(organization) || !isString(action)) {
    console.warn('One or more invalid properties passed to userCan()', organization, action);
    return false;
  }

  // Check if user is pending approval to be accepted to org
  if (userIsPendingApprovalForOrg(currentUser.data.id, organization)) {
    return false;
  }

  // In the interest of performance, we'll skip all this and move on if the
  // user is an admin.
  if (currentUser.isAdmin) {
    return true;
  }

  // Log a warning if organization.requester_permissions isn't present,
  // as that may indicate we need to adjust the source of that organization
  // to one that provides that data.
  if (!organization.hasOwnProperty('requester_permissions')) {
    console.warn(
      `userCan() organization parameter lacks requester_permissions property (user ID: ${currentUser.data.id}, organization ID: ${organization.id})`
    );
  }

  let perms = get(organization, 'requester_permissions', []);
  let res = includes(perms, action);

  return res;
}
