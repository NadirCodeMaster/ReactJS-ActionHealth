import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import HgSkeleton from "components/ui/HgSkeleton";
import ConfirmButton from "components/ui/ConfirmButton";
import { withStyles } from "@mui/styles";

/**
 * Component for 'Add to Action Plan' plan button
 * Contains logic if item is already in action plan
 */
class AddToActionPlan extends Component {
  static propTypes = {
    addToActionPlan: PropTypes.func.isRequired,
    organization: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    criterionInstance: PropTypes.object.isRequired,
    planItem: PropTypes.object,
    planItemLoading: PropTypes.bool.isRequired,
    userCanEditActionPlan: PropTypes.bool.isRequired,
    userCanViewActionPlan: PropTypes.bool.isRequired,
    shouldSave: PropTypes.bool,
  };

  /**
   * @returns {boolean} should we display 'Add to Action Plan'
   */
  displayAddButton = () => {
    const { planItem, userCanEditActionPlan } = this.props;

    return !planItem && userCanEditActionPlan;
  };

  render() {
    const {
      shouldSave,
      addToActionPlan,
      organization,
      theme,
      criterionInstance,
      planItem,
      planItemLoading,
      userCanViewActionPlan,
    } = this.props;

    if (!userCanViewActionPlan || !criterionInstance || !organization) {
      return null;
    }

    if (planItemLoading) {
      return <HgSkeleton variant="text" />;
    }

    // --- In the plan (and user is allowed to see it, per earlier check).
    if (planItem) {
      return (
        <Link to={`/app/account/organizations/${organization.id}/plan/items/${planItem.id}`}>
          <small>Item in Action Plan&gt;</small>
        </Link>
      );
    }

    let btnPadding = theme.spacing();

    if (this.displayAddButton()) {
      return (
        <React.Fragment>
          <ConfirmButton
            style={{
              position: "relative",
              left: `-${btnPadding}px`,
              padding: btnPadding,
            }}
            size="small"
            color="primary"
            onConfirm={() =>
              addToActionPlan(organization, criterionInstance.criterion_id, shouldSave)
            }
            title="Are you sure you want to add this to your Action Plan?"
            aria-label="Add to Action Plan"
            variant="text"
          >
            Add to Action Plan
          </ConfirmButton>
        </React.Fragment>
      );
    }

    return <em>Not in your Action Plan</em>;
  }
}

const styles = (theme) => ({
  link: {
    textDecoration: "none",
  },
});

export default withStyles(styles, { withTheme: true })(AddToActionPlan);
