import { get, isNil } from 'lodash';

/**
 * Determine if an org role allows mods using another org role.
 *
 * Each organizationRole has a `weight` property that determines its
 * "strength" relative to other organizationRoles. This is not directly
 * related to the permissions a role is granted, but it does determine
 * whether a user can self-select a given another role or modify the
 * organization/user of another user.
 *
 * If the `weight` of orgRole1 is equal to or higher than orgRole2,
 * orgRole1 can self-select orgRole2 and manage org/user relationships
 * that use orgRole2.
 *
 * **Comparison is only valid for relationships using the same organization.**
 *
 * @param {Boolean} orgRole1UserIsAdmin
 *  If user with orgRole1 is a system admin, we always return true.
 * @param {Object|null} orgRole1
 *  Org role object to determine privilege for. You can pass `null` if
 *  there's no org role, since that would still be valid if the user is
 *  a system admin.
 * @param {Object} orgRole2
 *  Org role object to be evaluated for access by orgRole1.
 * @returns {Boolean} Whether orgRole1 can manage orgRole2 relationships.
 */
export default function orgRoleCanManageOrgRole(orgRole1UserIsAdmin, orgRole1, orgRole2) {
  // If user with orgRole1 is a system admin, we always return true.
  if (orgRole1UserIsAdmin) {
    return true;
  }
  // If user isn't admin but orgRole1 is nil, they won't have access.
  else if (isNil(orgRole1)) {
    return false;
  }

  // Calculation is based on weight. Higher, the better.
  let weight1 = isNil(orgRole1) ? 0 : parseInt(get(orgRole1, 'weight', 0), 10);
  let weight2 = isNil(orgRole2) ? 0 : parseInt(get(orgRole2, 'weight', 0), 10);

  // Result is whether weight1 is greater than or equal to weight2.
  let res = weight1 >= weight2;

  return res;
}
