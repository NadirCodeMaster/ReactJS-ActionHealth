import styleVars from "./_vars.scss";
import { createTheme } from "@mui/material/styles";
import unitlessNumber from "style/utils/unitlessNumber";
import remToPxNumber from "style/utils/remToPxNumber";
import sp from "style/utils/sp";

let muiTheme = createTheme({
  // ===========
  // BREAKPOINTS
  // ===========
  breakpoints: {
    keys: ["xs", "sm", "md", "lg", "xl"],
    values: {
      xs: unitlessNumber(styleVars.bpXs),
      sm: unitlessNumber(styleVars.bpSm),
      md: unitlessNumber(styleVars.bpMd),
      lg: unitlessNumber(styleVars.bpLg),
      xl: unitlessNumber(styleVars.bpXl),
    },
  },

  // =======
  // PALETTE
  // =======
  palette: {
    // @see https://material-ui.com/customization/palette/
    // @see https://mui.com/customization/default-theme/

    // --
    // COLOR-RELATED SETTINGS
    mode: "light",
    contrastThreshold: 3, // default: 3
    tonalOffset: 0.2, // default: 0.2
    // --
    // COLOR BASICS
    background: {
      paper: styleVars.colorWhite,
      default: styleVars.colorOffWhite,
    },
    common: {
      black: styleVars.colorBlack,
      white: styleVars.colorWhite,
    },
    grey: {
      // Leaving empty to allow defaults for now. But FYI, we do
      // have some specific grays specified in styleVars.
    },
    // --
    // PRIMARY/SECONDARY
    primary: {
      main: styleVars.colorPrimary,
      // lighter: @TODO
      // light: @TODO
      // dark: @TODO
      // darker: @TODO
      contrastText: styleVars.colorWhite,
    },
    secondary: {
      main: styleVars.colorSecondary,
      // lighter: @TODO
      // light: @TODO
      // dark: @TODO
      // darker: @TODO
      contrastText: styleVars.colorWhite,
    },
    // --
    // SEVERITIES
    error: {
      main: styleVars.colorStatusError,
      // light: @TODO
      // dark: @TODO
      contrastText: styleVars.colorStatusErrorContrast,
    },
    warning: {
      main: styleVars.colorStatusWarning,
      // light: @TODO
      // dark: @TODO
      contrastText: styleVars.colorStatusWarningContrast,
    },
    info: {
      main: styleVars.colorStatusInfo,
      // light: @TODO
      // dark: @TODO
      contrastText: styleVars.colorStatusInfoContrast,
    },
    success: {
      main: styleVars.colorStatusSuccess,
      // light: @TODO
      // dark: @TODO
      contrastText: styleVars.colorStatusSuccessContrast,
    },
    // --
    // TEXT
    text: {
      primary: styleVars.txtColorDefault, // default: rgba(0,0,0,0.87)
      secondary: "rgba(0,0,0,0.6)", // default: rgba(0,0,0,0.6)
      disabled: styleVars.colorDarkGray, // default: rgba(0,0,0,0.38)
    },
    // --
    // ACTION
    action: {
      // Leaving empty to allow defaults for now.
    },

    // --
    // HG-SPECIFIC (@TODO Move this)
    assessment: {
      questionHandle: "#00BDEB",
    },
  },

  // =====
  // SHAPE
  // =====
  shape: {
    borderRadius: 0, // @TODO REVISIT... I BELIEVE WE USE BR NOW
  },
});

