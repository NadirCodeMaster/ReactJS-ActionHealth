import { runSaga } from 'redux-saga';
import { recordSaga } from './testUtils/recordSaga';
import {
  resetPassword,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure
} from 'store/actions';
import { handleResetPassword } from './reset_password';
import { requestPasswordResetChangePassword } from 'api/requests.js';

/**
 * reset_password > handleResetPassword generator function saga unit test.
 */
describe('call requestPasswordResetChangePassword', () => {
  let requestPasswordResetChangePasswordDummy = requestPasswordResetChangePassword;
  requestPasswordResetChangePasswordDummy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call api and dispatch success action if call returns 204', async () => {
    requestPasswordResetChangePasswordDummy.mockImplementation(() => {
      return { data: true, status: 204 };
    });

    const dispatched = await recordSaga(
      handleResetPassword,
      { type: 'RESET_PASSWORD', payload: { email: 'fake@gmail.com' } },
      requestPasswordResetChangePasswordDummy
    );

    let dispatchedContainsSuccess = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'RESET_PASSWORD_SUCCESS';
      }).length > 0
    ) {
      dispatchedContainsSuccess = true;
    }

    expect(dispatchedContainsSuccess).toBeTruthy();
  });

  it('should call api and dispatch failure action if call returns 400', async () => {
    requestPasswordResetChangePasswordDummy.mockImplementation(() => {
      return { data: true, status: 400 };
    });

    const dispatched = await recordSaga(
      handleResetPassword,
      { type: 'RESET_PASSWORD', payload: { email: 'fake@gmail.com' } },
      requestPasswordResetChangePasswordDummy
    );

    let dispatchedContainsFailure = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'RESET_PASSWORD_FAILURE';
      }).length > 0
    ) {
      dispatchedContainsFailure = true;
    }

    expect(dispatchedContainsFailure).toBeTruthy();
  });
});
