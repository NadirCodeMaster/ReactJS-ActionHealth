import React, { Component } from "react";
import PropTypes from "prop-types";
import CriterionUserFunctions from "components/views/CriterionUserFunctions";
import { Divider } from "@mui/material";
import { withStyles } from "@mui/styles";

/**
 * Component for displaying experts related to a specified criterion instance
 */
class CriterionExperts extends Component {
  static propTypes = {
    criterionInstance: PropTypes.object.isRequired,
    userFunctions: PropTypes.array.isRequired,
  };

  render() {
    const { classes, criterionInstance, userFunctions } = this.props;

    return (
      <React.Fragment>
        <div>
          <h3>Who will likely know the answer?</h3>
          <CriterionUserFunctions
            criterionId={criterionInstance.criterion_id}
            callerUserFunctions={userFunctions}
          />
        </div>
        <Divider />
        <div className={classes.contactExpertContainer}>
          <h3>Still don't know the answer?</h3>
          <p>
            <a href="/about-us/leadership/health-experts" target="_blank" rel="noopener noreferrer">
              Contact an expert.
            </a>
          </p>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  contactExpertContainer: {
    marginTop: theme.spacing(2),
  },
});

export default withStyles(styles, { withTheme: true })(CriterionExperts);
