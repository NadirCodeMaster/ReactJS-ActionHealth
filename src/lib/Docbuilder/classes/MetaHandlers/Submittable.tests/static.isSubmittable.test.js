import Submittable from '../Submittable';

const submittableDocbuilder = {
  submittable: true
};

const notSubmittableDocbuilder = {
  submittable: false
};

test('Submittable docbuilder returns true', () => {
  expect(Submittable.isSubmittable(submittableDocbuilder)).toEqual(true);
});

test('Not submittable docbuilder returns false', () => {
  expect(Submittable.isSubmittable(notSubmittableDocbuilder)).toEqual(false);
});
