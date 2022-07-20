import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import ClearIcon from "@mui/icons-material/Clear";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import HgAlert from "components/ui/HgAlert";
import { requestUnlinkUserOrganization } from "api/requests";
import ConfirmButton from "components/ui/ConfirmButton";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * Displays organizations where current user is pending approval.
 *
 * Calling code must provide the list of organizations.
 */
class UserOrganizationsPending extends React.Component {
  static propTypes = {
    afterRemoveRequest: PropTypes.func,
    orgs: PropTypes.array.isRequired,
    includeAlert: PropTypes.bool,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  static defaultProps = {
    includeAlert: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      removingRequest: false,
      orgs: [],
    };
  }

  removeRequest = (org) => {
    const { afterRemoveRequest, currentUser } = this.props;

    if (!this.isCancelled) {
      this.setState({ removingRequest: true });
    }

    requestUnlinkUserOrganization(currentUser.data.id, org.id)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({ removingRequest: false });
          if (afterRemoveRequest) {
            afterRemoveRequest();
          }
        }
        hgToast(`Removed request to join ${org.name}`);
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({ removingRequest: false });
        }
        hgToast(
          "An error occurred while attempting to remove this request. " + errorSuffix(error),
          "error"
        );
      });
  };

  render() {
    const { currentUser, includeAlert, orgs } = this.props;
    if (!currentUser || currentUser.loading) {
      return <CircularProgressGlobal />;
    }

    if (0 === orgs.length) {
      return null;
    }

    return (
      <React.Fragment>
        {includeAlert && (
          <HgAlert
            severity="info"
            includeIcon={true}
            message="Awaiting approval for access to the following organizations"
          />
        )}

        <Table>
          <TableBody>
            {orgs.map((org, idx) => (
              <TableRow key={`pending_org_${idx}`}>
                <TableCell>{org.name}</TableCell>
                <TableCell align="right">
                  <ConfirmButton
                    variant="text"
                    size="small"
                    aria-label={`Remove request to join ${org.name}`}
                    color="primary"
                    onConfirm={() => this.removeRequest(org)}
                    title={`Are you sure you want to remove your request to join ${org.name}?`}
                  >
                    <ClearIcon color="inherit" />
                  </ConfirmButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(UserOrganizationsPending));
