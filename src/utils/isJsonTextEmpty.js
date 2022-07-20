import { isArray, isString } from 'lodash';

/**
 * Test if JSON object of RTE text is empty (i.e., no text).
 *
 * Also returns true if provided value is itself empty
 * or structured in a way we don't recognize.
 *
 * @param {Object|String} v Value to test.
 * @returns {Boolean} < 1) `
 */
export default function isJsonTextEmpty(v) {
  // Convert to JSON object if they gave us a string.
  if (isString(v)) {
    v = JSON.parse(v);
  }

  if (!v || !isArray(v.blocks) || v.blocks.length < 1) {
    // Value wasn't valid as RTE text, so treat it as empty.
    return true;
  }
  return (
    v.blocks.length === 1 &&
    (v.blocks[0].text === null || v.blocks[0].text === '')
  );
}
