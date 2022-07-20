import qs from 'qs';
import convertStateToUrlParams from './convertStateToUrlParams';

/**
 * Update URL parameters based on state vars, pushing new entry to history.
 *
 * This method honors our query string prefixing practice, so parameters set
 * by components other than the calling component are not clobbered (assuming
 * unique prefixes have been used everywhere needed).
 *
 * Does not return anything.
 *
 * @see utils/populateStateFromUrlParams()
 *
 * @param {object} componentState
 *  State object from your component (i.e., `this.state`).
 * @param {object} location
 *  Location object.
 * @param {object} history
 *  History object.
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
export default function populateUrlParamsFromState(
  componentState,
  location,
  history,
  definitions,
  qsPrefix = ''
) {
  let oldBrowserParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  let newBrowserParams = convertStateToUrlParams(
    componentState,
    location,
    definitions,
    qsPrefix
  );

  // Merge with old to avoid clobbering params
  // from other components.
  let mergedBrowserParams = {
    ...oldBrowserParams,
    ...newBrowserParams
  };
  let newLocation = {
    ...location,
    search: '?' + qs.stringify(mergedBrowserParams)
  };

  if (location.search !== newLocation.search) {
    history.push(newLocation);
  }
}
