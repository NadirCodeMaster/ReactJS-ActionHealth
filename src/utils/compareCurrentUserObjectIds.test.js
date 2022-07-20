import compareCurrentUserObjectIds from './compareCurrentUserObjectIds';
import { cloneDeep } from 'lodash';

const validCurrentUserObject1 = {
  isAuthenticated: true,
  data: {
    id: 111
  }
};

const validCurrentUserObject2 = {
  isAuthenticated: true,
  data: {
    id: 222
  }
};

test('Identical currentUser object IDs return true', () => {
  let cloneOfValidCurrentUserObject1 = cloneDeep(validCurrentUserObject1);
  let res = compareCurrentUserObjectIds(
    validCurrentUserObject1,
    cloneOfValidCurrentUserObject1
  );
  expect(res).toEqual(true);
});

test('Different currentUser object IDs return false', () => {
  let res = compareCurrentUserObjectIds(
    validCurrentUserObject1,
    validCurrentUserObject2
  );
  expect(res).toEqual(false);
});

test('False isAuthenticated property prevents match', () => {
  let cloneOfValidCurrentUserObject1 = cloneDeep(validCurrentUserObject1);
  cloneOfValidCurrentUserObject1.isAuthenticated = false;
  let res = compareCurrentUserObjectIds(
    validCurrentUserObject1,
    cloneOfValidCurrentUserObject1
  );
  expect(res).toEqual(false);
});

test('null currentUser will not match', () => {
  let res = compareCurrentUserObjectIds(validCurrentUserObject1, null);
  expect(res).toEqual(false);
});

test('Empty currentUser object will not match', () => {
  let res = compareCurrentUserObjectIds(validCurrentUserObject1, {});
  expect(res).toEqual(false);
});

test('Missing data.id property prevents match', () => {
  let cloneOfValidCurrentUserObject1 = cloneDeep(validCurrentUserObject1);
  delete cloneOfValidCurrentUserObject1.data.id;
  let res = compareCurrentUserObjectIds(
    validCurrentUserObject1,
    cloneOfValidCurrentUserObject1
  );
  expect(res).toEqual(false);
});
