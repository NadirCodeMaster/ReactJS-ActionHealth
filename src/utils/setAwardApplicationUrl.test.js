import setAwardApplicationUrl from './setAwardApplicationUrl';

const mockIdOrObj = {
  id: 1,
  name: 'test'
};

test('Given a setId of 1 and org it will return an awards URL', () => {
  expect(setAwardApplicationUrl(1, mockIdOrObj)).toMatch(
    /take-action\/schools\/awards\/welcome\?organization_id\=1/
  );
});
