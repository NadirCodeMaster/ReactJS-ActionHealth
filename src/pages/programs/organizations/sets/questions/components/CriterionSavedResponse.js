import React, { Component } from "react";
import PropTypes from "prop-types";
import HgSkeleton from "components/ui/HgSkeleton";
import AddToActionPlan from "components/views/AddToActionPlan";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

/**
 * Component for displaying current saved response of criterion
 * Also AddToActionPlan and last updated by logic
 */
class CriterionSavedResponse extends Component {
  static propTypes = {
    savedResponseLoading: PropTypes.bool,
    savedResponse: PropTypes.object,
    statusName: PropTypes.string,
    statusDate: PropTypes.string,
    statusUpdatedByStr: PropTypes.string,
    addToActionPlan: PropTypes.func,
    organization: PropTypes.object,
    criterionInstance: PropTypes.object.isRequired,
    planItem: PropTypes.object,
    planItemLoading: PropTypes.bool,
    userCanEditActionPlan: PropTypes.bool,
    userCanViewActionPlan: PropTypes.bool,
  };

  /**
   * @returns {object} jsx for skeleton screen
   */
  statusEntrySkeletonScreen = () => {
    const { classes } = this.props;

    return (
      <div className={classes.statusBoxItem}>
        <div style={{ marginRight: "10px" }} className={classes.statusBoxLabel}>
          <HgSkeleton variant="text" />
        </div>
        <div className={classes.statusBoxValue}>
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
        </div>
      </div>
    );
  };

  render() {
    const {
      classes,
      savedResponseLoading,
      savedResponse,
      statusName,
      statusDate,
      statusUpdatedByStr,
      addToActionPlan,
      organization,
      criterionInstance,
      planItem,
      planItemLoading,
      userCanEditActionPlan,
      userCanViewActionPlan,
    } = this.props;

    return (
      <React.Fragment>
        {savedResponseLoading ? (
          this.statusEntrySkeletonScreen()
        ) : (
          <div className={classes.statusBoxItem}>
            <div className={classes.statusBoxLabel}>
              <strong>Status</strong>
            </div>
            <div className={classes.statusBoxValue}>
              <div className={classes.statusBoxValueStatusName}>{statusName}</div>
              <div className={classes.statusBoxValueActionPlanOutput}>
                <AddToActionPlan
                  addToActionPlan={addToActionPlan}
                  organization={organization}
                  criterionInstance={criterionInstance}
                  planItem={planItem}
                  planItemLoading={planItemLoading}
                  userCanEditActionPlan={userCanEditActionPlan}
                  userCanViewActionPlan={userCanViewActionPlan}
                />
              </div>
            </div>
          </div>
        )}

        {savedResponseLoading && this.statusEntrySkeletonScreen()}

        {savedResponse && (
          <React.Fragment>
            <br />
            <div className={classes.statusBoxItem}>
              <div className={classes.statusBoxLabel}>
                <strong>Last update</strong>
              </div>
              {statusDate && (
                <div className={classes.statusBoxValue}>
                  <span>
                    {statusUpdatedByStr && statusUpdatedByStr.length > 0 && (
                      <span>by {statusUpdatedByStr} on </span>
                    )}
                  </span>
                  <span>{statusDate}</span>
                </div>
              )}
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  statusBoxValueStatusName: {
    marginBottom: theme.spacing(0.5),
  },
  link: {
    textDecoration: "none",
  },
  statusBoxItem: {
    display: "flex",
  },
  statusBoxLabel: {
    fontWeight: styleVars.txtFontWeightDefaultBold,
    width: "100px",
    flex: "0 0 auto",
  },
  statusBoxValue: {
    textAlign: "left",
    flex: "0 1 auto",
    width: "100%",
  },
});

export default withStyles(styles, { withTheme: true })(CriterionSavedResponse);
