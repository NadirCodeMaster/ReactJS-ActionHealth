import sortSets from './sortSets';
import { map } from 'lodash';

const mockPrograms = {
  1000: {
    id: 1000,
    name: 'Program A',
    weight: 90
  },
  2000: {
    id: 2000,
    name: 'Program B',
    weight: 50
  },
  3000: {
    id: 3000,
    name: 'Program C',
    weight: 60
  },
  4000: {
    id: 4000,
    name: 'Program E',
    weight: 30
  },
  5000: {
    id: 5000,
    name: 'Program D',
    weight: 30
  }
};

const mockSets = [
  // Defining this array in order of program ID then set ID for
  // ease of reference while still ensuring stuff is out of order.

  { id: 30, name: 'Set X', program: mockPrograms[1000], weight: 40 },
  { id: 70, name: 'Set L', program: mockPrograms[1000], weight: 20 },
  { id: 120, name: 'Set A', program: mockPrograms[1000], weight: 50 },
  { id: 130, name: 'Set Z', program: mockPrograms[1000], weight: 200 },

  { id: 40, name: 'Set R', program: mockPrograms[2000], weight: 20 },
  { id: 50, name: 'Set K', program: mockPrograms[2000], weight: 20 },
  { id: 110, name: 'Set U', program: mockPrograms[2000], weight: 0 },

  { id: 10, name: 'Set B', program: mockPrograms[3000], weight: 40 },
  { id: 80, name: 'Set H', program: mockPrograms[3000], weight: -10 },
  { id: 90, name: 'Set I', program: mockPrograms[3000], weight: -70 },

  { id: 20, name: 'Set M', program: mockPrograms[4000], weight: 1000 },
  { id: 60, name: 'Set F', program: mockPrograms[4000], weight: 60 },
  { id: 100, name: 'Set C', program: mockPrograms[4000], weight: 10 },

  { id: 200, name: 'Set J', program: mockPrograms[5000], weight: 1000 },
  { id: 190, name: 'Set L', program: mockPrograms[5000], weight: 60 },
  { id: 210, name: 'Set V', program: mockPrograms[5000], weight: 10 }
];

const correctlyOrderedSetIdsMocks = [
  // From program 5000
  210,
  190,
  200,
  // From program 4000
  100,
  60,
  20,
  // From program 2000
  110,
  50,
  40,
  // From Program 3000
  90,
  80,
  10,
  // From Program 1000
  70,
  30,
  120,
  130
];

test('Sets are sorted in order of program.weight, program.name, set.weight, set.name', () => {
  let sortedSets = sortSets(mockSets);
  let sortedSetIds = [];
  map(sortedSets, s => {
    sortedSetIds.push(s.id);
  });
  expect(sortedSetIds).toEqual(correctlyOrderedSetIdsMocks);
});
