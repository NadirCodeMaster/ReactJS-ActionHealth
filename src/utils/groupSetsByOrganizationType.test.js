import groupSetsByOrganizationType from './groupSetsByOrganizationType';

const mockSets = {
  '1': {
    id: 1,
    organization_type_id: 100
  },
  '2': {
    id: 2,
    organization_type_id: 200
  }
};

test('Given set, will return array containing objects with an ID', () => {
  expect(groupSetsByOrganizationType(mockSets)).toEqual(
    expect.objectContaining({
      100: expect.arrayContaining([
        expect.objectContaining({
          id: 1
        })
      ])
    })
  );
});
