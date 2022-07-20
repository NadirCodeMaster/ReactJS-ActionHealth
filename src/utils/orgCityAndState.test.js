import orgCityAndState from './orgCityAndState';

const mockOrgCityState = {
  city: 'New Dell',
  state_id: 'mp'
};

const mockOrgCity = {
  city: 'New Dell'
};

const mockOrgState = {
  state_id: 'mp'
};

test('Given object with city and state, return string with city/state', () => {
  expect(orgCityAndState(mockOrgCityState)).toEqual(
    expect.stringMatching(/\w+\,\s\w{2}/)
  );
});

test('Given object with just city, return string with city', () => {
  expect(orgCityAndState(mockOrgCity)).toEqual(expect.stringMatching(/\w+/));
});

test('Given object with state, return string with state', () => {
  expect(orgCityAndState(mockOrgState)).toEqual(expect.stringMatching(/\w{2}/));
});

test('Given object with no state/state, return empty string', () => {
  expect(orgCityAndState({})).toEqual(expect.stringMatching(/\s?/));
});
