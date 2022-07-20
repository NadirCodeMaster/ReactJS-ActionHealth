import { isString } from 'lodash';

/**
 * Create Query Search Prefix for a given component.
 *
 * Given two possible prefix values, this method returns
 * the most appropriate based on priority and value.
 *
 * The customQsPrefix generally represents a unique prefix
 * value passed to a component as a prop. Code utilizing a
 * component would provide that to ensure the URL query
 * parameters the component generates don't conflict with
 * other instances of the component. So, this value is
 * the higher priority prefix value.
 *
 * If customQsPrefix is empty or invalid, the defaultQsPrefix
 * is returned. Note that no validation done on defaultQsPrefix,
 * so it is returned even if invalid.
 *
 * @param {string} defaultQsPrefix (IE: _terms)
 * @param {string} customQsPrefix (IE: _terms_1st)
 */
export default function generateQsPrefix(defaultQsPrefix, customQsPrefix) {
  if (isString(customQsPrefix) && customQsPrefix.length > 0) {
    return customQsPrefix;
  }
  return defaultQsPrefix;
}
