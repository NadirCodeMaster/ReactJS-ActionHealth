import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import AssessmentBoxBasic from "components/views/AssessmentBoxBasic";
import AssessmentBoxEconomy from "components/views/AssessmentBoxEconomy";

/**
 * Assessments list, for dashboard and org overview displays
 */
export default function AssessmentsList({ assessments, userCanViewSets, orgId, image }) {
  const classes = useStyles();

  return (
    <Fragment>
      {assessments.map((set, setIdx) => (
        <div key={`assessment_${setIdx}`}>
          {setIdx === 0 && (
            <div className={classes.assessmentBoxContainer}>
              <AssessmentBoxBasic
                orgId={orgId}
                image={image}
                assessment={set}
                userCanViewSets={userCanViewSets}
              />
            </div>
          )}
          {setIdx !== 0 && (
            <div className={classes.assessmentBoxContainer}>
              <AssessmentBoxEconomy
                orgId={orgId}
                assessment={set}
                userCanViewSets={userCanViewSets}
              />
            </div>
          )}
        </div>
      ))}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  assessmentBoxContainer: {
    marginBottom: theme.spacing(),
  },
}));

AssessmentsList.propTypes = {
  assessments: PropTypes.array.isRequired,
  orgId: PropTypes.number.isRequired,
  image: PropTypes.string,
};
