import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { get, isEmpty, isNil, isString, values } from "lodash";
import moment from "moment";
import clsx from "clsx";
import { Hidden, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import {
  requestUsersPending,
  requestApproveUserOrganizationRequest,
  requestDenyUserOrganizationRequest,
} from "api/requests";
import userFuncName from "utils/userFuncName";
import generateQsPrefix from "utils/generateQsPrefix";
import errorSuffix from "utils/errorSuffix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Provides a paginated table of users awaiting access to an organization.
 *
 * This is an admin-only display.
 *
 * User data is loaded in real-time from the server. (it's not pulled from
 * the redux store).
 */

class PendingOrganizationUsersGlobal extends Component {
  static propTypes = {
    // -- Provided by caller.
    // prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // Filtered list for non-admins
    nonAdmin: PropTypes.bool,
    // -- From state.
    userFunctions: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.defaultQsPrefix = "pendingorgusers_";

    this.defaultBrowserParamValues = {
      page: 1,
      sort_dir: "desc",
      sort_name: "created_at_sort",
    };

    this.state = {
      recordsLoading: false,
      records: null,
      requestMeta: {},
      updating: false,
    };

    // Defintions array passed to certain utilities.
    // @see utils/compareStateWithUrlParams()
    // @see utils/populateStateFromUrlParams()
    this.utilDefinitions = [
      {
        stateName: "currentPage",
        paramName: "page",
        defaultParamValue: this.defaultBrowserParamValues.page,
        valueType: "num",
      },
      {
        stateName: "currentSortDir",
        paramName: "sort_dir",
        defaultParamValue: this.defaultBrowserParamValues.sort_dir,
        valueType: "str",
      },
      {
        stateName: "currentSortName",
        paramName: "sort_name",
        defaultParamValue: this.defaultBrowserParamValues.sort_name,
        valueType: "str",
      },
    ];
  }

  componentWillUnmount() {
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);

    let _actualQsPrefix = generateQsPrefix(this.defaultQsPrefix, qsPrefix);

    this.setState({
      actualQsPrefix: _actualQsPrefix,
      currentPage: currentUrlParamValue(
        "page",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.page
      ),
      currentSortDir: currentUrlParamValue(
        "sort_dir",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.sort_dir
      ),
      currentSortName: currentUrlParamValue(
        "sort_name",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.sort_name
      ),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { history, location, qsPrefix } = this.props;
    const { qsPrefix: prevQsPrefix } = prevProps;
    const { actualQsPrefix, currentPage, currentSortDir, currentSortName } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }

    // Begin populating the rest of state once actualQsPrefix is set
    // (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    // Watch for changes that require updating the org result
    // values in state.
    if (
      prevCurrentPage !== currentPage ||
      prevCurrentSortDir !== currentSortDir ||
      prevCurrentSortName !== currentSortName
    ) {
      // Populate/update contents.
      // This call to populateRecords() will automatically be triggered
      // on component mount because we set the state vars checked above
      // there.
      this.populateRecords();

      // If state and URL conflict, update URL.
      if (!compareStateWithUrlParams(this.state, location, this.utilDefinitions, actualQsPrefix)) {
        populateUrlParamsFromState(
          this.state,
          location,
          history,
          this.utilDefinitions,
          actualQsPrefix
        );
      }
    }
  }

  /**
   * Handle onpopstate
   */
  onPopState = (e) => {
    this.callPopulateStateFromUrlParams();
  };

  /**
   * Update component state based on URL changes.
   *
   * Wrapper to simplify calling populateStateFromUrlParams().
   */
  callPopulateStateFromUrlParams = () => {
    const { location } = this.props;
    const { actualQsPrefix } = this.state;

    populateStateFromUrlParams(this, location, this.utilDefinitions, actualQsPrefix);
  };

  /**
   * Populate state.records.
   */
  populateRecords = () => {
    const { apiRequestParams } = this.state;
    this.setState({
      recordsLoading: true,
    });
    requestUsersPending(apiRequestParams).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          recordsLoading: false,
          records: res.data.data,
          requestMeta: res.data.meta,
        });
      }
    });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  /**
   * Handle click of a sortable col header.
   */
  handleSortClick = (v) => {
    const { currentSortDir, currentSortName } = this.state;

    if (!isNil(v)) {
      let vWithSuffix = v + "_sort";
      // If different than current sort selection, reset direction.
      if (vWithSuffix !== currentSortName) {
        this.setState({
          currentSortName: vWithSuffix,
          currentSortDir: "asc",
        });
      } else {
        let newCurrentSortDir = "asc"; // default
        if (isString(currentSortDir) && "asc" === currentSortDir.toLowerCase()) {
          newCurrentSortDir = "desc";
        }
        this.setState({ currentSortDir: newCurrentSortDir });
      }
    }
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
          this.populateRecords();
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
          this.populateRecords();
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

  approveConfMsg = () => {
    return "Are you sure you want to approve this user? This action cannot be undone.";
  };

  denyConfMsg = () => {
    return "Are you sure you want to deny this request? This action cannot be undone.";
  };

  render() {
    const { userFunctions, classes, nonAdmin, perPage } = this.props;
    const { recordsLoading, records, requestMeta, updating, currentPage } = this.state;

    let noRecordData = isEmpty(records) && !recordsLoading;

    // For non-admin screens, we want to hide the table completley
    // unless there is data.  Admin screns are different in that they
    // display the table header with a "no record" message in the table body
    if (nonAdmin && recordsLoading) {
      return <HgSkeleton variant="text" />;
    }
    if (nonAdmin && noRecordData) {
      return null;
    }

    return (
      <React.Fragment>
        <Paper>
          <h2
            className={clsx(classes.pendingOrgHeader, {
              [classes.nonAdminHeader]: nonAdmin,
            })}
          >
            Pending Requests
          </h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Organization</TableCell>
                <Hidden smDown>
                  <TableCell>Title</TableCell>
                </Hidden>
                <TableCell>Request date</TableCell>
                <TableCell>Approve/Deny</TableCell>
              </TableRow>
            </TableHead>
            {recordsLoading ? (
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
                {noRecordData && <caption>No pending requests found.</caption>}

                {!noRecordData && (
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

                            <TableCell>
                              <Link to={`/app/admin/organizations/${record.organization_id}`}>
                                {record.org_name}
                              </Link>
                            </TableCell>

                            <Hidden smDown>
                              <TableCell>{userFunction}</TableCell>
                            </Hidden>

                            <TableCell>{moment.utc(record.created_at).fromNow()}</TableCell>

                            <TableCell style={{ textAlign: "center" }}>
                              <div>
                                <ConfirmButton
                                  className={classes.approveButton}
                                  color="primary"
                                  fullWidth
                                  size="small"
                                  disabled={updating}
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
                                  className={classes.denyButton}
                                  color="secondary"
                                  fullWidth
                                  size="small"
                                  disabled={updating}
                                  onConfirm={() =>
                                    this.deny(record.user_id, record.organization_id)
                                  }
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
          {!recordsLoading && (
            <HgPagination
              handlePageChange={this.handlePageChange}
              itemsPerPage={perPage}
              itemsTotal={requestMeta.total ? requestMeta.total : 0}
              currentPage={currentPage}
            />
          )}
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  approveButton: {
    marginBottom: "3px",
  },
  denyButton: {},
  pendingOrgHeader: {
    margin: theme.spacing(2, 0, 0, 2),
  },
  nonAdminHeader: {
    fontSize: styleVars.txtFontSizeH3,
  },
});

const mapStateToProps = (state) => {
  return {
    userFunctions: state.app_meta.data.userFunctions,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(PendingOrganizationUsersGlobal));
