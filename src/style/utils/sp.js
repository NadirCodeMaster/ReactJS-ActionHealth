import styleVars from "../_vars.scss";

/**
 * Provides standardized spacing outside of MUI theme
 *
 * Equivalent to theme.spacing(). Relies on styleVars to produce the value
 * rather than MUI. (styleVars defines the value that is passed to MUI, so
 * there is no incompatibility)
 *
 * As is standard practice in this app: The multiplier value should be an
 * integer or, when a fractional value is required, something that is readily
 * divisable by 1/8. This helps maintain visual rhythm and is granular enough
 * to cover most reasonable design issues.
 *
 * The following are all fine multipliers: 0.125, 5.25, 10.875, 0.5.
 *
 * @param {number} multiplier
 *  Number of spacing units desired.
 * @returns {string}
 *  Returns a CSS-ready string that's equal to the standard spacing unit
 *  multiplied by `multiplier`. Ex: `24px`.
 */
const sp = (multiplier = 1) => {
  return `${styleVars.spacingUnitUnitlessValue * multiplier}${styleVars.spacingUnitUnit}`;
};

export default sp;
