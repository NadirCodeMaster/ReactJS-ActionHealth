import React, { Component } from "react";
import { get } from "lodash";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";

/**
 * Print screen Plan board CTA
 *
 * @extends Component
 */
class PrintActionPlanCta extends Component {
  getTextJsx = () => {
    const { classes, organization } = this.props;

    let orgTypeName = get(organization, "organization_type.name", "organization").toLowerCase();

    return (
      <div>
        <div>
          This is a collaborative to-do list. It will help you identify and keep track of the
          specific steps to achieve your
          {orgTypeName}'s goals. Add questions from the assessments that you'd like to work on.
          Categorize them to help focus on your most important tasks
        </div>
        <div className={classes.upperPrintLinkTitle}>Access your Action Plan online at:</div>
        <div>
          https://healthiergeneration.org/app/account/organizations/
          {organization.id}/plan
        </div>
        <div className={classes.lowerPrintLinkTitle}>Add colleagues as team members here:</div>
        <div>
          https://healthiergeneration.org/app/account/organizations/
          {organization.id}/team
        </div>
      </div>
    );
  };

  render() {
    return <CtaTemplateA title={"What is the Action Plan"} text={this.getTextJsx()} />;
  }
}

const styles = (theme) => ({
  upperPrintLinkTitle: {
    margin: theme.spacing(1, 0, 0, 0),
  },
  lowerPrintLinkTitle: {
    margin: theme.spacing(1, 0, 0, 0),
  },
});

export default withStyles(styles, { withTheme: true })(PrintActionPlanCta);
