import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import schoolImg from "images/school.svg";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * My Organizations CTA (app/account/organizations)
 *
 * @extends Component
 */
class MyOrganizationsCta extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired, // via withStyles
  };

  render() {
    let dynamicText = <DynamicContent machineName={"my_organizations_tip_1_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA
          title={`These are the organizations you've already joined`}
          linkHref={"/app/account/organizations/join"}
          linkText={`Join another organization's team`}
          text={dynamicText}
          imgSrc={schoolImg}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(MyOrganizationsCta);
