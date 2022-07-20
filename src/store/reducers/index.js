import { combineReducers } from 'redux';

import appMetaReducers from './app_meta';
import authReducers from './auth';
import contentsReducers from './contents';
import changePasswordReducers from './change_password';
import forgotPasswordReducers from './forgot_password';
import organizationResponsesReducers from './organization_responses';
import programsReducers from './programs';
import setsReducers from './sets';

export default combineReducers({
  app_meta: appMetaReducers,
  auth: authReducers,
  contents: contentsReducers,
  change_password: changePasswordReducers,
  forgot_password: forgotPasswordReducers,
  organization_responses: organizationResponsesReducers,
  programs: programsReducers,
  sets: setsReducers
});
