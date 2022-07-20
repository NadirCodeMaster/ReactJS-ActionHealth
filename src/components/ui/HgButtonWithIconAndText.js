import React from "react";
import PropTypes from "prop-types";
import { Box, Button } from "@mui/material";
import styleVars from "style/_vars.scss";

export default React.memo(HgButtonWithIconAndText);

// @TODO Add to styleguide

//
// Provides a Button with an icon and text.
// ----------------------------------------
// This component renders similar to list item links/buttons that use an
// icon and text. It's notably unbutton-like in appearance. For example,
// (currently) it uses normal case. It's ideal for buttons that kinda
// just look like links.
//

function HgButtonWithIconAndText({
  buttonProps,
  hideIcon,
  hideText,
  icon,
  iconOnRight = false,
  children,
}) {
  const IconComponent = icon;
  return (
    <Button
      disableRipple
      sx={{
        backgroundColor: "transparent",
        minWidth: "32px", // @TODO use theme.spacing(4)
        padding: 0,
        fontSize: "inherit",
        "&:link, &:visited, &:hover, &:active, &:focus": {
          backgroundColor: "transparent",
        },
      }}
      {...buttonProps}
    >
      <Box
        sx={{
          alignItems: "center",
          color: styleVars.colorPrimary,
          display: "flex",
          textTransform: "none",
        }}
      >
        {iconOnRight ? (
          <React.Fragment>
            {!hideText && (
              <Box
                sx={{
                  ...sxText,
                  marginRight: hideIcon ? 0 : 0.5,
                }}
              >
                {children}
              </Box>
            )}
            {!hideIcon && <IconComponent sx={sxIcon} />}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {!hideIcon && <IconComponent sx={sxIcon} />}
            {!hideText && (
              <Box
                sx={{
                  ...sxText,
                  marginLeft: hideIcon ? 0 : 0.5,
                }}
              >
                {children}
              </Box>
            )}
          </React.Fragment>
        )}
      </Box>
      {/* </div> */}
    </Button>
  );
}

const sxIcon = {
  width: "0.95em",
  height: "0.95em",
};

const sxText = {
  fontSize: styleVars.txtFontSizeDefault,
  fontWeight: styleVars.txtFontWeightDefaultMedium,
  paddingTop: "0.08em", // hacky adjustment for weird font baseline
};

HgButtonWithIconAndText.propTypes = {
  buttonProps: PropTypes.object,
  hideIcon: PropTypes.bool,
  hideText: PropTypes.bool,
  icon: PropTypes.object.isRequired,
  iconOnRight: PropTypes.bool,
  children: PropTypes.string.isRequired,
};
