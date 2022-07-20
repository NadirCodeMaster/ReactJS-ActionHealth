import userFullName from './userFullName';

const mockUserObject = {
  name_first: 'John',
  name_last: 'Doe'
};

test('Given an uObj return full name', () => {
  expect(userFullName(mockUserObject)).toEqual(
    expect.stringContaining('John Doe')
  );
});
