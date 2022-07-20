import isResourceDetailUrl from './isResourceDetailUrl';

const originResourcePath = document.location.origin + `/app/resources`;

test('Given url beginning with document.location.origin value, return true', () => {
  expect(isResourceDetailUrl(originResourcePath)).toEqual(true);
});

test('Given a non document.location.origin url, return false', () => {
  expect(isResourceDetailUrl('http://www.google.com/app/resources')).toEqual(
    false
  );
});
