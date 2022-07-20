import styleVars from "../../style/_vars.scss";
import unitlessNumber from "style/utils/unitlessNumber";

/**
 * Styles used only for the supporting markup of our story demos.
 *
 * Apply to elements via `style={}` attribute.
 */

// Strip units off of spacing unit so we can use in calculated
// values. Will be automatically evaluated as 'px' when parsed.
const spacingUnitInt = unitlessNumber(styleVars.spacingUnit);

export const disclaimerBlock = {
  backgroundColor: "#fff",
  boxShadow: "0 0 4px rgba(0, 0, 0, 0.125)",
  fontFamily: "sans-serif",
  fontSize: styleVars.txtFontSizeDefault,
  marginBottom: spacingUnitInt * 4,
  padding: spacingUnitInt * 2,
};
export const sectionStyle = {
  marginBottom: "2em",
};
export const sectionHeaderStyle = {
  color: "#000",
  fontFamily: "sans-serif",
  fontSize: styleVars.txtFontSizeDefault,
  fontWeight: "bold",
  marginTop: spacingUnitInt * 2,
  maxWidth: "800px",
  opacity: "0.5",
  textTransform: "uppercase",
};
export const itemStyle = {
  marginTop: spacingUnitInt * 2,
  marginBottom: spacingUnitInt * 3,
  marginLeft: 0,
  marginRight: 0,
};
export const itemLabelStyle = {
  color: "#000",
  fontFamily: "sans-serif",
  fontSize: styleVars.txtFontSizeDefault,
  fontWeight: "bold",
  marginTop: spacingUnitInt * 2,
  marginBottom: spacingUnitInt * 3,
  opacity: "0.5",
};
export const itemDescriptionStyle = {
  color: "#000",
  fontFamily: "sans-serif",
  fontSize: styleVars.txtFontSizeXs,
  opacity: "0.5",
};
export const tooltipTextStyle = {
  borderBottom: "1px dotted #38B8EA",
};
