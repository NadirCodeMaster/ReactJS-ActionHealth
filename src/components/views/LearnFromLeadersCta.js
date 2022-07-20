import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * Lean from leader CTA for action plan item detail
 *
 * @extends Component
 */
class LearnFromLeadersCta extends Component {
  render() {
    let dynamicText = <DynamicContent machineName={"action_plan_item_detail_tip_1_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA title={"Learn from leaders like you"} text={dynamicText} />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(LearnFromLeadersCta);
