import isMachineName from './isMachineName';

let mn1 = 'valid_machine_name';
let mn2 = 'InVaLiD mAcHiNeNaMe';

test('valid machine name will return true', () => {
  expect(isMachineName(mn1)).toEqual(true);
});

test('invalid machine name will return false', () => {
  expect(isMachineName(mn2)).toEqual(false);
});
