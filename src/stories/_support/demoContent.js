import React from 'react';

/**
 * Demo content used in story demos.
 */

export const demoHeaderText =
  'Aliquam pellentesque turpis quis lacus hendrerit feugiat';

export const demoShortSentence = 'Aliquam turpis a lacus';

export const demoMidSentence = 'Proin odio libero, semper id gravida id.';

export const demoSentence =
  'Proin odio libero, semper id gravida id, bibendum quis mi.';

export const demoShortParagraph =
  'Proin odio libero, semper id gravida id, bibendum quis mi. Proin lobortis urna at turpis molestie mattis at sed elit. In elit nunc, luctus vehicula suscipit in, pharetra ac arcu. ';

export const demoParagraph =
  'Proin odio libero, semper id gravida id, bibendum quis mi. Proin lobortis urna at turpis molestie mattis at sed elit. In elit nunc, luctus vehicula suscipit in, pharetra ac arcu. Morbi posuere odio a est feugiat interdum. Praesent luctus, lorem sed tincidunt lobortis, nunc justo egestas enim, vitae tincidunt tellus lacus eu massa. Suspendisse ac adipiscing lectus.';

// JSX
export const demoParagraphWithLinks = (
  <React.Fragment>
    Proin odio libero, semper id gravida id, bibendum quis mi. Proin lobortis
    urna at turpis molestie mattis at sed elit. In elit nunc, luctus vehicula
    suscipit in, pharetra ac arcu. Morbi posuere odio a est feugiat interdum.
    Praesent luctus, lorem sed tincidunt lobortis, nunc justo egestas enim,
    vitae tincidunt tellus lacus eu massa. Suspendisse ac adipiscing lectus.{' '}
    <a href="https://www.healthiergeneration.org/app/account/login">Login</a>
  </React.Fragment>
);

export const demoEditorJson = {
  blocks: [
    {
      key: 'hjchf',
      data: {},
      text:
        'Beatae eum neque pariatur quaerat et cupiditate qui. Est eveniet veniam voluptatem cupiditate. Animi dicta qui blanditiis.',
      type: 'unstyled',
      depth: 0,
      entityRanges: [
        { key: 0, length: 7, offset: 57 },
        { key: 1, length: 10, offset: 72 },
        { key: 2, length: 5, offset: 101 },
        { key: 3, length: 3, offset: 107 }
      ],
      inlineStyleRanges: [
        { style: 'BOLD', length: 66, offset: 36 },
        { style: 'ITALIC', length: 2, offset: 82 },
        { style: 'SUBSCRIPT', length: 49, offset: 27 }
      ]
    },
    {
      key: 'uvyna',
      data: {},
      text:
        'Vero blanditiis exercitationem ut ut accusamus ratione. Dolor cupiditate quis quaerat quae. Quisquam dolore omnis debitis distinctio. Saepe eligendi consequuntur sed.',
      type: 'blockquote',
      depth: 0,
      entityRanges: [
        { key: 4, length: 4, offset: 73 },
        { key: 5, length: 7, offset: 78 },
        { key: 6, length: 5, offset: 134 }
      ],
      inlineStyleRanges: [{ style: 'BOLD', length: 104, offset: 58 }]
    },
    {
      key: 'b0sac',
      data: {},
      text:
        'Vel harum eius voluptas quibusdam aut eius. Voluptatibus quia esse nihil iure doloribus. Officiis et quas fugiat.',
      type: 'blockquote',
      depth: 0,
      entityRanges: [
        { key: 7, length: 12, offset: 44 },
        { key: 8, length: 4, offset: 57 },
        { key: 9, length: 2, offset: 98 },
        { key: 10, length: 6, offset: 106 }
      ],
      inlineStyleRanges: [
        { style: 'BOLD', length: 45, offset: 6 },
        { style: 'ITALIC', length: 21, offset: 75 },
        { style: 'SUBSCRIPT', length: 16, offset: 96 }
      ]
    },
    {
      key: '6wm0q',
      data: {},
      text:
        'Eos rem esse itaque optio est fuga quod. Reiciendis illo explicabo et iste sequi voluptate. Quo sed ab dolores. Sint quasi commodi nisi asperiores. Voluptatem id nesciunt corrupti in.',
      type: 'unordered-list-item',
      depth: 0,
      entityRanges: [
        { key: 11, length: 3, offset: 26 },
        { key: 12, length: 4, offset: 52 },
        { key: 13, length: 10, offset: 136 }
      ],
      inlineStyleRanges: [
        { style: 'BOLD', length: 11, offset: 130 },
        { style: 'ITALIC', length: 27, offset: 7 }
      ]
    }
  ],
  entityMap: {
    '0': { data: { dec: 14 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '1': { data: { dec: 14 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '2': { data: { dec: 9 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '3': { data: { dec: 38 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '4': { data: { dec: 34 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '5': { data: { dec: 34 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '6': { data: { dec: 40 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '7': { data: { dec: 40 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '8': { data: { dec: 43 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '9': { data: { dec: 43 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '10': { data: { dec: 15 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '11': { data: { dec: 36 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '12': { data: { dec: 31 }, type: 'ABBRDATA', mutability: 'MUTABLE' },
    '13': { data: { dec: 37 }, type: 'ABBRDATA', mutability: 'MUTABLE' }
  }
};
