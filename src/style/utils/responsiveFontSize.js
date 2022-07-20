import styleVars from "./_vars.scss";
import { get, includes, upperFirst } from "lodash";
import theme from "./theme";

/**
 * Returns CSS-IN-JS-formatted responsive font-sizing.
 *
 * Example usage:
 * ```
 * const h1Rfs = responsiveFontSize('h1');
 * const myStyles = {
 *   myH1: {
 *      fontWeight: 'bold',
 *      ...h1Rfs,
 *   }
 * };
 * ```
 *
 * If no applicable usage is found, the default
 * text font sizes are returned.
 *
 * -------------------------------------------------------
 * Note: If using the `sx` prop where MUI theme shortcuts
 * are available, you may want to instead use them.
 * Ex: `sx={{ fontSize: 'h2.fontSize' }}`
 * @see https://mui.com/system/typography/
 * -------------------------------------------------------
 *
 * @param {string} usage
 *  A camelCase representation such as `h2` or `buttonsSmall`, as
 *  appears in styleVars property names (but starting w/lowercase).
 * @returns {object}
 */
export default function responsiveFontSize(usage) {
  // "usages" we honor.
  const usages = [
    "buttons",
    "buttonsSmall",
    "forms",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "tableBody",
    "tableHead",
    // size-based values
    "xxs",
    "xs",
    "sm",
    "", // default text
    "lg",
    "xl",
  ];

  // If we haven't whitelisted the requested usage,
  // they get the default.
  if (!includes(usages, usage)) {
    usage = "";
  }

  // The common bp-less prefix.
  const noBp = `txtFontSize${upperFirst(usage)}`;

  // Note that we do not style for `xl` and `xs` is
  // already our default sizing. So, neither is
  // explicitly declared here.
  return {
    fontSize: get(styleVars, noBp, styleVars.txtFontSize),
    [theme.breakpoints.up("sm")]: {
      fontSize: get(styleVars, `${noBp}BpSm`, styleVars.txtFontSizeBpSm),
    },
    [theme.breakpoints.up("md")]: {
      fontSize: get(styleVars, `${noBp}BpMd`, styleVars.txtFontSizeBpMd),
    },
    [theme.breakpoints.up("lg")]: {
      fontSize: get(styleVars, `${noBp}BpLg`, styleVars.txtFontSizeBpLg),
    },
  };
}
