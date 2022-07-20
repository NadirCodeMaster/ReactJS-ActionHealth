import React, { Component } from "react";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withCookies } from "react-cookie";
import { isEmpty, isString } from "lodash";
import { Link } from "react-router-dom";
import { Button, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import envelopeImg from "images/envelope-open.svg";
import generateTitle from "utils/generateTitle";
import { requestResendEmailVerificationMessage } from "api/requests";
import errorSuffix from "utils/errorSuffix";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Post-registration confirmation display, informing about email confirmation.
 *
 * @extends Component
 */
class RegistrationVerificationPending extends Component {
  static propTypes = {
    emailCookieName: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
  }

  state = {
    email: null,
  };

  onClickResend = () => {
    const { email } = this.state;

    if (!isEmpty(email) && isString(email)) {
      requestResendEmailVerificationMessage(email)
        .then((res) => {
          if (!this.isCancelled) {
            hgToast("Verification message sent");
          }
        })
        .catch((error) => {
          if (!this.isCancelled) {
            hgToast("Unable to send a new verification message. " + errorSuffix(error), "error");
          }
        });
    }
  };

  componentDidMount() {
    const { cookies, emailCookieName } = this.props;

    generateTitle("Verification Sent");

    let emailRegisteredWith = cookies.get(emailCookieName);
    if (!isEmpty(emailRegisteredWith) && isString(emailRegisteredWith)) {
      this.setState({ email: emailRegisteredWith });
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { classes, currentUser, theme } = this.props;
    const { email } = this.state;

    // This display/component needs an email address for it to
    // make any sense and do its thing.
    let displayEmail = email;
    if (!email) {
      return null;
    }

    return (
      <React.Fragment>
        {currentUser && currentUser.isAuthenticated && <Redirect to={"/app/account/dashboard"} />}

        <Paper style={{ padding: styleVars.paperPadding }}>
          <div className={classes.wrapper}>
            <header className={classes.header}>
              <div className={classes.envelopeImgWrapper}>
                <img alt="" className={classes.envelopeImg} src={envelopeImg} />
              </div>
              <small className={classes.subheadline}>Your account is almost ready!</small>
              <h2 className={classes.headline}>We've sent a message to {displayEmail}</h2>
            </header>

            <div className={classes.content}>
              <p>Please click the link in that message to confirm your Action Center account.</p>
            </div>

            <footer className={classes.footer}>
              <p style={{ marginBottom: theme.spacing(0.5) }}>Didn't receive an email?</p>
              <p>Verify your email address, check your spam filter, then</p>
              <p>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={this.onClickResend}
                >
                  Send me a new email
                </Button>
              </p>
              <p>
                Wrong email address? <Link to={`/app/account/register`}>Try again</Link>.
              </p>
            </footer>
          </div>
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    marginBottom: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: theme.spacing(2),
    maxWidth: "600px",
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(4),
    },
  },
  header: {},
  subheadline: {
    // @TODO Standardize this element (above header subtitle)
    color: "#888888",
    display: "block",
    fontWeight: styleVars.txtFontWeightDefaultBold,
    marginBottom: theme.spacing(1.5),
    textTransform: "uppercase",
  },
  headline: {},
  content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(6),
  },
  envelopeImgWrapper: {
    marginBottom: theme.spacing(1.5),
    textAlign: "center",
  },
  envelopeImg: {
    height: "auto",
    width: "48px",
  },
  footer: {},
  button: {
    [theme.breakpoints.up("sm")]: {
      marginBottom: theme.spacing(0.5),
      marginTop: theme.spacing(0.5),
      paddingLeft: theme.spacing(6),
      paddingRight: theme.spacing(6),
    },
  },
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
)(RegistrationVerificationPending);
