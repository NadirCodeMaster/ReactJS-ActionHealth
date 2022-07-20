import { isNumber } from 'lodash';

/**
 * Low-overhead comparison of objects based on an `id` property.
 *
 * Intended for use in componentDidUpdate() as a lightweight alternative
 * to comparing entire object structures to determine if if they're
 * different, when all we really care about is the ID. Covers the
 * boilerplate code required for safely dealing with variables that
 * might not be populated, or might not be an object at a given time.
 *
 * Comparison is done based on {obj}.id. If a value lacks the id property,
 * we evaluate its ID as null.
 *
 * @param {object} obj1
 * @param {object} obj1
 * @returns {boolean}
 */
export default function compareObjectIds(obj1, obj2) {
  let extractIdFromObj = obj => {
    if (obj && obj.hasOwnProperty('id') && isNumber(obj.id)) {
      return obj.id;
    }
    return null;
  };

  let objId1 = extractIdFromObj(obj1);
  let objId2 = extractIdFromObj(obj2);

  return objId1 === objId2;
}
