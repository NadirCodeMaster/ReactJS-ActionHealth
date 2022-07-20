import React from "react";
import { ValidatorForm } from "react-form-validator-core";
import PropTypes from "prop-types";

import {
  isPasswordUpperAndLower,
  isPasswordNumeric,
  isPasswordNonAlphanumeric,
  isPhone,
} from "form_utils";

class PasswordValidatorForm extends React.Component {
  static propTypes = {
    password: PropTypes.string,
    password_confirmation: PropTypes.string,
  };

  componentDidMount() {
    ValidatorForm.addValidationRule("isPhone", isPhone);
    ValidatorForm.addValidationRule("isPasswordUpperAndLower", isPasswordUpperAndLower);
    ValidatorForm.addValidationRule("isPasswordNumeric", isPasswordNumeric);
    ValidatorForm.addValidationRule("isPasswordNonAlphanumeric", isPasswordNonAlphanumeric);
    ValidatorForm.addValidationRule("isPasswordMatch", (value) => {
      return this.props.password === this.props.password_confirmation;
    });
  }

  render() {
    return <ValidatorForm {...this.props}>{this.props.children}</ValidatorForm>;
  }
}

export default PasswordValidatorForm;
