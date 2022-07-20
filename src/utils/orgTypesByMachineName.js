import { each } from 'lodash';

/**
 * Get object of organizationTypes keyed by machine name.
 *
 * Converts the `appMeta.data.organizationTypes` redux object,
 * which is keyed by numeric id.
 *
 * @param {object} orgTypes
 * @returns {object}
 */
export default function orgTypesByMachineName(orgTypes) {
  let res = {};
  each(orgTypes, (v, k) => {
    res[v.machine_name] = v;
  });
  return res;
}
