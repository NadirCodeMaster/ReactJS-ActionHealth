import Submittable from '../Submittable';

const submittableDocbuilderWithGracePeriod = {
  submittable: true,
  submittable_lock_after: 1000
};

const submittableDocbuilderWithoutGracePeriod = {
  submittable: true,
  submittable_lock_after: 0
};

const notSubmittableDocbuilder = {
  submittable: false
};

test('Non-submittable docbuilder returns false', () => {
  expect(Submittable.isSubmittableWithoutGracePeriod(notSubmittableDocbuilder)).toEqual(false);
});

test('Submittable docbuilder with grace period returns false', () => {
  expect(Submittable.isSubmittableWithoutGracePeriod(submittableDocbuilderWithGracePeriod)).toEqual(
    false
  );
});

test('Submittable docbuilder without grace period returns true', () => {
  expect(
    Submittable.isSubmittableWithoutGracePeriod(submittableDocbuilderWithoutGracePeriod)
  ).toEqual(true);
});
