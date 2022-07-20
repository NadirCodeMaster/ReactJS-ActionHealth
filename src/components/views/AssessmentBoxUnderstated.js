import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Paper, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { get } from "lodash";
import programBranding from "utils/programBranding";
import DraftEditor from "components/ui/DraftEditor";
import styleVars from "style/_vars.scss";

/**
 * Assessment understated action box
 */
export default function AssessmentBoxUnderstated({ assessment, orgId, userCanViewSet }) {
  const classes = useStyles();
  const theme = useTheme();

  const programBrandingOutput = () => {
    let programMachineName = get(assessment, "program.machine_name", "");
    let programBrandingStyle = {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-start",
      marginLeft: theme.spacing(-1),
      marginBottom: theme.spacing(-2),
    };

    return programBranding(programMachineName, programBrandingStyle);
  };

  return (
    <Paper className={classes.understatedContainer}>
      {userCanViewSet && (
        <div className={classes.assessmentContent}>
          <Link
            to={`/app/programs/${assessment.program_id}/organizations/${orgId}/sets/${assessment.id}`}
            className={classes.assessmentNameHeader}
          >
            {assessment.name}
          </Link>
          {programBrandingOutput()}
          <div className={classes.assessmentDescription}>
            <DraftEditor
              readOnly={true}
              value={assessment.description ? assessment.description : ""}
            />
          </div>
        </div>
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
  understatedContainer: {
    padding: styleVars.paperPadding,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  assessmentNameHeader: {
    fontSize: styleVars.txtFontSizeLg,
  },
  assessmentDescription: {
    marginTop: theme.spacing(),
  },
}));

AssessmentBoxUnderstated.propTypes = {
  assessments: PropTypes.object,
  orgId: PropTypes.number,
  userCanViewSet: PropTypes.bool,
};
