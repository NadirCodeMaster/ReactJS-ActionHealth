import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import PendingUsers from "components/views/PendingOrganizationUsersGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

const styles = (theme) => ({});

/**
 * Admin display of pending user/org requests.
 */
class Pending extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
  };

  componentDidMount() {
    generateTitle("Pending");
  }

  componentDidUpdate() {
    generateTitle("Pending");
  }

  render() {
    return (
      <React.Fragment>
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
