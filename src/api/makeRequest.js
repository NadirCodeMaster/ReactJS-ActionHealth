import axios from 'axios';
import { has } from 'lodash';
import { setLatestRequestTime } from 'api/latestRequestTime';
import { removeCsrfToken } from 'api/csrfToken';

/**
 * Our primary wrapper method for making API requests.
 *
 * @returns {Promise}
 */
export default function makeRequest({
  method = 'POST',

  // **url:** URL the request will be sent to.
  url = null,

  // **body:** Object w/body of request, unless method is GET (then it's the
  //  URL parameters).
  body = null,

  // **headers:** Custom request headers.
  headers = {},

  // **contentType:** Sets `Content-Type` header of request.
  contentType = 'application/json',

  // **throwOnFailure:** Declares types of request failures that should prompt
  //  this method to throw an error when an API request returns a failing
  //  status code. If redirectOnAuthFailure=true AND the API returns a status
  //  indicating authentication failure, this parameter has no effect.
  throwOnFailure = 'all', // 'all'|'auth'|'none'|'notauth'

  // **redirectOnAuthFailure:** If API responds with a status code indicating
  //  an authentication failure (401, 419), we log the user out by sending
  //  them to the logout page and resetting their CSRF token.
  redirectOnAuthFailure = true,

  // **timeout:** Timeout in milliseconds (or null).
  timeout = null
}) {
  const allowedThrowOnFailureValues = ['all', 'auth', 'none', 'notauth'];
  if (!allowedThrowOnFailureValues.includes(throwOnFailure)) {
    console.error('Invalid value passed to `throwOnFailure` in makeRequest()');
  }

  let defaultHeaders = {
    Accept: 'application/json',
    'Content-Type': contentType
  };

  const baseURL = process.env.REACT_APP_API_URL;

  let finalHeaders = {
    ...defaultHeaders,
    ...headers
  };

  let requestConfig = {
    url: baseURL + url,
    headers: finalHeaders,
    method,
    withCredentials: true,
    baseURL
  };

  if (method === 'GET') {
    requestConfig.params = body;
  } else {
    requestConfig.data = body;
  }

  if (null !== timeout) {
    requestConfig.timeout = timeout;
  }

  return axios
    .request(requestConfig)
    .then(function(response) {
      return response;
    })
    .catch(function(error) {
      const authFailCodes = [401, 419];

      let responseStatus = null;
      if (error && has(error, 'response.status')) {
        responseStatus = error.response.status;
      }

      let wasAuthFail = authFailCodes.includes(responseStatus);

      // Handle response errors where we want to redirect to login.
      if (redirectOnAuthFailure && wasAuthFail) {
        // April 19, 2021
        // --------------
        // To address what we believe to be CSRF token errors stemming
        // from an initial release of cookie-based authentication in P2,
        // which appears to have left some users with a CSRF cookie that
        // the API (Sanctum) rejects and won't reset, we're going to:
        //
        // 1) Kill the CSRF token cookie
        // 2) Redirect the browser to the logout page
        //
        // The logout redirect will be done via window.location.replace()
        // so the app is bootstrapped again. That (as opposed to a push()
        // will trigger a new CSRF token request, which should give the
        // user a fresh start.
        removeCsrfToken();
        window.location.replace('/app/account/logout');
        return;

        // OLD (prior to April 19, 2021)
        // -----------------------------
        // Send to logout route, which will dispatch attemptLogout().
        // appHistory.push(`/app/account/logout`);
        // -----------------------------
      }

      // Handle other errors as requested so other code can catch it.
      // Note: If redirectOnAuthFailure=true and the API returned an
      // auth-related failure, the user will have already been redirected.
      if ('none' !== throwOnFailure) {
        if ('all' === throwOnFailure) {
          // Calling code requested we throw an error on any API fail.
          throw error;
        } else if ('auth' === throwOnFailure && wasAuthFail) {
          // Calling code requested we throw an error only if API fail
          // was related to authentication.
          throw error;
        } else if ('notauth' === throwOnFailure && !wasAuthFail) {
          // Calling code requested we throw an error only if API fail
          // was NOT related to authentication.
          throw error;
        }
      }
      return;
    })
    .finally(() => setLatestRequestTime());
}
