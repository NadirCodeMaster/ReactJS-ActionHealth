import { isString } from "lodash";

/**
 * Helper to change CSS value string to a JS number w/out units.
 *
 * For example, this will convert `"10px"` to `10`. Floats are
 * supported.
 *
 * Non-strings will result in a return value of `0`.
 *
 * Entirely non-numeric values (like "normal") will also return
 * `0`, unless passThroughNonNumeric=true, in which case the
 * value is returned as-is.
 *
 * Strings with multiple values (like margin shorthand) are not
 * supported and will give you some unspecified result.
 *
 * @param {string} value
 * @param {bool} passThroughNonNumeric
 * @returns {number|string}
 */
export default function unitlessNumber(value, passThroughNonNumeric = false) {
  if (!isString(value)) {
    // nope
    if ("test" !== process.env.NODE_ENV) {
      console.error("unitlessNumber(): value is not a string", value);
    }
    return 0;
  }

  // If value starts with a number (or decimal point), we should be able to convert it.
  value = value.trim();
  if (/^.?[\d]/.test(value)) {
    return parseFloat(value, 10); // strips off px, rem, etc
  }

  // Otherwise, we pass through if requested, throw an error if not.
  if (passThroughNonNumeric) {
    return value;
  }
  // nope
  if ("test" !== process.env.NODE_ENV) {
    console.error("unitlessNumber(): value does not begin with a number", value);
  }
  return 0;
}
