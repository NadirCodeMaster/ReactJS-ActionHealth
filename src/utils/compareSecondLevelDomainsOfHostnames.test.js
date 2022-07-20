import compareSecondLevelDomainsOfHostnames from './compareSecondLevelDomainsOfHostnames';

let testDomain1 = 'ahg-programs-api.homestead1';
let testDomain2 = 'ahg-programs-api.homestead2';
let testDomain3 = 'localhost';

test('Expect same domain strings to return true', () => {
  expect(
    compareSecondLevelDomainsOfHostnames(testDomain1, testDomain2)
  ).toEqual(false);
});

test('Expect different domain strings to return false', () => {
  expect(
    compareSecondLevelDomainsOfHostnames(testDomain1, testDomain3)
  ).toEqual(false);
});
