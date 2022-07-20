import { takeLatest } from "redux-saga/effects";
import {
  fetchAppMeta,
  fetchAppMetaStart,
  fetchAppMetaSuccess,
  fetchAppMetaFailure,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestAppMeta } from "api/requests.js";

function* app_meta() {
  yield takeLatest(
    fetchAppMeta,
    fetcherForSagas({
      start: fetchAppMetaStart,
      success: ({ data, ...other }) => fetchAppMetaSuccess({ data, ...other }),
      failure: fetchAppMetaFailure,
      request: () => requestAppMeta(),
    })
  );
}

export default app_meta;
