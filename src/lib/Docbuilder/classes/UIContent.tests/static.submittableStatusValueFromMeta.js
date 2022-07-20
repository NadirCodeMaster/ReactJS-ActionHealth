import UIC from '../UIContent';

const now = '2022-01-01 00:00:00';

const submittableWithOutGracePeriodDocbuilder = {
  id: 10,
  submittable: true,
  submittable_lock_after: 0
};

const submittableWithGracePeriodDocbuilder = {
  id: 10,
  submittable: true,
  submittable_lock_after: 10000
};

const unsubmittableDocbuilder = {
  id: 10,
  submittable: false
};

const metaForNotSubmitted = {
  organization_id: null,
  docbuilder_id: null,
  submitted_at: null,
  lock_at: null
};

const metaForPending = {
  organization_id: 5,
  docbuilder_id: 10,
  submitted_at: '2021-11-11 00:00:00',
  lock_at: null
};

const metaForLocked = {
  organization_id: 5,
  docbuilder_id: 10,
  submitted_at: '2021-11-11 00:00:00',
  lock_at: '2021-12-11 00:00:00'
};

test('Empty docbuilder always results in the tbd value', () => {
  expect(UIC.submittableStatusValueFromMeta(null, null, now)).toBe(UIC.tbdValue);
  expect(UIC.submittableStatusValueFromMeta(null, metaForNotSubmitted, now)).toBe(UIC.tbdValue);
  expect(UIC.submittableStatusValueFromMeta(null, metaForPending, now)).toBe(UIC.tbdValue);
  expect(UIC.submittableStatusValueFromMeta(null, metaForLocked, now)).toBe(UIC.tbdValue);
});

test('Unsubmittable docbuilder always results in the n/a value', () => {
  expect(UIC.submittableStatusValueFromMeta(unsubmittableDocbuilder, null, now)).toBe(
    UIC.submittableStatusValues.NOT_APPLICABLE
  );

  expect(
    UIC.submittableStatusValueFromMeta(unsubmittableDocbuilder, metaForNotSubmitted, now)
  ).toBe(UIC.submittableStatusValues.NOT_APPLICABLE);

  expect(UIC.submittableStatusValueFromMeta(unsubmittableDocbuilder, metaForPending, now)).toBe(
    UIC.submittableStatusValues.NOT_APPLICABLE
  );

  expect(UIC.submittableStatusValueFromMeta(unsubmittableDocbuilder, metaForLocked, now)).toBe(
    UIC.submittableStatusValues.NOT_APPLICABLE
  );
});

test('Empty meta, submittable docbuilder w/out grace period results in the tbd value', () => {
  expect(
    UIC.submittableStatusValueFromMeta(submittableWithOutGracePeriodDocbuilder, null, now)
  ).toBe(UIC.submittableStatusValues.NOT_APPLICABLE);
  expect(
    UIC.submittableStatusValueFromMeta(
      submittableWithOutGracePeriodDocbuilder,
      metaForNotSubmitted,
      now
    )
  ).toBe(UIC.submittableStatusValues.NOT_APPLICABLE);
});

test('Empty meta, submittable docbuilder w/grace period results in the tbd value', () => {
  expect(UIC.submittableStatusValueFromMeta(submittableWithGracePeriodDocbuilder, null, now)).toBe(
    UIC.submittableStatusValues.NOT_APPLICABLE
  );
  expect(
    UIC.submittableStatusValueFromMeta(
      submittableWithGracePeriodDocbuilder,
      metaForNotSubmitted,
      now
    )
  ).toBe(UIC.submittableStatusValues.NOT_APPLICABLE);
});

test('Submittable docbuilder w/out grace period, PENDING meta results in LOCKED value', () => {
  // Note: A pending meta state on a docbuilder without a grace period shouldn't happen. Thus,
  // we expect this method to return locked instead of pending.
  expect(
    UIC.submittableStatusValueFromMeta(submittableWithOutGracePeriodDocbuilder, metaForPending, now)
  ).toBe(UIC.submittableStatusValues.SUBMITTED_AND_LOCKED);
});

test('Submittable docbuilder w/out grace period, locked meta results in locked value', () => {
  expect(
    UIC.submittableStatusValueFromMeta(submittableWithOutGracePeriodDocbuilder, metaForLocked, now)
  ).toBe(UIC.submittableStatusValues.SUBMITTED_AND_LOCKED);
});

test('Submittable docbuilder w/grace period, pending meta results in pending value', () => {
  expect(
    UIC.submittableStatusValueFromMeta(submittableWithGracePeriodDocbuilder, metaForPending, now)
  ).toBe(UIC.submittableStatusValues.SUBMITTED_AND_PENDING);
});

test('Submittable docbuilder w/grace period, locked meta results in locked value', () => {
  expect(
    UIC.submittableStatusValueFromMeta(submittableWithGracePeriodDocbuilder, metaForLocked, now)
  ).toBe(UIC.submittableStatusValues.SUBMITTED_AND_LOCKED);
});
