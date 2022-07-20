import extractResponsesFrom from './extractResponsesFrom';

const mockOrgSetsData = [
  {
    id: 1,
    program_id: 1000,
    responses: [
      {
        id: 2284,
        criterion_id: 24
      }
    ]
  }
];

test('Get object with all responses for this org, keyed by criterionId.', () => {
  expect(extractResponsesFrom(mockOrgSetsData)).toEqual(
    expect.objectContaining({
      24: expect.anything()
    })
  );
});
