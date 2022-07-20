import orgRoleForMachineName from './orgRoleForMachineName';

const mockOrgRoles = {
  '100': {
    id: 100,
    machine_name: 'guest'
  },
  '200': {
    id: 200,
    machine_name: 'team_member'
  },
  '300': {
    id: 300,
    machine_name: 'program_manager_onsite'
  }
};

test('Gets orgRole object for given machineName', () => {
  expect(orgRoleForMachineName('team_member', mockOrgRoles)).toEqual(
    expect.objectContaining({
      id: 200
    })
  );
});
