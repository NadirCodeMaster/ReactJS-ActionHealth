import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { Link, Redirect } from "react-router-dom";
import { Button, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { isNil } from "lodash";
import qs from "qs";
import RegistrationForm from "components/views/RegistrationForm";
import generateTitle from "utils/generateTitle";
import validateAppDest from "utils/validateAppDest";
import styleVars from "style/_vars.scss";

class Register extends Component {
  static propTypes = {
    emailCookieName: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
  };

  state = {
    postRegDest: null, // location to send user after reg, verif etc
  };

  componentDidMount() {
    generateTitle("Register");
    this.establishPostRegDest();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const { location: prevLocation } = prevProps;

    if (location !== prevLocation) {
      this.establishPostRegDest();
    }
  }

  establishPostRegDest = () => {
    const { location } = this.props;
    const { postRegDest } = this.state;

    const params = qs.parse(location.search, { ignoreQueryPrefix: true });

    // If we have a valid appDest url parameter value, use it.
    let appDest = !isNil(params.appDest) && validateAppDest(params.appDest) ? params.appDest : null;

    if (postRegDest !== appDest) {
      this.setState({ postRegDest: appDest });
    }
  };

  render() {
    const { classes, emailCookieName, location, user } = this.props;
    const { postRegDest } = this.state;

    return (
      <React.Fragment>
        <Paper className={classes.paper}>
          {user.isAuthenticated && (
            <Redirect to={(location.state && location.state.from) || "/app/account/dashboard"} />
          )}

          <header className={classes.regHeader}>
            <p className={classes.regHeaderSmallText}>Ready to get started?</p>
            <h1>Create your free Action Center account</h1>
          </header>

          <div className={classes.regStuffWrapper}>
            <RegistrationForm successUrl={postRegDest} emailCookieName={emailCookieName} />
            <Button
              color="primary"
              className={classes.regAlreadyHaveButton}
              component={Link}
              fullWidth
              to="/app/account/login"
            >
              I already have an account
            </Button>
          </div>
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  paper: {
    padding: styleVars.paperPadding,
  },
  regStuffWrapper: {
    margin: "0 auto",
    maxWidth: "310px",
  },
  regHeader: {
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1.5),
    textAlign: "center",
  },
  regHeaderSmallText: {
    fontSize: 11,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    letterSpacing: "1px",
    marginBottom: theme.spacing(),
    textTransform: "uppercase",
  },
  regAlreadyHaveButton: {
    fontWeight: "normal",
    marginTop: theme.spacing(1.5),
    textTransform: "unset",
  },
});

export default compose(
  withRouter,
  connect(
    (state) => ({
      user: state.auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(Register));
