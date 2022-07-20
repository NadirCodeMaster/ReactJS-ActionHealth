import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withStyles } from "@mui/styles";
import PendingUsers from "components/views/PendingOrganizationUsersForOrganizationAdmin";
import generateTitle from "utils/generateTitle";

const styles = (theme) => ({});

/**
 * Admin display of pending user/org requests.
 */
class Pending extends Component {
  constructor(props) {
    super(props);
    this.pageTitle = "Pending Invites";
  }

  componentDidMount() {
    generateTitle(this.pageTitle);
  }

  render() {
    return (
      <React.Fragment>
        <h1>{this.pageTitle}</h1>
        <PendingUsers />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Pending));
