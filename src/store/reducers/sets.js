import { handleActions } from 'redux-actions';
import { keyBy, merge } from 'lodash';

import {
  fetchSetsStart,
  fetchSetsSuccess,
  fetchSetsFailure,
  logoutStart
} from 'store/actions';

const initialState = {
  loading: false, // Whether we're currently loading items
  loaded: false, // Whether we've attemped to load items yet (leave true once set)
  failed: false, // Whether latest request for item/items failed (set false on new starts)
  data: {} // key by id
};

export default handleActions(
  {
    [fetchSetsStart]: state => ({
      ...state,
      failed: false,
      loading: true,
      loaded: false
    }),
    [fetchSetsSuccess]: (state, { payload }) => ({
      ...state,
      loading: false,
      loaded: true,
      data: {
        ...state.data,
        ...keyBy(
          merge(payload.data, [
            {
              loading: false,
              loaded: true,
              failed: false
            }
          ]),
          'id'
        )
      }
    }),
    [fetchSetsFailure]: () => ({
      ...initialState,
      failed: true,
      loading: false
    }),
    [logoutStart]: state => ({
      ...initialState
    })
  },
  initialState
);
