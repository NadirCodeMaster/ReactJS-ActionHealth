import { forEach, isEmpty, isNumber } from 'lodash';

/**
 * Calculates the total number of organizations for a currentUser object.
 *
 * This relies on the `organization_counts` property provided
 * by the API for the current user (via `/api/auth/me`), which
 * means other user objects will probably not work.
 *
 * @param {object} currentUserData The currentUser data object from redux
 *  (auth.currentUser.data)
 * @return {integer|null} Returns the total number of organizations.
 *  As per the the organization_counts property, only organizations
 *  where the use is approved are counted. Returns null if currentUserData
 *  is invalid.
 */
export default function currentUserOrgCount(currentUserData) {
  if (
    isEmpty(currentUserData) ||
    !currentUserData.hasOwnProperty('organization_counts') ||
    isEmpty(currentUserData.organization_counts)
  ) {
    // currentUserData appears to be invalid.
    return null;
  }

  let total = 0;
  forEach(currentUserData.organization_counts, v => {
    if (isNumber(v)) {
      total = total + v;
    }
  });
  return total;
}
