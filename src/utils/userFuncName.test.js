import userFuncName from './userFuncName';

const mockIdOrgObj = {
  user_id: 51,
  organization_type_id: 200,
  user_function_id: 200
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

test('Given an idOrObj and userFuncs, return UF name', () => {
  expect(userFuncName(mockIdOrgObj, mockOrgRoles, 'n/a')).toEqual(
    expect.stringContaining('Team Member')
  );
});
