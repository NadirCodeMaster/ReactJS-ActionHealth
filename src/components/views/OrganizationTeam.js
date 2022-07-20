import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { has, isEmpty, isNil, values } from "lodash";
import moment from "moment";
import { Button, Hidden, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import ConfirmButton from "components/ui/ConfirmButton";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import ChangeUserRoleDialog from "components/views/ChangeUserRoleDialog";
import { requestOrganizationUsers, requestUnlinkUserOrganization } from "api/requests";
import orgRoleCanManageOrgRole from "utils/orgRoleCanManageOrgRole";
import userFullName from "utils/userFullName";
import userFuncName from "utils/userFuncName";
import generateQsPrefix from "utils/generateQsPrefix";
import errorSuffix from "utils/errorSuffix";
import compareObjectIds from "utils/compareObjectIds";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import userCan from "utils/userCan";
import { organizationShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * Provides a paginated table of users associated with an organization.
 *
 * Can be used on admin or user-facing pages. When current user is an admin,
 * the individual user records will be linked to their admin detail page.
 *
 * Users with sufficient permissions (via their organization role) will be
 * allowed to modify the organization roles of other users.
 *
 * User data is loaded in real-time from the server. (it's not pulled from
 * the redux store).
 */
class OrganizationTeam extends Component {
  static propTypes = {
    // From caller.
    // -------------------
    qsPrefix: PropTypes.string, // prefix for query string parameters
    organization: PropTypes.shape(organizationShape).isRequired,

    // From HOCs.
    // ----------
    appMeta: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 50,
  };

  constructor(props) {
    super(props);

    this.actualQsPrefix = generateQsPrefix("orgteam_", props.qsPrefix);
    this.firstLoadRequested = false;
    this.isCancelled = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
    };

    this.utilDefinitions = [
      {
        stateName: "currentPage",
        paramName: "page",
        defaultParamValue: this.defaultBrowserParamValues.page,
        valueType: "num",
      },
    ];

    this.state = {
      accessChecked: false,
      userCanEditUsers: false,
      userCanRemoveUsers: false,
      changeUserRoleUser: null,
      currentUserOrgRole: null,
      organizationUsersLoading: false,
      organization: null,
      organizationUsers: null,
      removingUser: false,
      organizationUsersTotal: 0,
      currentPage: null,
    };
  }

  componentDidMount() {
    const { currentUser, organization, qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);

    this.setState({
      actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
    });

    let allowEditUsers = userCan(currentUser, organization, "edit_others_user_organization");

    let allowRemoveUsers = userCan(currentUser, organization, "remove_others_user_organization");

    this.setState({
      accessChecked: true,
      userCanEditUsers: allowEditUsers,
      userCanRemoveUsers: allowRemoveUsers,
    });

    // // Initial call to populate our results.
    this.populateOrganizationUsers();
    //
    // Determine current user org role with org.
    this.populateCurrentUserOrgRole();
  }

  componentDidUpdate(prevProps, prevState) {
    const { location, history, qsPrefix, subjectUser } = this.props;
    const { qsPrefix: prevQsPrefix, subjectUser: prevSubjectUser } = prevProps;
    const { actualQsPrefix, currentPage } = this.state;
    const { actualQsPrefix: prevActualQsPrefix, currentPage: prevCurrentPage } = prevState;

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

    // Watch for changes that require initial loading of and
    // updates to the org result values in state.
    if (currentPage !== prevCurrentPage || !compareObjectIds(subjectUser, prevSubjectUser)) {
      this.populateOrganizationUsers();

      // If state and URL conflict, update URL to reflect state.
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

  componentWillUnmount() {
    window.removeEventListener("popstate", this.onPopState);
    this.isCancelled = true;
  }

  /**
   * Handle onpopstate
   */
  onPopState = (e) => {
    this.callPopulateStateFromUrlParams();
  };

  callPopulateStateFromUrlParams = () => {
    const { location } = this.props;
    const { actualQsPrefix } = this.state;

    populateStateFromUrlParams(this, location, this.utilDefinitions, actualQsPrefix);
  };

  /**
   * Populate state.organizationUsers.
   */
  populateOrganizationUsers = () => {
    const { organization, perPage } = this.props;
    const { currentPage } = this.state;

    if (organization && organization.id) {
      this.firstLoadRequested = true;
      this.setState({
        organizationUsersLoading: true,
      });
      requestOrganizationUsers(organization.id, {
        current_page: currentPage,
        per_page: perPage,
      }).then((res) => {
        if (!this.isCancelled) {
          this.setState({
            organizationUsersLoading: false,
            organizationUsers: res.data.data,
            requestMeta: res.data.meta,
          });
        }
      });
    }
  };

  /**
   * Sets this.currentUserOrgRole (org role obj for current user in org).
   */
  populateCurrentUserOrgRole = () => {
    const { appMeta, organization } = this.props;
    const { currentUserOrgRole } = this.state;

    let newRole = null;
    let allOrgRoles = appMeta.data.organizationRoles;

    if (
      !isEmpty(organization.requester_pivot) &&
      has(organization.requester_pivot, "organization_role_id") &&
      organization.requester_pivot.organization_role_id
    ) {
      newRole = allOrgRoles[organization.requester_pivot.organization_role_id];
    }

    if (!compareObjectIds(currentUserOrgRole, newRole)) {
      this.setState({ currentUserOrgRole: newRole });
    }
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  removeUser = (userObj) => {
    const { organization } = this.props;

    if (!this.isCancelled) {
      this.setState({
        removingUser: true,
      });
    }

    requestUnlinkUserOrganization(userObj.id, organization.id).then((res) => {
      if (204 === res.status) {
        // SUCCESS.
        let fullName = userFullName(userObj, true);
        if (!this.isCancelled) {
          hgToast(`Removed user ${fullName} from ${organization.name}`);
          this.populateOrganizationUsers(); // repop from server
          this.setState({ removingUser: false });
        }
      } else {
        // FAILED.
        if (!this.isCancelled) {
          hgToast(`An error occurred removing this user. ` + errorSuffix(res), "error");
          this.setState({ removingUser: false });
        }
      }
    });
  };

  onChangeUserRoleDialogClosed = (res) => {
    if (!isNil(res)) {
      // If we received a value from the dialog, it means
      // an update was processed. So, refresh the table data.
      this.populateOrganizationUsers();
    }
    // Unset the subject user of the dialog.
    this.setState({ changeUserRoleUser: null });
  };

  onChangeUserRoleDialogOpened = (user) => {
    this.setState({ changeUserRoleUser: user });
  };

  render() {
    const { appMeta, classes, currentUser, organization, perPage } = this.props;
    const {
      accessChecked,
      userCanEditUsers,
      userCanRemoveUsers,
      changeUserRoleUser,
      currentUserOrgRole,
      organizationUsers,
      organizationUsersLoading,
      requestMeta,
      currentPage,
    } = this.state;

    let organizationRoles = appMeta.data.organizationRoles;
    let userFunctions = appMeta.data.userFunctions;

    let loading = !accessChecked || organizationUsersLoading;

    // Number of cols per row, adjusted based on
    // whether we include cols for modifying users.
    // Note that responsively hidden cols don't count.
    let cols = 4;
    if (userCanEditUsers) {
      cols++;
    }
    if (userCanRemoveUsers) {
      cols++;
    }

    return (
      <React.Fragment>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <Hidden smDown>
                <TableCell>Title</TableCell>
                <TableCell>Joined team</TableCell>
              </Hidden>
              {userCanEditUsers && (
                <TableCell className={classes.changeRoleCell}>Change role</TableCell>
              )}
              {userCanRemoveUsers && (
                <TableCell className={classes.changeRoleCell}>Remove</TableCell>
              )}
            </TableRow>
          </TableHead>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
                <TableCell>
                  <HgSkeleton variant="text" />
                </TableCell>
                <Hidden smDown>
                  <TableCell>
                    <HgSkeleton variant="text" />
                  </TableCell>
                  <TableCell>
                    <HgSkeleton variant="text" />
                  </TableCell>
                </Hidden>
                {userCanEditUsers && (
                  <TableCell className={classes.changeRoleCell}>
                    <HgSkeleton variant="text" />
                  </TableCell>
                )}
                {userCanRemoveUsers && (
                  <TableCell className={classes.changeRoleCell}>
                    <HgSkeleton variant="text" />
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
          ) : (
            <React.Fragment>
              {organizationUsers.length < 1 && (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={cols}>No team members found.</TableCell>
                  </TableRow>
                </TableBody>
              )}

              {organizationUsers.length > 0 && (
                <React.Fragment>
                  <TableBody>
                    {values(organizationUsers).map((user) => {
                      let userFunction = userFuncName(user.pivot, userFunctions);
                      let subjOrgRole = organizationRoles[user.pivot.organization_role_id];
                      let rowIsForCurUser = user.id === currentUser.data.id;
                      let userOrgRoleCanManageSubjOrgRole = orgRoleCanManageOrgRole(
                        currentUser.isAdmin,
                        currentUserOrgRole,
                        subjOrgRole
                      );
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            {currentUser.isAdmin ? (
                              <Link to={`/app/admin/users/${user.id}`}>
                                {userFullName(user, true)}
                              </Link>
                            ) : (
                              <span>{userFullName(user, true)}</span>
                            )}
                          </TableCell>
                          <TableCell>{subjOrgRole && subjOrgRole.name}</TableCell>
                          <Hidden smDown>
                            <TableCell>{userFunction}</TableCell>
                            <TableCell>{moment.utc(user.pivot.created_at).fromNow()}</TableCell>
                          </Hidden>

                          {userCanEditUsers && (
                            <TableCell style={{ textAlign: "center" }}>
                              {/* Only enable button for other users
                                  to simplify code here. */}
                              <Button
                                disabled={rowIsForCurUser || !userOrgRoleCanManageSubjOrgRole}
                                aria-label="Change role"
                                color="primary"
                                onClick={() => this.onChangeUserRoleDialogOpened(user)}
                              >
                                <EditIcon color="inherit" />
                              </Button>
                            </TableCell>
                          )}

                          {userCanRemoveUsers && (
                            <TableCell style={{ textAlign: "center" }}>
                              {/* Only enable button for other users
                                  to simplify code here. */}
                              <ConfirmButton
                                disabled={rowIsForCurUser || !userOrgRoleCanManageSubjOrgRole}
                                aria-label="Remove from team"
                                color="primary"
                                onConfirm={() => this.removeUser(user)}
                                title="Are you sure you want to remove this user from your organization?"
                              >
                                <ClearIcon color="inherit" />
                              </ConfirmButton>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </Table>
        {!loading && (
          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={perPage}
            itemsTotal={requestMeta.total ? requestMeta.total : 0}
            currentPage={currentPage}
          />
        )}
        {userCanEditUsers && changeUserRoleUser && (
          <ChangeUserRoleDialog
            onClose={this.onChangeUserRoleDialogClosed}
            open={Boolean(changeUserRoleUser)}
            subjUserWithPivot={changeUserRoleUser}
            organization={organization}
          />
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  changeRoleCell: {
    [theme.breakpoints.up("sm")]: {
      width: "10%",
    },
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
    appMeta: state.app_meta,
    programs: state.programs,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(OrganizationTeam));
