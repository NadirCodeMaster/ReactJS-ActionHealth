import { takeLatest, put } from 'redux-saga/effects';
import { requestPasswordResetChangePassword } from 'api/requests';

import {
  resetPassword,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure
} from 'store/actions';

/**
 * handleResetPassword saga.  This function is exported in addition to the helper
 * function (resetPasswordSagas) to allow for more direct testing with the
 * runSaga functionality that is built into redux-saga.  By doing this we
 * allow ourselves to not have to .next() through the entire saga to unit test.
 * That step-by-step method is less robust and more error prone way of testing.
 * Also, we add the option for a second parameter to include a customApiCall.
 * This allows us to mock api calls during unit testing.
 */
export function* handleResetPassword(action, customApiCall) {
  let { payload } = action;
  let resetPasswordApiCall = customApiCall
    ? customApiCall
    : requestPasswordResetChangePassword;

  yield put(resetPasswordStart());

  let response;

  try {
    response = yield resetPasswordApiCall(payload);
  } catch (e) {
    switch (e.response.status) {
      // Endpoint returns 400 status when providing a specific failure.
      // String representing failure, such as "passwords.user" will be in
      // body of response. So, we treat 400 differently than other failures
      // and return string so calling code can provide a user-friendly
      // translation.
      case 400:
        yield put(resetPasswordFailure(e.response.data));
        break;
      default:
        throw e;
    }
  }

  if (response) {
    if (resetPasswordSuccess && 204 === response.status) {
      yield put(resetPasswordSuccess(response.data, action.payload));
    } else {
      yield put(resetPasswordFailure(response.data));
    }
  }
}

function* resetPasswordSagas() {
  yield takeLatest(resetPassword, handleResetPassword);
}

export default resetPasswordSagas;
