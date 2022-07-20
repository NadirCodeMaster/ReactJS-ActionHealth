import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import targetImg from "images/target.svg";

/**
 * Assessment worksheet box (used on set detail page)
 */
export default function AssessmentWorksheetBox({ worksheetUrl }) {
  const classes = useStyles();
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 500;
  const sizeStr = width > maxSmWidth ? "lg" : "sm";

  return (
    <div ref={ref} className={clsx(classes.worksheetContainer, sizeStr)}>
      <div className={clsx(classes.worksheetBody, sizeStr)}>
        <img alt="" className={classes.worksheetImage} src={targetImg} />
        <div>
          <h3>Not sure what to focus on first?</h3>
          <div>
            This worksheet helps identify where to start based on your school community’s priorities
            and capacity.
          </div>
        </div>
      </div>
      <div className={clsx(classes.worksheetLinkContainer, sizeStr)}>
        <a href={worksheetUrl} target="_blank" rel="noopener noreferrer">
          Download worksheet
        </a>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  worksheetContainer: {
    "&.lg": {
      display: "flex",
      alignItems: "center",
    },
  },
  worksheetImageContainer: {
    "&.lg": {
      width: "15%",
    },
  },
  worksheetImage: {
    height: "50px",
    marginRight: theme.spacing(2),
  },
  worksheetBody: {
    display: "flex",
    "&.lg": {
      width: "70%",
    },
    "&.sm": {
      marginBottom: theme.spacing(),
    },
  },
  worksheetLinkContainer: {
    "&.lg": {
      width: "20%",
      marginLeft: "auto",
    },
    "&.sm": {
      marginLeft: theme.spacing(8.2),
    },
  },
}));

AssessmentWorksheetBox.propTypes = {
  worksheetUrl: PropTypes.string.isRequired,
};
