import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * Intro to action plan CTA
 *
 * @extends Component
 */
class IntroActionPlanCta extends Component {
  render() {
    const { isBlankState } = this.props;

    let dynamicText, dynamicTitle;

    if (isBlankState) {
      dynamicText = <DynamicContent machineName={"blank_state_action_plan_tip_1_body"} />;
      dynamicTitle = <DynamicContent machineName={"blank_state_action_plan_tip_1_header"} />;
    }

    if (!isBlankState) {
      dynamicText = <DynamicContent machineName={"active_state_action_plan_tip_1_body"} />;
      dynamicTitle = <DynamicContent machineName={"active_state_action_plan_tip_1_header"} />;
    }

    return (
      <React.Fragment>
        <CtaTemplateA title={dynamicTitle} text={dynamicText} />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(IntroActionPlanCta);
