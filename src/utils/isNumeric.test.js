import isNumeric from './isNumeric';

test('Given sting containing number, return true', () => {
  expect(isNumeric('1')).toEqual(true);
});

test('Given number, return true', () => {
  expect(isNumeric(1)).toEqual(true);
});

test('Given non-numeric string, return false', () => {
  expect(isNumeric('test1')).toEqual(false);
});
