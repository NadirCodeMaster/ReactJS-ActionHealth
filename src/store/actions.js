import { createAction } from 'redux-actions';

// --------------------
// Account deactivation
// --------------------
export const deactivateAccount = createAction('DEACTIVATE_ACCOUNT');
export const deactivateAccountStart = createAction('DEACTIVATE_ACCOUNT_START');
export const deactivateAccountFailure = createAction('DEACTIVATE_ACCOUNT_FAILURE');
export const deactivateAccountSuccess = createAction('DEACTIVATE_ACCOUNT_SUCCESS');

// --------------------
// Account reactivation
// --------------------
export const reactivateAccount = createAction('REACTIVATE_ACCOUNT');
export const reactivateAccountStart = createAction('REACTIVATE_ACCOUNT_START');
export const reactivateAccountFailure = createAction('REACTIVATE_ACCOUNT_FAILURE');
export const reactivateAccountSuccess = createAction('REACTIVATE_ACCOUNT_SUCCESS');

// --------
// App meta
// --------
export const fetchAppMeta = createAction('FETCH_APP_META');
export const fetchAppMetaStart = createAction('FETCH_APP_META_START');
export const fetchAppMetaSuccess = createAction('FETCH_APP_META_SUCCESS');
export const fetchAppMetaFailure = createAction('FETCH_APP_META_FAILURE');

// -------
// Content
// -------
export const fetchContents = createAction('FETCH_CONTENTS');
export const fetchContentsStart = createAction('FETCH_CONTENTS_START');
export const fetchContentsSuccess = createAction('FETCH_CONTENTS_SUCCESS');
export const fetchContentsFailure = createAction('FETCH_CONTENTS_FAILURE');

// --------------------------
// Current user data: Refresh
// --------------------------
export const refreshCurrentUserData = createAction('REFRESH_CURRENT_USER_DATA');
export const refreshCurrentUserDataStart = createAction('REFRESH_CURRENT_USER_DATA_START');
export const refreshCurrentUserDataSuccess = createAction('REFRESH_CURRENT_USER_DATA_SUCCESS');
export const refreshCurrentUserDataFailure = createAction('REFRESH_CURRENT_USER_DATA_FAILURE');

// -----------------------------
// Current user data: Initialize
// -----------------------------
export const initializeCurrentUserData = createAction('INITIALIZE_CURRENT_USER_DATA');
export const initializeCurrentUserDataStart = createAction('INITIALIZE_CURRENT_USER_DATA_START');
export const initializeCurrentUserDataSuccess = createAction(
  'INITIALIZE_CURRENT_USER_DATA_SUCCESS'
);
export const initializeCurrentUserDataFailure = createAction(
  'INITIALIZE_CURRENT_USER_DATA_FAILURE'
);

// -----
// Login
// -----
export const attemptLogin = createAction('ATTEMPT_LOGIN');
export const loginStart = createAction('LOGIN_START');
export const loginSuccess = createAction('LOGIN_SUCCESS');
export const loginFailure = createAction('LOGIN_FAILURE');

// ------
// Logout
// ------
export const attemptLogout = createAction('ATTEMPT_LOGOUT');
export const logoutStart = createAction('LOGOUT_START');
export const logoutDone = createAction('LOGOUT_DONE');

// ----------------------
// ORGANIZATION RESPONSES
// ----------------------
export const fetchOrganizationResponses = createAction('FETCH_ORGANIZATION_RESPONSES');
export const fetchOrganizationResponsesStart = createAction('FETCH_ORGANIZATION_RESPONSES_START');
export const fetchOrganizationResponsesSuccess = createAction(
  'FETCH_ORGANIZATION_RESPONSES_SUCCESS'
);
export const fetchOrganizationResponsesFailure = createAction(
  'FETCH_ORGANIZATION_RESPONSES_FAILURE'
);

// ----------------
// Password: Change
// ----------------
export const changePassword = createAction('CHANGE_PASSWORD');
export const changePasswordStart = createAction('CHANGE_PASSWORD_START');
export const changePasswordSuccess = createAction('CHANGE_PASSWORD_SUCCESS');
export const changePasswordFailure = createAction('CHANGE_PASSWORD_FAILURE');

export const clearChangePasswordErrors = createAction('CLEAR_CHANGE_PASSWORD_ERRORS');

// ----------------
// Password: Forgot
// ----------------
export const attemptChangePassword = createAction('ATTEMPT_FORGOT_PASSWORD');
export const forgotPasswordEditEmail = createAction('FORGOT_PASSWORD_EDIT_EMAIL');
export const forgotPasswordStart = createAction('FORGOT_PASSWORD_START');
export const forgotPasswordSuccess = createAction('FORGOT_PASSWORD_SUCCESS');
export const forgotPasswordFailure = createAction('FORGOT_PASSWORD_FAILURE');

// ---------------
// Password: Reset
// ---------------
export const resetPassword = createAction('RESET_PASSWORD');
export const resetPasswordStart = createAction('RESET_PASSWORD_START');
export const resetPasswordSuccess = createAction('RESET_PASSWORD_SUCCESS');
export const resetPasswordFailure = createAction('RESET_PASSWORD_FAILURE');

// -----------------
// Programs (plural)
// -----------------
export const fetchPrograms = createAction('FETCH_PROGRAMS');
export const fetchProgramsStart = createAction('FETCH_PROGRAMS_START');
export const fetchProgramsSuccess = createAction('FETCH_PROGRAMS_SUCCESS');
export const fetchProgramsFailure = createAction('FETCH_PROGRAMS_FAILURE');

// ----------------
// Program (single)
// ----------------
export const fetchProgram = createAction('FETCH_PROGRAM');
export const fetchProgramStart = createAction('FETCH_PROGRAM_START');
export const fetchProgramSuccess = createAction('FETCH_PROGRAM_SUCCESS');
export const fetchProgramFailure = createAction('FETCH_PROGRAM_FAILURE');

// ------------
// Registration
// ------------
export const registerInit = createAction('REGISTER_INIT');
export const attemptRegister = createAction('ATTEMPT_REGISTER');
export const registerStart = createAction('REGISTER_START');
export const registerSuccess = createAction('REGISTER_SUCCESS');
export const registerFailure = createAction('REGISTER_FAILURE');

// ----
// Sets
// ----
export const fetchSets = createAction('FETCH_SETS');
export const fetchSetsStart = createAction('FETCH_SETS_START');
export const fetchSetsSuccess = createAction('FETCH_SETS_SUCCESS');
export const fetchSetsFailure = createAction('FETCH_SETS_FAILURE');
