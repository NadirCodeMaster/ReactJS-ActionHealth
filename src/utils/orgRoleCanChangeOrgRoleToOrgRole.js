import orgRoleCanManageOrgRole from './orgRoleCanManageOrgRole';

/**
 * Determine if user of orgRole1 is allowed to set user of orgRole2 to orgRole3.
 *
 * This exists for a few reasons:
 *
 * - Prevent the UI from appearing as though a user (a) can elevate the org
 *   role of another user (b) above what user a has. The API would prevent
 *   that from happening anyway, but we want the UI to reflect this as well.
 * - Prevent the UI from allowing a  to downgrade another user to the
 *   viewer role. This operation is allowed by the API because the permission
 *   structure is linear (for performance reasons), but it's not desirable.
 *   So, this not a security measure, but prevents good actors from doing
 *   bad things.
 *
 * Aside from those points, this method is largely just a wrapper for orgRoleCanManageOrRole().
 *
 * @param {Boolean} orgRole1UserIsAdmin
 *  If user with orgRole1 is a system admin, we always return true.
 * @param {Object} orgRole1
 *  Org role object to determine privilege for.
 * @param {Object} orgRole2
 *  Org role object to be evaluated for control by orgRole1.
 * @param {Object} orgRole3
 *  Role we're checking to see if user of orgRole1 is allowed to assign
 *  to a user with orgRole2.
 * @returns {Boolean}
 */
export default function orgRoleCanChangeOrgRoleToOrgRole(
  orgRole1UserIsAdmin,
  orgRole1,
  orgRole2,
  orgRole3
) {
  // If user with orgRole1 is a system admin, we always return true.
  if (orgRole1UserIsAdmin) {
    return true;
  }

  // Otherwise see how orgRoleCanManageOrgRole feels about it.
  if (!orgRoleCanManageOrgRole(orgRole1UserIsAdmin, orgRole1, orgRole2)) {
    // If he said no, it's a no.
    return false;
  } else {
    // Now check if the target role is higher than one the current user has.
    // Because that's a no.
    if (orgRole1.weight < orgRole3.weight) {
      return false;
    }

    // At this point, the API answer to the request would be yes. So,
    // impose additional UI-only checks..

    // If destination role is viewer, the operation is disallowed unless
    // the subject user's org role is also viewer.
    if ('viewer' === orgRole3.machine_name && 'viewer' !== orgRole2.machine_name) {
      return false;
    }

    // Not our special case.
    return true;
  }
}
