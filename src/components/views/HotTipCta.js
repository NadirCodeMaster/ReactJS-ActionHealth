import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";
import fireImg from "images/fire.svg";

/**
 * Hot Tip CTA for action plan item select
 *
 * @extends Component
 */
class HotTipCta extends Component {
  render() {
    const { organizationId } = this.props;
    let dynamicText = <DynamicContent machineName={"action_plan_item_selection_tip_1_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA
          title={"Hot Tip!"}
          text={dynamicText}
          linkText={"See my Assessments"}
          linkHref={`/app/account/organizations/${organizationId}/sets`}
          imgSrc={fireImg}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(HotTipCta);
