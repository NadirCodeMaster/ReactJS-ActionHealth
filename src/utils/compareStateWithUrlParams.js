import { each, isNil, toNumber } from 'lodash';
import currentUrlParamValue from './currentUrlParamValue';

/**
 * Find out if current URL parameter values match component state representations.
 *
 * This method assumes there's a default value for each URL parameter, even
 * if the URL parameter doesn't exist in the location object. For example, a
 * component will typically have a default sort direction that is used by the
 * component even if it's not present in the browser's address bar.
 *
 * Each value must also have a valueType defined; either 'num' or 'str'. This
 * is used to ensure values are compared as expected.
 *
 * Values missing from the state object are considered empty strings, to reflect
 * what a missing or empty URL parameter typically represents in other contexts.
 * This includes state values submitted with valueType:num.
 *
 * @param {object} componentState
 *  State object from your component (i.e., `this.state`)
 * @param {object} location
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
 *
 * @returns {boolean}
 *  Returns true if the values match, false if they don't.
 */
export default function compareStateWithUrlParams(
  componentState,
  location,
  definitions,
  qsPrefix = ''
) {
  let matches = true;

  each(definitions, (value, key) => {
    // Get this item from the URL params.
    let curParamVal = currentUrlParamValue(
      value.paramName,
      qsPrefix,
      location,
      value.defaultParamValue
    );
    // Cast to number if needed.
    if ('num' === value.valueType && curParamVal.length > 0) {
      curParamVal = toNumber(curParamVal);
    }

    // Get a correctly typed version of the state value.
    let curStateVal = '';
    if (!isNil(componentState[value.stateName])) {
      curStateVal = componentState[value.stateName].toString();
    }
    if ('num' === value.valueType && curStateVal.length > 0) {
      curStateVal = toNumber(curStateVal);
    }

    // Compare the param to the state value.
    if (curParamVal !== curStateVal) {
      matches = false;
      return false; // exit loop.
    }
  });

  return matches;
}
