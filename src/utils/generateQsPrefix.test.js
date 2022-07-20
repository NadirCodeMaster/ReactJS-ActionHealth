import generateQsPrefix from './generateQsPrefix';

test('Given custom value that is a non-empty string, will return it', () => {
  expect(generateQsPrefix('xyz_default', 'xyz_custom')).toEqual('xyz_custom');
});

test('Given custom value that is an empty string, will return default', () => {
  expect(generateQsPrefix('xyz_default', '')).toEqual('xyz_default');
});

test('Given custom value that is null, will return default', () => {
  expect(generateQsPrefix('xyz_default', null)).toEqual('xyz_default');
});

test('Given a custom value that is not a string, will return default', () => {
  expect(generateQsPrefix('xyz_default', ['xyz_custom'])).toEqual(
    'xyz_default'
  );
  expect(generateQsPrefix('xyz_default', { xyz_custom: 'something' })).toEqual(
    'xyz_default'
  );
});
