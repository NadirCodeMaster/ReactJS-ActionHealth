import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { get } from "lodash";
import programBranding from "utils/programBranding";
import { Paper, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

/**
 * Assessment premium action box
 */
export default function AssessmentBoxPremium({ assessment, orgId, userCanViewSet }) {
  const classes = useStyles();
  const theme = useTheme();
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 500;
  const sizeStr = width > maxSmWidth ? "lg" : "sm";

  const blob = () => {
    if (assessment.percentComplete === 0) {
      return notStartedBlob();
    }

    if (assessment.percentComplete > 0 && assessment.percentComplete < 100) {
      return inProgressBlob();
    }

    if (assessment.percentComplete === 100) {
      return finishedBlob();
    }
  };

  const notStartedBlob = () => {
    return (
      <div>
        <div>
          <div className={classes.blobHeader}>Everything's connected</div>
          <div className={classes.blobBodyContent}>
            Answer a question in one topic and see how it relates to other topics!
          </div>
          <div className={classes.blobHeader}>Build your foundation</div>
          <div className={classes.blobBodyContent}>
            A great place to start is by answering the core questions. These will help you build the
            foundation to make healthy changes.
          </div>
        </div>
        <Link
          to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
        >
          Get started answering questions
        </Link>
      </div>
    );
  };

  const inProgressBlob = () => {
    return (
      <div>
        <div className={classes.blobHeader}>It’s all connected</div>
        <div className={classes.blobBodyContent}>
          Some questions apply to multiple topics. You only need to answer once, and your response
          will be saved everywhere.
        </div>
        <div className={classes.blobHeader}>Focus on what’s important</div>
        <div className={classes.blobBodyContent}>
          Assess your practices and policies in the topics that are important to you.
        </div>
        <Link
          to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
        >
          Continue this assessment
        </Link>
      </div>
    );
  };

  const finishedBlob = () => {
    return (
      <div>
        <div className={classes.blobHeader}>Well done!</div>
        <div className={classes.blobBodyContent}>
          You’ve taken a huge step toward whole child health in your community by completing the
          assessment.
        </div>
        <div className={classes.blobHeader}>Keep current and committed</div>
        <div className={classes.blobBodyContent}>
          Update your assessment each year to ensure that your responses are accurate and your
          improvements are captured. Use the Action Plan tool to organize and track your work.
        </div>
        <Link to={`/app/account/organizations/${orgId}/plan`}>Go to your Action Plan</Link>
      </div>
    );
  };

  const programBrandingOutput = () => {
    let programMachineName = get(assessment, "program.machine_name", "");
    let programBrandingStyle = {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-start",
      marginLeft: theme.spacing(-1),
    };

    return programBranding(programMachineName, programBrandingStyle);
  };

  return (
    <Paper ref={ref} className={clsx(classes.premiumContainer, sizeStr)}>
      {userCanViewSet && (
        <Fragment>
          <div className={clsx(classes.leftColumn, sizeStr)}>
            <Link
              to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
              className={classes.assessmentNameHeader}
            >
              {assessment.name}
            </Link>
            {programBrandingOutput()}
            <div className={classes.assessmentBlob}>{blob()}</div>
          </div>
          <div className={clsx(classes.rightColumn, sizeStr)}>
            <h3 className={classes.moduleHeader}>What's in this assessment</h3>
            <ul>
              {assessment.modules.map((_module, idx) => (
                <Link
                  to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}/modules/${_module.id}`}
                  key={`setModules_${idx}`}
                >
                  <li>{_module.name}</li>
                </Link>
              ))}
            </ul>
          </div>
        </Fragment>
      )}
      {!userCanViewSet && (
        <small>
          <em>restricted</em>
        </small>
      )}
    </Paper>
  );
}

const useStyles = makeStyles((theme) => ({
  assessmentBlob: {
    marginTop: theme.spacing(),
  },
  assessmentNameHeader: {
    fontSize: styleVars.txtFontSizeXl,
  },
  blobBodyContent: {
    marginBottom: theme.spacing(2),
  },
  blobHeader: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  premiumContainer: {
    padding: styleVars.paperPadding,
    "&.lg": {
      display: "flex",
      justifyContent: "space-between",
    },
  },
  leftColumn: {
    "&.lg": {
      width: "50%",
      borderRight: `2px solid ${styleVars.colorLightGray}`,
      paddingRight: styleVars.paperPadding,
    },
    "&.sm": {
      paddingBottom: styleVars.paperPadding,
    },
  },
  rightColumn: {
    "&.lg": {
      width: "50%",
      paddingLeft: theme.spacing(2),
      paddingRight: styleVars.paperPadding,
    },
    "&.sm": {
      borderTop: `2px solid ${styleVars.colorLightGray}`,
      paddingTop: styleVars.paperPadding,
    },
  },
}));

AssessmentBoxPremium.propTypes = {
  assessments: PropTypes.object,
  orgId: PropTypes.number,
  userCanViewSet: PropTypes.bool,
};
