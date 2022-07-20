import { sortBy } from 'lodash';

/**
 * Sort sets according to our standard set sorting algorithm.
 *
 * The sorting algorithm is to sort with the following priority:
 *
 * - Program weight   (asc)
 * - Program name     (asc)
 * - Set weight       (asc)
 * - Set name         (asc)
 *
 * @param {String} sets
 *  Array of sets to be sorted. Each set must include populated `program` object.
 * @returns {Array}
 *  Sorted sets
 */
export default function sortSets(sets) {
  return sortBy(sets, ['program.weight', 'program.name', 'weight', 'name']);
}
