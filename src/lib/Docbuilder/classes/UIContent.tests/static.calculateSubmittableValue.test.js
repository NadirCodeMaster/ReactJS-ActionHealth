import UIC from '../UIContent';

const dNotSubmittable = {
  submittable: false
};

const dSubmittableImmediate = {
  submittable: true,
  submittable_lock_after: 0
};

const dSubmittableWithGracePeriod = {
  submittable: true,
  submittable_lock_after: 10000
};

test('Not submittable docbuilder returns "n"', () => {
  expect(UIC.calculateSubmittableValue(dNotSubmittable)).toEqual('n');
});

test('Submittable docbuilder w/out grace period returns "i"', () => {
  expect(UIC.calculateSubmittableValue(dSubmittableImmediate)).toEqual('i');
});

test('Submittable docbuilder w/grace period returns "g"', () => {
  expect(UIC.calculateSubmittableValue(dSubmittableWithGracePeriod)).toEqual('g');
});
