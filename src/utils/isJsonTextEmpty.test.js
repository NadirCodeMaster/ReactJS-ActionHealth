import isJsonTextEmpty from './isJsonTextEmpty';

/**
 * NOTE:
 * mockContent.data.sitewide_alert.content is NOT empty
 * mockContent.data.my_organizations_tip_1_body.content IS empty
 */
const mockContent = {
  data: {
    sitewide_alert: {
      content: {
        blocks: [
          {
            key: '5detk',
            data: [],
            text:
              'Temporary service outage, our team is working on a fix.  Thank you for your patience.',
            type: 'unstyled',
            depth: 0,
            entityRanges: [
              {
                key: 0,
                length: 8,
                offset: 76
              }
            ],
            inlineStyleRanges: []
          }
        ],
        entityMap: [
          {
            data: {
              dec: 'http://google.com',
              isLinkTargetBlank: true
            },
            type: 'LINK',
            mutability: 'MUTABLE'
          }
        ]
      }
    },
    my_organizations_tip_1_body: {
      content: {
        blocks: [
          {
            key: 'emone',
            text: '',
            type: 'unstyled',
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: []
          }
        ],
        entityMap: []
      }
    }
  }
};

test('Non empty RTE data object returns false', () => {
  expect(isJsonTextEmpty(mockContent.data.sitewide_alert.content)).toEqual(
    false
  );
});

test('Empty RTE data object returns false', () => {
  expect(
    isJsonTextEmpty(mockContent.data.my_organizations_tip_1_body.content)
  ).toEqual(true);
});
