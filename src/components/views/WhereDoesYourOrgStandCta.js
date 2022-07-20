import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import CtaTemplateA from "components/ui/CtaTemplateA";
import questionDocImg from "images/question-doc.svg";
import DynamicContent from "components/ui/DynamicContent";

/**
 * "Where does your {OrgType} stand" CTA.
 *
 * @extends Component
 */
class WhereDoesYourOrgStandCta extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired, // via withStyles
  };

  render() {
    let dynamicText = <DynamicContent machineName={"assessments_tip_1_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA
          title={"How healthy is your organization?"}
          text={dynamicText}
          imgSrc={questionDocImg}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(WhereDoesYourOrgStandCta);
