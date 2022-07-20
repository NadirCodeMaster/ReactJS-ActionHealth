import isAbsoluteUrl from './isAbsoluteUrl';

test('Given a secure absolute URL, return true', () => {
  expect(isAbsoluteUrl('https://www.healthiergeneration.org/')).toEqual(true);
});

test('Given an insecure absolute URL, return true', () => {
  expect(isAbsoluteUrl('http://www.healthiergeneration.org/')).toEqual(true);
});

test('Given a root-relative URL, return false', () => {
  expect(isAbsoluteUrl('/app/account/dashboard/')).toEqual(false);
});

test('Given a relative URL, return false', () => {
  expect(isAbsoluteUrl('app/account/dashboard/')).toEqual(false);
});
