import { takeEvery } from "redux-saga/effects";
import {
  fetchContents,
  fetchContentsStart,
  fetchContentsSuccess,
  fetchContentsFailure,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestContentsShow } from "api/requests.js";

function* contents() {
  yield takeEvery(
    fetchContents,
    fetcherForSagas({
      start: fetchContentsStart,
      success: fetchContentsSuccess,
      failure: fetchContentsFailure,
      request: ({ payload }) =>
        requestContentsShow({
          machine_name: payload.machine_name,
        }),
    })
  );
}

export default contents;
