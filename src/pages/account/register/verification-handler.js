import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withCookies } from "react-cookie";
import { withRouter } from "react-router";
import qs from "qs";
import { Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { isEmpty, isString } from "lodash";
import { Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import generateTitle from "utils/generateTitle";
import { requestProcessEmailVerificationToken } from "api/requests";
import validateAppDest from "utils/validateAppDest";
import errorSuffix from "utils/errorSuffix";
import authConfigs from "constants/authConfigs";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

const VTOKEN_CHECK_PENDING = -1;
const VTOKEN_CHECK_FAILED = 0;
const VTOKEN_CHECK_SUCCEEDED = 1;

/**
 * Display and handler code for when user clicks an account verification link from registration.
 *
 * @extends Component
 */
class RegistrationVerificationHandler extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    verificationToken: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
  }

  state = {
    // Status of verification token check.
    //  `-1`: not checked yet
    //  `0`:  failed
    //  `1`:  succeeded
    verificationStatus: VTOKEN_CHECK_PENDING,
    // Destination passed to login to allow redirecting upon
    // successful authentication.
    destination: null,
  };

  componentDidMount() {
    const { cookies, verificationToken } = this.props;

    generateTitle("Account Verification");

    // Check if a post-registration destination cookie has been set,
    // add it to component state. Validate the same as our typical
    // appDest usage.
    // @see store/sagas/register.js
    let dest = cookies.get(authConfigs.registerDest);
    if (validateAppDest(dest)) {
      this.setState({
        destination: dest,
      });
    }

    // Verify the provided token.
    this.checkToken(verificationToken);
  }

  componentDidUpdate(prevProps, prevState) {
    const { verificationToken } = this.props;
    const { verificationToken: prevVerificationToken } = this.props;
    if (verificationToken !== prevVerificationToken) {
      this.checkToken(verificationToken);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  checkToken(verificationToken) {
    if (isEmpty(verificationToken) || !isString(verificationToken)) {
      this.setState({ verificationStatus: VTOKEN_CHECK_FAILED });
      return;
    }

    // Messages shown to user for different API responses.
    // @see requestProcessEmailVerificationToken()
    let msgs = {
      200: "Verified! You can now log in.",
      204: "Already verified! You can log in.",
    };

    requestProcessEmailVerificationToken(verificationToken)
      .then((res) => {
        if (!this.isCancelled) {
          hgToast(msgs[res.status]);
          this.setState({ verificationStatus: VTOKEN_CHECK_SUCCEEDED });
        }
      })
      .catch((res) => {
        if (!this.isCancelled) {
          hgToast(errorSuffix(res), "error");
          this.setState({ verificationStatus: VTOKEN_CHECK_FAILED });
        }
      });
  }

  render() {
    const { classes, currentUser, verificationToken } = this.props;
    const { destination, verificationStatus } = this.state;

    if (!verificationToken) {
      return null;
    }

    // Set login path w/appDest if applicable.
    let loginPath = "/app/account/login";
    if (destination) {
      loginPath = `${loginPath}?${qs.stringify({ appDest: destination })}`;
    }

    // Forward authenticated users to their dashboard.
    if (currentUser && currentUser.isAuthenticated) {
      return <Redirect to={"/app/account/dashboard"} />;
    }

    return (
      <React.Fragment>
        <Paper style={{ padding: styleVars.paperPadding }}>
          <div className={classes.wrapper}>
            <header className={classes.header}>
              <h2>Account Verification</h2>
            </header>
            <div className={classes.content}>
              {verificationStatus === VTOKEN_CHECK_PENDING && (
                <p>Checking your verification token...</p>
              )}
              {verificationStatus === VTOKEN_CHECK_FAILED && (
                <React.Fragment>
                  <p>The token provided appears to be invalid or expired.</p>
                  <p>
                    If you've registered for an account,{" "}
                    <Link to="/app/account/forgot">try resetting the password</Link>. You can{" "}
                    <Link to="/app/account/register">create a new account here</Link>.
                  </p>
                </React.Fragment>
              )}
              {verificationStatus === VTOKEN_CHECK_SUCCEEDED && (
                <p>
                  Confirmed! You can now <Link to={loginPath}>log in to your account.</Link>
                </p>
              )}
            </div>
            <footer className={classes.footer} />
          </div>
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "400px",
    textAlign: "center",
  },
  header: {},
  content: {
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  footer: {},
});

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  withCookies,
  withStyles(styles, { withTheme: true }),
  connect(mapStateToProps, mapDispatchToProps)
)(RegistrationVerificationHandler);
