import { filter, isNumber, sortBy } from 'lodash';

/**
 * @param {Array|Object} sets
 * @param {Number|String|Object} organizationType
 * @return {Array}
 *  Returns array of sets sorted by name.
 */
export default function filterSetsByOrganizationType(sets, organizationType) {
  let organizationTypeId = organizationType;
  if (!isNumber(organizationType)) {
    organizationTypeId = organizationType.id;
  }
  organizationTypeId = parseInt(organizationTypeId, 10);
  let results = filter(sets, s => {
    return organizationTypeId === parseInt(s.organization_type_id, 10);
  });
  return sortBy(results, 'name');
}
