import { isEmpty, isNil, isNumber } from 'lodash';

/**
 * Get organization role name as string for a pivot object or ID.
 *
 * @param {Number|Object} idOrObj
 *  The org role ID or an object with a organization_role_id prop.
 * @param {Object} orgRoles
 *  Typically you'll use appMeta.data.organizationRoles for this.
 * @param {String} ifNone
 *  String to return if org role not found.
 * @returns {String}
 */
export default function orgRoleName(idOrObj, orgRoles, ifNone = '') {
  if (!isNil(idOrObj) && !isEmpty(idOrObj)) {
    let orId = idOrObj;
    if (!isNumber(orId)) {
      orId = idOrObj.organization_role_id;
    }
    if (orId) {
      orId = parseInt(orId, 10);
      if (!isNil(orgRoles[orId])) {
        return orgRoles[orId].name;
      }
    }
  }
  return ifNone;
}
