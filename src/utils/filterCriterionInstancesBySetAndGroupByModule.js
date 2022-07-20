import { each, filter, isNumber, sortBy } from 'lodash';

/**
 * @param Array criterionInstances
 * @param Array setModules Array of the modules belonginging to set
 * @param Number|String|Object set
 * @return Array
 *  Returns array of objects. Each object contains two properties: `module_id`
 *  (a module id or null) and `criterionInstances` (array of CIs that belong
 *   to that module). Outer array is sorted by module weight (though the
 *   null module is first) and criterionInstance arrays are sorted by their
 *   weight.
 */
export default function filterCriterionInstancesBySetAndGroupByModule(
  criterionInstances,
  setModules,
  set
) {
  let setId = set;
  if (!isNumber(set)) {
    setId = set.id;
  }
  setId = parseInt(setId, 10);
  let setCIs = criterionInstances.filter(ci => {
    return setId === parseInt(ci.set_id, 10);
  });

  // Make sure setModules is limited to modules from set.
  setModules = setModules.filter(m => {
    return setId === parseInt(m.set_id, 10);
  });

  // Sort the CIs relative to each other.
  setCIs = sortBy(setCIs, [
    function(obj) {
      return obj.weight;
    }
  ]);

  // Sort the modules relative to each other.
  setModules = sortBy(setModules, [
    function(obj) {
      return obj.weight;
    }
  ]);

  // This will be our result array.
  let results = [];

  // Locate any CIs without a module.
  let ciWithoutModule = filter(setCIs, ciVal => {
    return !ciVal.module_id;
  });

  // ... if we find any, create the first results entry with them.
  if (ciWithoutModule.length > 0) {
    results.push({
      module: null,
      criterionInstances: ciWithoutModule
    });
  }

  // Now add the remaining CIs grouped by module.
  each(setModules, moduleVal => {
    results.push({
      module: moduleVal,
      criterionInstances: filter(setCIs, ciVal => {
        return parseInt(moduleVal.id, 10) === parseInt(ciVal.module_id, 10);
      })
    });
  });

  return results;
}
