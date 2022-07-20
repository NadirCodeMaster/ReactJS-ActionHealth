import isUrlSlug from './isUrlSlug';

let slug1 = 'valid-slug';
let slug2 = 'InVaLiD sLuG';

test('valid slug will return true', () => {
  expect(isUrlSlug(slug1)).toEqual(true);
});

test('invalid slug will return false', () => {
  expect(isUrlSlug(slug2)).toEqual(false);
});
