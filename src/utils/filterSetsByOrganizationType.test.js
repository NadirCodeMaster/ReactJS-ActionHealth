import filterSetsByOrganizationType from './filterSetsByOrganizationType';

const mockSets = {
  '1': {
    organization_type_id: 100
  },
  '2': {
    organization_type_id: 200
  }
};

test('Given set data and orgTypeId, returns filtered sets', () => {
  expect(filterSetsByOrganizationType(mockSets, 100)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        organization_type_id: 100
      })
    ])
  );
});
