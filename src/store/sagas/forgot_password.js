import { takeLatest } from "redux-saga/effects";
import {
  attemptChangePassword,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestPasswordResetForEmail } from "api/requests";

function* forgot_password() {
  yield takeLatest(
    attemptChangePassword,
    fetcherForSagas({
      start: forgotPasswordStart,
      success: forgotPasswordSuccess,
      failure: forgotPasswordFailure,
      status: 202,
      request: ({ payload }) => requestPasswordResetForEmail(payload.email),
    })
  );
}

export default forgot_password;
