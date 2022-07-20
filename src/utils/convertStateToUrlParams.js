import { each, isNil, isString } from 'lodash';

/**
 * Build user-facing (browser) query params obj from state vars.
 *
 * Given a component state object, a query string prefix, and a standard utility
 * definitions array as used in some of our other utils, this function generates
 * an object of equivalent browser URL parameters where names have been prefixed.
 *
 * This method does not update the browser params. That's generally done
 * via utils/populateUrlParamsFromState() (which calls this method).
 *
 * Should replace the buildBrowserQueryParams() methods used in many
 * of our components as of this writing, as well as the
 * convertApiParamsToUrlParams() utility.
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
 *    defaultParamValue: '', // default value used if state value is empty
 *    valueType: '{num|str}'
 *  }
 *  ```
 * @param {string} qsPrefix
 *
 * @returns {object}
 *  Values in returned object will maintain their type as it exists
 *  in state, regardless of the valueType specified. Note that string
 *  values are not modified at all. (you'll typically handle that via
 *  qs.stringify() when populating the location object).
 */
export default function convertStateToUrlParams(
  componentState,
  location,
  definitions,
  qsPrefix = ''
) {
  let results = {};

  each(definitions, (value, key) => {
    // Default to an empty string.
    let curStateVal = '';
    if (!isNil(componentState[value.stateName])) {
      curStateVal = componentState[value.stateName];
    }
    if (isString(curStateVal) && curStateVal.length === 0) {
      // No value, so we'll inject the default parameter value.
      curStateVal = value.defaultParamValue;
    }
    results[`${qsPrefix}${value.paramName}`] = curStateVal;
  });

  return results;
}
