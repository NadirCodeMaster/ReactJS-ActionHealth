import { isNil } from 'lodash';
import qs from 'qs';

/**
 * Get current value of a browser URL parameter.
 *
 * Note that returned value is always a string.
 *
 * @param {string} paramName
 *  Name of parameter, sans-prefix.
 * @param {string} qsPrefix
 *  Query string prefix used in your component instance (i.e., `xyz_`)
 * @param {object} location
 *  Location object, probably provided to your component
 *  by withRouter() HOC.
 * @param {string} defaultValue
 *  Default value to return if param isn't found.
 * @returns {string}
 */
export default function currentUrlParamValue(
  paramName,
  qsPrefix,
  location,
  defaultValue = ''
) {
  let allParams = qs.parse(location.search, { ignoreQueryPrefix: true });
  let prefixedParamName = qsPrefix + paramName;

  if (!isNil(allParams[prefixedParamName])) {
    return allParams[prefixedParamName];
  }
  return defaultValue;
}
