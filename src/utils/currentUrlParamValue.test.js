import currentUrlParamValue from './currentUrlParamValue';

test('Location with matching param returns its value', () => {
  let prefix = 'xyz_';
  let locationObject = {
    pathname: '/app/something',
    search: `?${prefix}param1=test&${prefix}param2=anothertest`,
    hash: ''
  };
  expect(currentUrlParamValue('param2', prefix, locationObject)).toEqual(
    'anothertest'
  );
});

test('Location without matching param returns default value argument', () => {
  let prefix = 'xyz_';
  let locationObject = {
    pathname: '/app/something',
    search: `?${prefix}param1=test&${prefix}param2=anothertest`,
    hash: ''
  };
  expect(
    currentUrlParamValue('not_a_param', prefix, locationObject, 'default_value')
  ).toEqual('default_value');
});

test('Location without matching param or default returns empty string', () => {
  let prefix = 'xyz_';
  let locationObject = {
    pathname: '/app/something',
    search: `?${prefix}param1=test&${prefix}param2=anothertest`,
    hash: ''
  };
  expect(currentUrlParamValue('not_a_param', prefix, locationObject)).toEqual(
    ''
  );
});
