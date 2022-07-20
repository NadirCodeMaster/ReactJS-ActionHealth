import { isEmpty, isNil, trim } from 'lodash';

/**
 * Get a displayable full name string for a user object.
 *
 * @param {Object} uObj
 * @param {Boolean} lastNameAsInitial
 * @returns {String}
 */
export default function userFullName(uObj, lastNameAsInitial = false) {
  let fname = '';
  let lname = '';

  if (!isNil(uObj) && typeof uObj === 'object') {
    if (!isNil(uObj.name_first) && !isEmpty(uObj.name_first)) {
      fname = uObj.name_first;
    }
    if (!isNil(uObj.name_last) && !isEmpty(uObj.name_last)) {
      lname = uObj.name_last;
      if (lastNameAsInitial) {
        lname = lname.charAt(0).toUpperCase() + '.';
      }
    }
  }
  return trim(`${fname} ${lname}`);
}
