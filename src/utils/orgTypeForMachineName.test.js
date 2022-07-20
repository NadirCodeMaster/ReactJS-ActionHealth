import orgTypeForMachineName from './orgTypeForMachineName';

const mockOrganizationTypes = {
  '100': {
    id: 100,
    machine_name: 'school'
  },
  '200': {
    id: 200,
    machine_name: 'district'
  }
};

test('Return object of org type for specified machine_name', () => {
  expect(orgTypeForMachineName('school', mockOrganizationTypes)).toEqual(
    expect.objectContaining({
      machine_name: 'school'
    })
  );
});
