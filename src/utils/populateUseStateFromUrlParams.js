import { each, isNil, toNumber } from 'lodash';
import qs from 'qs';

/**
 * call useState set functions based on URL parameters.
 *
 * Does not return anything.
 *
 * @param {object} setFunctions
 *  functions called to set state in component
 * @param {object} location
 *  Location object.
 * @param {array} definitions
 *  Array of objects, each with the props below. @TODO This structure is
 *  used in other related methods and should be defined somewhere as
 *  a standard convention in our app.
 *  ```
 *  {
 *    stateName: '',
 *    paramName: '', // omit component-specific prefixes
 *    defaultParamValue: '', // value to assume if not present as URL param
 *    valueType: '{num|str}'
 *  }
 *  ```
 * @param {string} qsPrefix
 */
export default function populateStateFromUrlParams(
  setFunctions,
  search,
  definitions,
  qsPrefix = ''
) {
  each(definitions, (value, key) => {
    let paramValue = value.defaultParamValue;
    let allParams = qs.parse(search, { ignoreQueryPrefix: true });
    let prefixedParamName = qsPrefix + value.paramName;

    if (!isNil(allParams[prefixedParamName])) {
      paramValue = allParams[prefixedParamName];
    }

    // Will be string by default. Check if it needs to be converted.
    if ('num' === value.valueType) {
      paramValue = toNumber(paramValue);
    }

    let setFunction = setFunctions[value.paramName];

    if (setFunction) {
      setFunction(paramValue);
    }
  });
}
