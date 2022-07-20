import { cloneDeep } from 'lodash';
import userIsPendingApprovalForOrg from './userIsPendingApprovalForOrg';

const mockUserId = 222;

const mockOrgObjWithPivot = {
  id: 111,
  requester_pivot: {},
  pivot: {
    user_id: 222,
    access_approved_at: '2019-07-11 17:11:17'
  }
};

const mockOrgObjWithRequesterPivot = {
  id: 111,
  pivot: {},
  requester_pivot: {
    user_id: 222,
    access_approved_at: '2019-07-11 17:11:17'
  }
};

test('User pending approval returns true', () => {
  let _mockOrgObj, res;

  // TEST WITH PIVOT PROPERTY.
  // -------------------------

  // Try with null approval date.
  _mockOrgObj = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObj.pivot.access_approved_at = null;
  res = userIsPendingApprovalForOrg(mockUserId, _mockOrgObj);
  expect(res).toBe(true);

  // Try with empty string approval date.
  _mockOrgObj = cloneDeep(mockOrgObjWithPivot);
  _mockOrgObj.pivot.access_approved_at = '';
  res = userIsPendingApprovalForOrg(mockUserId, _mockOrgObj);
  expect(res).toBe(true);

  // TEST WITH REQUESTER_PIVOT PROPERTY.
  // -----------------------------------

  // Try with null approval date.
  _mockOrgObj = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObj.requester_pivot.access_approved_at = null;
  res = userIsPendingApprovalForOrg(mockUserId, _mockOrgObj);
  expect(res).toBe(true);

  // Try with empty string approval date.
  _mockOrgObj = cloneDeep(mockOrgObjWithRequesterPivot);
  _mockOrgObj.requester_pivot.access_approved_at = '';
  res = userIsPendingApprovalForOrg(mockUserId, _mockOrgObj);
  expect(res).toBe(true);
});

test('User already approved returns false', () => {
  let res;

  // TEST WITH PIVOT PROPERTY.
  // -------------------------
  res = userIsPendingApprovalForOrg(mockUserId, mockOrgObjWithPivot);
  expect(res).toBe(false);

  // TEST WITH REQUESTER_PIVOT PROPERTY.
  // -----------------------------------
  res = userIsPendingApprovalForOrg(mockUserId, mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);
});

test('Unassociated user returns false', () => {
  let res;

  // TEST WITH PIVOT PROPERTY.
  // -------------------------
  res = userIsPendingApprovalForOrg(999, mockOrgObjWithPivot);
  expect(res).toBe(false);

  // TEST WITH REQUESTER_PIVOT PROPERTY.
  // -----------------------------------
  res = userIsPendingApprovalForOrg(999, mockOrgObjWithRequesterPivot);
  expect(res).toBe(false);
});
