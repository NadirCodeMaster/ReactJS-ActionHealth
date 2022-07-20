import { takeEvery, takeLatest } from "redux-saga/effects";
import { fetcherForSagas } from "store/fetcherForSagas";
import {
  loginSuccess,
  logoutDone,
  fetchPrograms,
  fetchProgramsStart,
  fetchProgramsSuccess,
  fetchProgramsFailure,
  fetchProgram,
  fetchProgramStart,
  fetchProgramSuccess,
  fetchProgramFailure,
} from "store/actions";

import { requestProgram, requestPrograms } from "api/requests.js";

function* programs() {
  yield takeLatest(
    [logoutDone],
    fetcherForSagas({
      start: fetchProgramsStart,
      success: ({ data, ...other }) => fetchProgramsSuccess({ data, ...other }),
      failure: fetchProgramsFailure,
      useToken: false,
      request: () => requestPrograms(),
    })
  );
  yield takeLatest(
    fetchPrograms,
    fetcherForSagas({
      start: fetchProgramsStart,
      success: ({ data, ...other }) => fetchProgramsSuccess({ data, ...other }),
      failure: fetchProgramsFailure,
      request: () => requestPrograms(),
    })
  );
  yield takeEvery(
    loginSuccess,
    fetcherForSagas({
      start: fetchProgramsStart,
      success: ({ data, ...other }) => fetchProgramsSuccess({ data, ...other }),
      failure: fetchProgramsFailure,
      request: () => requestPrograms(),
    })
  );
  yield takeEvery(
    fetchProgram,
    fetcherForSagas({
      start: fetchProgramStart,
      success: fetchProgramSuccess,
      failure: fetchProgramFailure,
      request: ({ payload }) => requestProgram(payload),
    })
  );
}

export default programs;
