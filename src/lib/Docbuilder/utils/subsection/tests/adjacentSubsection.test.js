import adjacentSubsection from '../adjacentSubsection';

const mockDoc = {
  docbuilder_sections: [
    { docbuilder_subsections: [{ id: 4 }, { id: 10 }, { id: 999 }, { id: 2 }] },
    { docbuilder_subsections: [{ id: 7 }, { id: 35 }, { id: 100 }] },
    {
      docbuilder_subsections: [
        { id: 888 },
        { id: 777 },
        { id: 64646 },
        { id: 204 }
      ]
    },
    {
      docbuilder_subsections: [
        { id: 20 },
        { id: 612 },
        { id: 598 },
        { id: 843 }
      ]
    }
  ]
};

test('Identifies previous subsection in same section', () => {
  let res = adjacentSubsection(mockDoc, 64646, 'prev');
  expect(res).toBe(777);
});

test('Identifies next subsection in same section', () => {
  let res = adjacentSubsection(mockDoc, 612, 'next');
  expect(res).toBe(598);
});

test('Identifies previous subsection in adjacent section', () => {
  let res = adjacentSubsection(mockDoc, 888, 'prev');
  expect(res).toBe(100);
});

test('Identifies next subsection in adjacent section', () => {
  let res = adjacentSubsection(mockDoc, 2, 'next');
  expect(res).toBe(7);
});

test('Returns null when no previous subsection', () => {
  let res = adjacentSubsection(mockDoc, 4, 'prev');
  expect(res).toBe(null);
});

test('Returns null when no next subsection', () => {
  let res = adjacentSubsection(mockDoc, 843, 'next');
  expect(res).toBe(null);
});

test('Returns null when subsection is not present', () => {
  let res = adjacentSubsection(mockDoc, 99999999, 'prev');
  expect(res).toBe(null);
});
