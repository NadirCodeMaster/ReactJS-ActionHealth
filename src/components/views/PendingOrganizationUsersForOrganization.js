import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { get, isNil, values } from "lodash";
import moment from "moment";
import { Hidden, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";
import HgSkeleton from "components/ui/HgSkeleton";
import errorSuffix from "utils/errorSuffix";
import {
  requestOrganizationUsersPending,
  requestApproveUserOrganizationRequest,
  requestDenyUserOrganizationRequest,
} from "api/requests";
import userFuncName from "utils/userFuncName";

import hgToast from "utils/hgToast";

/**
 * Provides a table of users awaiting access to a given organization.
 *
 * This component does _not_ check for permission to approve. Calling code
 * must do so (approve_organization_user) before using this component.
 *
 * User data is loaded in real-time from the server. (it's not pulled from
 * the redux store).
 */

class PendingOrganizationUsersForOrganization extends Component {
  static propTypes = {
    // -- Provided by caller.
    organizationId: PropTypes.number.isRequired,
    limit: PropTypes.number, // max numer of users to display
    callbackWithResults: PropTypes.func,
    // -- From state.
    userFunctions: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.apiRequestParams = {
      per_page: !isNil(props.limit) ? props.limit : 1000,
      created_at_sort: "desc",
    };

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      recordsLoading: false,
      records: null,
      updating: false,
    };
  }

  /**
   * Populate state.records.
   */
  getRecords = () => {
    const { callbackWithResults, organizationId } = this.props;
    this.setState({
      recordsLoading: true,
    });

    requestOrganizationUsersPending(organizationId, this.apiRequestParams).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          recordsLoading: false,
          records: res.data.data,
        });
      }
      if (callbackWithResults) {
        callbackWithResults(res.data.data);
      }
    });
  };

  approve = (userId, organizationId) => {
    this.setState({ updating: true });

    // Note: returns 204 on success, 422 if user/org
    // already approved or there's no existing
    // relationship.
    requestApproveUserOrganizationRequest(userId, organizationId).then((res) => {
      // OK
      // --
      if (204 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            updating: false,
          };
          this.setState(newStateVals);
          hgToast(`Approved access for user #${userId}`);
          // Reload records so display reflects change.
          this.getRecords();
        }
      }

      // Error
      // -----
      else {
        this.setState({ approving: false });
        let msg =
          `An error occurred when saving your changes (API returned status ${res.status}) ` +
          errorSuffix(res);
        hgToast(msg, "error");
      }
    });
  };

  deny = (userId, organizationId) => {
    this.setState({ updating: true });

    // Note: returns 204 on success, 422 if user/org
    // already approved or there's no existing
    // relationship.
    requestDenyUserOrganizationRequest(userId, organizationId).then((res) => {
      // OK
      // --
      if (204 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            updating: false,
          };
          this.setState(newStateVals);
          hgToast(`Denied access for user #${userId}`);

          // Reload records so display reflects change.
          this.getRecords();
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

  componentDidMount() {
    // Initial call to populate our results.
    this.getRecords();
  }

  componentDidUpdate(prevProps) {
    const { organizationId: prevOrganizationId } = prevProps;
    const { organizationId } = this.props;

    if (organizationId !== prevOrganizationId) {
      // Update the collection.
      this.getRecords();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  approveConfMsg = () => {
    return "Are you sure you want to approve this user? This action cannot be undone.";
  };

  denyConfMsg = () => {
    return "Are you sure you want to deny this request? This action cannot be undone.";
  };

  render() {
    const { userFunctions } = this.props;
    const { recordsLoading, records, updating } = this.state;

    let loading = !records || recordsLoading;

    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <Hidden smDown>
                <TableCell>Title</TableCell>
              </Hidden>
              <TableCell>Request date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
                <Hidden smDown>
                  <TableCell>
                    <HgSkeleton variant="text" />
                  </TableCell>
                </Hidden>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <React.Fragment>
              {records.length < 1 && <caption>No pending requests found.</caption>}

              {records.length > 0 && (
                <React.Fragment>
                  <TableBody>
                    {values(records).map((record, idx) => {
                      let userFunction = userFuncName(record, userFunctions);
                      let nameFirst = get(record, "name_first", "");
                      let nameLast = get(record, "name_last", "");
                      return (
                        <TableRow key={`pending_record_${idx}`}>
                          <TableCell>
                            <Link to={`/app/admin/users/${record.user_id}`}>
                              {nameFirst} {nameLast}
                            </Link>
                          </TableCell>

                          <Hidden smDown>
                            <TableCell>{userFunction}</TableCell>
                          </Hidden>

                          <TableCell>{moment.utc(record.created_at).fromNow()}</TableCell>

                          <TableCell style={{ textAlign: "center" }}>
                            <div>
                              <ConfirmButton
                                fullWidth
                                size="small"
                                disabled={updating}
                                style={{ marginBottom: "3px" }}
                                color="primary"
                                onConfirm={() =>
                                  this.approve(record.user_id, record.organization_id)
                                }
                                title={this.approveConfMsg()}
                                variant="text"
                              >
                                Approve
                              </ConfirmButton>
                            </div>
                            <div>
                              <ConfirmButton
                                fullWidth
                                size="small"
                                disabled={updating}
                                color="secondary"
                                onConfirm={() => this.deny(record.user_id, record.organization_id)}
                                title={this.denyConfMsg()}
                                variant="text"
                              >
                                Deny
                              </ConfirmButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </Table>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    userFunctions: state.app_meta.data.userFunctions,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(PendingOrganizationUsersForOrganization));
