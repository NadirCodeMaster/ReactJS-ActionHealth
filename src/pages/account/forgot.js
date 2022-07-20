import React, { Component } from "react";
// import PropTypes from 'prop-types'; // @TODO IMPLEMENT
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import qs from "qs";
import ForgotPasswordForm from "components/views/ForgotPasswordForm";
import generateTitle from "utils/generateTitle";
import validateAppDest from "utils/validateAppDest";
import styleVars from "style/_vars.scss";

class Forgot extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    postForgotDest: null, // location to send user after reg, verif etc
  };

  componentDidMount() {
    generateTitle("Forgot Password");
    this.establishPostForgotDest();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const { location: prevLocation } = prevProps;

    if (location !== prevLocation) {
      this.establishPostForgotDest();
    }
  }

  establishPostForgotDest = () => {
    const { location } = this.props;
    const { postForgotDest } = this.state;

    const params = qs.parse(location.search, { ignoreQueryPrefix: true });

    // If we have a valid appDest url parameter value, use it.
    let appDest = !isNil(params.appDest) && validateAppDest(params.appDest) ? params.appDest : null;

    if (postForgotDest !== appDest) {
      this.setState({ postForgotDest: appDest });
    }
  };

  render() {
    const { classes } = this.props;
    const { postForgotDest } = this.state;

    return (
      <div className={classes.wrapper}>
        <Paper className={classes.paper}>
          <div className={classes.formWrapper}>
            <h1>Reset Password</h1>
            <ForgotPasswordForm successUrl={postForgotDest} />
          </div>
        </Paper>
        <p align="center">
          <small>
            <Link className="muted_link" to="/app/account/reactivate">
              Reactivate Account
            </Link>
          </small>
        </p>
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

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Forgot));
