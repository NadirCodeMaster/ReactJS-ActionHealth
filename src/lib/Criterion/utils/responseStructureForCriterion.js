import { find, get, isNil } from 'lodash';

/**
 * Get the response structure object for a given criterion.
 *
 * @param {object} criterion
 * @param {object} responseStructures
 *  Object containing response structures, keyed by ID. As from app_meta.data.responseStructures.
 * @returns {object|null}
 */
export default function responseStructureForCriterion(criterion, responseStructures) {
  let res = null;
  let rsId = get(criterion, 'response_structure_id', null);
  if (!isNil(rsId)) {
    res = find(responseStructures, rs => {
      return Number(rs.id) === Number(rsId);
    });
  }
  return res;
}
