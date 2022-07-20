import extractCriterionFrom from './extractCriterionFrom';

const mockOrgSetsData = [
  {
    id: 1,
    program_id: 1000,
    criterion_instances: [
      {
        id: 96,
        criterion_id: 1,
        criterion_variant_id: null,
        case: 1,
        criterion: {
          id: 1,
          description: 'foo bar baz'
        }
      }
    ]
  }
];

test('Get single criterion object orgSetsData', () => {
  expect(extractCriterionFrom(mockOrgSetsData, 1)).toEqual(
    expect.objectContaining({
      description: expect.anything()
    })
  );
});
