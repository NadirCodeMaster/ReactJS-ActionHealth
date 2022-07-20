import { all } from 'redux-saga/effects';

import accountActivationSagas from './account_activation';
import appMetaSagas from './app_meta';
import authSagas from './auth';
import contentsSagas from './contents';
import changePasswordSagas from './change_password';
import forgotPasswordSagas from './forgot_password';
import organizationResponsesSagas from './organization_responses';
import programsSagas from './programs';
import setsSagas from './sets';
import registerSagas from './register';
import resetPasswordSagas from './reset_password';

export default function* rootSaga(context) {
  yield all([
    accountActivationSagas(context),
    appMetaSagas(context),
    authSagas(context),
    contentsSagas(context),
    changePasswordSagas(context),
    forgotPasswordSagas(context),
    organizationResponsesSagas(context),
    programsSagas(context),
    setsSagas(context),
    registerSagas(context),
    resetPasswordSagas(context)
  ]);
}
