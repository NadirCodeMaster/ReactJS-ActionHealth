/**
 * Test if a string (or number) value is numeric.
 *
 * @param {Number|String} v Value to test.
 * @returns {Boolean}
 */
export default function isNumeric(v) {
  return /^\d+$/.test(v);
}
