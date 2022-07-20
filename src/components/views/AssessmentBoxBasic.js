import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import assessmentDisplayStatuses from "utils/assessmentDisplayStatuses";
import clsx from "clsx";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import DraftEditor from "components/ui/DraftEditor";
import styleVars from "style/_vars.scss";

/**
 * Assessment basic action box
 */
export default function AssessmentBoxBasic({ assessment, orgId, image, userCanViewSets }) {
  const classes = useStyles();
  const displayStatuses = assessmentDisplayStatuses(assessment.percentComplete);
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 599;
  let sizeStr = width > maxSmWidth ? "lg" : "sm";

  return (
    <div ref={ref} className={classes.basicContainer}>
      {image && (
        <div>
          <img alt="" className={classes.assessmentImage} src={image} />
        </div>
      )}
      <div className={clsx(classes.rowContainer, sizeStr)}>
        {userCanViewSets && (
          <Fragment>
            <div className={clsx(classes.innerCol1, sizeStr)}>
              <Link
                className={classes.assessmentName}
                to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
              >
                {assessment.name}
              </Link>
              <div>
                <DraftEditor
                  readOnly={true}
                  value={assessment.description ? assessment.description : ""}
                />
              </div>
            </div>
            <div className={clsx(classes.innerCol2, sizeStr)}>{displayStatuses.text}</div>
            <div className={clsx(classes.innerCol3, sizeStr)}>
              <Button
                aria-label={displayStatuses.button}
                className={classes.assessmentButton}
                color="primary"
                variant="contained"
                href={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
              >
                {displayStatuses.button}
              </Button>
            </div>
          </Fragment>
        )}
        {!userCanViewSets && (
          <small>
            <em>restricted</em>
          </small>
        )}
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  assessmentButton: {
    width: "120px",
    borderRadius: 5,
  },
  assessmentImage: {
    width: "50px",
  },
  assessmentName: {
    fontSize: styleVars.txtFontSizeLg,
    marginBottom: theme.spacing(),
  },
  basicContainer: {
    padding: styleVars.paperPadding,
    border: `2px solid ${styleVars.colorLightGray}`,
  },
  rowContainer: {
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

AssessmentBoxBasic.propTypes = {
  assessments: PropTypes.object,
  orgId: PropTypes.number.isRequired,
  image: PropTypes.string,
};
