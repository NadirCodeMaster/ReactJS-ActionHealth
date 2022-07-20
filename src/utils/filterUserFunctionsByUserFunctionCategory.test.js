import filterUserFunctionsByUserFunctionCategory from './filterUserFunctionsByUserFunctionCategory';

const mockUserFunctions = [
  {
    id: 100,
    machine_name: 'school_community_member',
    user_function_category_id: 105,
    default_organization_role_id: 100
  },
  {
    id: 105,
    machine_name: 'school_secondary_principal',
    user_function_category_id: 100,
    default_organization_role_id: 200
  }
];

test('Given an organization_type_id, returns filtered User Functions', () => {
  expect(
    filterUserFunctionsByUserFunctionCategory(mockUserFunctions, 100)
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        user_function_category_id: 100
      })
    ])
  );
});

test('Does not return User Functions that dont match organization_type_id', () => {
  expect(
    filterUserFunctionsByUserFunctionCategory(mockUserFunctions, 100)
  ).toEqual(
    expect.arrayContaining([
      expect.not.objectContaining({
        user_function_category_id: 202
      })
    ])
  );
});
