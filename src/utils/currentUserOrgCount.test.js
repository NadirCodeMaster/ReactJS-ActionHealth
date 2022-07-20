import currentUserOrgCount from './currentUserOrgCount';
import { cloneDeep } from 'lodash';

const mockCurrentUserData = {
  id: 10,
  organization_counts: {
    100: 8,
    200: 3,
    300: 1,
    400: 0,
    500: 3
  }
};

test('Sum of organization type totals is returned', () => {
  let res = currentUserOrgCount(mockCurrentUserData);
  expect(res).toBe(15);
});

test('Missing organization_counts returns null', () => {
  let brokenCurrentUserData = cloneDeep(mockCurrentUserData);
  delete brokenCurrentUserData.organization_counts;
  let res = currentUserOrgCount(brokenCurrentUserData);
  expect(res).toBe(null);
});

test('Non-object arguments return null', () => {
  let brokenCurrentUserData, res;

  brokenCurrentUserData = ['totally invalid'];
  res = currentUserOrgCount(brokenCurrentUserData);
  expect(res).toBe(null);

  brokenCurrentUserData = 'also totally invalid';
  res = currentUserOrgCount(brokenCurrentUserData);
  expect(res).toBe(null);
});
