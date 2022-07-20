import validateQuestionValue from '../validateQuestionValue';

const mockQuestionType3MachineName = 'text_checkboxes';
const mockQuestionType3 = {
  label: 'To what extent egestas velit a arcu aliquam a malesuada?',
  variableName: 'extent_of_aliquam_a_malesuada',
  options: [
    {
      key: 'something_a',
      label: 'Very much so',
      content:
        'We will prioritize donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae.'
    },
    {
      key: 'something_b',
      label: 'Sometimes we do that',
      content:
        'We will create a committee that vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
    },
    {
      key: 'something_c',
      label: 'Not so much',
      content:
        'Perhaps next year amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
    }
  ],
  prepopulate: [],
  replacementFormat: 'block'
};

const mockQuestionType3Invalid = {
  label: 'To what extent egestas velit a arcu aliquam a malesuada?',
  variableName: 'extent_of_aliquam_a_malesuada',
  options: [
    {
      key: 'something_a',
      label: 'Very much so',
      content:
        'We will prioritize donec eu purus justo, convallis molestie turpis. Phasellus eget sem leo, ut aliquet dui. Cras vitae.'
    },
    {
      key: 'something_b',
      label: 'Sometimes we do that',
      content:
        'We will create a committee that vitae tortor sit amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
    },
    {
      key: 'something_c',
      label: 'Not so much',
      content:
        'Perhaps next year amet nulla dignissim fringilla in non augue. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.'
    }
  ],
  prepopulate: '',
  replacementFormat: 'block'
};

test('Valid question type returns no errors', () => {
  let expected = [];
  let res = validateQuestionValue(mockQuestionType3MachineName, mockQuestionType3);
  expect(res).toEqual(expect.arrayContaining(expected));
});

test('Invalid question type returns array with message for error', () => {
  let res = validateQuestionValue(mockQuestionType3Invalid, mockQuestionType3);
  expect(res).not.toEqual([]);
});
