import orgTypesByMachineName from './orgTypesByMachineName';

test('Values in submitted object are returned in a new object keyed by their machine_name value', () => {
  const mockOrgTypes = {
    100: {
      id: 100,
      machine_name: 'abc',
      name: 'Abc'
    },
    200: {
      id: 200,
      machine_name: 'xyz',
      name: 'Xyz'
    }
  };

  let res = orgTypesByMachineName(mockOrgTypes);

  expect(res).toEqual({
    abc: {
      id: 100,
      machine_name: 'abc',
      name: 'Abc'
    },
    xyz: {
      id: 200,
      machine_name: 'xyz',
      name: 'Xyz'
    }
  });
});
