import authConfigs from 'constants/authConfigs';
import validateAppDest from './validateAppDest';

test('Given a string starting with /app, return true', () => {
  expect(validateAppDest('/app/account/')).toEqual(true);
});

test('Given a string starting with the configued SSO SAML endpoint, return true', () => {
  expect(
    validateAppDest(
      `${process.env.REACT_APP_API_URL}${authConfigs.authSamlEndpointPath}?something=1`
    )
  ).toEqual(true);
});

test('Given a string starting with the docbuilder file upload URL prefix, return true', () => {
  expect(validateAppDest(`${process.env.REACT_APP_API_URL}/builder-uploads/123`)).toEqual(true);
});

test('Given a relative path, return false', () => {
  expect(validateAppDest('account/organizations/')).toEqual(false);
});

test('Given a string with app, return false', () => {
  expect(validateAppDest('app/account/')).toEqual(false);
});
