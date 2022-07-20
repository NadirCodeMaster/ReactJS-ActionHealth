import { filter, isNumber, sortBy } from 'lodash';

/**
 * @param {Array|Object} sets
 * @param {Number|String|Object} program
 * @return Array
 *  Returns array of sets sorted by name(?)
 */
export default function filterSetsByProgram(sets, program) {
  let programId = program;
  if (!isNumber(program)) {
    programId = program.id;
  }
  programId = parseInt(programId, 10);
  let results = filter(sets, s => {
    return programId === parseInt(s.program_id, 10);
  });
  return sortBy(results, 'name');
}
