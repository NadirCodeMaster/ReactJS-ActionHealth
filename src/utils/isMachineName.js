/**
 * Test if a string qualifies as a valid machine name
 *
 * EX: this_is_a_sample_machine_name
 * lowercase letter and underscores only.
 *
 * @param {string} str
 * @return {boolean}
 */
export default function isMachineName(str) {
  const regex = new RegExp(/^[a-z](_?[a-z])*$/);

  return Boolean(str.match(regex));
}
