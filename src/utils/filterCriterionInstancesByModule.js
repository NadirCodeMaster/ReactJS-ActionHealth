import { isNumber, reverse, sortBy } from 'lodash';

/**
 * @param Array criterionInstances
 * @param Number|String|Object mod
 * @param sortParams|Object (optional)
 * @return Array
 *  Returns array of CIs sorted by weight
 */
export default function filterCriterionInstancesByModule(
  criterionInstances,
  mod,
  sortParams
) {
  let modId = mod;
  if (!isNumber(mod)) {
    modId = mod.id;
  }
  modId = parseInt(modId, 10);
  let results = criterionInstances.filter(ci => {
    return modId === parseInt(ci.module_id, 10);
  });

  if (sortParams) {
    if (sortParams.asc) {
      return sortBy(results, sortParams.column);
    }
    if (!sortParams.asc) {
      return reverse(sortBy(results, sortParams.column));
    }
  }

  return sortBy(results, 'weight');
}