// Define a new theme where we can use dynamically set properties
// from above (i.e. `muiTheme.whatever`).
muiTheme = createTheme(muiTheme, {
  // ==========
  // TYPOGRAPHY
  // ==========
  typography: {
    // ********************** Note! ***************************************
    // We avoid MUI's <Typography> component and prefer instead to use and
    // style semantic HTML tags where possible. A primary benefit of this
    // is that non-MUI code and components an be used without more easily.
    // However, some MUI components may use Typography internally, so
    // we populate the values below using the same variables we apply to
    // non-MUI tags.
    // ********************************************************************

    htmlFontSize: 16, // MUI default value: 16 (default is eval'd as px, but no unit suffix)
    fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
    fontFamily: styleVars.txtFontFamilyDefault,
    fontWeightLight: styleVars.txtFontWeightDefaultExtraLight,
    fontWeightRegular: styleVars.txtFontWeightDefaultNormal,
    fontWeightMedium: styleVars.txtFontWeightDefaultMedium,
    fontWeightBold: styleVars.txtFontWeightDefaultSemibold,

    // ================
    // H* Header styles
    // ----------------
    // Note: As with most semantic HTML styles, don't use H* tags (including
    // via Typography variants) just to achieve styling that resembles one of
    // these. Instead, use the appropriate semantic HTML tags, and if  really
    // needed, use one-off styles applied to the semantic tags.
    // However, you could apply these styles to component-specific markup
    // via the `styles` object using `muiTheme.typography.{tag}.{prop}` if you
    // really had a need to align the styles.
    // ================
    h1: {
      // About H1: We use H1 for the primary title of the individual page
      // being viewed, and no where else. We don't use it for the site title
      // in the app bar (as some sites/systems do).
      // -----------------------------------------------------------------
      color: styleVars.txtColorH1,
      fontSize: remToPxNumber(styleVars.txtFontSizeH1),
      fontVariant: styleVars.txtFontVariantH1,
      fontWeight: styleVars.txtFontWeightH1,
      lineHeight: styleVars.txtLineHeightH1,
      letterSpacing: styleVars.txtLetterSpacingH1,
      margin: `0 0 ${styleVars.txtMarginBottomH1}`,
      textTransform: styleVars.txtTextTransformH1,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH1BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH1BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH1BpLg),
      },
    },
    h2: {
      // About H2: We use H2 for the title of secondary page blocks when
      // possible. However, sometimes H2s aren't appropriate based on the
      // overall page structure and/or components being used to create the
      // page, so use your best judgement. If unsure and there's no clear
      // semantically-correct option, use H2 or H3 based on desired sizing.
      // Also used within large blocks of primary page text as would be
      // expected if it's known that the content is only used as primary
      // page text.
      // -----------------------------------------------------------------
      color: styleVars.txtColorH2,
      fontSize: remToPxNumber(styleVars.txtFontSizeH2),
      fontVariant: styleVars.txtFontVariantH2,
      fontWeight: styleVars.txtFontWeightH2,
      lineHeight: styleVars.txtLineHeightH2,
      letterSpacing: styleVars.txtLetterSpacingH2,
      margin: `0 0 ${styleVars.txtMarginBottomH2}`,
      textTransform: styleVars.txtTextTransformH2,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH2BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH2BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH2BpLg),
      },
    },
    h3: {
      // About H3: We use H3 for the title of tertiary page blocks, and
      // as misc blocks where the content level is unknown/unspecified.
      // Miscelaneous call-to-action and sidebar blocks will typically use
      // use an H3 for their titles.
      // Also used within large blocks text as a 3rd-level header (relative
      // to the page title) as would be expected.
      // -----------------------------------------------------------------
      color: styleVars.txtColorH3,
      fontSize: remToPxNumber(styleVars.txtFontSizeH3),
      fontVariant: styleVars.txtFontVariantH3,
      fontWeight: styleVars.txtFontWeightH3,
      lineHeight: styleVars.txtLineHeightH3,
      letterSpacing: styleVars.txtLetterSpacingH3,
      margin: `0 0 ${styleVars.txtMarginBottomH3}`,
      textTransform: styleVars.txtTextTransformH3,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH3BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH3BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH3BpLg),
      },
    },
    h4: {
      // About H4: We use H4 for the title of quaternary page blocks and
      // within large blocks of text as would be expected. For blocks that
      // are used on multiple pages at unknown/unspecified levels, you're
      // better off using H3.
      // Also used within large blocks text as a 4th-level header (relative
      // to the page title) as would be expected.
      // -----------------------------------------------------------------
      color: styleVars.txtColorH4,
      fontSize: remToPxNumber(styleVars.txtFontSizeH4),
      fontVariant: styleVars.txtFontVariantH4,
      fontWeight: styleVars.txtFontWeightH4,
      lineHeight: styleVars.txtLineHeightH4,
      letterSpacing: styleVars.txtLetterSpacingH4,
      margin: `0 0 ${styleVars.txtMarginBottomH4}`,
      textTransform: styleVars.txtTextTransformH4,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH4BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH4BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH4BpLg),
      },
    },
    h5: {
      // About H5: Used within large blocks text as a 4th-level header (relative
      // to the page title) as would be expected.
      // -----------------------------------------------------------------
      color: styleVars.txtColorH5,
      fontSize: remToPxNumber(styleVars.txtFontSizeH5),
      fontVariant: styleVars.txtFontVariantH5,
      fontWeight: styleVars.txtFontWeightH5,
      lineHeight: styleVars.txtLineHeightH5,
      letterSpacing: styleVars.txtLetterSpacingH5,
      margin: `0 0 ${styleVars.txtMarginBottomH5}`,
      textTransform: styleVars.txtTextTransformH5,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH5BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH5BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH5BpLg),
      },
    },
    h6: {
      // About H6: Used within large blocks text as a 6th-level header (relative
      // to the page title) as would be expected. Pretty uncommon.
      // -----------------------------------------------------------------
      color: styleVars.txtColorH6,
      fontSize: remToPxNumber(styleVars.txtFontSizeH6),
      fontVariant: styleVars.txtFontVariantH6,
      fontWeight: styleVars.txtFontWeightH6,
      lineHeight: styleVars.txtLineHeightH6,
      letterSpacing: styleVars.txtLetterSpacingH6,
      margin: `0 0 ${styleVars.txtMarginBottomH6}`,
      textTransform: styleVars.txtTextTransformH6,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH6BpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH6BpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeH6BpLg),
      },
    },
    body1: {
      // Default text styles.
      // --------------------
      color: styleVars.txtColorDefault,
      fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
      fontWeight: styleVars.txtFontWeightNormal,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpLg),
      },
    },
    body2: {
      // Default text styles, but when smaller is more appropriate.
      // ----------------------------------------------------------
      color: styleVars.txtColorDefault,
      fontSize: remToPxNumber(styleVars.txtFontSizeSm),
      fontWeight: styleVars.txtFontWeightNormal,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpLg),
      },
    },
    button: {
      // NOTE: Intentionally not declaring fontSize here because it
      // would otherwise impact things like tabs, requiring additional
      // specificity to correct them.
      fontFamily: styleVars.txtFontFamilyButtons,
      fontWeight: styleVars.txtFontWeightButtons,
    },
    caption: {
      color: styleVars.txtColorDefault,
      fontSize: remToPxNumber(styleVars.txtFontSizeSm),
      fontWeight: styleVars.txtFontWeightNormal,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeSmBpLg),
      },
    },
    subtitle1: {
      color: styleVars.txtColorDefault,
      fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
      fontWeight: styleVars.txtFontWeightDefaultMedium,
      [muiTheme.breakpoints.up("sm")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpSm),
      },
      [muiTheme.breakpoints.up("md")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpMd),
      },
      [muiTheme.breakpoints.up("lg")]: {
        fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpLg),
      },
    },
  },

  // -- COMPONENTS
  components: {
    // --
    MuiAccordion: {
      styleOverrides: {
        root: {},
        rounded: {
          borderRadius: "0",

          // ----------------------------------------
          // @TODO This generates a console error:
          // > The pseudo class ":first-child" is potentially unsafe when doing
          // > server-side rendering. Try changing it to ":first-of-type"."
          // ---
          // "&:first-child": {
          //   borderTopLeftRadius: "3px",
          //   borderTopRightRadius: "3px",
          // },
          // ----------------------------------------
          "&:last-child": {
            borderBottomLeftRadius: "3px",
            borderBottomRightRadius: "3px",
          },
        },
      },
    },

    // --
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0,0,0,0.01)",
          paddingLeft: sp(2),
          paddingRight: sp(2),
          paddingTop: sp(2),
          paddingBottom: sp(2),
        },
      },
    },

    // --
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          paddingLeft: sp(2),
          paddingRight: sp(2),
          paddingTop: 0,
          paddingBottom: 0,
          "&.Mui-expanded": {
            "&:before": {
              // This replicates a bottom border, but isn't visible
              // when the accordion is collapsed (which a border
              // would be).
              backgroundColor: "rgba(0,0,0,0.125)",
              content: '""',
              display: "block",
              height: "1px",
              position: "absolute",
              left: 0,
              bottom: "-1px",
              width: "100%",
            },
          },
        },
      },
    },

    // --
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: remToPxNumber(styleVars.txtFontSizeButtons),
          letterSpacing: styleVars.txtLetterSpacingButtons,
          lineHeight: styleVars.txtLineHeightButtons,
          paddingLeft: sp(1.25),
          paddingRight: sp(1.25),
          paddingTop: sp(1.625),
          paddingBottom: sp(1.5),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsBpLg),
          },
        },
        sizeSmall: {
          fontSize: remToPxNumber(styleVars.txtFontSizeButtonsSmall),
          paddingTop: sp(1.125),
          paddingBottom: sp(1),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsSmallBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsSmallBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeButtonsSmallBpLg),
          },
        },
        contained: {
          boxShadow: "none",
        },
        outlined: {
          boxShadow: "none",
        },
        text: {},

        textPrimary: {
          // Styles applied to the root element if variant="text"
          // and color="primary"
          color: styleVars.colorPrimaryExtraContrast,
        },

        textSecondary: {
          // Styles applied to the root element if variant="text"
          // and color="secondary"
          color: styleVars.colorSecondaryExtraContrast,
        },
      },
    },

    // --
    MuiCard: {
      styleOverrides: {
        root: {
          marginTop: styleVars.cardPadding,
        },
      },
    },

    // --
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: styleVars.cardPadding,
          "&:last-child": {
            paddingBottom: styleVars.cardPadding,
          },
        },
      },
    },

    // --
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: styleVars.cardPadding,
          paddingBottom: styleVars.cardPadding * 0.125,
        },
        title: {
          fontSize: remToPxNumber(styleVars.txtFontSizeLg),
          fontWeight: styleVars.txtFontWeightDefaultBold,
          marginBottom: "0.125em",
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeLgBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeLgBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeLgBpLg),
          },
        },
      },
    },

    // --
    MuiCardActions: {
      styleOverrides: {
        root: {
          borderTop: "2px solid #F3F5F7",
          padding: styleVars.cardPadding,
        },
      },
    },

    // --
    MuiCheckbox: {
      styleOverrides: {
        root: {
          paddingRight: sp(0.75),
        },
        colorPrimary: {
          color: styleVars.colorPrimary, // needed so unchecked state is also colored
        },
        colorSecondary: {
          color: styleVars.colorSecondary, // needed so unchecked state is also colored
        },
      },
    },

    // --
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },

    // --
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: styleVars.txtFontFamilyDefault,
          fontSize: remToPxNumber(styleVars.txtFontSizeXxl),
          fontWeight: styleVars.txtFontWeightH3,
          lineHeight: styleVars.txtLineHeightH3,
          paddingBottom: sp(0.25),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXxlBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXxlBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXxlBpLg),
          },
        },
      },
    },

    // --
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: styleVars.colorLightGray,
          height: "2px",
        },
        light: {
          backgroundColor: "#F3F5F7",
        },
      },
    },

    // --
    MuiInput: {
      // NOTE: This is for <TextField variant="standard">.
      // @see MuiFilledInput (<TextField variant="filled">)
      // @see MuiOutlinedInput (<TextField variant="outlined">)
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#DDDDDD",
            color: styleVars.colorGray,
          },
        },
        input: {
          backgroundColor: styleVars.colorOffWhite,
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
        inputMultiline: {
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
        underline: {
          "&:before": {
            borderBottom: `2px solid ${styleVars.colorLightGray}`,
          },
        },
      },
    },

    // --
    MuiInputBase: {
      styleOverrides: {
        root: {
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
        },
      },
    },

    // --
    MuiFilledInput: {
      // NOTE: This is for <TextField variant="filled">.
      // @see MuiInput (<TextField variant="standard">)
      // @see MuiOutlinedInput (<TextField variant="outlined">)
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#DDDDDD",
            color: styleVars.colorGray,
          },
        },
        input: {
          boxShadow: "inset 0 0 4px #000000",
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
        inputMultiline: {
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
      },
    },

    // --
    MuiFormControl: {
      styleOverrides: {
        marginNormal: {
          marginTop: 0,
        },
      },
    },

    // --
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: styleVars.txtFontFamilyInputs,
          fontSize: remToPxNumber(styleVars.txtFontSizeInputs),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpLg),
          },
        },
      },
    },

    // --
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: styleVars.txtFontFamilyDefault,
          fontSize: remToPxNumber(styleVars.txtFontSizeXs),
          fontWeight: styleVars.txtFontWeighDefault,
          marginLeft: 0,
          marginTop: sp(0.5),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXsBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXsBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeXsBpLg),
          },
        },
      },
    },

    // --
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: styleVars.txtFontFamilyInputs,
          fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
          fontWeight: styleVars.txtFontWeightForms,
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpLg),
          },
        },
      },
    },

    // --
    MuiLinearProgress: {
      styleOverrides: {
        colorSecondary: {
          backgroundColor: "#F3F5F7",
        },
      },
    },

    // --
    MuiListItem: {
      styleOverrides: {
        button: {
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
    },

    // --
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          marginRight: sp(1),
          minWidth: 0,
        },
      },
    },

    // --
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpLg),
          },
        },
      },
    },

    // --
    MuiOutlinedInput: {
      // NOTE: This is for <TextField variant="outlined">.
      // @see MuiInput (<TextField variant="standard">)
      // @see MuiFilledInput (<TextField variant="filled">)
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#DDDDDD",
            color: styleVars.colorGray,
          },
        },
        input: {
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
        inputMultiline: {
          lineHeight: styleVars.txtLineHeightInputs,
          paddingLeft: sp(1.25),
          paddingRight: sp(0.5),
          paddingTop: sp(1.5),
          paddingBottom: sp(1.5),
        },
      },
    },

    // --
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderColor: styleVars.colorWhite,
          borderRadius: "3px",
          boxShadow: "0 0 12px rgba(0,0,0,0.25) !important",
          color: "#222",
          minWidth: sp(1),
          padding: 1,
        },
      },
    },

    // --
    MuiPaper: {
      styleOverrides: {
        root: {
          color: styleVars.txtColorDefault,
        },
        rounded: {
          // @TODO Need better way to rm box shadows and mod Paper without
          // disrupting shadow on appBar, etc. Currently stashing everything
          // in "rounded" as that effectively does the trick.
          border: `2px solid ${styleVars.colorLightGray}`,
          borderRadius: "3px",
          boxShadow: "none !important",
        },
      },
    },

    // --
    MuiSelect: {
      styleOverrides: {
        selectMenu: {
          fontSize: remToPxNumber(styleVars.txtFontSizeInputs),
          fontWeight: styleVars.txtFontWeightInputs,
          minHeight: "unset",
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeInputsBpLg),
          },
        },
        outlined: {
          backgroundColor: styleVars.colorWhite,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
        },
        icon: {
          top: "calc(50% - 10px)",
        },
      },
    },

    // --
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#00BDEB",
          color: styleVars.colorWhite,
          fontFamily: styleVars.txtFontFamilyDefault,
        },
      },
    },

    // --
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          height: "0.8em",
          fontSize: 22,
          width: "0.8em",
        },
      },
    },

    // --
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: styleVars.txtFontFamilyTableBody,
          fontSize: remToPxNumber(styleVars.txtFontSizeTableBody),
          fontWeight: styleVars.txtFontWeightTableBody,
          lineHeight: styleVars.txtLineHeightTableBody,
          height: "auto",
          padding: styleVars.tblBodyCellPadding,
          textAlign: "left",
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpLg),
          },
        },
        head: {
          height: "auto",
          fontFamily: styleVars.txtFontFamilyTableHead,
          fontSize: remToPxNumber(styleVars.txtFontSizeTableHead),
          fontWeight: styleVars.txtFontWeightTableHead,
          lineHeight: styleVars.txtLineHeightTableHead,
          padding: styleVars.tblHeadCellPadding,
          textAlign: "left",
          textTransform: "uppercase",
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableHeadBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableHeadBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableHeadBpLg),
          },
        },
        body: {
          fontSize: remToPxNumber(styleVars.txtFontSizeTableBody),
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeTableBodyBpLg),
          },
        },
      },
    },

    // --
    MuiTableRow: {
      styleOverrides: {
        root: {
          height: "auto",
        },
        head: {
          height: "auto",
        },
        hover: {
          color: "#FB4F14",
          cursor: "pointer",
          "&:hover": {
            backgroundColor: `${styleVars.colorOffWhite} !important`, // @TODO adjust to not need !important
            color: "#FB4F14 !important",
          },
        },
      },
    },

    // --
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: styleVars.txtFontFamilyDefault,
          fontSize: remToPxNumber(styleVars.txtFontSizeDefault),
          fontWeight: styleVars.txtFontWeightDefaultNormal,
          letterSpacing: "-0.025em",
          minHeight: sp(4.5),
          textTransform: "none",
          [muiTheme.breakpoints.up("sm")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpSm),
          },
          [muiTheme.breakpoints.up("md")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpMd),
          },
          [muiTheme.breakpoints.up("lg")]: {
            fontSize: remToPxNumber(styleVars.txtFontSizeDefaultBpLg),
          },
        },
      },
    },

    // --
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${styleVars.colorLightGray}`,
          minHeight: sp(4.5),
        },
        indicator: {
          bottom: 0,
        },
      },
    },

    // --
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: sp(1),
          marginTop: sp(1),
        },
      },
    },

    // --
    MuiToolbar: {
      styleOverrides: {
        root: {},
        dense: {
          minHeight: "38px",
        },
      },
    },
  },
});

export default muiTheme;
