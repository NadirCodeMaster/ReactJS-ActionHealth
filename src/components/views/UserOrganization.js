import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ValidatorForm } from "react-form-validator-core";
import HgSelect from "components/ui/HgSelect";
import HgTextValidator from "components/ui/HgTextValidator";
import clsx from "clsx";
import { each, get, includes, isNil, orderBy, startsWith, set as lodashSet } from "lodash";
import { Button, CircularProgress, Divider, FormGroup } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requiredMessage } from "form_utils";
import HgSkeleton from "components/ui/HgSkeleton";
import ConfirmButton from "components/ui/ConfirmButton";
import UserOrganizationApproval from "components/views/UserOrganizationApproval";
import {
  requestUserOrganizations,
  requestUpdateUserOrganization,
  requestUnlinkUserOrganization,
} from "api/requests";
import compareObjectIds from "utils/compareObjectIds";
import filterUserFunctionsByOrganizationType from "utils/filterUserFunctionsByOrganizationType";
import orgRoleCanChangeOrgRoleToOrgRole from "utils/orgRoleCanChangeOrgRoleToOrgRole";
import errorSuffix from "utils/errorSuffix";
import userCan from "utils/userCan";
import { refreshCurrentUserData } from "store/actions";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Provides a UI for managing relationship between a User and Organization.
 *
 * The adminMode prop determines if this operates as if it's in the `admin/`
 * section of the system or in the user-facing `account/` section. However,
 * that prop does _not_ determine any actual permissions.
 */
