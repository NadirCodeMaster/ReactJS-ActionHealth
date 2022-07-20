import { isString, startsWith } from 'lodash';
import authConfigs from 'constants/authConfigs';

/**
 * Validate the "appDest" url parameter.
 *
 * We use a URL parameter named appDest throughout the app to pass
 * intended destinations along to login and registration forms.
 *
 * @param {String} appDest
 * @returns boolean
 */
export default function validateAppDest(appDest) {
  // Sanity check of provided value.
  if (!appDest || !isString(appDest)) {
    return false;
  }

  // Check for supported values.
  // ---------------------------

  // -- Allow root-relative paths starting within /app
  if ('/app' === appDest.substring(0, 4)) {
    return true;
  }

  // -- Allow Docbuilder file upload URLs.
  let builderUploadPrefix = `${process.env.REACT_APP_API_URL}/builder-uploads/`;
  if (startsWith(appDest, builderUploadPrefix)) {
    return true;
  }

  // -- Allow SAML auth absolute URLs using configured API URL and the
  //    correct auth path.
  let samlAuthPrefix = `${process.env.REACT_APP_API_URL}${authConfigs.authSamlEndpointPath}`;
  if (startsWith(appDest, samlAuthPrefix)) {
    return true;
  }

  return false;
}
