import React, { Component } from "react";
import { withStyles } from "@mui/styles";
import CheckIcon from "@mui/icons-material/Done";
import ClearIcon from "@mui/icons-material/Clear";
import clsx from "clsx";
import { map } from "lodash";
import {
  isPasswordUpperAndLowerMessage,
  isPasswordNumericMessage,
  isPasswordNonAlphanumericMessage,
  minStringLengthMessage,
} from "form_utils";
import styleVars from "style/_vars.scss";

class DocPasswordRequirements extends Component {
  mapPasswordMessages = () => {
    const { classes, invalidmessages } = this.props;

    let errorsToDisplay = {
      "minStringLength:7": minStringLengthMessage(7),
      isPasswordUpperAndLower: isPasswordUpperAndLowerMessage,
      isPasswordNumeric: isPasswordNumericMessage,
      isPasswordNonAlphanumeric: isPasswordNonAlphanumericMessage,
    };

    return map(errorsToDisplay, (value, key) => {
      if (invalidmessages.includes(key) || invalidmessages.includes("invalid")) {
        return (
          <div key={`password_message_invalid_${key}`}>
            <div className={clsx(classes.passwordMessageItemWrapper, classes.invalidMessage)}>
              <ClearIcon className={classes.passwordClearIcon} color="primary" />{" "}
              <span>{value}</span>
            </div>
          </div>
        );
      }

      if (!invalidmessages.includes(key)) {
        return (
          <div key={`password_message_valid_${key}`}>
            <div className={clsx(classes.passwordMessageItemWrapper, classes.validMessage)}>
              <CheckIcon className={classes.passwordCheckIcon} /> <span>{value}</span>
            </div>
          </div>
        );
      }
    });
  };

  render() {
    const { classes } = this.props;

    return <div className={classes.passwordMessageWrapper}>{this.mapPasswordMessages()}</div>;
  }
}

const styles = (theme) => ({
  passwordMessageWrapper: {
    marginTop: theme.spacing(),
  },
  passwordMessageItemWrapper: {
    display: "inline-flex",
    fontSize: styleVars.txtFontSizeXs,
  },
  passwordClearIcon: {
    marginRight: theme.spacing(1),
    color: styleVars.colorSecondaryExtraContrast,
  },
  passwordCheckIcon: {
    marginRight: theme.spacing(1),
    color: styleVars.colorGreen,
  },
  invalidMessage: {
    color: styleVars.colorSecondaryExtraContrast,
  },
  validMessage: {
    color: styleVars.colorGreen,
  },
});

export default withStyles(styles, { withTheme: true })(DocPasswordRequirements);
