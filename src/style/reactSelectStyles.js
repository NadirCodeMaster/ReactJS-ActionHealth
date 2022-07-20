import styleVars from "./_vars.scss";
import sp from "./utils/sp";
import remToPxNumber from "./utils/remToPxNumber";
import muiTheme from "./muiTheme";

//
// Styles passed to react-select
// -----------------------------
// @see https://react-select.com/styles#provided-styles-and-state
//

const reactSelectStyles = {
  container: (providedStyles, state) => ({
    ...providedStyles,
    fontFamily: styleVars.txtFontFamilyInputs,
    fontSize: styleVars.txtFontSizeInputs,
    fontWeight: styleVars.txtFontWeightInputs,
    lineHeight: styleVars.txtLineHeightInputs,
    [muiTheme.breakpoints.up("sm")]: {
      fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpSm),
    },
    [muiTheme.breakpoints.up("md")]: {
      fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpMd),
    },
    [muiTheme.breakpoints.up("lg")]: {
      fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpLg),
    },
  }),
  valueContainer: (providedStyles, state) => ({
    ...providedStyles,
    paddingLeft: sp(1.25),
    paddingRight: sp(0.5),
    paddingTop: sp(1.5),
    paddingBottom: sp(1.5),
  }),
  input: (providedStyles, state) => ({
    ...providedStyles,
    padding: 0,
    margin: 0,
  }),
  option: (providedStyles, state) => ({
    ...providedStyles,
    // Force darker text than would otherwise
    // be used and light contrasting text
    // when selected.
    color: state.isSelected ? styleVars.colorWhite : styleVars.txtColorDefault,
    fontStyle: state.isDisabled ? "italic" : "normal",
    opacity: state.isDisabled ? 0.4 : 1.0,
  }),
  control: (providedStyles) => ({
    ...providedStyles,
    borderRadius: 0,
    borderWidth: "1px",
    lineHeight: styleVars.txtLineHeightInputs,
    minHeight: "unset",
    paddingBottom: 0,
    paddingTop: 0,
  }),
  indicatorSeparator: (providedStyles) => ({
    ...providedStyles,
    display: "none",
  }),
  dropdownIndicator: (providedStyles, state) => ({
    ...providedStyles,
    color: state.isDisabled ? styleVars.colorDarkGray : styleVars.colorLightOrange,
    padding: sp(0.5),
  }),
  placeholder: (providedStyles) => ({
    ...providedStyles,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    maxWidth: "90%",
  }),
};

export default reactSelectStyles;
