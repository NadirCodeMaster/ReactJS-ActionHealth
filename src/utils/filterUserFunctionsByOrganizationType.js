import { each, isNumber, sortBy } from 'lodash';
import filterUserFunctionCategoriesByOrganizationType from './filterUserFunctionCategoriesByOrganizationType.js';
import filterUserFunctionsByUserFunctionCategory from './filterUserFunctionsByUserFunctionCategory.js';

/**
 * @param Array userFunctions
 * @param Array userFunctionCategories
 * @param Number|String|Object organizationType
 * @return Array
 *  Returns array of UFs sorted by name
 */
export default function filterUserFunctionsByOrganizationType(
  userFunctions,
  userFunctionCategories,
  organizationType
) {
  let organizationTypeId = organizationType;
  if (!isNumber(organizationType)) {
    organizationTypeId = organizationType.id;
  }
  organizationTypeId = parseInt(organizationType, 10);

  // Get the UFCs for the provided organization type.
  let filteredUFCs = filterUserFunctionCategoriesByOrganizationType(
    userFunctionCategories,
    organizationTypeId
  );

  // Get all UFs that have one of those UFCs.
  let results = [];
  each(filteredUFCs, ufc => {
    let ufcUfs = filterUserFunctionsByUserFunctionCategory(
      userFunctions,
      ufc.id
    );
    results.push(...ufcUfs);
  });

  return sortBy(results, 'name');
}
