import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * Action plan question CTA for item detail
 *
 * @extends Component
 */
class ActionPlanQuestionsCta extends Component {
  render() {
    let dynamicText = <DynamicContent machineName={"action_plan_item_detail_tip_2_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA title={"Have questions?"} text={dynamicText} />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(ActionPlanQuestionsCta);
