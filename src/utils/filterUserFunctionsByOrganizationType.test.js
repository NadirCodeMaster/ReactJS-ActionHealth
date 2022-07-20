import filterUserFunctionsByOrganizationType from './filterUserFunctionsByOrganizationType';

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

const mockUserFunctions = [
  {
    id: 100,
    machine_name: 'school_community_member',
    name: 'Community member',
    user_function_category_id: 105
  },
  {
    id: 104,
    machine_name: 'school_principal',
    name: 'Principal',
    user_function_category_id: 100
  }
];

test('Given set data and organization_type_id, returns filtered User Functions', () => {
  expect(
    filterUserFunctionsByOrganizationType(
      mockUserFunctions,
      mockUserFunctionCategories,
      100
    )
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Principal'
      })
    ])
  );
});

test('Do not return User functions not in organizationTypeId', () => {
  expect(
    filterUserFunctionsByOrganizationType(
      mockUserFunctions,
      mockUserFunctionCategories,
      100
    )
  ).toEqual(
    expect.arrayContaining([
      expect.not.objectContaining({
        name: 'Administration'
      })
    ])
  );
});
