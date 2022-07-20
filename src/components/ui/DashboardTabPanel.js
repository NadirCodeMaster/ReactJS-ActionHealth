import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { withStyles } from "@mui/styles";

/**
 * Tab panel compoent for use on dashboards.
 *
 * @todo abstract this for wider use (allow IDs to be customized, etc)
 */
class DashboardTabPanel extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  render() {
    const { children, value, index, classes } = this.props;
    let isActive = value === index;

    return (
      <React.Fragment>
        <div
          className={clsx(isActive ? classes.tabVisible : classes.tabHidden, classes.tab)}
          id={`dashboard-tabpanel-${index}`}
        >
          <div className={classes.childrenWrapper}>{children}</div>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  tab: {
    transition: "visibility 0s linear 300ms",
  },
  tabVisible: {},
  tabHidden: {
    height: "0 !important",
    overflow: "hidden",
    visibility: "hidden",
  },
  childrenWrapper: {},
});

export default withStyles(styles, { withTheme: true })(DashboardTabPanel);
