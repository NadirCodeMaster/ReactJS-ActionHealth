import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { get } from "lodash";
import HgTextValidator from "components/ui/HgTextValidator";
import Checkbox from "components/ui/CheckboxWrapper";
import Errors from "components/ui/Errors";
import { withCookies } from "react-cookie";
import { Button, CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requiredMessage, isEmailMessage } from "form_utils";
import compareInvalidToValidators from "utils/compareInvalidToValidators";
import { attemptRegister, registerInit } from "store/actions";
import PasswordValidatorForm from "./PasswordValidatorForm";
import PasswordValidator from "./PasswordValidator";

class RegistrationForm extends Component {
  static propTypes = {
    emailCookieName: PropTypes.string.isRequired,
    prePopEmail: PropTypes.string, // optional, email not changeable if set
    successUrl: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.fixedEmail = false;
    let email = "";
    if (props.prePopEmail && props.prePopEmail.length > 0) {
      this.fixedEmail = true;
      email = props.prePopEmail;
    }

    this.state = {
      email: email,
      name_first: "",
      name_last: "",
      password: "",
      password_confirmation: "",
      phone_number: "",
      errors: [],
      show_password: false,
      invalidmessages: ["invalid"],
    };

    this.passwordValidatorRef = React.createRef();
  }

  componentDidMount() {
    this.props.registerInit();
  }

  componentDidUpdate(prevProps) {
    const { prePopEmail: prevPrePopEmail } = prevProps;
    const { prePopEmail } = this.props;

    if (prePopEmail !== prevPrePopEmail) {
      this.fixedEmail = prePopEmail && prePopEmail.length > 0;
      this.setState({ email: prePopEmail });
    }
  }

  handleChange(e) {
    // No changing email if prepopulated.
    if ("email" !== e.target.name || !this.fixedEmail) {
      this.setState({ [e.target.name]: e.target.value });
    }
  }

  togglePassword() {
    this.setState({ show_password: !this.state.show_password });
  }

  validatorListener = () => {
    this.setState({
      invalidmessages: compareInvalidToValidators(this.passwordValidatorRef),
    });
  };

  onSubmit = () => {
    const { attemptRegister, cookies, emailCookieName, successUrl } = this.props;
    const { show_password, ...registration } = this.state;

    let verificationEmail = get(registration, "email", "");

    cookies.set(emailCookieName, verificationEmail, {
      path: "/",
      secure: true,
      httpOnly: false,
      maxAge: 172800, // two days in seconds
      sameSite: "lax",
    });

    attemptRegister({
      ...registration,
      successUrl,
    });
  };

  render() {
    const { classes, currentUser } = this.props;
    const { invalidmessages } = this.state;

    return (
      <PasswordValidatorForm
        password={this.state.password}
        password_confirmation={this.state.password_confirmation}
        onSubmit={this.onSubmit}
        instantValidate={true}
      >
        <div>
          <HgTextValidator
            className={classes.formElement}
            name={"name_first"}
            id="reg_name_first"
            label={"First Name"}
            onChange={(e) => this.handleChange(e)}
            value={this.state.name_first}
            validators={["required"]}
            errorMessages={[requiredMessage]}
            margin={"normal"}
          />
        </div>
        <div>
          <HgTextValidator
            className={classes.formElement}
            name={"name_last"}
            id="reg_name_last"
            label={"Last Name"}
            onChange={(e) => this.handleChange(e)}
            value={this.state.name_last}
            validators={["required"]}
            errorMessages={[requiredMessage]}
            margin={"normal"}
          />
        </div>
        <div>
          <HgTextValidator
            type="email"
            className={classes.formElement}
            disabled={this.fixedEmail}
            name={"email"}
            id="reg_email"
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
              id="reg_password"
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
              id="reg_password_confirmation"
              label={"Confirm Password"}
              type={this.state.show_password ? "text" : "password"}
              onChange={(e) => this.handleChange(e)}
              value={this.state.password_confirmation}
              margin={"normal"}
            />
          }
        />

        <div className={classes.formOptions}>
          <Checkbox
            name={"showPassword"}
            value={"showPassword"}
            label={"Show Password"}
            checked={this.state.show_password}
            handleChange={() => this.togglePassword()}
          />
        </div>

        <Errors errors={currentUser.errors} />

        <Button
          className={classes.submitButton}
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          disabled={currentUser.loading}
        >
          Create My Account
          {currentUser.loading && (
            <React.Fragment>
              &nbsp;
              <CircularProgress size="1em" />
            </React.Fragment>
          )}
        </Button>
      </PasswordValidatorForm>
    );
  }
}

const styles = (theme) => ({
  formElement: {
    width: "100%",
  },
  formOptions: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  helperText: {
    display: "none",
  },
});

export default compose(
  withCookies,
  connect(
    ({ auth }) => ({
      currentUser: auth.currentUser,
    }),
    {
      attemptRegister,
      registerInit,
    }
  ),
  withStyles(styles, { withTheme: true })
)(RegistrationForm);
