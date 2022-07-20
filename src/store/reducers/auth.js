import {
  // Request user data from the server for whomever is currently
  // authenticated, if anyone (only the server will know that).
  // This should be called on initial loading of the app (so we
  // can figure out if they're authenticated, and if so, who they
  // are) AND called upon successful login so we can get their info.
  initializeCurrentUserDataStart,
  initializeCurrentUserDataSuccess,
  initializeCurrentUserDataFailure,

  // Retrieve latest data from server for a currently authenticated
  // user that has already had "initializeCurrentUserData" action
  // performed. Unlike that action, this one is intended to work
  // behind the scenes; it doesn't modify things like "loading"
  // or "bootstrapped".
  refreshCurrentUserDataStart,
  refreshCurrentUserDataSuccess,
  refreshCurrentUserDataFailure,

  // login
  loginStart,
  loginSuccess,
  loginFailure,

  // logout
  logoutStart,
  logoutDone,

  // registration
  registerInit,
  registerStart,
  registerFailure,

  // acct activation
  deactivateAccountSuccess,

  // password
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure
} from 'store/actions';

import { handleActions } from 'redux-actions';
const initialState = {
  currentUser: {
    // Bootstrapped represents that the initial "bootstrapping" phase of
    // establishing whether the current user is authenticated or not has
    // completed.
    bootstrapped: false,
    loading: false, // Whether we're currently loading user
    loaded: false, // Whether we've loaded the user yet (leave true once set)
    isAuthenticated: false,
    isAdmin: false,
    errors: [],
    data: {}
  },
  resetPassword: {
    loading: false,
    errors: [],
    message: '',
    succeeded: false,
    failed: false
  }
};

export default handleActions(
  {
    [refreshCurrentUserDataStart]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser
        // Note: we omit loading/loaded here since the user should
        // already be bootstrapped. This prevents unnecessary
        // disruption to the UI that isn't helpful (i.e.,
        // things being hidden because currentUser.loading).
      }
    }),
    [refreshCurrentUserDataSuccess]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        data: payload,
        errors: []
      }
    }),
    [refreshCurrentUserDataFailure]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        errors: payload.errors
      }
    }),
    [initializeCurrentUserDataStart]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        bootstrapped: false,
        data: {},
        errors: [],
        isAdmin: false,
        loading: true,
        loaded: false
      }
    }),
    [initializeCurrentUserDataSuccess]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        bootstrapped: true,
        data: payload,
        errors: [],
        isAdmin: payload.system_role_machine_name === 'admin',
        isAuthenticated: Boolean(payload.id),
        loaded: true,
        loading: false
      }
    }),
    [initializeCurrentUserDataFailure]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        bootstrapped: true,
        errors: payload.errors,
        loading: false
      }
    }),
    [registerInit]: state => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        errors: []
      }
    }),
    [registerStart]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        loading: true,
        errors: []
      }
    }),
    [registerFailure]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        loading: false,
        errors: payload.errors
      }
    }),
    [logoutStart]: (state, { payload }) => ({
      ...state
    }),
    [logoutDone]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        isAuthenticated: false,
        isAdmin: false,
        errors: [],
        data: {}
      }
    }),
    [loginStart]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        loading: true,
        errors: []
      }
    }),
    [deactivateAccountSuccess]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        isAuthenticated: false,
        isAdmin: false,
        data: {}
      }
    }),
    [loginSuccess]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        isAuthenticated: true,
        errors: []
      }
    }),
    [loginFailure]: (state, { payload }) => ({
      ...state,
      currentUser: {
        ...state.currentUser,
        loading: false,
        errors: ['Log in credentials are invalid']
      }
    }),
    // reset password
    [resetPasswordStart]: (state, { payload }) => ({
      ...state,
      resetPassword: {
        ...state.resetPassword,
        loading: true,
        succeeded: false,
        failed: false
      }
    }),
    [resetPasswordSuccess]: (state, { payload }) => ({
      ...state,
      resetPassword: {
        ...state.resetPassword,
        loading: false,
        message: 'Password successfully reset!',
        succeeded: true,
        failed: false
      }
    }),
    [resetPasswordFailure]: (state, { payload }) => {
      return {
        ...state,
        resetPassword: {
          ...state.resetPassword,
          loading: false,
          errors: [resetPasswordErrorMessages(payload)],
          succeeded: false,
          failed: true
        }
      };
    }
  },
  initialState
);

// @TODO Gotta be a better place for this.
const resetPasswordErrorMessages = errorCode => {
  switch (errorCode) {
    case 'passwords.user':
      return 'The user account provided appears to be invalid.';
    case 'passwords.password':
      return "The password provided doesn't appear to meet our requirements. Please try another.";
    case 'passwords.token':
      return 'The provided token appears to be invalid or has already been used. Please request another password reset to try again.';
    default:
      return 'There was an unexpected error resetting your password. Please email us at help@healthiergeneration.org for assistance.';
  }
};
