import React, { Component } from "react";
// import PropTypes from 'prop-types'; // @TODO IMPLEMENT
import { Link } from "react-router-dom";
import { Grid } from "@mui/material";
import { withStyles } from "@mui/styles";
import ForgotPasswordForm from "components/views/ForgotPasswordForm";
import generateTitle from "utils/generateTitle";

const styles = (theme) => ({});

class WelcomeBack extends Component {
  componentDidMount() {
    generateTitle("Welcome Back");
  }

  componentDidUpdate() {
    generateTitle("Welcome Back");
  }

  render() {
    return (
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6}>
          <ForgotPasswordForm>
            <h1>New site, new password</h1>
            <p>We're starting fresh with security for our new site.</p>
            <p>
              Please enter the email address associated with your account and we'll send you a link
              to set up your new password.
            </p>
            <p>
              If you don't receive the email in 5 minutes, be sure to check your spam filter. If
              you're still having trouble,{" "}
              <a href="https://www.healthiergeneration.org/take-action/schools/get-help">
                contact us
              </a>
              .
            </p>
          </ForgotPasswordForm>
        </Grid>

        <Grid item xs={12}>
          <div style={{ marginTop: "1em", textAlign: "center" }}>
            <p>
              <small>
                <Link className="muted_link" to="/app/account/reactivate">
                  Reactivate Account
                </Link>
              </small>
            </p>
          </div>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })(WelcomeBack);
