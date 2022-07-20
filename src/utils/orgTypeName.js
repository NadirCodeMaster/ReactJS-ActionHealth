import { isEmpty, isNil, isNumber } from 'lodash';

/**
 * Get organization type name as string for an ID or object.
 *
 * @param {Number|Object} idOrObj
 *  The org type ID or an object with organization_type_id prop.
 * @param {Object} orgTypes
 *  Typically you'll use appMeta.data.organizationTypes for this.
 * @param {String} ifNone
 *  String to return if org type not found.
 * @returns {String}
 */
export default function orgTypeName(idOrObj, orgTypes, ifNone = '') {
  if (!isNil(idOrObj) && !isEmpty(idOrObj)) {
    let otId = idOrObj;
    if (!isNumber(otId)) {
      otId = otId.organization_type_id;
    }
    if (otId) {
      otId = parseInt(otId, 10);
      if (!isNil(orgTypes[otId])) {
        return orgTypes[otId].name;
      }
    }
  }
  return ifNone;
}
