import React, { Component } from "react";
import { connect } from "react-redux";
import HgTextValidator from "components/ui/HgTextValidator";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { withStyles } from "@mui/styles";
import PasswordValidatorForm from "components/views/PasswordValidatorForm";
import PasswordValidator from "components/views/PasswordValidator";
import { resetPassword } from "store/actions";
import { requiredMessage, isEmailMessage } from "form_utils";
import compareInvalidToValidators from "utils/compareInvalidToValidators";
import Errors from "components/ui/Errors";
import HgAlert from "components/ui/HgAlert";
import styleVars from "style/_vars.scss";

// @TODO Combine this with ./reset-password.js (only diff is text)

class WelcomeBackHandler extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      password_confirmation: "",
      errors: [],
      invalidmessages: ["invalid"],
    };

    this.passwordValidatorRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const { resetPasswordState: prevResetPassword } = prevProps;
    const { resetPasswordState } = this.props;

    if (prevResetPassword.loading && !resetPasswordState.loading) {
      this.setState({ errors: resetPasswordState.errors });
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  onSubmit = () => {
    this.props.onResetPassword(
      this.state.email,
      this.state.password,
      this.state.password_confirmation,
      this.props.match.params.token
    );
  };

  validatorListener = () => {
    this.setState({
      invalidmessages: compareInvalidToValidators(this.passwordValidatorRef),
    });
  };

  render() {
    const { classes, user, resetPasswordState } = this.props;
    const { errors, invalidmessages } = this.state;

    return (
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={8} md={6}>
          <Paper className={classes.paper}>
            <h1>You're almost there!</h1>
            <p>
              We're starting fresh with security for our new site. Please create a new password to
              continue
            </p>
            {!resetPasswordState.message && (
              <PasswordValidatorForm
                password={this.state.password}
                password_confirmation={this.state.password_confirmation}
                onSubmit={this.onSubmit}
                instantValidate={true}
              >
                <div>
                  <HgTextValidator
                    className={classes.formElement}
                    name={"email"}
                    label={"Email"}
                    onChange={(e) => this.handleChange(e)}
                    value={this.state.email}
                    validators={["required", "isEmail"]}
                    errorMessages={[requiredMessage, isEmailMessage]}
                    margin="normal"
                  />
                </div>
                <PasswordValidator
                  passwordNode={
                    <HgTextValidator
                      className={classes.formElement}
                      name={"password"}
                      label={"Password"}
                      type={this.state.show_password ? "text" : "password"}
                      onChange={(e) => this.handleChange(e)}
                      value={this.state.password}
                      margin="normal"
                      ref={this.passwordValidatorRef}
                      validatorListener={this.validatorListener}
                      invalidmessages={invalidmessages}
                      FormHelperTextProps={{
                        className: classes.helperText,
                      }}
                    />
                  }
                  confirmNode={
                    <HgTextValidator
                      className={classes.formElement}
                      name={"password_confirmation"}
                      label={"Confirm Password"}
                      type={this.state.show_password ? "text" : "password"}
                      onChange={(e) => this.handleChange(e)}
                      value={this.state.password_confirmation}
                      margin={"normal"}
                    />
                  }
                />
                <Errors errors={errors} />
                <Button
                  className={classes.submitButton}
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={user.loading}
                >
                  Reset
                  {resetPasswordState.loading ? (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgress size="1em" />
                    </React.Fragment>
                  ) : undefined}
                </Button>
              </PasswordValidatorForm>
            )}
            {resetPasswordState.message && (
              <HgAlert
                success="success"
                className={classes.message}
                message={resetPasswordState.message}
                includeIcon={true}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const styles = (theme) => ({
  paper: {
    padding: styleVars.paperPadding,
    textAlign: "center",
  },
  formElement: {
    width: "80%",
  },
  message: {
    marginTop: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    display: "none",
  },
});

const WelcomeBackHandlerContainer = connect(
  ({ auth }) => ({
    user: auth.currentUser,
    resetPasswordState: auth.resetPassword,
  }),
  (dispatch) => ({
    onResetPassword: (email, password, password_confirmation, token) => {
      dispatch(resetPassword({ email, password, password_confirmation, token }));
    },
  })
)(WelcomeBackHandler);

export default withStyles(styles, { withTheme: true })(WelcomeBackHandlerContainer);
