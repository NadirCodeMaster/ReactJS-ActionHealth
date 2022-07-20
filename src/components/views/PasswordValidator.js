import React from "react";
import PropTypes from "prop-types";
import DocPasswordRequirements from "components/ui/DocPasswordRequirements";
import { get } from "lodash";
import { withStyles } from "@mui/styles";

import {
  isPasswordMatchMessage,
  isPasswordUpperAndLowerMessage,
  isPasswordNumericMessage,
  isPasswordNonAlphanumericMessage,
  minStringLengthMessage,
  requiredMessage,
} from "form_utils";

class PasswordValidator extends React.Component {
  static propTypes = {
    passwordNode: PropTypes.node.isRequired,
    confirmNode: PropTypes.node.isRequired,
  };

  render() {
    const { classes } = this.props;
    const invalidmessages = get(this.props, "passwordNode.props.invalidmessages", []);
    const PasswordNode = React.cloneElement(this.props.passwordNode, {
      validators: [
        "required",
        "minStringLength:7",
        "isPasswordUpperAndLower",
        "isPasswordNumeric",
        "isPasswordNonAlphanumeric",
      ],
      errorMessages: [
        requiredMessage,
        minStringLengthMessage(7),
        isPasswordUpperAndLowerMessage,
        isPasswordNumericMessage,
        isPasswordNonAlphanumericMessage,
      ],
    });

    const ConfirmPasswordNode = React.cloneElement(this.props.confirmNode, {
      validators: ["required", "isPasswordMatch"],
      errorMessages: [requiredMessage, isPasswordMatchMessage],
    });

    return (
      <React.Fragment>
        <div>{PasswordNode}</div>
        <div className={classes.docPasswordRequirementsWrapper}>
          <DocPasswordRequirements invalidmessages={invalidmessages} />
        </div>
        <div>{ConfirmPasswordNode}</div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  docPasswordRequirementsWrapper: {
    margin: theme.spacing(0, 0, 1, 0.5),
    textAlign: "left",
  },
});

export default withStyles(styles, { withTheme: true })(PasswordValidator);
