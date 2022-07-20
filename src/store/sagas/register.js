import { appHistory } from "../../appHistory";
import { takeEvery, put } from "redux-saga/effects";
import keys from "lodash/keys";
import isEmpty from "lodash/isEmpty";
import { requestRegister } from "api/requests";
import { appCookiesContext } from "appCookiesContext";
import validateAppDest from "utils/validateAppDest";
import authConfigs from "constants/authConfigs";
import { attemptRegister, registerFailure, registerStart, registerSuccess } from "store/actions";

/**
 * handleAttemptRegister saga.  This function is exported in addition to the helper
 * function (registerSagas) to allow for more direct testing with the
 * runSaga functionality that is built into redux-saga.  By doing this we
 * allow ourselves to not have to .next() through the entire saga to unit test.
 * That step-by-step method is less robust and more error prone way of testing.
 * Also, we add the option for a second parameter to include a customApiCall.
 * This allows us to mock api calls during unit testing.
 */
export function* handleAttemptRegister(
  { payload: { successUrl, ...registration } },
  customApiCall
) {
  let registerApiCall = customApiCall ? customApiCall : requestRegister;

  yield put(registerStart());

  try {
    const response = yield registerApiCall(registration);

    if (response.status === 202) {
      // If a successUrl was provided, we'll set that as a cookie value
      // that the verification handler can use after user has been verified.
      //
      // We'll apply the same validation to this as the typical appDest param
      // (which is typically what will be pased through here).
      if (validateAppDest(successUrl)) {
        appCookiesContext.set(authConfigs.registerDest, successUrl, {
          path: "/",
          secure: true,
          httpOnly: false,
          maxAge: 172800, // two days in seconds
          sameSite: "lax",
        });
      }

      // Send to verification page.
      yield put(registerSuccess());
      yield put(appHistory.push("/app/account/register/verification"));
    }
  } catch (e) {
    if (e.response && e.response.data && !isEmpty(e.response.data.errors)) {
      const { errors } = e.response.data;

      if (errors) {
        const fieldErrors = keys(errors).map((field) => {
          const err = errors[field].reduce((acc, val) => `${acc}  ${val}`, "");
          return err;
        });
        yield put(registerFailure({ errors: fieldErrors }));
      } else {
        yield put(
          registerFailure({
            errors: [
              "There was an error processing your registration.  Please check the information provided and try again.",
            ],
          })
        );
      }
    }
  }
}

function* registerSagas() {
  yield takeEvery(attemptRegister, handleAttemptRegister);
}

export default registerSagas;
