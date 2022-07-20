import filterCriterionInstancesByModule from './filterCriterionInstancesByModule';

const mockCriterionInstances = [
  {
    id: 18,
    criterion_id: 7,
    module_id: 68
  },
  {
    id: 114,
    criterion_id: 46,
    module_id: 68
  }
];

const mockModule = [
  {
    id: 68,
    name: 'Sed et illum nostrum distincti/'
  }
];

test('Will filter criterion_instances based on module_id in mod', () => {
  expect(
    filterCriterionInstancesByModule(mockCriterionInstances, mockModule[0])
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        module_id: 68
      })
    ])
  );
});

test('will not return CIs with module_id not specified in mod', () => {
  expect(
    filterCriterionInstancesByModule(mockCriterionInstances, mockModule[0])
  ).toEqual(
    expect.arrayContaining([
      expect.not.objectContaining({
        module_id: 38
      })
    ])
  );
});
