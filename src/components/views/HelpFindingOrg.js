import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import PropTypes from "prop-types";

class HelpFindingOrg extends Component {
  static propTypes = {
    orgTypeMachineName: PropTypes.string,
  };

  render() {
    const { orgTypeMachineName } = this.props;

    const requestHref =
      "https://www.healthiergeneration.org/take-action/get-help/request-an-organization";

    return (
      <div style={{ textAlign: "center" }}>
        {"school" === orgTypeMachineName ? (
          <React.Fragment>
            <p>
              If your school is a charter, religious, or not affiliated with a district, please
              select the <em>"N/A (does not belong to a district)"</em> option.
            </p>
            <p>
              You can{" "}
              <a target="_blank" rel="noopener noreferrer" href={requestHref}>
                request it
              </a>{" "}
              if you are still unable to find your school.
            </p>
          </React.Fragment>
        ) : (
          <p>
            Not finding your organization?
            <br />
            <a target="_blank" rel="noopener noreferrer" href={requestHref}>
              Request it
            </a>
          </p>
        )}
      </div>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(HelpFindingOrg);
