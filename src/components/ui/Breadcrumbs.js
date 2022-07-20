import React, { Component } from "react";
import { compose } from "redux";
import { withStyles } from "@mui/styles";

/**
 * Standardized wrapper for Breadcrumbs.
 */
class Breadcrumbs extends Component {
  render() {
    const { children, classes } = this.props;

    return (
      <div className="no-print">
        <div className={classes.wrapper}>{children}</div>
      </div>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      marginBottom: theme.spacing(0.5),
    },
  },
});

export default compose(withStyles(styles, { withTheme: true })(Breadcrumbs));
