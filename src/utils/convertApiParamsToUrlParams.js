import { each, includes, isNil } from 'lodash';

/**
 * @DEPRECATED Use convertStateToUrlParams() instead.
 *
 * Build user-facing (browser) query params obj from API params obj.
 *
 * Given the API parameter values used when sorting, filtering,
 * searching, etc, this function generates an object of equivalent
 * browser URL parameters where names have been prefixed and values have
 * been sanitized. See example code in the function body.
 *
 * Should replace the buildBrowserQueryParams() methods used in many
 * of our components as of this writing.
 *
 * @param {object} apiRequestValues
 *  name:value map of the actual parameters and corresponding values that
 *  would be sent in an API request.
 *  Ex: `{apiParamName1:apiParamValue1, apiParamName2:apiParamValue2}`
 * @param {object} browserToApiParamsMap
 *  Map of browser URL params to corresponding API request param name. Provide
 *  these without the query string prefix.
 *  Ex: `{browserParamName1: apiParamName1, browserParamName2:apiParamName2}`
 * @param {string} queryStringPrefix,
 * @param {array} excludedApiParameters
 *  Array of API parameter names that should be excluded from the results.
 * @returns {object}
 *  Note that values in return object will always be strings.
 */
export default function convertApiParamsToUrlParams(
  apiRequestValues,
  browserToApiParamsMap,
  queryStringPrefix = '',
  excludedApiParameters = []
) {
  /*
  # Example usage: (requires withRouter() HOC)
  # --------------
  import qs from 'qs';
  import { withRouter } from 'react-router';

  # The query string prefix used by your component instance,
  # used to uniquely associate URL parameters with it.
  let queryStringPrefix = 'sweet_component_`;

  # Your component will typically have a var like the one below that
  # maps the parameter name used in the browser to the equivalent
  # key used to represent it in API requests.
  # Note that this map should _not_ include the query string prefix
  # on the parameter names.
  let browserToApiParamsMap = {
    // browserKey: apiKey
    sort: sort_field,
    dir: sort_dir,
    org_name: name,
    page: page,
    per_page: per_page
  };

  # Create another var that contains the actual values you
  # use in your API requests, keyed by their API key title.
  # You can use the map var above to reduce coupling.
  let apiRequestValues = {
    // apiKey: valueInComponentState
    [browserToApiParamsMap.sort]: this.state.currentSort,
    [browserToApiParamsMap.dir]: this.state.currentDir,
    [browserToApiParamsMap.org_name]: this.state.currentOrgName,
    [browserToApiParamsMap.page]: this.state.currentPage,
    [browserToApiParamsMap.per_page]: this.state.currentPerPage,
  };

  # Then call this method with values from above:
  let newBrowserParams = convertApiParamsToUrlParams(
    apiRequestValues,
    browserToApiParamsMap,
    queryStringPrefix
  );

  # Get current params so we can merge the new ones to avoid
  # clobbering params for other active components.
  let oldBrowserParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  # Combine existing and updated params, giving preference to updated.
  let mergedQp = {
    ...oldBrowserParams,
    ...newBrowserParams
  };

  # Define a new location object.
  let newLocation = {
    pathname: this.props.location.pathname,
    search: '?' + qs.stringify(mergedQp)
  };

  # Push the change to the browser.
  if (this.props.location.search !== newLocation.search) {
    history.push(newLocation);
  }
  # end example usage -------------------
  */

  let q = {};

  each(browserToApiParamsMap, (value, key) => {
    if (browserToApiParamsMap.hasOwnProperty(key)) {
      if (
        !isNil(apiRequestValues[value]) &&
        !includes(excludedApiParameters, value)
      ) {
        let prefixedUrlParamName = queryStringPrefix + key;
        q[prefixedUrlParamName] = String(apiRequestValues[value]).replace(
          /[^a-zA-Z0-9_\-, ]/g,
          ''
        );
      }
    }
  });

  return q;
}
