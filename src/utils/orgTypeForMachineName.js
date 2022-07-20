import { find, isNil } from 'lodash';

/**
 * Get organization type object for a machine_name string.
 *
 * @param {String} machineName
 *  Org type machine name value.
 * @param {Object} orgTypes
 *  Typically you'll use appMeta.data.organizationTypes for this.
 * @returns {Object|Null}
 */
export default function orgTypeForMachineName(machineName, orgTypes) {
  let returnVal = null;
  if (!isNil(machineName)) {
    let orgType = find(orgTypes, (v, k) => {
      return machineName === v.machine_name;
    });
    returnVal = orgType ? orgType : returnVal;
  }
  return returnVal;
}
