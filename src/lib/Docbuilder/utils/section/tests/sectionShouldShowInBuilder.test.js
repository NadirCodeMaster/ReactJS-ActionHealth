import sectionShouldShowInBuilder from '../sectionShouldShowInBuilder';

test('Section with mixed subsections is showable', () => {
  const mock = {
    id: 100,
    docbuilder_subsections: [
      { id: 1000, exclude_from_builder: true },
      { id: 1001, exclude_from_builder: false },
      { id: 1002, exclude_from_builder: true }
    ]
  };
  let res = sectionShouldShowInBuilder(mock);
  expect(res).toEqual(true);
});

test('Section with one non-excluded subsection is showable', () => {
  const mock = {
    id: 200,
    docbuilder_subsections: [{ id: 2001, exclude_from_builder: false }]
  };
  let res = sectionShouldShowInBuilder(mock);
  expect(res).toEqual(true);
});

test('Section with only excluded subsections is not showable', () => {
  const mock = {
    id: 300,
    docbuilder_subsections: [
      { id: 3000, exclude_from_builder: true },
      { id: 3001, exclude_from_builder: true },
      { id: 3002, exclude_from_builder: true }
    ]
  };
  let res = sectionShouldShowInBuilder(mock);
  expect(res).toEqual(false);
});

test('Section with no subsections is not showable', () => {
  const mock = {
    id: 400,
    docbuilder_subsections: []
  };
  let res = sectionShouldShowInBuilder(mock);
  expect(res).toEqual(false);
});
