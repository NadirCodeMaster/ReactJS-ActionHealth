import UIC from '../UIContent';

// See UIContent._stateKeyPriority() for code that actually
// calculates prioritization values.

test('Correct value returned for multiple matching candidates', () => {
  let subject = 'xyz',
    candidates;

  candidates = [
    'xy*',
    'x*z',
    '*yz' // best due to fixed values being in last positions
  ];
  expect(UIC._bestStateKey(subject, candidates)).toBe('*yz');

  candidates = [
    'x**',
    '**z', //
    'xy*' // best due to fewest wildcards
  ];
  expect(UIC._bestStateKey(subject, candidates)).toBe('xy*');

  candidates = [
    'x**',
    '**z',
    'xy*',
    '*yz',
    'xyz' // best due to no wildcards
  ];
  expect(UIC._bestStateKey(subject, candidates)).toBe('xyz');

  candidates = [
    'x**',
    '**z',
    'xy*',
    '*yz',
    'xyx',
    'xyz', // best due to no wildcards and matching all lettters
    'abc',
    '123',
    '***'
  ];
  expect(UIC._bestStateKey(subject, candidates)).toBe('xyz');
});

test('null returned when no candidates match', () => {
  let subject = 'xyz',
    candidates;

  candidates = ['**r', 'r*r', 'rrr', 'r**', 'xxx', 'zzz', 'zyx'];
  expect(UIC._bestStateKey(subject, candidates)).toBe(null);
});

test('null returned for empty candidates array', () => {
  let subject = 'xyz',
    candidates = [];
  expect(UIC._bestStateKey(subject, candidates)).toBe(null);
});
