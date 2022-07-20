import validDownloadableSetUrl from './validDownloadableSetUrl';

test('Returns true if an absolute URL is given', () => {
  expect(
    validDownloadableSetUrl('https://www.healthiergeneration.org/')
  ).toBeTruthy();
});

test('Returns false if a non-absolute URL is given', () => {
  expect(validDownloadableSetUrl('healthiergeneration.org')).toBeFalsy();
});
