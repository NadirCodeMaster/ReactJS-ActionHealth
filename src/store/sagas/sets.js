import { takeEvery, takeLatest } from "redux-saga/effects";
import { fetcherForSagas } from "store/fetcherForSagas";
import {
  loginSuccess,
  fetchSets,
  fetchSetsStart,
  fetchSetsSuccess,
  fetchSetsFailure,
} from "store/actions";

import { requestSets } from "api/requests.js";

function* sets() {
  // Listen for direct calls to fetchSets.
  yield takeLatest(
    fetchSets,
    fetcherForSagas({
      start: fetchSetsStart,
      success: ({ data, ...other }) => fetchSetsSuccess({ data, ...other }),
      failure: fetchSetsFailure,
      request: () => requestSets({ per_page: 1000 }),
    })
  );

  // Listen for login success as a cue to pull in the sets.
  yield takeEvery(
    loginSuccess,
    fetcherForSagas({
      start: fetchSetsStart,
      success: ({ data, ...other }) => fetchSetsSuccess({ data, ...other }),
      failure: fetchSetsFailure,
      request: () => requestSets({ per_page: 1000 }),
    })
  );
}

export default sets;
