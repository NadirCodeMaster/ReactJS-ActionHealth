import { handleActions } from 'redux-actions';
import values from 'lodash/values';
import get from 'lodash/get';
import {
  changePasswordFailure,
  changePasswordStart,
  changePasswordSuccess,
  clearChangePasswordErrors,
  logoutStart
} from 'store/actions';

const initialState = {
  updating: false,
  failed: false,
  errors: []
};

export default handleActions(
  {
    [changePasswordStart]: (state, { payload }) => ({
      ...state,
      updating: true,
      failed: false,
      errors: []
    }),

    [changePasswordSuccess]: state => ({
      ...state,
      updating: false,
      message: 'Password changed!'
    }),

    [changePasswordFailure]: (state, { payload }) => ({
      ...state,
      updating: false,
      failed: true,
      errors: values(
        get(payload, 'response.data.errors', {
          standard: 'Error updating the password!'
        })
      )
    }),

    [clearChangePasswordErrors]: state => ({
      ...state,
      errors: []
    }),

    [logoutStart]: state => ({
      ...initialState
    })
  },
  initialState
);
