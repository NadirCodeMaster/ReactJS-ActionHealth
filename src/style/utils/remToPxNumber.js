import unitlessNumber from "style/utils/unitlessNumber";
import { toNumber } from "lodash";

/**
 * Returns the suffix-less px value for a rem font size.
 *
 * Example: `'2.2rem'` returns `22`.
 *
 * Assumes external styles have been configured so that 1rem is equal to 10px
 * (i.e., `html {font-size: 62.5%;}` in site styles).
 *
 * This is primarily intended for use in converting our custom SCSS vars
 * (which are rem) to the values the MUI theme code wants.
 *
 * @param {string} v
 *  A rem font-size value such as 1.5rem.
 * @returns {number}
 */
export default function remToPxNumber(v) {
  // strip off `rem`
  v = unitlessNumber(v);
  v = toNumber(v);
  // multiply the value by 10 to get the px value
  return v * 10;
}