class UserOrganization extends Component {
  constructor(props) {
    super(props);

    // Whether we've attempted to load pivot data
    // from the api yet.
    this.firstRequestMade = false;

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      updating: false,
      editing: false,
      enabledRoles: [],
      changesPending: false,
      notAssociated: false, // if user/org aren't actually associated yet
      actualPivot: {},
      actualPivotLoading: true,
      draftPivot: {},
      userCanEditSubjUser: false,
      userCanViewTeam: false,
    };
  }

  static propTypes = {
    adminMode: PropTypes.bool,
    organization: PropTypes.shape(organizationShape).isRequired,
    subjectUser: PropTypes.object.isRequired,
    appMeta: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    refreshCurrentUserData: PropTypes.func.isRequired,
  };

  static defaultProps = {
    adminMode: false,
  };

  componentDidMount() {
    this.populatePerms();
    this.populateActualPivot(true);
  }

  componentDidUpdate(prevProps, prevState) {
    const { organization, subjectUser } = this.props;
    const { organization: prevOrganization, subjectUser: prevSubjectUser } = prevProps;
    const { actualPivot } = this.state;
    const { actualPivot: prevActualPivot } = prevState;

    // Changes requiring us to set/re-set the enabled roles.
    if (
      actualPivot !== prevActualPivot ||
      organization.id !== prevOrganization.id ||
      subjectUser.id !== prevSubjectUser.id
    ) {
      this.populateEnabledRoles(actualPivot);
    }

    // Changes requiring us to re-establish perms and
    // actual the actual pivot record for user.
    if (organization.id !== prevOrganization.id || subjectUser.id !== prevSubjectUser.id) {
      this.populatePerms();
      this.populateActualPivot(true);
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  /**
   * Check permissions and setup state vars for em.
   */
  populatePerms = () => {
    const { currentUser, organization } = this.props;

    // Determine current user access.
    let canViewTeam = userCan(currentUser, organization, "view_team");
    let editPerm = "edit_others_user_organization";
    if (this.sameCurrentAndSubjectUser()) {
      editPerm = "edit_own_user_organization";
    }
    let canEditSubjUser = userCan(currentUser, organization, editPerm);

    this.setState({
      userCanEditSubjUser: canEditSubjUser,
      userCanViewTeam: canViewTeam,
    });
  };

  /**
   * Populate state.actualPivot from server.
   *
   */
  populateActualPivot = (overwriteDraft) => {
    const { organization, subjectUser } = this.props;

    this.firstRequestMade = true;
    this.setState({ actualPivotLoading: true });
    requestUserOrganizations(subjectUser.id, {
      organization_id: organization.id,
      per_page: 1,
      page: 1,
      access_approved: 1,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals;

          // If no results.
          if (0 === res.data.data.length) {
            updatedStateVals = {
              changesPending: false,
              actualPivotLoading: false,
              notAssociated: true,
              actualPivot: {},
              draftPivot: {},
            };
          }

          // If a relationship was found.
          else {
            let resPiv = res.data.data[0].pivot;
            updatedStateVals = {
              changesPending: false,
              actualPivotLoading: false,
              actualPivot: {
                organization_role_id: resPiv.organization_role_id,
                user_function_id: resPiv.user_function_id,
                user_function_other: resPiv.user_function_other,
                access_approved_at: resPiv.access_approved_at,
                access_approved_by: resPiv.access_approved_by,
              },
            };
            if (overwriteDraft) {
              updatedStateVals.draftPivot = {
                ...updatedStateVals.actualPivot,
              };
            }
          }

          // Apply whatever updated state vals we now have.
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            actualPivotLoading: false,
          });
        }
      });
  };

  /**
   * Reset the draftPivot to the values of actualPivot.
   */
  resetDraftPivot = (disableEditMode) => {
    this.setState({
      draftPivot: { ...this.state.actualPivot },
      changesPending: false,
      editing: disableEditMode ? false : this.state.editing,
    });
  };

  /**
   * Check if an org role ID is in our enabledRoles state var.
   *
   * @param {Number} orgRoleId
   * @return {Boolean}
   */
  roleIdIsEnabled(orgRoleId) {
    const { enabledRoles } = this.state;
    return includes(enabledRoles, orgRoleId);
  }

  /**
   * Populate state var w/roles allowed to be selected by this user.
   *
   * @param {Object} subjPiv
   *  User/org pivot data object
   */
  populateEnabledRoles = (subjPiv) => {
    const { appMeta, currentUser } = this.props;

    // Array of what org ids the current user can select/modify for org.
    let enabledRoles = [];
    let allOrgRoles = appMeta.data.organizationRoles;

    // Current user org role for organization, if any.
    let curUserOrgRole = allOrgRoles[subjPiv.organization_role_id];

    each(allOrgRoles, (orgRole) => {
      // Use special logic to determine if cur user is allowed to change
      // self to orgRole of this loop.
      if (
        orgRoleCanChangeOrgRoleToOrgRole(
          currentUser.isAdmin,
          curUserOrgRole,
          curUserOrgRole,
          orgRole
        )
      ) {
        enabledRoles.push(orgRole.id);
      }
    });

    this.setState({ enabledRoles: enabledRoles });
  };

  handleChange = (e) => {
    if (this.state.editing) {
      let changesPending = this.state.changesPending;
      if (this.state.draftPivot[e.target.name] !== e.target.value) {
        changesPending = true;
      }
      this.setState({
        changesPending: changesPending,
        draftPivot: {
          ...this.state.draftPivot,
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  handleSave = () => {
    const { organization, subjectUser } = this.props;
    const { draftPivot } = this.state;

    this.setState({ updating: true });
    requestUpdateUserOrganization(subjectUser.id, organization.id, draftPivot).then((res) => {
      if (200 === res.status) {
        if (!this.isCancelled) {
          let newStateVals = {
            changesPending: false,
            editing: false,
            updating: false,
            actualPivot: {
              ...draftPivot,
            },
          };

          this.setState(newStateVals);
          hgToast("Changes saved!");
        }
      } else {
        // **NOT OK**
        this.setState({
          updating: false,
        });
        let msg =
          `An error occurred when saving your changes (API returned status ${res.status}). ` +
          errorSuffix(res);
        hgToast(msg, "error");
      }
    });
  };

  isOtherFunction = (ufId) => {
    const { appMeta } = this.props;
    return startsWith(get(appMeta.data.userFunctions, `[${ufId}].name`), "Other");
  };

  sameCurrentAndSubjectUser = () => {
    const { currentUser, subjectUser } = this.props;
    return parseInt(currentUser.data.id, 10) === parseInt(subjectUser.id, 10);
  };

  leaveOrganizationConfMsg = () => {
    if (this.sameCurrentAndSubjectUser()) {
      return "Are you sure you want to remove yourself from this organization?";
    }
    return "Are you sure you want to remove this user from this organization?";
  };

  leaveOrganization = () => {
    const { adminMode, currentUser, history, organization, refreshCurrentUserData, subjectUser } =
      this.props;

    this.setState({ updating: true });
    requestUnlinkUserOrganization(subjectUser.id, organization.id)
      .then((res) => {
        if (!this.isCancelled) {
          // Reload user data if current and subject are same.
          if (compareObjectIds(currentUser.data, subjectUser)) {
            refreshCurrentUserData();
          }

          hgToast("Left organization");

          // Use different links in admin vs not
          if (adminMode) {
            history.push(`/app/admin/users/${subjectUser.id}`);
          } else {
            // Everyone else to their dashboard.
            history.push("/app/account/dashboard");
          }
        }
      })
      .catch((error) => {
        hgToast("An error occurred while removing user from organization", "error");
      });
  };

  // Executed after access is denied for user.
  afterDeny = () => {
    const { adminMode, history, subjectUser } = this.props;
    // Only applicable in adminMode.
    if (adminMode) {
      history.push(`/app/admin/users/${subjectUser.id}`);
    }
  };

  // Executed after invalid access request completes.
  afterInvalid = () => {
    const { adminMode, history, subjectUser } = this.props;
    // Only applicable in adminMode.
    if (adminMode) {
      history.push(`/app/admin/users/${subjectUser.id}`);
    }
  };

  toggleEditClick = (e) => {
    // If this is a cancel click, reset the values and toggle
    // via that method to consolidate setState calls.
    if ("cancel" === e.currentTarget.value) {
      this.resetDraftPivot(true);
    } else {
      this.toggleEdit();
    }
  };

  toggleEdit = () => {
    this.setState((state, props) => {
      return { editing: !state.editing };
    });
  };

  selectOrgRoleValues = () => {
    const { appMeta } = this.props;
    let organizationRoles = get(appMeta, "data.organizationRoles", []);

    return Object.entries(organizationRoles).map(([key, value]) => {
      return {
        value: value.id,
        label: value.name,
        isDisabled: !this.roleIdIsEnabled(value.id),
      };
    });
  };

  selectPositionValues = () => {
    const { appMeta, organization } = this.props;
    let uFuncs = get(appMeta, "data.userFunctions", {});
    let uFuncCats = get(appMeta, "data.userFunctionCategories", {});

    // Remove user functions that don't match org type.
    uFuncs = filterUserFunctionsByOrganizationType(
      uFuncs,
      uFuncCats,
      organization.organization_type_id
    );

    let resArr = Object.entries(uFuncs).map(([key, value]) => {
      let ufcName = "";
      try {
        let ufcId = value.user_function_category_id;
        ufcName = `${uFuncCats[ufcId].name}: `;
      } catch (err) {
        console.error(err.message);
      }
      return {
        value: value.id,
        label: `${ufcName}${value.name}`,
      };
    });

    resArr = orderBy(resArr, "label", "asc");
    return resArr;
  };

  handleSelectChange = (field, e) => {
    this.setState((state) => lodashSet(state, `draftPivot.${field}`, e.value));
  };

  render() {
    const { adminMode, classes, organization, subjectUser } = this.props;

    const {
      changesPending,
      actualPivot,
      draftPivot,
      editing,
      actualPivotLoading,
      notAssociated,
      updating,
      userCanEditSubjUser,
      userCanViewTeam,
    } = this.state;

    if (actualPivotLoading || isNil(draftPivot)) {
      return (
        <div>
          <HgSkeleton className={classes.skeletonSelect} variant="rect" width={"30%"} height={30} />
          <HgSkeleton className={classes.skeletonSelect} variant="rect" width={"30%"} height={30} />
          <HgSkeleton variant="text" width={"50%"} />
          <HgSkeleton variant="text" width={"50%"} />
          <div className={classes.skeletonButtonContainer}>
            <HgSkeleton className={classes.skeletonButton} variant="rect" width={70} height={30} />
            <HgSkeleton className={classes.skeletonButton} variant="rect" width={90} height={30} />
            <HgSkeleton
              className={classes.skeletonButtonLast}
              variant="rect"
              width={100}
              height={30}
            />
          </div>
        </div>
      );
    }

    if (notAssociated && adminMode) {
      return (
        <div>
          <em>This user and organization are not currently associated with each other.</em>
        </div>
      );
    }

    const commonInputProps = {
      errorMessages: [requiredMessage],
      onChange: this.handleChange,
      validators: ["required"],
    };

    return (
      <React.Fragment>
        {adminMode && (
          <React.Fragment>
            <UserOrganizationApproval
              subjectUser={subjectUser}
              organization={organization}
              pivot={actualPivot}
              afterApprove={() => this.populateActualPivot(false)}
              afterDeny={() => this.afterDeny()}
              afterInvalid={() => this.afterInvalid()}
              adminMode={adminMode}
            />
            <br />
            <Divider light />
            <br />
          </React.Fragment>
        )}
        <ValidatorForm ref="form" onSubmit={this.handleSave}>
          <FormGroup className={classes.formControl}>
            <HgSelect
              placeholder="Organization Role"
              aria-label="Organization Role"
              name="organization_role_id"
              isDisabled={!editing || updating}
              options={this.selectOrgRoleValues()}
              value={
                this.selectOrgRoleValues().filter(
                  ({ value }) => value === draftPivot.organization_role_id
                ) || ""
              }
              onChange={(e) => this.handleSelectChange("organization_role_id", e)}
            />
          </FormGroup>

          <FormGroup className={classes.formControl}>
            <HgSelect
              placeholder="Position"
              aria-label="Position"
              name="user_function_id"
              isDisabled={!editing || updating}
              options={this.selectPositionValues()}
              value={
                this.selectPositionValues().filter(
                  ({ value }) => value === draftPivot.user_function_id
                ) || ""
              }
              onChange={(e) => this.handleSelectChange("user_function_id", e)}
            />
          </FormGroup>

          <FormGroup className={classes.formControl}>
            {this.isOtherFunction(draftPivot.user_function_id) && (
              <HgTextValidator
                {...commonInputProps}
                name="user_function_other"
                label="Other position description"
                value={draftPivot.user_function_other ? draftPivot.user_function_other : ""}
                disabled={!editing || updating}
              />
            )}
          </FormGroup>

          {changesPending && (
            <p>
              <em>
                <strong>Click save to apply your changes</strong>
              </em>
            </p>
          )}

          <p
            style={{
              fontSize: styleVars.txtFontSizeXs,
              maxWidth: "400px",
            }}
          >
            Available role selections are dependent on your current role with the organization and
            with Healthier Generation.
          </p>

          <br />
          <Divider light />
          <br />

          <div className={classes.actions}>
            {editing && (
              <Button
                className={classes.actionsButton}
                color="primary"
                type="submit"
                variant="contained"
                disabled={updating}
              >
                Save
                {updating && (
                  <React.Fragment>
                    &nbsp;
                    <CircularProgress size="1em" />
                  </React.Fragment>
                )}
              </Button>
            )}

            {userCanEditSubjUser && (
              <Button
                className={clsx(classes.actionsButton, {
                  [classes.cancelButton]: editing,
                })}
                color="secondary"
                onClick={this.toggleEditClick}
                type="button"
                variant="contained"
                disabled={updating}
                value={editing ? "cancel" : "edit"}
              >
                {editing ? "Cancel" : "Edit"}
              </Button>
            )}

            {!editing && userCanViewTeam && (
              <Button
                className={clsx(classes.actionsButton, classes.teamButton)}
                color="primary"
                variant="outlined"
                component={Link}
                to={`/app/account/organizations/${organization.id}/team`}
                type="button"
              >
                {adminMode ? "Team" : "Your Team"}
              </Button>
            )}

            {!editing && (
              <span className={classes.leaveButtonWrapper}>
                <ConfirmButton
                  className={classes.actionsButton}
                  color="primary"
                  onConfirm={this.leaveOrganization}
                  title={this.leaveOrganizationConfMsg()}
                  variant="contained"
                >
                  {adminMode ? "Disassociate" : "Leave Organization"}
                </ConfirmButton>
              </span>
            )}
          </div>
        </ValidatorForm>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  formControl: {
    maxWidth: 600,
    marginBottom: theme.spacing(2),
    width: "100%",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  actionsButton: {
    marginLeft: "0.25em",
    marginRight: "0.25em",
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(),
      width: "100%",
    },
  },
  cancelButton: {
    [theme.breakpoints.up("sm")]: {
      marginRight: "auto",
    },
  },
  teamButton: {
    [theme.breakpoints.up("sm")]: {
      marginRight: "auto",
    },
  },
  leaveButtonWrapper: {
    [theme.breakpoints.down("md")]: {
      borderTop: `1px dashed ${theme.palette.primary.main}`,
      marginTop: theme.spacing(2),
      paddingTop: theme.spacing(2),
      width: "100%",
    },
  },
  skeletonSelect: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  skeletonButtonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    margin: theme.spacing(4, 0, 0, 0),
  },
  skeletonButton: {
    margin: theme.spacing(0, 2, 0, 0),
  },
  skeletonButtonLast: {
    marginLeft: "auto",
  },
});

export default compose(
  withRouter,
  connect(
    (state) => ({
      appMeta: state.app_meta,
      currentUser: state.auth.currentUser,
    }),
    { refreshCurrentUserData }
  )
)(withStyles(styles, { withTheme: true })(UserOrganization));
