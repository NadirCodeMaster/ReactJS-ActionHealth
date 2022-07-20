import filterCriterionInstancesBySetAndGroupByModule from './filterCriterionInstancesBySetAndGroupByModule';

const mockCriterionInstances = [
  {
    id: 18,
    criterion_id: 7,
    set_id: 22,
    module_id: 68
  },
  {
    id: 114,
    criterion_id: 46,
    set_id: 22,
    module_id: 68
  }
];

const mockModule = [
  {
    id: 68,
    name: 'Sed et illum nostrum distincti/',
    set_id: 22,
    description:
      'Molestiae omnis non et non et officiis. Laborum iure reprehenderit cumque porro. Totam tempora voluptas ut nulla culpa distinctio enim numquam.',
    internal: false,
    created_at: '2019-04-02 19:02:47',
    updated_at: '2019-04-09 19:00:22',
    deleted_at: null,
    weight: 5218
  }
];

test('Given criterionInstances and mod, return grouped by modules', () => {
  expect(
    filterCriterionInstancesBySetAndGroupByModule(
      mockCriterionInstances,
      mockModule,
      22
    )
  ).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        module: expect.objectContaining({
          id: 68
        })
      }),
      expect.objectContaining({
        criterionInstances: expect.arrayContaining([
          expect.objectContaining({
            id: expect.anything()
          })
        ])
      })
    ])
  );
});
