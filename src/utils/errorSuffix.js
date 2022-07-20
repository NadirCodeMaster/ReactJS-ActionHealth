import { get } from 'lodash';

/**
 * Export error suffix for 404 and 500 errors
 *
 * @param Object error
 * @return String
 */
export default function errorSuffix(error) {
  let errorStatus = get(error, 'response.status', null);
  let errorSuffix = '';

  if (errorStatus === 402 || errorStatus === 404 || errorStatus === 500) {
    errorSuffix = 'Please and try again.';
  }

  return errorSuffix;
}
