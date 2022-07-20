import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import bullhornImg from "images/bullhorn.svg";
import CtaTemplateA from "components/ui/CtaTemplateA";
import DynamicContent from "components/ui/DynamicContent";

/**
 * Typical "spread the word" CTA.
 *
 * @extends Component
 */
class SpreadTheWordCta extends React.Component {
  static propTypes = {
    theme: PropTypes.object.isRequired, // via withStyles
  };

  render() {
    let dynamicText = <DynamicContent machineName={"organization_overview_tip_2_body"} />;

    return (
      <React.Fragment>
        <CtaTemplateA
          text={dynamicText}
          linkHref={"https://www.healthiergeneration.org/take-action/schools/promote-your-program"}
          linkText={"Promote your program"}
          imgSrc={bullhornImg}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(SpreadTheWordCta);
