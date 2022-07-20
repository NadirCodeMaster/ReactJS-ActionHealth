import { handleActions } from 'redux-actions';
import { difference, keyBy, map, merge } from 'lodash';

import {
  fetchContentsStart,
  fetchContentsSuccess,
  fetchContentsFailure
} from 'store/actions';

const initialState = {
  loading: [], // array of machine_name's that are currently loading
  loaded: [], // array of machine_name's that have been loaded successfully
  failed: false, // Whether latest request for item/items failed (set false on new starts)
  data: {} // key by machine_name
};

export default handleActions(
  {
    [fetchContentsStart]: (state, { payload }) => {
      let machineNameArray = payload.machine_name.split(',');
      return {
        ...state,
        failed: false,
        loading: merge(state.loading, machineNameArray),
        loaded: difference(state.loaded, machineNameArray)
      };
    },
    [fetchContentsSuccess]: (state, { payload }) => {
      let machineNameArray = map(payload.data, 'machine_name');
      return {
        ...state,
        loading: difference(state.loading, machineNameArray),
        loaded: merge(state.loaded, machineNameArray),
        data: {
          ...state.data,
          ...keyBy(payload.data, 'machine_name')
        }
      };
    },
    [fetchContentsFailure]: () => ({
      ...initialState,
      failed: true,
      loading: []
    })
  },
  initialState
);
