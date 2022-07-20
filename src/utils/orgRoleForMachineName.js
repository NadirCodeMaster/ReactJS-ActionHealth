import { find, isNil } from 'lodash';

/**
 * Get organization role object for a machine_name string.
 *
 * @param {String} machineName
 *  Org role machine name value.
 * @param {Object} orgRoles
 *  Typically you'll use appMeta.data.organizationRoles for this.
 * @returns {Object|Null}
 */
export default function orgRoleForMachineName(machineName, orgRoles) {
  let returnVal = null;
  if (!isNil(machineName)) {
    let orgRole = find(orgRoles, (v, k) => {
      return machineName === v.machine_name;
    });
    returnVal = orgRole ? orgRole : returnVal;
  }
  return returnVal;
}
