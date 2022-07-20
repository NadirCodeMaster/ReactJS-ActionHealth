import programBranding from './programBranding';

test('Return truthy if given valid program machine_name rise', () => {
  expect(programBranding('rise')).toBeTruthy();
});

test('Return truthy if given valid program machine_name quickstart', () => {
  expect(programBranding('quickstart')).toBeTruthy();
});

test('Return falsy if given invalid program machine_name hsp', () => {
  expect(programBranding('hsp')).toBeFalsy();
});
