import { isEmpty, isNil, isNumber } from 'lodash';

/**
 * Get the user function name for ID or a object.
 *
 * @param {Number|Object} idOrObj
 *  The user function ID or an obj with user_function_id.
 * @param {Object} userFuncs
 *  Typically you'll use appMeta.data.userFunctions for this.
 * @param {String} ifNone
 *  String to return if UF not found.
 * @returns {String}
 */
export default function userFuncName(idOrObj, userFuncs, ifNone = '') {
  if (!isNil(idOrObj) && !isEmpty(idOrObj)) {
    let ufId = idOrObj;
    if (!isNumber(ufId)) {
      ufId = ufId.user_function_id;
    }
    if (ufId) {
      ufId = parseInt(ufId, 10);
      if (!isNil(userFuncs[ufId])) {
        return userFuncs[ufId].name;
      }
    }
  }
  return ifNone;
}
