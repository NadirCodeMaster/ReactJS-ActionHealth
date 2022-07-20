import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import moment from "moment";
import { isNil } from "lodash";
import { CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";
import {
  requestApproveUserOrganizationRequest,
  requestDenyUserOrganizationRequest,
} from "api/requests";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

// Provides a UI for approving/denying relationship between a User
// and Organization.
//
// Only for use by admin users.
//
// Most relationships are automatically approved during
// registration, but some are not (when org is a type with
// requires_access_approval = true).

class UserOrganizationApproval extends Component {
  static propTypes = {
    // From caller.
    organization: PropTypes.shape(organizationShape).isRequired,
    subjectUser: PropTypes.object.isRequired,
    pivot: PropTypes.object.isRequired,
    afterApprove: PropTypes.func,
    afterDeny: PropTypes.func,
    afterInvalid: PropTypes.func,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      approving: false,
      denying: false,
    };
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  approve = () => {
    const { afterApprove, afterInvalid, organization, subjectUser } = this.props;

    this.setState({ approving: true });

    // Note: returns 204 on success, 422 if user/org
    // already approved or there's no existing
    // relationship.
    requestApproveUserOrganizationRequest(subjectUser.id, organization.id).then((res) => {
      // OK
      // --
      if (204 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            approving: false,
          };
          this.setState(newStateVals);
          hgToast("Access approved!");
          if (!isNil(afterApprove)) {
            afterApprove();
          }
        }
      }

      // Invalid
      // -------
      // User already approved for org or there was no existing relationship record.
      else if (422 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            approving: false,
          };
          this.setState(newStateVals);
          hgToast(
            "We couldn't locate an open request for the user to join this organization. No changes were made.",
            "warning"
          );
          if (!isNil(afterInvalid)) {
            afterInvalid();
          }
        }
      }

      // Error
      // -----
      else {
        this.setState({ approving: false });
        let msg =
          `An error occurred when saving your changes (API returned status ${res.status}). ` +
          errorSuffix(res);
        hgToast(msg, "error");
      }
    });
  };

  deny = () => {
    const { afterDeny, afterInvalid, organization, subjectUser } = this.props;

    this.setState({ denying: true });

    // Note: returns 204 on success, 422 if user/org
    // already approved or there's no existing
    // relationship.
    requestDenyUserOrganizationRequest(subjectUser.id, organization.id).then((res) => {
      // OK
      // --
      if (204 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            denying: false,
          };
          this.setState(newStateVals);
          hgToast("Access request denied");
          if (!isNil(afterDeny)) {
            afterDeny();
          }
        }
      }

      // Invalid
      // -------
      // User already approved for org or there was no existing relationship record.
      else if (422 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            approving: false,
          };
          this.setState(newStateVals);
          hgToast(
            "We couldn't locate an open request for the user to join this organization. No changes were made.",
            "warning"
          );
          if (!isNil(afterInvalid)) {
            afterInvalid();
          }
        }
      }

      // Error
      // -----
      else {
        this.setState({ denying: false });
        let msg = `An error occurred when saving your changes (API returned status ${res.status})`;
        hgToast(msg, "error");
      }
    });
  };

  sameCurrentAndSubjectUser = () => {
    const { currentUser, subjectUser } = this.props;
    return parseInt(currentUser.data.id, 10) === parseInt(subjectUser.id, 10);
  };

  approveConfMsg = () => {
    return "Are you sure you want to approve this user? This action cannot be undone.";
  };

  denyConfMsg = () => {
    return "Are you sure you want to deny this request? This action cannot be undone.";
  };

  render() {
    const { adminMode, organization, pivot } = this.props;
    const { approving, denying } = this.state;
    let approved = !isNil(pivot.access_approved_at);

    return (
      <React.Fragment>
        {adminMode && (
          <React.Fragment>
            <p>
              {!approved && (
                <em>Click below to approve or deny {organization.name} access for this user.</em>
              )}
              {approved && (
                <React.Fragment>
                  Access to {organization.name} was granted{" "}
                  {moment.utc(pivot.access_approved_at).format("L")}.
                </React.Fragment>
              )}
            </p>
          </React.Fragment>
        )}

        <div>
          <ConfirmButton
            disabled={approved || approving || denying}
            color="primary"
            onConfirm={this.approve}
            title={this.approveConfMsg()}
            variant="contained"
          >
            {approved ? "Access approved" : "Approve access"}
            {approving && (
              <React.Fragment>
                &nbsp;
                <CircularProgress size="1em" />
              </React.Fragment>
            )}
          </ConfirmButton>

          {!approved && (
            <React.Fragment>
              {" "}
              <ConfirmButton
                disabled={approved || approving || denying}
                color="secondary"
                onConfirm={this.deny}
                title={this.denyConfMsg()}
                variant="contained"
              >
                {"Deny access"}
                {denying && (
                  <React.Fragment>
                    &nbsp;
                    <CircularProgress size="1em" />
                  </React.Fragment>
                )}
              </ConfirmButton>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(
    (state) => ({
      currentUser: state.auth.currentUser,
    }),
    mapDispatchToProps
  )
)(withStyles(styles, { withTheme: true })(UserOrganizationApproval));
