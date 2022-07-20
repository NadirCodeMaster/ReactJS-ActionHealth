import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { withRouter } from "react-router";
import { isNil } from "lodash";
import {
  Button,
  CircularProgress,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { requiredMessage, isEmailMessage } from "form_utils";
import { ValidatorForm } from "react-material-ui-form-validator";
import HgTextValidator from "components/ui/HgTextValidator";
import errorSuffix from "utils/errorSuffix";
import { requestCreateInvitation } from "api/requests";
import {} from "store/actions";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

class InviteTeamMemberDialog extends React.Component {
  static propTypes = {
    // Note: all prop values must be fully loaded when
    // mounting component.
    // -----------------------------------------------
    orgTypesData: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organization: PropTypes.shape(organizationShape).isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
  };

  constructor(props) {
    super(props);

    let orgTypesData = props.orgTypesData;

    this.isCancelled = false;
    this.state = {
      orgType: orgTypesData[props.organization.organization_type_id],
      submitting: false,
      inviteeEmail: null,
    };
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  onChangeInviteeEmail = (e) => {
    this.setState({
      inviteeEmail: e.target.value.trim(),
    });
  };

  onBlurInviteeEmail = (e) => {
    this.refs["inviteeEmail"].validate(e.target.value, true);
  };

  close = () => {
    const { onClose } = this.props;

    this.setState({
      submitting: false,
      inviteeEmail: null,
    });

    if (!isNil(onClose)) {
      onClose();
    }
  };

  handleSubmit = () => {
    const { organization } = this.props;
    const { inviteeEmail } = this.state;

    if (!this.refs.form.isFormValid()) {
      return;
    }

    if (!this.isCancelled) {
      this.setState({ submitting: true });
    }

    requestCreateInvitation({
      email: inviteeEmail,
      organization_id: organization.id,
    })
      .then((res) => {
        // SUCCESS
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              submitting: false,
            });
          }
          hgToast("Invite sent!");
        }

        // ALREADY INVITED
        else if (208 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              submitting: false,
            });
          }
          hgToast(`${inviteeEmail} is already invited`, "info");
        }

        // Either 20x result has the same close.
        this.close();
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            submitting: false,
          });
          hgToast(`An error occurred inviting ${inviteeEmail}. ` + errorSuffix(error), "error");
        }
      });
  };

  render() {
    const { classes, open, organization } = this.props;
    const { inviteeEmail, orgType, submitting } = this.state;

    return (
      <Dialog open={open} onClose={this.close} aria-labelledby="invite-user-dialog-title">
        <ValidatorForm ref="form" instantValidate={false} onSubmit={this.handleSubmit}>
          <DialogTitle id="invite-user-dialog-title">
            Invite a Team Member to {organization.name}
          </DialogTitle>

          <DialogContent className={classes.dialog}>
            <p>
              We'll send an invitation to become a member of your {orgType.name}
              's team.
            </p>
            <br />
            <FormControl margin="none" fullWidth variant="standard">
              <HgTextValidator
                fullWidth
                required
                type="email"
                label="Email"
                name="inviteeEmail"
                ref="inviteeEmail"
                id="invitee-email"
                onChange={this.onChangeInviteeEmail}
                onBlur={this.onBlurInviteeEmail}
                value={inviteeEmail ? inviteeEmail : ""}
                validators={["required", "isEmail"]}
                errorMessages={[requiredMessage, isEmailMessage]}
              />
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color="secondary" variant="contained">
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={submitting}
              variant="contained"
              onClick={this.handleSubmit}
            >
              Invite
              {submitting && (
                <React.Fragment>
                  &nbsp;
                  <CircularProgress size="1em" />
                </React.Fragment>
              )}
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    );
  }
}

const styles = (theme) => ({
  dialog: {
    minWidth: "400px",
  },
});

export default compose(withRouter)(withStyles(styles, { withTheme: true })(InviteTeamMemberDialog));
