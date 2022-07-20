import { filter, isNumber, sortBy } from 'lodash';

/**
 * @param Array userFunctions
 * @param Number|String|Object userFunctionCategory
 * @return Array
 *  Returns array of UFs sorted by name
 */
export default function filterUserFunctionsByUserFunctionCategory(
  userFunctions,
  userFunctionCategory
) {
  let ufcId = userFunctionCategory;
  if (!isNumber(userFunctionCategory)) {
    ufcId = userFunctionCategory.id;
  }
  ufcId = parseInt(ufcId, 10);

  let results = filter(userFunctions, uf => {
    return ufcId === parseInt(uf.user_function_category_id, 10);
  });
  return sortBy(results, 'name');
}
