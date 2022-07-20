import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import checklistImg from "images/checklist.svg";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * See what actions you can take CTA
 *
 * @extends Component
 */
class SeeActionPlanActionCta extends Component {
  render() {
    const { isBlankState } = this.props;

    let dynamicText, dynamicTitle;

    if (isBlankState) {
      dynamicText = <DynamicContent machineName={"blank_state_action_plan_tip_2_body"} />;
      dynamicTitle = <DynamicContent machineName={"blank_state_action_plan_tip_2_header"} />;
    }

    if (!isBlankState) {
      dynamicText = <DynamicContent machineName={"active_state_action_plan_tip_2_body"} />;
      dynamicTitle = <DynamicContent machineName={"active_state_action_plan_tip_2_header"} />;
    }

    return (
      <React.Fragment>
        <CtaTemplateA title={dynamicTitle} text={dynamicText} imgSrc={checklistImg} />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(SeeActionPlanActionCta);
