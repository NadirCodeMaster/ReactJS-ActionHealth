import repositionArrayItem from './repositionArrayItem';

const testArray = [0, 1, 2, 3];
const startIndex = 0;
const endIndex = 3;

test('element in testArray moved from startIndex to endIndex', () => {
  expect(repositionArrayItem(testArray, startIndex, endIndex)).toEqual([
    1,
    2,
    3,
    0
  ]);
});
