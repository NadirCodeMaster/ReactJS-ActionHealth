import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import HgTextValidator from "components/ui/HgTextValidator";
import Button from "@mui/material/Button";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import Paper from "@mui/material/Paper";
import { withStyles } from "@mui/styles";
import PasswordValidatorForm from "components/views/PasswordValidatorForm";
import PasswordValidator from "components/views/PasswordValidator";
import { resetPassword } from "store/actions";
import { requiredMessage, isEmailMessage } from "form_utils";
import Errors from "components/ui/Errors";
import generateTitle from "utils/generateTitle";
import compareInvalidToValidators from "utils/compareInvalidToValidators";
import styleVars from "style/_vars.scss";

class AccountResetPassword extends Component {
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

  componentDidMount() {
    generateTitle("Reset Password");
  }

  componentDidUpdate(prevProps) {
    const { resetPasswordState: prevResetPassword } = prevProps;
    const { resetPasswordState } = this.props;

    if (prevResetPassword.loading && !resetPasswordState.loading) {
      this.setState({ errors: resetPasswordState.errors });
    }
    generateTitle("Reset Password");
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
    const { classes, resetPasswordState } = this.props;
    const { errors, invalidmessages } = this.state;

    return (
      <div className={classes.wrapper}>
        <Paper className={classes.paper}>
          <div className={classes.contentWrapper}>
            {!resetPasswordState.succeeded && (
              <div>
                <h1>You're almost there!</h1>
                <p>Finish resetting your password below</p>

                <PasswordValidatorForm
                  password={this.state.password}
                  password_confirmation={this.state.password_confirmation}
                  onSubmit={this.onSubmit}
                  instantValidate={true}
                >
                  <div className={classes.formBodyWrapper}>
                    <div>
                      <HgTextValidator
                        className={classes.formElement}
                        name={"email"}
                        id="reset_password_email"
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
                          id="reset_password_password"
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
                          id="reset_password_password_confirmation"
                          label={"Confirm Password"}
                          type={this.state.show_password ? "text" : "password"}
                          onChange={(e) => this.handleChange(e)}
                          value={this.state.password_confirmation}
                          margin={"normal"}
                        />
                      }
                    />
                  </div>
                  <Errors errors={errors} />
                  <Button
                    className={classes.submitButton}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={resetPasswordState.loading}
                  >
                    Reset
                    {resetPasswordState.loading ? (
                      <React.Fragment>
                        &nbsp;
                        <CircularProgressForButtons />
                      </React.Fragment>
                    ) : undefined}
                  </Button>
                </PasswordValidatorForm>
              </div>
            )}
            {resetPasswordState.succeeded && (
              <div>
                <h1>Success!</h1>
                <p>
                  You can now <Link to="/app/account/login">log in to your account</Link>.
                </p>
              </div>
            )}
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
  paper: {
    padding: styleVars.paperPadding,
    textAlign: "center",
  },
  contentWrapper: {
    marginBottom: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "410px",
    width: "100%",
  },
  formBodyWrapper: {
    marginLeft: "auto",
    marginRight: "auto",
    width: "80%",
  },
  formElement: {
    width: "100%",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    display: "none",
  },
});

const AccountResetPasswordContainer = connect(
  ({ auth }) => ({
    user: auth.currentUser,
    resetPasswordState: auth.resetPassword,
  }),
  (dispatch) => ({
    onResetPassword: (email, password, password_confirmation, token) => {
      dispatch(resetPassword({ email, password, password_confirmation, token }));
    },
  })
)(AccountResetPassword);

export default withStyles(styles, { withTheme: true })(AccountResetPasswordContainer);
