import extractSetFrom from './extractSetFrom';

const mockOrgSetsData = [
  {
    id: 1,
    abbreviation: 'hello world'
  }
];

test('Finds orgSetsData item representing a given set.', () => {
  expect(extractSetFrom(mockOrgSetsData, 1)).toEqual(
    expect.objectContaining({
      abbreviation: expect.anything()
    })
  );
});
