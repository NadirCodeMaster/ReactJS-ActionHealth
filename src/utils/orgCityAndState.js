import { isEmpty, isNil } from 'lodash';

/**
 * Get single-line string with city and state for an organization.
 *
 * If only part of the data is available, we return it (but still
 * properly handle punctuation).
 *
 * @param {Object} org
 *  The org object to work on.
 * @param {String} ifEmpty
 *  String to return if there's nothing else to return.
 * @returns {String}
 */
export default function orgCityAndState(org, ifEmpty = '') {
  let city = !isNil(org.city) ? org.city : '';
  let state = !isNil(org.state_id) ? org.state_id : '';

  // City and state.
  if (!isEmpty(city) && !isEmpty(state)) {
    return city + ', ' + state.toUpperCase();
  }
  // Just city.
  if (!isEmpty(city) && isEmpty(state)) {
    return city;
  }
  // Just state.
  if (isEmpty(city) && !isEmpty(state)) {
    return state.toUpperCase();
  }
  // Nothing.
  return ifEmpty;
}
