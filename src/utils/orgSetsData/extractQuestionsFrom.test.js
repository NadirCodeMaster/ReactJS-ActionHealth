import extractQuestionsFrom from './extractQuestionsFrom';

const mockOrgSetsData = [
  {
    id: 1,
    program_id: 1000,
    criterion_instances: [
      {
        id: 96,
        criterion_id: 1,
        criterion: {
          id: 1,
          name: 'Ullam sapiente animi ratione ratione cupiditate voluptas.'
        }
      }
    ]
  }
];

test('Get object with all questions (CriterionInstances) for this org, keyed by CI ID', () => {
  expect(extractQuestionsFrom(mockOrgSetsData, 1)).toEqual(
    expect.objectContaining({
      96: expect.anything()
    })
  );
});
