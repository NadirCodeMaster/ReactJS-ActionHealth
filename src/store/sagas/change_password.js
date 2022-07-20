import { takeLatest } from "redux-saga/effects";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestChangeOwnPassword } from "api/requests";

import {
  changePassword,
  changePasswordSuccess,
  changePasswordFailure,
  changePasswordStart,
} from "store/actions";

function* change_password() {
  yield takeLatest(
    changePassword,
    fetcherForSagas({
      success: changePasswordSuccess,
      failure: changePasswordFailure,
      start: changePasswordStart,
      status: 200,
      request: ({ payload: { id, ...data } }) => requestChangeOwnPassword(id, data),
    })
  );
}

export default change_password;
