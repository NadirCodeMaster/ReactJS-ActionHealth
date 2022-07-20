import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { get, each, find, has, includes, isEmpty, isNil, values } from "lodash";
import errorSuffix from "utils/errorSuffix";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormHelperText,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import HgSelect from "components/ui/HgSelect";
import { requestUpdateUserOrganization } from "api/requests";
import {} from "store/actions";
import orgRoleCanChangeOrgRoleToOrgRole from "utils/orgRoleCanChangeOrgRoleToOrgRole";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import hgToast from "utils/hgToast";

/**
 * Modal dialog for modifying organization role of a org/user relationship.
 */
class ChangeUserRoleDialog extends React.Component {
  static propTypes = {
    subjUserWithPivot: PropTypes.shape({
      id: PropTypes.number.isRequired,
      pivot: PropTypes.object.isRequired,
    }).isRequired,
    organization: PropTypes.shape(organizationShape).isRequired,
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationRoles: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      updating: false,
      enabledRoles: [],
      pivot: {
        organization_id: "",
        organization_role_id: "",
        user_id: "",
      },
    };
  }

  componentDidMount() {
    this.initCompState();
  }

  componentDidUpdate(prevProps) {
    const { subjUserWithPivot } = this.props;
    const { subjUserWithPivot: prevSubjUserWithPivot } = this.props;

    if (subjUserWithPivot !== prevSubjUserWithPivot) {
      this.initCompState();
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  initCompState = () => {
    const { organizationRoles, currentUser, organization, subjUserWithPivot } = this.props;

    // Check if current and subject users are same.
    let same = currentUser.data.id === subjUserWithPivot.id;

    // Subject user pivot for organization.
    let subjPiv = subjUserWithPivot.pivot;

    // Current user pivot for organization.
    let curUserOrgRole = null;
    if (
      !isEmpty(organization.requester_pivot) &&
      has(organization.requester_pivot, "organization_role_id") &&
      organization.requester_pivot.organization_role_id
    ) {
      curUserOrgRole = organizationRoles[organization.requester_pivot.organization_role_id];
    }

    // Which permission to check, based on whether it's same or other user.
    let permToCheck = same ? "edit_own_user_organization" : "edit_others_user_organization";

    // Whether we'll allow any changes to occur.
    let allowChanges = userCan(currentUser, organization, permToCheck);

    // Array of what org ids the current user can select/modify for org/sub user.
    let enabledRoles = [];

    // If any changes can be made at all, determine what roles are allowed to
    // be selected by this user.
    if (allowChanges) {
      // Get subject user's org role object.
      let subjOrgRoleId = get(subjPiv, "organization_role_id", null);
      let subjOrgRole = find(organizationRoles, (v) => {
        return v.id === subjOrgRoleId;
      });

      each(organizationRoles, (orgRole) => {
        // Use special logic to determine if cur user is allowed to change
        // subj user to the orgRole of this loop.
        if (
          orgRoleCanChangeOrgRoleToOrgRole(
            currentUser.isAdmin,
            curUserOrgRole,
            subjOrgRole,
            orgRole
          )
        ) {
          enabledRoles.push(orgRole.id);
        }
      });
    }

    this.setState({
      enabledRoles: enabledRoles,
      pivot: {
        organization_id: subjPiv.organization_id,
        organization_role_id: subjPiv.organization_role_id,
        user_id: subjPiv.user_id,
      },
    });
  };

  onChangeSelect = (event) => {
    this.setState({
      pivot: {
        ...this.state.pivot,
        organization_role_id: event.value,
      },
    });
  };

  close = (pivot) => {
    const { onClose } = this.props;

    if (isNil(pivot)) {
      pivot = null;
    }

    // Send the pivot data back to the caller if
    // an update was processed. If no update was
    // processed, the callback will be sent null.
    onClose(pivot);
  };

  submit = () => {
    const { pivot } = this.state;

    this.setState({ updating: true });

    requestUpdateUserOrganization(pivot.user_id, pivot.organization_id, pivot)
      .then((res) => {
        if (!this.isCancelled) {
          // SUCCESS
          this.setState({
            updating: false,
          });
          hgToast("Role changed");
          this.close(this.state.pivot);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            updating: false,
          });
          let msg =
            "An error occurred updating the user/organization relationship. " + errorSuffix(error);
          hgToast(msg, "error");
        }
      });
  };

  /**
   * Check if an org role ID is in our enabledRoles state var.
   */
  roleIdIsEnabled = (orgRoleId) => {
    const { enabledRoles } = this.state;
    return includes(enabledRoles, orgRoleId);
  };

  render() {
    const { organizationRoles, classes, open, organization, subjUserWithPivot } = this.props;
    const { pivot, updating } = this.state;
    const { organization_role_id } = pivot;

    let orgRolesArr = values(organizationRoles);
    let nameFirst = get(subjUserWithPivot, "name_first", "");
    let nameLast = get(subjUserWithPivot, "name_last", "");
    let selectValues = orgRolesArr.map((orgRole) => {
      return {
        value: orgRole.id,
        label: orgRole.name,
        isDisabled: !this.roleIdIsEnabled(orgRole.id),
      };
    });

    return (
      <React.Fragment>
        <Dialog
          open={open}
          onClose={() => this.close(null)}
          aria-labelledby="change-user-role-dialog-title"
        >
          <DialogTitle id="change-user-role-dialog-title">
            Change role at {organization.name} for {nameFirst} {nameLast}
          </DialogTitle>
          <DialogContent className={classes.dialog}>
            <form>
              <FormControl margin="normal" fullWidth variant="standard">
                <HgSelect
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  maxMenuHeight={220}
                  placeholder="Organization role"
                  aria-label="Organization role"
                  name="organization_role_id"
                  options={selectValues}
                  value={selectValues.filter(({ value }) => value === organization_role_id) || ""}
                  onChange={this.onChangeSelect}
                />

                <FormHelperText id="organization_role_id_helper_text">
                  Available selections are dependent on your role with the organization and with
                  Healthier Generation.
                </FormHelperText>
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.close(null)} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button color="primary" disabled={updating} onClick={this.submit} variant="contained">
              Change role
              {updating && (
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
    minWidth: "400px",
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
    organizationRoles: state.app_meta.data.organizationRoles,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ChangeUserRoleDialog));
