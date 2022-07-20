import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ValidatorForm } from "react-material-ui-form-validator";
import HgTextValidator from "components/ui/HgTextValidator";
import isFunction from "lodash/isFunction";
import PropTypes from "prop-types";
import { Button, CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { attemptChangePassword, forgotPasswordEditEmail } from "store/actions";
import { appCookiesContext } from "appCookiesContext";
import { requiredMessage, isEmailMessage } from "form_utils";
import Errors from "components/ui/Errors";
import HgAlert from "components/ui/HgAlert";
import validateAppDest from "utils/validateAppDest";

class Forgot extends Component {
  static propTypes = {
    customReset: PropTypes.func,
    submitButtonText: PropTypes.string,
    successUrl: PropTypes.string,
  };

  static defaultProps = {
    submitButtonText: "Reset password",
  };

  state = {
    email: "",
    errors: [],
  };

  componentDidUpdate(prevProps) {
    const { forgot_password: prevForgotPassword } = prevProps;
    const { forgot_password } = this.props;

    if (prevForgotPassword.loading && !forgot_password.loading) {
      this.setState({ errors: forgot_password.errors });
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit = () => {
    const { customReset, successUrl, onChangePassword, forgot_password } = this.props;

    // If a successUrl was provided, we'll set that as a cookie value
    // that the verification handler can use after user has been verified.
    //
    // We'll apply the same validation to this as the typical appDest param
    // (which is typically what will be pased through here).
    if (validateAppDest(successUrl)) {
      appCookiesContext.set("p2forgotdest", successUrl, {
        path: "/",
        secure: true,
        httpOnly: false,
        maxAge: 172800, // two days in seconds
        sameSite: "lax",
      });
    }

    const resetFunction = isFunction(customReset) ? customReset : onChangePassword;
    resetFunction(forgot_password.address);
  };

  render() {
    const { classes, forgot_password, submitButtonText } = this.props;
    const { errors } = this.state;

    return (
      <React.Fragment>
        <ValidatorForm onSubmit={this.onSubmit} instantValidate={false}>
          {this.props.children ? (
            this.props.children
          ) : (
            <React.Fragment>
              <p>
                To reset your password, please enter the email address associated with your account
                and we'll send you a reset link.
              </p>
              <p>If you don't receive an email in 5 minutes, be sure to check your spam filter.</p>
            </React.Fragment>
          )}

          <React.Fragment>
            {!forgot_password.succeeded && (
              <React.Fragment>
                <div>
                  <HgTextValidator
                    className={classes.formElement}
                    name={"email"}
                    id="forgot_password_email"
                    label={"Email"}
                    onChange={(e) => this.props.setEmailText(e.target.value)}
                    value={forgot_password.address ? forgot_password.address : ""}
                    validators={["required", "isEmail"]}
                    errorMessages={[requiredMessage, isEmailMessage]}
                    margin="normal"
                  />
                </div>
                <Errors errors={errors} />
                <Button
                  className={classes.submitButton}
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={forgot_password.loading}
                >
                  {submitButtonText}
                  {forgot_password.loading ? (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgress size="1em" />
                    </React.Fragment>
                  ) : undefined}
                </Button>
              </React.Fragment>
            )}
          </React.Fragment>

          <React.Fragment>
            {forgot_password.succeeded && (
              <div className={classes.message}>
                <HgAlert includeIcon={true} message={forgot_password.message} severity="success" />
              </div>
            )}
          </React.Fragment>
        </ValidatorForm>

        <div className={classes.register}>
          <p>Don't have an account?</p>
          <Button
            fullWidth
            variant="text"
            color="primary"
            component={Link}
            to={"/app/account/register"}
          >
            {" "}
            register{" "}
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  formElement: {
    width: "80%",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  message: {
    marginTop: theme.spacing(2),
  },
  register: {
    marginTop: theme.spacing(2),
  },
});

export default connect(
  ({ auth, forgot_password }) => ({
    forgot_password,
  }),
  (dispatch) => {
    return {
      onChangePassword: (email) => {
        dispatch(attemptChangePassword({ email }));
      },
      setEmailText: (email) => {
        dispatch(forgotPasswordEditEmail({ email }));
      },
    };
  }
)(withStyles(styles, { withTheme: true })(Forgot));
