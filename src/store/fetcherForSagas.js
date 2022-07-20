import { all, put } from 'redux-saga/effects';

// Used to dispatch action with an optional payload
const puts = action =>
  Array.isArray(action) ? all(action.map(a => put(a))) : put(action);

/**
 * Helper for making API requests with various states mapped to Redux actions.
 */
export const fetcherForSagas = ({
  start,
  success,
  failure,
  request,
  status = 200
}) => {
  return function*(action) {
    if (start) {
      // dispatch start action
      // Example action: FETCH_APP_META_START
      yield puts(start(action.payload));
    }

    let response;
    try {
      // yield call api request
      response = yield request(action);
    } catch (e) {
      // Log the error to the console, but allow code below
      // to deal with the error by calling the provided
      // failure() method with a value that's appropriate
      // based on `response`.
      console.warn(e);
    }

    // If we have a response
    if (undefined !== response) {
      // If response is successful
      if (success && response.status === status) {
        // dispatch success action, action.payload is optional (can be undefined)
        // Example action: FETCH_APP_META_SUCCESS
        yield puts(success(response.data, action.payload));
        // If response is unsuccessful
      } else if (failure && response.status !== status) {
        // dispatch failure action
        // Example action: FETCH_APP_META_FAILURE
        yield puts(failure(response.data));
      }
    } else {
      // We have no response.
      // Dispatch failure action with empty error payload.
      // Example action: FETCH_APP_META_FAILURE
      yield puts(failure({ errors: [] }));
    }
  };
};
