import subsectionFromDocbuilder from '../subsectionFromDocbuilder';

const mockSection1 = {
  id: 11,
  docbuilder_id: 3000,
  docbuilder_subsections: [
    { id: 101, section_id: 11 },
    { id: 102, section_id: 11 },
    { id: 103, section_id: 11 },
    { id: 104, section_id: 11 }
  ]
};
const mockSection2 = {
  id: 12,
  docbuilder_id: 1000,
  docbuilder_subsections: [
    { id: 201, section_id: 12 },
    { id: 202, section_id: 12 },
    { id: 203, section_id: 12 },
    { id: 204, section_id: 12 }
  ]
};
const mockSection3 = {
  id: 13,
  docbuilder_id: 1000,
  docbuilder_subsections: [
    { id: 301, section_id: 13 },
    { id: 302, section_id: 13 },
    { id: 303, section_id: 13 },
    { id: 304, section_id: 13 }
  ]
};
const mockSection4 = {
  id: 14,
  docbuilder_id: 3000,
  docbuilder_subsections: [
    { id: 401, section_id: 14 },
    { id: 402, section_id: 14 },
    { id: 403, section_id: 14 },
    { id: 404, section_id: 14 }
  ]
};

const mockDocbuilder1 = {
  id: 1000,
  docbuilder_sections: [mockSection2, mockSection3]
};

const mockDocbuilder2 = {
  id: 2000,
  docbuilder_sections: []
};

const mockDocbuilder3 = {
  id: 3000,
  docbuilder_sections: [mockSection1, mockSection4]
};

test('Correct subsection is located by its ID when present', () => {
  let ss = subsectionFromDocbuilder(mockDocbuilder3, 403);
  expect(ss.id).toBe(403);
});

test('null is returned when subsection is absent', () => {
  let ss = subsectionFromDocbuilder(mockDocbuilder1, 403);
  expect(ss).toBe(null);
});

test('Nothing bad happens when sections array is empty', () => {
  let ss = subsectionFromDocbuilder(mockDocbuilder2, 403);
  expect(ss).toBe(null);
});
