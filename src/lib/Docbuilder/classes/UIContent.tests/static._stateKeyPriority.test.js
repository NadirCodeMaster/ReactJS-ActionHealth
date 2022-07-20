import UIC from '../UIContent';

test('Minimum value returned is 0', () => {
  expect(UIC._stateKeyPriority('***')).toEqual(0);
});

test('Wildcards reduce priority more in later positions', () => {
  // ----------------
  // One fixed value.
  // -- *x*
  expect(UIC._stateKeyPriority('*x*')).toBeGreaterThan(UIC._stateKeyPriority('x**'));
  // -- **x
  expect(UIC._stateKeyPriority('**x')).toBeGreaterThan(UIC._stateKeyPriority('*x*'));
  expect(UIC._stateKeyPriority('**x')).toBeGreaterThan(UIC._stateKeyPriority('x**'));

  // ----------------
  // Two fixed values.
  // -- *xx
  expect(UIC._stateKeyPriority('*xx')).toBeGreaterThan(UIC._stateKeyPriority('xx*'));
  expect(UIC._stateKeyPriority('*xx')).toBeGreaterThan(UIC._stateKeyPriority('x*x'));
  // -- x*x
  expect(UIC._stateKeyPriority('x*x')).toBeGreaterThan(UIC._stateKeyPriority('xx*'));
});

test('Less wildcards always results in higher priority than more', () => {
  // ----------------------------
  // One fixed value in subject.
  expect(UIC._stateKeyPriority('x**')).toBeGreaterThan(UIC._stateKeyPriority('***'));
  expect(UIC._stateKeyPriority('*x*')).toBeGreaterThan(UIC._stateKeyPriority('***'));
  expect(UIC._stateKeyPriority('**x')).toBeGreaterThan(UIC._stateKeyPriority('***'));

  // ----------------------------
  // Two fixed values in subject.
  // - xx*
  expect(UIC._stateKeyPriority('xx*')).toBeGreaterThan(UIC._stateKeyPriority('x**'));
  expect(UIC._stateKeyPriority('xx*')).toBeGreaterThan(UIC._stateKeyPriority('*x*'));
  expect(UIC._stateKeyPriority('xx*')).toBeGreaterThan(UIC._stateKeyPriority('**x'));
  // - x*x
  expect(UIC._stateKeyPriority('x*x')).toBeGreaterThan(UIC._stateKeyPriority('x**'));
  expect(UIC._stateKeyPriority('x*x')).toBeGreaterThan(UIC._stateKeyPriority('*x*'));
  expect(UIC._stateKeyPriority('x*x')).toBeGreaterThan(UIC._stateKeyPriority('**x'));
  // - *xx
  expect(UIC._stateKeyPriority('*xx')).toBeGreaterThan(UIC._stateKeyPriority('x**'));
  expect(UIC._stateKeyPriority('*xx')).toBeGreaterThan(UIC._stateKeyPriority('*x*'));
  expect(UIC._stateKeyPriority('*xx')).toBeGreaterThan(UIC._stateKeyPriority('**x'));

  // ------------------------------
  // Three fixed values in subject.
  // -- One fixed value in comprison...
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('x**'));
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('*x*'));
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('**x'));
  // -- Two fixed values in comprison...
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('xx*'));
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('*xx'));
  expect(UIC._stateKeyPriority('xxx')).toBeGreaterThan(UIC._stateKeyPriority('x*x'));
});
