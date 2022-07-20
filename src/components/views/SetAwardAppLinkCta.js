import React, { Component } from "react";
import PropTypes from "prop-types";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { withStyles } from "@mui/styles";
import setAwardApplicationUrl from "utils/setAwardApplicationUrl";

/**
 * Provides a simple CTA block linking to the award
 * application for an assessment (if there is one).
 */

class SetAwardAppLinkCta extends Component {
  static propTypes = {
    set: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
  };

  render() {
    const { classes, set, organization } = this.props;
    let url = setAwardApplicationUrl(set.id, organization);

    if (!url) {
      // no award application URL
      return null;
    }

    return (
      <div>
        <StarBorderIcon className={classes.centerIcon} />
        <a target="_blank" rel="noopener noreferrer" href={url}>
          Apply for an Award
        </a>
      </div>
    );
  }
}

const styles = (theme) => ({
  centerIcon: {
    verticalAlign: "middle",
    color: theme.palette.primary.main,
    paddingRight: ".1em",
  },
});

export default withStyles(styles, { withTheme: true })(SetAwardAppLinkCta);
