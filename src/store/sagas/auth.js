import { takeLatest, takeLeading } from "redux-saga/effects";
import {
  refreshCurrentUserData,
  refreshCurrentUserDataStart,
  refreshCurrentUserDataSuccess,
  refreshCurrentUserDataFailure,
  initializeCurrentUserData,
  initializeCurrentUserDataStart,
  initializeCurrentUserDataSuccess,
  initializeCurrentUserDataFailure,
  attemptLogout,
  logoutStart,
  logoutDone,
  attemptLogin,
  loginStart,
  loginSuccess,
  loginFailure,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestSelf, requestLogin, requestLogout } from "api/requests.js";

function* auth() {
  yield takeLatest(
    refreshCurrentUserData,
    fetcherForSagas({
      start: refreshCurrentUserDataStart,
      success: ({ data, ...other }) => refreshCurrentUserDataSuccess({ data, ...other }),
      failure: refreshCurrentUserDataFailure,
      request: () => requestSelf(),
    })
  );
  yield takeLatest(
    [loginSuccess, initializeCurrentUserData],
    fetcherForSagas({
      start: initializeCurrentUserDataStart,
      success: (payload) => initializeCurrentUserDataSuccess(payload),
      failure: initializeCurrentUserDataFailure,
      request: () => requestSelf(),
    })
  );
  yield takeLeading(
    // takes first to avoid potential loop of logouts
    attemptLogout,
    fetcherForSagas({
      start: logoutStart,
      // Same logout action for success and failure because BE
      // may return a 4xx if the user is already logged out.
      success: logoutDone,
      failure: logoutDone,
      request: () => requestLogout(),
    })
  );
  yield takeLatest(
    attemptLogin,
    fetcherForSagas({
      start: loginStart,
      success: loginSuccess,
      failure: loginFailure,
      request: ({ payload }) => requestLogin(payload),
    })
  );
}

export default auth;
