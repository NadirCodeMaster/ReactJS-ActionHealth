import findCurrentResponseForCriterion from './findCurrentResponseForCriterion';

const mockOrgSetsData = [
  {
    id: 1,
    program_id: 1000,
    responses: [
      {
        id: 2284,
        criterion_id: 24,
        active_module_id: 2
      }
    ]
  }
];

test('Get organizations current response for a Criterion', () => {
  expect(findCurrentResponseForCriterion(mockOrgSetsData, 24)).toEqual(
    expect.objectContaining({
      active_module_id: expect.anything()
    })
  );
});
