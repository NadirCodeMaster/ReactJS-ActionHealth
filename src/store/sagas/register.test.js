import { runSaga } from 'redux-saga';
import { recordSaga } from './testUtils/recordSaga';
import MockError from './testUtils/mockError';
import {
  attemptRegister,
  registerStart,
  registerSuccess,
  registerFailure
} from 'store/actions';
import { handleAttemptRegister } from './register.js';
import { requestRegister } from 'api/requests.js';

/**
 * register > handleAttemptRegister generator function saga unit test.
 */
describe('call requestRegister', () => {
  let requestRegisterDummy = requestRegister;
  requestRegisterDummy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call api and dispatch success action if call returns 202', async () => {
    requestRegisterDummy.mockImplementation(() => {
      return { data: true, status: 202 };
    });

    const dispatched = await recordSaga(
      handleAttemptRegister,
      { type: 'ATTEMPT_REGISTER', payload: { email: 'fake@gmail.com' } },
      requestRegisterDummy
    );

    let dispatchedContainsSuccess = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'REGISTER_SUCCESS';
      }).length > 0
    ) {
      dispatchedContainsSuccess = true;
    }

    expect(dispatchedContainsSuccess).toBeTruthy();
  });

  it('should call api and dispatch failure action if call returns non-202', async () => {
    requestRegisterDummy.mockImplementation(() => {
      throw new MockError();
    });

    const dispatched = await recordSaga(
      handleAttemptRegister,
      { type: 'ATTEMPT_REGISTER', payload: { email: 'fake@gmail.com' } },
      requestRegisterDummy
    );

    let dispatchedContainsFailure = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'REGISTER_FAILURE';
      }).length > 0
    ) {
      dispatchedContainsFailure = true;
    }

    expect(dispatchedContainsFailure).toBeTruthy();
  });
});
