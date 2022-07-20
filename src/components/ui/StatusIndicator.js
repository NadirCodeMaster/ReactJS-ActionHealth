import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import clsx from "clsx";
import { get, includes, isNil, values as _values } from "lodash";
import { withStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    margin: "0 auto",
    position: "relative",
    height: "48px",
    minWidth: "220px",
  },
  markers: {
    position: "absolute",
    height: "100%",
    width: "100%",
    "z-index": 1,
  },
  marker: {
    "border-right": "2px solid #d6d6d6",
    height: "100%",
    position: "absolute",
  },
  tooltip: {
    fontSize: 12,
    marginTop: "-10px",
    display: "inline",
  },
  responses: {
    "z-index": 100,
    position: "absolute",
    width: "100%",
    top: "29%",
  },
  response_segment: {
    height: "24px",
    float: "left",
    overflow: "hidden",
  },
  response_segment_text: {
    color: theme.palette.secondary.contrastText,
    marginLeft: "2px",
    marginTop: "2px",
  },
  segmentnull: {
    backgroundColor: "#F3F5F7",
    border: `1px solid ${theme.palette.secondary.light}`,
  },
  segment0_text: {
    color: "#95918D",
    marginLeft: theme.spacing(),
  },
  segment0: {
    backgroundColor: "#FF8A5B",
  },
  segment1: {
    backgroundColor: "#FB4F14",
  },
  segment2: {
    backgroundColor: "#E13F00",
  },
  segment3: {
    backgroundColor: "#AA2A01",
  },
  // TODO: Add more segments/shades of red if
  // responseTypes with more than 4 options are included
});

/**
 * Generates a status bar based on qty of possible responses,
 * qty of actual responses, and a group of response values,
 * each with a number reflecting how many responses they
 * are responsible for.
 */

class StatusIndicator extends React.Component {
  static propTypes = {
    possibleResponses: PropTypes.number.isRequired,
    actualResponses: PropTypes.number.isRequired,
    // Ex of props in `values`:
    // {value_key_as_str}: Number (Qty of resp. w/this value)
    values: PropTypes.objectOf(PropTypes.number).isRequired,
    classes: PropTypes.object.isRequired,
    responseStuctureId: PropTypes.number,
    responseStructures: PropTypes.object,
  };

  /**
   * Generates JSX for status bar markers
   * (The verticle lines that segment the status bar)
   * @param {object} markers
   **/
  getMappedMarkers = (markers) => {
    const { classes } = this.props;

    return Object.keys(markers).map((key) => (
      <span
        key={key}
        className={classes.marker}
        style={{
          right: `${markers[key]}%`,
          ...(includes([0.0, 100.0], markers[key]) && { display: "none" }),
        }}
      />
    ));
  };

  /**
   * Generates JSX for status bar responses
   * (individual status bar sections w/tooltip)
   * @param {object} segments
   **/
  getMappedResponses = (segments) => {
    const { responseStructures, classes, responseStuctureId } = this.props;

    let responseValues = get(responseStructures[responseStuctureId], "response_value", "");

    return Object.keys(segments).map((key) => {
      let classSegment, titleName, percentage;

      if (key !== "null") {
        classSegment = "segment" + key;
        titleName = get(responseValues[key], "label", "");
        percentage = segments[key] === 100.0 ? "100%" : segments[key].toPrecision(2) + "%";
      }

      if (key === "null") {
        classSegment = "segmentnull";
        titleName = "Unanswered";
        percentage = "";
      }

      return (
        <div
          className={clsx(classes.response_segment, classes[classSegment])}
          style={{
            width: `${segments[key]}%`,
            ...(segments[key] === 0.0 && { display: "none" }),
          }}
          key={key}
        >
          <Tooltip classes={{ tooltip: classes.tooltip }} placement="top" title={titleName}>
            <div className={classes.response_segment_text}>{percentage}</div>
          </Tooltip>
        </div>
      );
    });
  };

  render() {
    const { classes, possibleResponses, values } = this.props;

    let statusesAccommodated = 4;
    let segments = {};
    let markers = {};
    let i;

    // If no values submitted.
    if (isNil(_values) || _values(values).length === 0) {
      segments[null] = 100.0;
      for (i = 0; i < statusesAccommodated; i++) {
        markers[i] = 0.0;
        segments[i] = 0.0;
      }
    } else {
      for (i = 0; i < statusesAccommodated; i++) {
        // statusKey will represent the values (i.e., 0-3)
        let statusKey = statusesAccommodated - (i + 1);

        if (!isNil(values[statusKey.toString()])) {
          let val = values[statusKey.toString()];
          segments[statusKey] = (val * 100.0) / possibleResponses;
        } else {
          segments[statusKey] = 0.0;
        }
      }

      // Prevent not-null widths from adding up to more than 100%.
      let sumNotNullSegments = 0;
      for (i = 0; i < statusesAccommodated; i++) {
        sumNotNullSegments += segments[i];
      }

      let reducedNotNullSegments = Math.min(100, sumNotNullSegments);
      segments[null] = 100.0 - reducedNotNullSegments;
      markers[statusesAccommodated] = segments[null];

      for (i = 0; i < statusesAccommodated; i++) {
        var currentMarkerKey = statusesAccommodated - (i + 1);
        var totalOthers = segments[null];
        for (var i2 = 0; i2 < currentMarkerKey; i2++) {
          totalOthers += segments[i2];
        }
        markers[currentMarkerKey] = totalOthers;
      }
    }

    return (
      <div className={classes.root}>
        <div className={classes.markers}>{this.getMappedMarkers(markers)}</div>

        <div className={classes.responses}>{this.getMappedResponses(segments)}</div>
      </div>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ app_meta }) => ({
      responseStructures: app_meta.data.responseStructures,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(StatusIndicator));
