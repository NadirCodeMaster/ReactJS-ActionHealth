import React, { Component } from "react";
import PropTypes from "prop-types";
import { get } from "lodash";
import { withStyles } from "@mui/styles";

// Provides a simple CTA block linking to a downloadable
// version of an assessment (if there is one).

class SetDownloadCta extends Component {
  static propTypes = {
    set: PropTypes.object.isRequired,
  };

  render() {
    const { set } = this.props;

    let dlUrl = get(set, "download_url", null);

    if (!dlUrl) {
      // no download URL
      return null;
    }

    return (
      <a target="_blank" rel="noopener noreferrer" href={dlUrl}>
        Assessment Guide
      </a>
    );
  }
}

const styles = (theme) => ({});

export default withStyles(styles, { withTheme: true })(SetDownloadCta);
