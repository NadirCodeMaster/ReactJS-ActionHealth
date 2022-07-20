import { runSaga } from 'redux-saga';

/**
 * Records saga actions in 'dispatched' array.  runSaga allows us to
 * run a saga from start to finish and record actions that occured
 * along the way without having to .next() manually through the entire thing.
 */
export async function recordSaga(saga, action, params = {}) {
  const dispatched = [];

  await runSaga(
    {
      dispatch: action => dispatched.push(action)
    },
    saga,
    action,
    params
  ).done;

  return dispatched;
}
