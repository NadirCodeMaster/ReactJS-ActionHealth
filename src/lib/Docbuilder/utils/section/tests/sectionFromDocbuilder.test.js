import sectionFromDocbuilder from '../sectionFromDocbuilder';

const mockSection1 = { id: 11, machine_name: 'mock_section_1' };
const mockSection2 = { id: 12, machine_name: 'mock_section_2' };
const mockSection3 = { id: 13, machine_name: 'mock_section_3' };
const mockSection4 = { id: 14, machine_name: 'mock_section_4' };

const mockDocbuilder = {
  docbuilder_sections: [mockSection1, mockSection2, mockSection3, mockSection4]
};

test('Correct section is located by its ID when present', () => {
  let sec = sectionFromDocbuilder(mockDocbuilder, mockSection3.id);
  expect(sec.id).toBe(13);
});

test('null is returned when section ID is absent', () => {
  let sec = sectionFromDocbuilder(mockDocbuilder, 100);
  expect(sec).toBe(null);
});
