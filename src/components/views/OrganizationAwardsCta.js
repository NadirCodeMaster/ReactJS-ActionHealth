import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import medalImg from "images/medal.svg";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * Organization-specific CTA to learn about/link to award info.
 *
 * @extends Component
 */
class OrganizationAwardsCta extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired, // via withStyles
  };

  render() {
    let dynamicText = <DynamicContent machineName={"organization_overview_tip_1_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA
          text={dynamicText}
          linkHref={
            "https://www.healthiergeneration.org/take-action/schools/national-healthy-schools-award"
          }
          linkText={"Learn more about awards"}
          imgSrc={medalImg}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(OrganizationAwardsCta);
