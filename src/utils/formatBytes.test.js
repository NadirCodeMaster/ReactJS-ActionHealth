import formatBytes from './formatBytes';

test('Convert large byte number to readable notation', () => {
  expect(formatBytes(4000000, 2)).toEqual('4 MB');
  expect(formatBytes('4200000000', 4)).toEqual('4.2 GB');
});
