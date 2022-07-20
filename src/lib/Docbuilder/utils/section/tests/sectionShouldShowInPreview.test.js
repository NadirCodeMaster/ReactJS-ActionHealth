import sectionShouldShowInPreview from '../sectionShouldShowInPreview';
import { cloneDeep } from 'lodash';

test('Section with is_meta=false is showable', () => {
  let section = {
    id: 100,
    is_meta: false,
    docbuilder_subsections: [
      { id: 200, docbuilder_section_id: 100 },
      { id: 201, docbuilder_section_id: 100 }
    ]
  };
  let res = sectionShouldShowInPreview(section);
  expect(res).toEqual(true);
});

test('Section with is_meta=true is not showable', () => {
  let section = {
    id: 100,
    is_meta: false,
    docbuilder_subsections: [
      { id: 200, docbuilder_section_id: 100 },
      { id: 201, docbuilder_section_id: 100 }
    ]
  };
  let res = sectionShouldShowInPreview(section);
  expect(res).toEqual(true);
});
