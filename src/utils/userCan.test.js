import userCan from './userCan';

const currentUserAdmin = {
  isAdmin: true,
  data: {
    id: 51
  }
};

const currentUserNonAdmin = {
  isAdmin: false,
  data: {
    id: 50
  }
};

const mockOrgObjWithPivot = {
  id: 1,
  requester_pivot: {},
  pivot: {
    user_id: 50,
    access_approved_at: '2019-07-11 17:11:17'
  },
  requester_permissions: ['edit_assessment', 'view_responses', 'view_team']
};

const mockOrgObjWithRequesterPivot = {
  id: 1,
  pivot: {},
  requester_pivot: {
    user_id: 50,
    access_approved_at: null
  }
};

test('Correct boolean is returned for admin', () => {
  let res;

  //Sample edit/view actions, admin should be able to do all of them
  res = userCan(currentUserAdmin, mockOrgObjWithPivot, 'edit_action_plan');
  expect(res).toBeTruthy();

  res = userCan(currentUserAdmin, mockOrgObjWithPivot, 'edit_assessment');
  expect(res).toBeTruthy();

  res = userCan(currentUserAdmin, mockOrgObjWithPivot, 'view_team');
  expect(res).toBeTruthy();
});

test('Pending user cannot make edits or view critical org info like teams', () => {
  let res;

  res = userCan(
    currentUserNonAdmin,
    mockOrgObjWithRequesterPivot,
    'edit_assessment'
  );
  expect(res).toBeFalsy();

  res = userCan(currentUserNonAdmin, mockOrgObjWithRequesterPivot, 'view_team');
  expect(res).toBeFalsy();
});

test('Non admin user can do actions defined in requester_permissions array of org obj', () => {
  let res;

  res = userCan(currentUserNonAdmin, mockOrgObjWithPivot, 'edit_assessment');
  expect(res).toBeTruthy();

  res = userCan(currentUserNonAdmin, mockOrgObjWithPivot, 'view_team');
  expect(res).toBeTruthy();

  res = userCan(currentUserNonAdmin, mockOrgObjWithPivot, 'view_responses');
  expect(res).toBeTruthy();
});
