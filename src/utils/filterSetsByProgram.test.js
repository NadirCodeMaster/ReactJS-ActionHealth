import filterSetsByProgram from './filterSetsByProgram';

const mockSets = {
  '1': {
    id: 1,
    program_id: 2000
  },
  '2': {
    id: 2,
    program_id: 2000
  }
};

test('Given set data an programId, returns filtered sets', () => {
  expect(filterSetsByProgram(mockSets, 2000)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        program_id: 2000
      })
    ])
  );
});

test('Given set data an programId, returns set without program_id not in set', () => {
  expect(filterSetsByProgram(mockSets, 2000)).toEqual(
    expect.arrayContaining([
      expect.not.objectContaining({
        program_id: 100
      })
    ])
  );
});
