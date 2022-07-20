/**
 * Get a copy of an array where an item at one position is moved to another.
 *
 * The returned array will have the item that was originally at startIndex
 * moved endIndex.
 *
 * @param {Array} list
 * @param {Number} startIndex
 * @param {Number} endIndex
 * @returns {Array}
 */
export default function repositionArrayItem(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}
