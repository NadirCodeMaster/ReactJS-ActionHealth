import currentWebsocketId from './currentWebsocketId';

test('No connection to return null', () => {
  expect(currentWebsocketId()).toEqual(null);
});
