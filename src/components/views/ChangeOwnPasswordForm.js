import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import HgTextValidator from "components/ui/HgTextValidator";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { withStyles } from "@mui/styles";
import { changePassword, clearChangePasswordErrors } from "store/actions";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import compareInvalidToValidators from "utils/compareInvalidToValidators";
import PasswordValidatorForm from "./PasswordValidatorForm";
import PasswordValidator from "./PasswordValidator";
import { currentUserShape } from "constants/propTypeShapes";
import hgToast from "utils/hgToast";

class ChangeOwnPasswordForm extends React.Component {
  static propTypes = {
    change_password: PropTypes.object.isRequired,
    changePassword: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      password: "",
      password_confirmation: "",
      invalidmessages: ["invalid"],
    };

    this.changeOwnPasswordValidatorRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const {
      change_password: { updating: prevUpdating },
    } = prevProps;
    const {
      change_password: { failed, message, updating },
    } = this.props;

    if (prevUpdating && !updating && !failed) {
      this.setState({ password: "", password_confirmation: "" });
      hgToast(message);
      this.onClose();
    }
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onClose = () => {
    const { clearChangePasswordErrors, onClose } = this.props;

    clearChangePasswordErrors();
    onClose();
  };

  onSubmit = () => {
    const { changePassword, currentUser } = this.props;

    changePassword({ id: currentUser.data.id, ...this.state });
  };

  validatorListener = () => {
    this.setState({
      invalidmessages: compareInvalidToValidators(this.changeOwnPasswordValidatorRef),
    });
  };

  render() {
    const { classes, change_password, isOpen } = this.props;
    const { invalidmessages } = this.state;

    // @TODO Modify this to only be true of at "xs" breakpoint
    let useFullScreenDialog = true;

    return (
      <React.Fragment>
        <Dialog
          open={isOpen}
          onClose={this.onClose}
          aria-labelledby="change-password-dialog-title"
          fullScreen={useFullScreenDialog}
        >
          <DialogTitle id="change-password-dialog-title">Change your password</DialogTitle>
          <DialogContent className={classes.dialog}>
            <PasswordValidatorForm
              onSubmit={this.onSubmit}
              instantValidate={true}
              className={classes.form}
              password={this.state.password}
              password_confirmation={this.state.password_confirmation}
            >
              <PasswordValidator
                passwordNode={
                  <HgTextValidator
                    name="password"
                    autoComplete="new-password"
                    label="New password"
                    type="password"
                    onChange={this.onChange}
                    fullWidth
                    value={this.state.password}
                    ref={this.changeOwnPasswordValidatorRef}
                    validatorListener={this.validatorListener}
                    invalidmessages={invalidmessages}
                    FormHelperTextProps={{
                      className: classes.helperText,
                    }}
                  />
                }
                confirmNode={
                  <HgTextValidator
                    name="password_confirmation"
                    autoComplete="new-password"
                    label="Confirm password"
                    type="password"
                    fullWidth
                    onChange={this.onChange}
                    value={this.state.password_confirmation}
                  />
                }
              />
            </PasswordValidatorForm>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={this.onSubmit}
              variant="contained"
              disabled={
                !isEmpty(invalidmessages) ||
                this.state.password_confirmation !== this.state.password ||
                change_password.updating
              }
            >
              Change password
              {change_password.updating && (
                <React.Fragment>
                  &nbsp;
                  <CircularProgressForButtons />
                </React.Fragment>
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  dialog: {
    minWidth: "220px",
  },
  helperText: {
    display: "none",
  },
});

export default compose(
  connect(
    ({ change_password }) => ({
      change_password,
    }),
    {
      changePassword,
      clearChangePasswordErrors,
    }
  ),
  withStyles(styles, { withTheme: true })
)(ChangeOwnPasswordForm);
