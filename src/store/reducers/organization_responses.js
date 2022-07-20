import { handleActions } from 'redux-actions';
import { has, get, isArray, isNil } from 'lodash';
import {
  fetchOrganizationResponsesStart,
  fetchOrganizationResponsesSuccess,
  fetchOrganizationResponsesFailure
} from 'store/actions';
import isNumeric from 'utils/isNumeric';

// The data object will be keyed by org ID, with each entry being an object
// of responses (or nulls) keyed by criterion_id. Ex:
//
// {
//   10: {                    // (org #10)
//     20: {                  // (criterion #20, response #1000)
//       loading: false,
//       failed: false,
//       response: { id: 1000, ...}
//     },
//     21: {                  // (criterion #21, response #1001)
//       loading: false,
//       failed: false,
//       response: { id: 1001, ...}
//     },
//   },
//   11: {                    // (org #11)
//     20: {                  // (criterion #20, response #1001)
//       loading: false,
//       failed: false,
//       response: { id: 1001, ...}
//     },
//     21: {                  // (criterion #21, response #1002)
//       loading: false,
//       failed: false,
//       response: { id: 1002, ...}
//     },
//   }
// }
//
// Note: Requests that specify a `criterion_id` are tracked as
// `data[organizationId][criterionId].failed` and
// `data[organizationId][criterionId].loading`.
//
// If a criterion_id is logged as `failed`, that flag is removed
// at the start of the next request for it. The flag will be set
// back to true if the request fails.
//
// Bulk requests are _not_ tracked in those arrays. However, the
// results of bulk requests _will_ reset the failed and loading
// flags to false for criteria that had a response object successfully
// received.
//
const initialState = {
  data: {}
};

export default handleActions(
  {
    [fetchOrganizationResponsesStart]: (state, { payload }) => {
      let _state = { ...state };

      // If request was for a specific criterion, create or populate the
      // necessary properties to reflect that.
      if (has(payload, 'criterion_id') && isNumeric(payload.criterion_id)) {
        // Request is for a single criterion, so check if we've already
        // got an entry for the org/criterion combo we can set flags on.
        if (!has(_state.data, payload.organization_id)) {
          // no org entry yet, so add it...
          _state.data[payload.organization_id] = {
            [payload.criterion_id]: {
              loading: true,
              failed: false,
              response: null
            }
          };
        }
      }
      return _state;
    },
    [fetchOrganizationResponsesSuccess]: (state, { payload }) => {
      if (!isArray(payload.data)) {
        console.error('Invalid payload.data in fetchOrganizationResponsesSuccess.', payload.data);
        return { ...state };
      }

      let orgId = null;
      let criterionId = null;
      let newOrgProps = {};

      // -- Handle payloads with at least one response.
      // We can use the data in the response records to locate org and criterion IDs.
      if (payload.data.length > 0) {
        orgId = payload.data[0].organization_id;
        for (let i = 0; i < payload.data.length; i++) {
          newOrgProps[payload.data[i].criterion_id] = {
            failed: false,
            loading: false,
            response: payload.data[i]
          };
        }
      }
      // -- Handle payloads with _no_ responses.
      else {
        // If there were no responses, try extracting the org ID _and_ criterion ID
        // from 'links' properties that may be present on the payload if it came from
        // the API. We'll use this to update the state as best as possible with the
        // info we have.
        if (has(payload, 'links.first')) {
          criterionId = extractCriterionIdFromUrl(payload.links.first);
          orgId = extractOrganizationIdFromUrl(payload.links.first);
          if (criterionId && orgId) {
            newOrgProps[criterionId] = {
              failed: false,
              loading: false,
              response: null
            };
          }
        }
      }

      // @TODO Would be good if we could remove a response from
      // redux that comes back as having been removed from server.

      let oldOrgProps = {};
      if (!isNil(orgId)) {
        oldOrgProps = get(state.data, orgId, null);
      }

      return {
        ...state,
        data: {
          ...state.data,
          [orgId]: {
            ...oldOrgProps,
            ...newOrgProps
          }
        }
      };
    },
    [fetchOrganizationResponsesFailure]: (state, { payload }) => {
      // Not a lot we can do for a failed request, so log it to the
      // console with some debugging.
      console.error('fetchOrganizationResponsesFailure', state, payload);

      // Try to extract org and criterion info from URLs included in
      // returned payload. (though if req failed, it may not be possible)
      let oId = null;
      let cId = null;
      if (has(payload, 'links.first')) {
        cId = extractCriterionIdFromUrl(payload.links.first);
        oId = extractOrganizationIdFromUrl(payload.links.first);
      }

      // We only do this if it was a single-criterion request and we
      // were able to extract that info.
      if (oId && cId) {
        let oldOrgEntry = get(state.data, oId, {});
        let newOrgEntry = {
          ...oldOrgEntry,
          [cId]: {
            failed: true,
            loading: false,
            response: null
          }
        };

        return {
          ...state,
          data: {
            ...state.data,
            [oId]: newOrgEntry
          }
        };
      }

      // Otherwise, just return an unmodified copy of state.
      return { ...state };
    }
  },
  initialState
);

/**
 * Get the numeric value of a criterion_id parameter from an API request URL, if any.
 *
 * @param {string} url
 * @returns {int|null}
 */
const extractCriterionIdFromUrl = url => {
  let _url = new URL(url);
  let cId = _url.searchParams.get('criterion_id');
  if (cId && isNumeric(cId)) {
    return cId;
  }
  return null;
};

/**
 * Get the organization ID segment value from an API request URL.
 *
 * @param {string} url
 * @returns {int|null} ID or null if not extraction failed.
 */
const extractOrganizationIdFromUrl = url => {
  let _url = new URL(url);
  let path = _url.pathname;
  let regEx = /\/?api\/v1\/organizations\/([\d]+)\/responses\/?$/i;
  let result = regEx.exec(path);

  // Result should be an array where the second item is the
  // org ID.
  if (result && isArray(result) && result.length > 1 && isNumeric(result[1])) {
    return Number(result[1]);
  }
  return null;
};
