import { runSaga } from 'redux-saga';
import { recordSaga } from './sagas/testUtils/recordSaga';
import {
  fetchAppMeta,
  fetchAppMetaStart,
  fetchAppMetaSuccess,
  fetchAppMetaFailure
} from 'store/actions';
import { fetcherForSagas } from 'store/fetcherForSagas';
import { requestAppMeta } from 'api/requests.js';

/**
 * fetcherForSagas unit test.  We use fetchAppMeta actions as sample parameters.
 */
describe('call requestAppMeta', () => {
  let requestAppMetaDummy = requestAppMeta;
  requestAppMetaDummy = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call api and dispatch success action if call returns 200', async () => {
    requestAppMetaDummy.mockImplementation(() => {
      return { data: true, status: 200 };
    });

    const dispatched = await recordSaga(
      fetcherForSagas({
        start: fetchAppMetaStart,
        success: ({ data, ...other }) =>
          fetchAppMetaSuccess({ data, ...other }),
        failure: fetchAppMetaFailure,
        request: () => requestAppMetaDummy()
      }),
      fetchAppMeta
    );

    let dispatchedContainsSuccess = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'FETCH_APP_META_SUCCESS';
      }).length > 0
    ) {
      dispatchedContainsSuccess = true;
    }

    expect(dispatchedContainsSuccess).toBeTruthy();
  });

  it('should call api and dispatch failure action if call returns non-200', async () => {
    requestAppMetaDummy.mockImplementation(() => {
      return { data: true, status: 500 };
    });

    const dispatched = await recordSaga(
      fetcherForSagas({
        start: fetchAppMetaStart,
        success: ({ data, ...other }) =>
          fetchAppMetaSuccess({ data, ...other }),
        failure: fetchAppMetaFailure,
        request: () => requestAppMetaDummy()
      }),
      fetchAppMeta
    );

    let dispatchedContainsFailure = false;
    if (
      dispatched.filter(function(e) {
        return e.type === 'FETCH_APP_META_FAILURE';
      }).length > 0
    ) {
      dispatchedContainsFailure = true;
    }

    expect(dispatchedContainsFailure).toBeTruthy();
  });
});
