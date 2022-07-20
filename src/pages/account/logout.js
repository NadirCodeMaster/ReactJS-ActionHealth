import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { attemptLogout } from "store/actions";

/**
 * Executes the log out process for a user.
 */
class Logout extends Component {
  componentDidMount() {
    if (this.props.currentUser.isAuthenticated) {
      this.props.dispatchAttemptLogout();
    }
  }

  render() {
    const { currentUser } = this.props;

    // Show logging out message until user is logged out.
    if (currentUser.isAuthenticated) {
      return <p>Logging out...</p>;
    }
    // Forward user to logged out page when logged out.
    return (
      <React.Fragment>
        <Redirect to="/app/account/logged-out" />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

export default connect(
  (state, ownProps) => {
    return {
      currentUser: state.auth.currentUser,
    };
  },
  (dispatch, ownProps) => {
    return {
      dispatchAttemptLogout: () => dispatch(attemptLogout()),
    };
  }
)(withStyles(styles, { withTheme: true })(Logout));
