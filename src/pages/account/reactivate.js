import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import ForgotPasswordForm from "components/views/ForgotPasswordForm";
import { reactivateAccount } from "store/actions";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class Reactivate extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape),
  };

  componentDidMount() {
    generateTitle("Reactivate");
  }

  componentDidUpdate(prevProps) {
    generateTitle("Reactivate");
  }

  render() {
    const { classes, currentUser, reactivateAccount } = this.props;

    // If user is authenticated, send them to dashboard.
    // (they don't need to reactivate anything)
    if (currentUser && currentUser.isAuthenticated) {
      return <Redirect to="/app/account/dashboard" />;
    }

    return (
      <div className={classes.wrapper}>
        <Paper className={classes.paper}>
          <div className={classes.formWrapper}>
            <ForgotPasswordForm
              customReset={reactivateAccount}
              submitButtonText="Send reactivation link"
            >
              <h1>Reactivate Account</h1>
              <p>Enter your email address and we will send you a reactivation link</p>
            </ForgotPasswordForm>
          </div>
        </Paper>
      </div>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    margin: "0 auto",
    maxWidth: "800px",
  },
  formWrapper: {
    marginBottom: theme.spacing(3),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "410px",
    width: "80%",
  },
  paper: {
    marginBottom: theme.spacing(3),
    padding: styleVars.paperPadding,
    textAlign: "center",
  },
});

export default connect(
  ({ auth, programs }) => ({
    currentUser: auth.currentUser,
  }),
  (dispatch) => ({
    reactivateAccount: (email) => dispatch(reactivateAccount({ email })),
  })
)(withStyles(styles, { withTheme: true })(Reactivate));
