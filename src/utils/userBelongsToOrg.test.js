import { cloneDeep } from 'lodash';
import userBelongsToOrg from './userBelongsToOrg';

const mockUserId = 222;

const mockOrgObjWithPivot = {
  id: 111,
  pivot: {
    user_id: 222,
    access_approved_at: '2019-07-11 17:11:17'
  },
  requester_pivot: null
};

const mockOrgObjWithRequesterPivot = {
  id: 111,
  pivot: null,
  requester_pivot: {
    user_id: 222,
    access_approved_at: '2019-07-11 17:11:17'
  }
};

test('User with active direct relationship to organization returns true', () => {
  let res;

  // Using pivot property.
  // ---------------------
  res = userBelongsToOrg(mockUserId, mockOrgObjWithPivot);
  expect(res).toBe(true);

  // Using requester_pivot property.
  // -------------------------------
  res = userBelongsToOrg(mockUserId, mockOrgObjWithRequesterPivot);
  expect(res).toBe(true);
});

test('User with inactive direct relationship to organization returns false', () => {
  let res, _mockOrgObjWithPivot, _mockOrgObjWithRequesterPivot;

  // Using pivot property.
  // ---------------------

  // Try with null access_approved_at
  _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObjWithPivot.pivot.access_approved_at = null;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot);
  expect(res).toBe(false);

  // Try with '' access_approved_at
  _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObjWithPivot.pivot.access_approved_at = '';

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot);
  expect(res).toBe(false);

  // Try without access_approved_at existing at all
  _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  delete _mockOrgObjWithPivot.pivot.access_approved_at;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot);
  expect(res).toBe(false);

  // Using requester_pivot property.
  // -------------------------------

  // Try with null access_approved_at
  _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObjWithRequesterPivot.requester_pivot.access_approved_at = null;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);

  // Try with '' access_approved_at
  _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObjWithRequesterPivot.requester_pivot.access_approved_at = '';

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);

  // Try without access_approved_at existing at all
  _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  delete _mockOrgObjWithRequesterPivot.requester_pivot.access_approved_at;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);
});

test('Passing allowPending=true allows user with inactive direct relationship to organization to return true', () => {
  let res;

  // Using pivot property.
  // ---------------------

  let _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObjWithPivot.pivot.access_approved_at = null;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot, true);
  expect(res).toBe(true);

  // Using requester_pivot property.
  // -------------------------------
  let _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObjWithRequesterPivot.requester_pivot.access_approved_at = null;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithRequesterPivot, true);
  expect(res).toBe(true);
});

test('User not in pivot record returns false', () => {
  let res;

  // Using pivot property.
  // ---------------------

  let _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObjWithPivot.pivot.user_id = 999;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot);
  expect(res).toBe(false);

  // Using requester_pivot property.
  // -------------------------------

  let _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObjWithRequesterPivot.requester_pivot.user_id = 999;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);
});

test('Org without a pivot property returns false', () => {
  let res;

  // Using pivot property.
  // ---------------------
  let _mockOrgObjWithPivot = cloneDeep(mockOrgObjWithPivot);
  delete _mockOrgObjWithPivot.pivot;

  res = userBelongsToOrg(mockUserId, _mockOrgObjWithPivot);
  expect(res).toBe(false);

  // Using requester_pivot property.
  // -------------------------------
  let _mockOrgObjWithRequesterPivot = cloneDeep(mockOrgObjWithRequesterPivot);
  delete _mockOrgObjWithRequesterPivot.requester_pivot;
});
