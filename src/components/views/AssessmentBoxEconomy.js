import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import assessmentDisplayStatuses from "utils/assessmentDisplayStatuses";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

/**
 * Assessment economy action box
 */
export default function AssessmentBoxEconomy({ assessment, orgId, userCanViewSets }) {
  const classes = useStyles();
  const displayStatuses = assessmentDisplayStatuses(assessment.percentComplete);
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 599;
  let sizeStr = width > maxSmWidth ? "lg" : "sm";

  return (
    <div ref={ref} className={clsx(classes.basicContainer, sizeStr)}>
      {userCanViewSets && (
        <Fragment>
          <div className={clsx(classes.innerCol1, sizeStr)}>{assessment.name}</div>
          <div className={clsx(classes.innerCol2, sizeStr)}>{displayStatuses.text}</div>
          <div className={clsx(classes.innerCol3, sizeStr)}>
            <Link
              className={classes.assessmentName}
              to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
            >
              View
            </Link>
          </div>
        </Fragment>
      )}
      {!userCanViewSets && (
        <small>
          <em>restricted</em>
        </small>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  basicContainer: {
    padding: styleVars.paperPadding,
    border: `2px solid ${styleVars.colorLightGray}`,
    "&.lg": {
      display: "flex",
      alignItems: "center",
    },
  },
  innerCol1: {
    "&.lg": { width: "60%" },
    "&.sm": { marginBottom: theme.spacing() },
  },
  innerCol2: {
    "&.lg": {
      marginLeft: theme.spacing(2),
      width: "20%",
    },
    "&.sm": { marginBottom: theme.spacing() },
  },
  innerCol3: {
    "&.lg": {
      marginLeft: theme.spacing(2),
      width: "20%",
    },
  },
}));

AssessmentBoxEconomy.propTypes = {
  assessments: PropTypes.object,
  orgId: PropTypes.number,
};
