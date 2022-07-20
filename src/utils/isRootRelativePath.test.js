import isRootRelativePath from './isRootRelativePath';

test('Given an absolute URL, return false', () => {
  expect(isRootRelativePath('https://www.healthiergeneration.org/')).toEqual(
    false
  );
});

test('Given a relative path, return false', () => {
  expect(isRootRelativePath('app/account')).toEqual(false);
});

test('Given a root relative path, return true', () => {
  expect(isRootRelativePath('/app/account/dashboard/')).toEqual(true);
});
