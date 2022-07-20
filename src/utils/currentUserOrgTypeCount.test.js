import currentUserOrgTypeCount from './currentUserOrgTypeCount';

const mockOrgTypes = {
  // @see appMeta.organizationTypes
  100: {
    id: 100,
    machine_name: 'school'
  },
  200: {
    id: 200,
    machine_name: 'district'
  },
  300: {
    id: 300,
    machine_name: 'ost'
  }
};

const mockCurrentUserData = {
  id: 10,
  organization_counts: {
    100: 8,
    200: 0,
    300: 5
  }
};

test('Correct organization type counts are returned', () => {
  let res;

  res = currentUserOrgTypeCount('school', mockCurrentUserData, mockOrgTypes);
  expect(res).toBe(8);

  res = currentUserOrgTypeCount('district', mockCurrentUserData, mockOrgTypes);
  expect(res).toBe(0);

  res = currentUserOrgTypeCount('ost', mockCurrentUserData, mockOrgTypes);
  expect(res).toBe(5);
});
