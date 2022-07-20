import extractDomainFromUrlString from './extractDomainFromUrlString';

let testUrl = 'http://www.youtube.com/watch?v=ClkQA2Lb_iE';

test('Domain will be parsed from string with parameters', () => {
  expect(extractDomainFromUrlString(testUrl)).toEqual('www.youtube.com');
});
