import { handleActions } from 'redux-actions';
import { keyBy, merge } from 'lodash';

import {
  // Multiple
  fetchProgramsStart,
  fetchProgramsSuccess,
  fetchProgramsFailure,
  // Single
  fetchProgramStart,
  fetchProgramSuccess,
  fetchProgramFailure,
  // Logout
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
    // Multiple
    [fetchProgramsStart]: state => ({
      ...state,
      failed: false,
      loading: true,
      loaded: false
    }),
    [fetchProgramsSuccess]: (state, { payload }) => ({
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
    [fetchProgramsFailure]: () => ({
      ...initialState,
      failed: true,
      loading: false
    }),

    // Single
    [fetchProgramStart]: (state, { payload }) => ({
      ...state,
      data: {
        ...state.data,
        [payload]: {
          // set item as loading
          ...state.data[payload],
          loaded: false,
          loading: true,
          failed: false
        }
      }
    }),
    [fetchProgramSuccess]: (state, { payload }) => ({
      ...state,
      data: {
        ...state.data,
        [payload.data.id]: {
          // add/overwrite local instance of this program
          ...payload.data,
          loaded: true,
          loading: false,
          failed: false
        }
      }
    }),
    [fetchProgramFailure]: (state, { payload }) => ({
      ...state,
      data: {
        ...state.data
        // @TODO Remove item from redux store or flag w/errors (not sure yet how to get its id)
        // [payload.data.id]: {
        //   ...payload.data,
        //   loading: false,
        //   failed: true,
        // }
      }
    }),
    [logoutStart]: state => ({
      ...initialState
    })
  },
  initialState
);
