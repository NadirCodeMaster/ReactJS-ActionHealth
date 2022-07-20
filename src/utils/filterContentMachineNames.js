import { forEach, get, isEmpty, has, toString } from 'lodash';

/**
 * @param Object contents
 * @param Array machineNames
 * @param sortParams|Object (optional)
 * @return String
 *  Comma delimited machine names
 */
export default function filterContentMachineNames(contents, machineNames) {
  let contentsData = get(contents, 'data', {});
  let paramContents = '';

  forEach(machineNames, machineName => {
    // If content object from redux does not have machine name,
    // add it to paramater variable
    if (!has(contentsData, machineName)) {
      if (isEmpty(paramContents)) {
        paramContents = toString(machineName);
      } else {
        paramContents += ',' + toString(machineName);
      }
    }
  });

  return paramContents;
}
