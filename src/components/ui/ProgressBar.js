import React, { Component } from "react";
import PropTypes from "prop-types";
import { Box, LinearProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import { toNumber } from "lodash";
import styleVars from "style/_vars.scss";

/**
 * Custom HG component for LinearProgress
 *
 * Value prop must be a number between 0-100.
 * 0 value will not render a LinearProgress, but an outline of one
 *
 * @extends Component
 */
class ProgressBar extends Component {
  static propTypes = {
    height: PropTypes.string,
    minHeight: PropTypes.string,
    minHeightForEmpty: PropTypes.string,
    value: PropTypes.number.isRequired,
    theme: PropTypes.object.isRequired, // via withStyles
    linkIfZero: PropTypes.bool,
    linkIfZeroText: PropTypes.string,
    linkIfZeroTo: PropTypes.string,
  };

  render() {
    const {
      classes,
      height,
      minHeight,
      minHeightForEmpty,
      value,
      linkIfZero,
      linkIfZeroText,
      linkIfZeroTo,
      theme,
    } = this.props;

    let defaultHeight = "auto";
    let defaultMinHeight = theme.spacing(3);
    let defaultMinHeightForEmpty = theme.spacing(3);

    let _height = height ? height : defaultHeight;
    let _minHeight = minHeight ? minHeight : defaultMinHeight;
    let _minHeightForEmpty = minHeightForEmpty ? minHeightForEmpty : defaultMinHeightForEmpty;

    let v = value ? toNumber(value).toFixed(0) : 0;

    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          {linkIfZero && value === 0 ? (
            <div className={classes.progressBarEmpty} style={{ minHeight: _minHeightForEmpty }}>
              <Link to={linkIfZeroTo} className={classes.progressBarEmptyLink}>
                {linkIfZeroText ? linkIfZeroText : "Start"}
              </Link>
            </div>
          ) : (
            <LinearProgress
              variant="determinate"
              value={toNumber(v)}
              classes={{
                root: classes.linearProgressRoot,
                colorPrimary: classes.linearProgressColorPrimary,
                bar: classes.linearProgressBar,
              }}
              style={{ height: _height, minHeight: _minHeight }}
            />
          )}
        </Box>
        <Box minWidth={35}>
          <span className={classes.percentValue}>{toNumber(v)}%</span>
        </Box>
      </Box>
    );
  }
}

const styles = (theme) => ({
  linearProgressRoot: {
    borderRadius: 5,
  },
  linearProgressColorPrimary: {
    backgroundColor: styleVars.colorLightGray,
  },
  linearProgressBar: {
    borderRadius: 5,
    backgroundColor: styleVars.colorBlue,
  },
  progressBarEmpty: {
    background: "white",
    border: `2px dotted ${styleVars.colorLightGray}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    width: "100%",
    borderRadius: 5,
  },
  progressBarEmptyLink: {
    display: "block",
    textAlign: "center",
  },
  percentValue: {
    color: styleVars.colorSecondaryExtraContrast,
  },
});

export default withStyles(styles, { withTheme: true })(ProgressBar);
