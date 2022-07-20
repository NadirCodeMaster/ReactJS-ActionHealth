import { takeLatest } from "redux-saga/effects";
import { appHistory } from "../../appHistory";
import {
  deactivateAccount,
  deactivateAccountFailure,
  deactivateAccountStart,
  deactivateAccountSuccess,
  reactivateAccount,
  reactivateAccountFailure,
  reactivateAccountStart,
  reactivateAccountSuccess,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestReactivateUser, requestDeactivateSelf } from "api/requests";

function* account_activation() {
  yield takeLatest(
    deactivateAccount,
    fetcherForSagas({
      success: deactivateAccountSuccess,
      start: deactivateAccountStart,
      status: 204,
      failure: deactivateAccountFailure,
      request: () => {
        return requestDeactivateSelf();
      },
    })
  );

  yield takeLatest(
    reactivateAccount,
    fetcherForSagas({
      success: reactivateAccountSuccess,
      failure: reactivateAccountFailure,
      start: reactivateAccountStart,
      status: 202,
      request: ({ payload }) => {
        return requestReactivateUser(payload.email);
      },
    })
  );

  yield takeLatest(deactivateAccountSuccess, function* () {
    yield appHistory.push("/app/account/login");
  });
}

export default account_activation;
