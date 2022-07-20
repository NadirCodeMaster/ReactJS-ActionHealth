import parseProgramOrganizationData from './parseProgramOrganizationData';

const mockProgramOrganizationInfo = [
  {
    set_id: 12,
    module_id: 38,
    total_possible: 2,
    total_responses: null,
    value: null
  },
  {
    set_id: 12,
    module_id: 39,
    total_possible: 2,
    total_responses: 1,
    value: null
  },
  {
    set_id: 12,
    module_id: null,
    total_possible: 4,
    total_responses: 2,
    value: null
  }
];

test('Given API data, will return organized structure', () => {
  expect(parseProgramOrganizationData(mockProgramOrganizationInfo)).toEqual(
    expect.objectContaining({
      program: expect.objectContaining({
        sets: expect.objectContaining({
          '12': expect.objectContaining({
            modules: expect.objectContaining({
              '38': expect.objectContaining({
                actualResponses: 0
              })
            })
          })
        })
      })
    })
  );
});
