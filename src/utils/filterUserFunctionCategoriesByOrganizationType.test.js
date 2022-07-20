import filterUserFunctionCategoriesByOrganizationType from './filterUserFunctionCategoriesByOrganizationType';

const mockUserFunctionCategories = [
  {
    id: 100,
    organization_type_id: 100
  },
  {
    id: 101,
    organization_type_id: 200
  }
];

test('Given set data an organization_type_id, returns filtered UFCats', () => {
  expect(
    filterUserFunctionCategoriesByOrganizationType(
      mockUserFunctionCategories,
      100
    )
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        organization_type_id: 100
      })
    ])
  );
});
