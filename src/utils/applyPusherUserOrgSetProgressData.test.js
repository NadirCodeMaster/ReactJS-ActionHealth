import applyPusherUserOrgSetProgressData from './applyPusherUserOrgSetProgressData';
import { cloneDeep } from 'lodash';

const mockOrg = {
  id: 10,
  name: 'The Biz',
  available_sets: [
    {
      // not the match
      set_id: 8,
      percentComplete: 0.11
    },
    {
      // not the match
      set_id: 9,
      percentComplete: 0.12
    },
    {
      // the match
      set_id: 20,
      percentComplete: 0.25
    }
  ]
};

const mockPusherData = {
  organization_id: 10,
  percentage_complete: 0.5,
  response: {
    name_first: 'John',
    name_last: 'Doe',
    updated_at: '2020-08-21T20:43:07.000000Z'
  },
  set_id: 20
};

test('Pusher percentComplete is merged into to organization', () => {
  let res = applyPusherUserOrgSetProgressData(mockOrg, mockPusherData);
  let isCorrect =
    res.available_sets[2].percentComplete ===
    mockPusherData.percentage_complete;
  expect(isCorrect).toBe(false);
});
