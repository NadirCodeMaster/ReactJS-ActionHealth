import { handleActions, combineActions } from 'redux-actions';
import {
  forgotPasswordEditEmail,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  reactivateAccountStart,
  reactivateAccountSuccess,
  reactivateAccountFailure
} from 'store/actions';

const initialState = {
  message: null,
  address: '',
  errors: [],
  loading: false,
  succeeded: false,
  failed: false
};

export default handleActions(
  {
    [combineActions(forgotPasswordStart, reactivateAccountStart)]: (
      state,
      { payload }
    ) => ({
      ...state,
      loading: true,
      succeeded: false,
      failed: false
    }),
    [reactivateAccountSuccess]: (state, { payload }) => ({
      ...state,
      errors: [],
      loading: false,
      message: 'To finish reactivating your account, please check your email!',
      succeeded: true,
      failed: false
    }),
    [reactivateAccountFailure]: (state, { payload }) => ({
      ...state,
      errors: [
        'Error reactivating account. Are you sure the account was deactivated?'
      ],
      loading: false,
      succeeded: false,
      failed: true
    }),

    [forgotPasswordSuccess]: (state, { payload }) => ({
      ...state,
      errors: [],
      loading: false,
      address: '',
      message: 'Please check your email to reset your password!',
      succeeded: true,
      failed: false
    }),
    [forgotPasswordFailure]: (state, { payload }) => ({
      errors: [
        'Error resetting password. Please make sure the email address is in use.'
      ],
      loading: false,
      succeeded: false,
      failed: true
    }),
    [forgotPasswordEditEmail]: (state, { payload }) => ({
      ...state,
      address: payload.email,
      message: '',
      errors: []
    })
  },
  initialState
);
