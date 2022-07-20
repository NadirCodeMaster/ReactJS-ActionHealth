import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import qs from "qs";
import { Button, CircularProgress, FormControl, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requiredMessage, isEmailMessage } from "form_utils";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import { ValidatorForm } from "react-material-ui-form-validator";
import HgTextValidator from "components/ui/HgTextValidator";
import HgAlert from "components/ui/HgAlert";
import RegistrationForm from "components/views/RegistrationForm";
import { requestInvitation } from "api/requests";
import generateTitle from "utils/generateTitle";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class RedeemInvite extends Component {
  static propTypes = {
    // All props must be fully populated/loaded before mounting.
    orgTypes: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape),
    emailCookieName: PropTypes.string.isRequired,
    inviteToken: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      // Organization obj returned from API for the invite.
      organization: null,
      // If we've successfully checked the invite w/email.
      inviteValidated: false,
      // If invite check failed.
      inviteRejected: false,
      // If we're awaiting a response from server about invite.
      checkingInvite: false,
      // User-entered email (used if currently un-authenticed)
      userEnteredEmail: null,
      // Whether to show new user reg form.
      showNewUserForm: false,
      // Whether we're ready to send user to reg form
      sendToDest: false,
      // User is invited but already on team
      alreadyOnTeam: false,
    };
  }

  componentDidMount() {
    const { currentUser } = this.props;

    // If user is authenticated, proceed w/checking the
    // token using their account email.
    if (currentUser && currentUser.isAuthenticated) {
      this.checkInvite(currentUser.data.email);
    }
    generateTitle("Redeem Invite");
  }

  componentDidUpdate() {
    generateTitle("Redeem Invite");
  }

  /**
   * Build the destination registration URL path.
   *
   * This is where folks will be sent to associate themselves
   * with an organization after redeeming an invite.
   * @param {Object} org
   * @returns {String|null}
   *  Returns the path as string, or null we don't have enough info.
   */
  buildDestUrl = (org) => {
    const { orgTypes } = this.props;
    if (org && orgTypes) {
      let ot = orgTypes[org.organization_type_id];
      if (ot) {
        let otmn = orgTypes[org.organization_type_id].machine_name;
        return `/app/account/organizations/join/${otmn}/${org.id}`;
      }
    }
    return null;
  };

  checkInvite = (email) => {
    const { currentUser, inviteToken } = this.props;

    if (!this.isCancelled) {
      this.setState({ checkingInvite: true });
    }

    // Status codes for requestInvitation() endpoint.
    let resStatusForNewUser = 206;
    let resStatusForExistingUserOnTeam = 208;
    let resStatusForExistingUserNotOnTeam = 202;

    requestInvitation(inviteToken, email)
      .then((res) => {
        let feedbackMsg = null;
        let setStateObj = {
          inviteValidated: true,
          checkingInvite: false,
          showNewUserForm: false,
          sendToDest: false,
          organization: res.data,
        };

        // User doesn't yet exist
        // ----------------------
        if (res.status === resStatusForNewUser) {
          setStateObj.showNewUserForm = true;
          feedbackMsg =
            "We found your invite! Use this form to create your account and join the team.";
        }

        // User exists but not yet a team member
        // -------------------------------------
        else if (res.status === resStatusForExistingUserNotOnTeam) {
          setStateObj.sendToDest = true;

          // Msg for un-authenticated user.
          feedbackMsg =
            "We found your invite! Login and answer a few more questions to join the team.";

          // Msg for authenticated user.
          if (currentUser && currentUser.isAuthenticated) {
            feedbackMsg = "We found your invite! Just a few more questions to join the team.";
          }
        }

        // User exists and is already a team member
        // ----------------------------------------
        else if (res.status === resStatusForExistingUserOnTeam) {
          setStateObj.alreadyOnTeam = true;
        }

        if (!this.isCancelled) {
          this.setState(setStateObj);
        }

        if (feedbackMsg) {
          hgToast(feedbackMsg);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            // State values not below should remain as-is.
            checkingInvite: false,
            inviteValidated: false,
            inviteRejected: true,
            showNewUserForm: false,
            sendToDest: false,
          });
        }
        let msg =
          `An error occurred handling this invite. Please double check the email address provided. ` +
          errorSuffix();
        hgToast(msg, "error");
      });
  };

  handleEmailFormSubmit = () => {
    if (!this.refs.form.isFormValid()) {
      return;
    }
    this.checkInvite(this.state.userEnteredEmail);
  };

  onChangeUserEnteredEmail = (e) => {
    this.setState({
      userEnteredEmail: e.target.value.trim(),
    });
  };

  onBlurUserEnteredEmail = (e) => {
    this.refs["userEnteredEmail"].validate(e.target.value, true);
  };

  render() {
    const { classes, currentUser, emailCookieName } = this.props;
    const {
      alreadyOnTeam,
      inviteRejected,
      checkingInvite,
      userEnteredEmail,
      showNewUserForm,
      sendToDest,
      organization,
    } = this.state;

    // Initialize var for destination URL with fallback just in case.
    let destUrl = "/app/account/dashboard";

    // Build destination URL and maybe redirect if we have org data to do so.
    if (organization) {
      destUrl = this.buildDestUrl(organization);

      // If we're redirecting to login or the join form...
      if (sendToDest) {
        // Send anon users to login followed by destination URL.
        let redirectTo = `/app/account/login?${qs.stringify({
          appDest: destUrl,
        })}`;
        // Send auth users right to the join org page.
        if (currentUser && currentUser.isAuthenticated) {
          redirectTo = destUrl;
        }
        return <Redirect to={redirectTo} />;
      }
    }

    return (
      <Grid container justifyContent="center">
        {/*
        Showing the redemption form/status
        */}
        {!showNewUserForm && (
          <Grid item xs={12} sm={6}>
            <Paper className={classes.paper}>
              <h1>Redeem Invitation</h1>
              {checkingInvite && (
                <React.Fragment>
                  <p>Redeeming...</p>
                  <CircularProgress />
                </React.Fragment>
              )}

              {alreadyOnTeam && (
                <div className={classes.alreadyOnTeamContainer}>
                  <HgAlert
                    severity="info"
                    includeIcon={true}
                    message={
                      <React.Fragment>
                        We found your invite, but you're already on the team!
                        {organization && (
                          <div>
                            <Link to={`/app/account/organizations/${organization.id}/`}>
                              Review your role with {organization.name}
                            </Link>
                          </div>
                        )}
                      </React.Fragment>
                    }
                  />
                </div>
              )}

              {inviteRejected && (
                <p>
                  <em>The invite code doesn't appear to be valid for this account/email.</em>
                </p>
              )}

              {(!currentUser || !currentUser.isAuthenticated) && (
                <ValidatorForm
                  ref="form"
                  instantValidate={false}
                  onSubmit={this.handleEmailFormSubmit}
                >
                  <p>Enter your email below to validate your invitation.</p>

                  <FormControl fullWidth variant="standard">
                    <HgTextValidator
                      fullWidth
                      required
                      disabled={checkingInvite}
                      type="email"
                      label="Email"
                      name="userEnteredEmail"
                      ref="userEnteredEmail"
                      id="user-entered-email"
                      onChange={this.onChangeUserEnteredEmail}
                      onBlur={this.onBlurUserEnteredEmail}
                      value={userEnteredEmail ? userEnteredEmail : ""}
                      validators={["required", "isEmail"]}
                      errorMessages={[requiredMessage, isEmailMessage]}
                    />
                  </FormControl>
                  <br />
                  <br />
                  <div>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={checkingInvite}
                      variant="contained"
                      onClick={this.handleEmailFormSubmit}
                    >
                      Get started
                      {checkingInvite && <CircularProgressForButtons />}
                    </Button>
                  </div>
                </ValidatorForm>
              )}
            </Paper>
          </Grid>
        )}

        {/*
        Showing the create account form.
        */}
        {showNewUserForm && (
          <Grid item xs={12} sm={8}>
            <Paper className={classes.paper}>
              <h1>Create Your Account</h1>
              <RegistrationForm
                emailCookieName={emailCookieName}
                prePopEmail={userEnteredEmail ? userEnteredEmail : ""}
                successUrl={destUrl}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  }
}

const styles = (theme) => ({
  paper: {
    padding: styleVars.paperPadding,
    textAlign: "center",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  alreadyOnTeamContainer: {
    marginBottom: theme.spacing(),
  },
});

export default connect(
  ({ app_meta }) => ({
    orgTypes: app_meta.data.organizationTypes,
  }),
  (dispatch) => ({})
)(withStyles(styles, { withTheme: true })(RedeemInvite));
