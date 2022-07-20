import { filter, isNumber } from 'lodash';

/**
 * @param Array userFunctionCategories
 * @param Number|String|Object organizationType
 * @return Array
 *  Returns array of UFCs sorted by name
 */
export default function filterUserFunctionCategoriesByOrganizationType(
  userFunctionCategories,
  organizationType
) {
  let organizationTypeId = organizationType;
  if (!isNumber(organizationType)) {
    organizationTypeId = organizationType.id;
  }
  organizationTypeId = parseInt(organizationTypeId, 10);

  let results = filter(userFunctionCategories, ufc => {
    return organizationTypeId === parseInt(ufc.organization_type_id, 10);
  });
  return results; // @TODO APPLY SORTING
  //return results.sortBy('name');
}
