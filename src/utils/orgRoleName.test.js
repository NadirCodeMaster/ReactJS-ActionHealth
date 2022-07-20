import orgRoleName from './orgRoleName';

const mockIdOrObj2 = {
  id: 71470,
  name: 'Abbott-Abbott',
  organization_role_id: 100
};

const mockOrgRoles = {
  '100': {
    id: 100,
    machine_name: 'guest',
    name: 'Guest'
  },
  '200': {
    id: 200,
    machine_name: 'team_member',
    name: 'Team Member'
  }
};

test('Given an idOrObj and  orgRoles, return the role name', () => {
  expect(orgRoleName(mockIdOrObj2, mockOrgRoles, 'n/a')).toEqual(
    expect.stringContaining('Guest')
  );
});
