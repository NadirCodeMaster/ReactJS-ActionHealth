import orgTypeForMachineName from './orgTypeForMachineName';
import { get, isEmpty, isNumber } from 'lodash';

/**
 * Calculates the number of orgs of a given type for currentUser.
 *
 * This relies on the `organization_counts` property provided
 * by the API for the current user (via `/api/auth/me`), which
 * means other user objects will probably not work.
 *
 * @param {string} orgTypeMachineName
 * @param {object} currentUserData The currentUser data object from redux
 *  (auth.currentUser.data)
 * @param {object} orgTypes
 *  Typically you'll use appMeta.data.organizationTypes for this.
 * @return {integer|null} Returns the total number of organizations.
 *  As per the the organization_counts property, only organizations
 *  where the use is approved are counted. Returns null if an argument
 *  is identified as invalid.
 */
export default function currentUserOrgTypeCount(
  orgTypeMachineName,
  currentUserData,
  orgTypes
) {
  if (
    !isEmpty(orgTypes) &&
    !isEmpty(currentUserData) &&
    currentUserData.hasOwnProperty('organization_counts') &&
    !isEmpty(currentUserData.organization_counts)
  ) {
    let orgType = orgTypeForMachineName(orgTypeMachineName, orgTypes);
    let userOrgCounts = currentUserData.organization_counts;
    let orgTypeCount = get(userOrgCounts, orgType.id, 0);

    if (isNumber(orgTypeCount)) {
      return orgTypeCount;
    }
  }
  return null;
}
