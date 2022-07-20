import orgRoleCanManageOrgRole from './orgRoleCanManageOrgRole';

const mockOrgRole1 = {
  id: 200,
  weight: 100
};

const mockOrgRole2 = {
  id: 100,
  weight: 0
};

test('Admin user will return true', () => {
  expect(orgRoleCanManageOrgRole(true, null, mockOrgRole2)).toBe(true);
});

test('NonAdmin user will null orgRole1 will return false', () => {
  expect(orgRoleCanManageOrgRole(false, null, mockOrgRole2)).toBe(false);
});

test('NonAdmin with higher weight orgRole1 than orgRole 2 returns true', () => {
  expect(orgRoleCanManageOrgRole(false, mockOrgRole1, mockOrgRole2)).toBe(true);
});
