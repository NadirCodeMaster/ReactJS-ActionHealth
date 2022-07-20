import { get } from "lodash";
import { takeEvery } from "redux-saga/effects";
import {
  fetchOrganizationResponses,
  fetchOrganizationResponsesStart,
  fetchOrganizationResponsesSuccess,
  fetchOrganizationResponsesFailure,
} from "store/actions";
import { fetcherForSagas } from "store/fetcherForSagas";
import { requestOrganizationResponses } from "api/requests.js";

function* organization_responses() {
  yield takeEvery(
    fetchOrganizationResponses,
    fetcherForSagas({
      start: fetchOrganizationResponsesStart,
      success: fetchOrganizationResponsesSuccess,
      failure: fetchOrganizationResponsesFailure,
      request: ({ payload }) => {
        let orgId = Number(payload.organization_id);
        let params = {};

        // Filter payload to the params we'll allow to be sent from here.
        // These are all optional, so we allow empty values.
        params.criterion_id = get(payload, "criterion_id", "");
        params.program_id = get(payload, "program_id", "");
        params.set_id = get(payload, "set_id", "");

        // Hardcode pagination values (no need to support more flexibility).
        params.page = 1;
        params.per_page = 500;

        return requestOrganizationResponses(orgId, params);
      },
    })
  );
}

export default organization_responses;
