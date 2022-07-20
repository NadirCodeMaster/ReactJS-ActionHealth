import extractCriteriaFrom from './extractCriteriaFrom';

const mockOrgSetsData = [
  {
    id: 1,
    program_id: 1000,
    criterion_instances: [
      {
        id: 96,
        criterion_id: 1,
        criterion: {
          id: 1
        }
      }
    ]
  }
];

test('get object with all criteria applicable to org, keyed by criterionId', () => {
  expect(extractCriteriaFrom(mockOrgSetsData)).toEqual(
    expect.objectContaining({
      '1': expect.anything()
    })
  );
});
