import { isNumber } from 'lodash';

/**
 * Low-overhead comparison of currentUser objects based on ID.
 *
 * Intended for use in componentDidUpdate() as a lightweight alternative
 * to comparing entire currentUser object structures to determine if a
 * currentUser has changed. Boilerplate code for safely navigating into the
 * object structure to reach the ID is handled here.
 *
 * Comparison is done based on {obj}.data.id. If a provided value lacks the
 * data, data.id, or isAuthenticated properties, or isAuthenticated is false,
 * we evaluate its ID as null.
 *
 * @param {object} cu1
 * @param {object} cu2
 * @returns {boolean}
 */
export default function compareCurrentUserObjectIds(cu1, cu2) {
  let extractIdFromObj = cu => {
    if (
      cu &&
      cu.hasOwnProperty('isAuthenticated') &&
      cu.isAuthenticated &&
      cu.hasOwnProperty('data') &&
      cu.data.hasOwnProperty('id') &&
      isNumber(cu.data.id)
    ) {
      return cu.data.id;
    }
    return null;
  };

  let cuId1 = extractIdFromObj(cu1);
  let cuId2 = extractIdFromObj(cu2);

  return cuId1 === cuId2;
}
