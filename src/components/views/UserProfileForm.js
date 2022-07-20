import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { ValidatorForm } from "react-material-ui-form-validator";
import HgSelect from "components/ui/HgSelect";
import HgTextValidator from "components/ui/HgTextValidator";
import { get, each, find, isNil, values, set as lodashSet } from "lodash";
import { Button, CircularProgress, Grid } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requiredMessage, isEmailMessage, isPhone, isPhoneMessage } from "form_utils";
import { requestUser, requestCreateUser, requestUpdateUser } from "api/requests";
import stateCodes from "constants/state_codes";
import moment from "moment";
import HgTextField from "components/ui/HgTextField";
import hgToast from "utils/hgToast";
import { refreshCurrentUserData } from "store/actions";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * User profile form component.
 *
 * Can be used for the current user to edit their own information or for
 * other users. The subject user is determined by the value of the subjectUserId
 * prop that is passed to the component.
 */
class User extends Component {
  static propTypes = {
    adminMode: PropTypes.bool,
    subjectUserId: PropTypes.number,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
    refreshSelf: PropTypes.func,
    systemRoles: PropTypes.object.isRequired,
  };

  static defautProps = {
    adminMode: false,
  };

  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      loading: true,
      submitting: false,
      draftUser: {},
    };

    // Declare the "standard" system role as our default
    // to be used if needed.
    let systemRolesObj = this.props.systemRoles;
    let defSysRole = find(systemRolesObj, (systemRole) => {
      return "standard" === systemRole.machine_name;
    });
    this.defaultSystemRoleId = defSysRole ? defSysRole.id : null;
  }

  handleChange = (e) => {
    this.setState({
      draftUser: {
        ...this.state.draftUser,
        [e.target.name]: e.target.value,
      },
    });
  };

  /**
   * If subjectUserId prop is provided, update existing (PUT)
   * otherwise treat the form as a new user form, and create new (POST)
   * @param {object} e (event object)
   */
  handleSubmit = (e) => {
    const { subjectUserId } = this.props;

    if (subjectUserId) {
      this.updateCurrentUser();
    }

    if (!subjectUserId) {
      this.createNewUser();
    }
  };

  updateCurrentUser = () => {
    const { currentUser, refreshSelf, subjectUserId } = this.props;
    const { draftUser } = this.state;

    this.setState({ submitting: true });
    requestUpdateUser(draftUser)
      .then((res) => {
        // UPDATE REQUEST SUCCEEDED
        if (!this.isCancelled) {
          this.setState({ submitting: false });
          hgToast("Changes saved");
          // If current user, update data in redux.
          if (currentUser.data.id === subjectUserId && !isNil(refreshSelf)) {
            refreshSelf();
          }
        }
      })
      .catch((error) => {
        // UPDATE REQUEST FAILED
        if (!this.isCancelled) {
          let response = error.request.response;
          let errorMessage = "Unable to save your changes. Please reload the page and try again.";
          if (response) {
            let errorMessageObject = JSON.parse(response).errors;
            errorMessage = errorMessageObject[Object.keys(errorMessageObject)[0]][0];
          }
          this.setState({ submitting: false });
          hgToast(errorMessage, error);
        }
      });
  };

  createNewUser = () => {
    const { history } = this.props;
    const { draftUser } = this.state;

    this.setState({ submitting: true });
    requestCreateUser(draftUser)
      .then((res) => {
        // SAVE REQUEST SUCCEEDED
        if (!this.isCancelled) {
          this.setState({ submitting: false });
          hgToast("New user created");
          let userId = get(res, "data.data.id", "");
          history.push(`/app/admin/users/${userId}`);
        }
      })
      .catch((error) => {
        // SAVE REQUEST FAILED
        if (!this.isCancelled) {
          let response = error.request.response;
          let errorMessage = "Unable to save your changes. Please reload the page and try again.";

          if (response) {
            let errorMessageObject = JSON.parse(response).errors;
            errorMessage = errorMessageObject[Object.keys(errorMessageObject)[0]][0];
          }

          this.setState({ submitting: false });
          hgToast(errorMessage, "error");
        }
      });
  };

  // Runs validation on blur, validators are defined by validoator array in
  // props of corresponding component.  This call is semi-redundant with
  // validation onChange, but is needed where the only validator is 'required'
  // EX: User types Name, then deletes it, and tabs to next field
  handleBlur = (e) => {
    this.refs[e.target.name].validate(e.target.value, true);
  };

  handleCancel = (e) => {
    this.loadUserToDraft("Loaded user data from server");
  };

  formatDate = (date) => {
    if (date) {
      return moment.utc(date).format("LLL");
    }

    return null;
  };

  selectSystemRoleValues = () => {
    const { systemRoles } = this.props;

    let systemRolesForSelect = values(systemRoles);

    return systemRolesForSelect.map((sr) => {
      return { value: sr.id, label: sr.name };
    });
  };

  handleSelectChange = (field, e) => {
    this.setState((state) => lodashSet(state, `draftUser.${field}`, e.value));
  };

  // Load user data from server to component state draftUser.
  loadUserToDraft = (successMessage = null) => {
    const { subjectUserId } = this.props;

    // If no subjectUserId, treat as a Create New User form
    if (!subjectUserId) {
      this.setState({
        loading: false,
      });
      return;
    }

    requestUser(subjectUserId)
      .then((res) => {
        // REQUEST SUCCEEDED
        if (!this.isCancelled) {
          this.setState({
            loading: false,
            draftUser: { ...res.data.data },
          });
          // If a success message was provided to method, put in toast.
          if (successMessage) {
            hgToast(successMessage);
          }
        }
      })
      .catch((error) => {
        hgToast("An error occurred loading user from server.", "error");
      });
  };

  componentDidMount() {
    ValidatorForm.addValidationRule("isPhone", isPhone);
    this.loadUserToDraft();
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { adminMode, classes, currentUser, theme } = this.props;
    const { draftUser, loading, submitting } = this.state;

    let stateCodesForSelect = [];
    each(stateCodes, (item) => {
      stateCodesForSelect.push({
        id: item[0].toLowerCase(),
        name: item[1],
      });
    });

    let disableSystemRole = false;
    if (!currentUser.isAdmin) {
      disableSystemRole = true;
    }

    let nameFirst = get(draftUser, "name_first", "");
    let nameLast = get(draftUser, "name_last", "");

    let showAdminStuff = adminMode && currentUser.isAdmin;

    // Show a spinner if we're still loading the data.
    if (loading) {
      return (
        <div style={{ textAlign: "center" }}>
          <br />
          <CircularProgress />
          <br />
        </div>
      );
    }

    return (
      <React.Fragment>
        <ValidatorForm ref="form" onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
            <Grid item xs={12} sm={6}>
              <HgTextValidator
                fullWidth
                label="First name"
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                name="name_first"
                ref="name_first"
                id="user_profile_form_name_first"
                value={nameFirst}
                validators={["required"]}
                errorMessages={[requiredMessage]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <HgTextValidator
                fullWidth
                label="Last name"
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                name="name_last"
                ref="name_last"
                id="user_profile_form_name_last"
                value={nameLast}
                validators={["required"]}
                errorMessages={[requiredMessage]}
              />
            </Grid>
          </Grid>

          <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
            <Grid item xs={12} sm={6}>
              <HgTextValidator
                fullWidth
                label="Email"
                type="email"
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                name="email"
                ref="email"
                id="user_profile_form_email"
                value={draftUser.email || ""}
                validators={["required", "isEmail"]}
                errorMessages={[requiredMessage, isEmailMessage]}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <HgTextValidator
                fullWidth
                type="tel"
                label="Telephone"
                onChange={this.handleChange}
                onBlur={this.handleBlur}
                name="phone"
                ref="phone"
                id="user_profile_form_phone"
                value={draftUser.phone || ""}
                validators={["isPhone"]}
                errorMessages={[isPhoneMessage]}
              />
            </Grid>
          </Grid>

          <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
            <Grid item xs={12} sm={6}>
              <HgSelect
                placeholder="System Role"
                aria-label="System Role"
                name="system_role_id"
                isDisabled={disableSystemRole}
                options={this.selectSystemRoleValues()}
                value={
                  this.selectSystemRoleValues().filter(
                    ({ value }) => value === draftUser.system_role_id
                  ) || ""
                }
                onChange={(e) => this.handleSelectChange("system_role_id", e)}
              />
            </Grid>
          </Grid>

          {/* section below is only visible for admins */}

          {showAdminStuff && (
            <section className={theme.metaSection}>
              <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="Last Login"
                    name="last_login"
                    id="user_profile_form_last_login"
                    value={this.formatDate(draftUser.last_login_at) || "--"}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="Email Verified Date"
                    name="email_verified_date"
                    id="user_profile_form_email_verified"
                    value={this.formatDate(draftUser.email_verified_at) || "--"}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="Created At"
                    name="created_at"
                    id="user_profile_form_created_at"
                    value={this.formatDate(draftUser.created_at) || "--"}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="Updated At"
                    name="updated_at"
                    id="user_profile_form_updated_at"
                    value={this.formatDate(draftUser.updated_at) || "--"}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={Number(styleVars.gridSpacing)} sx={sxFieldGroup}>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="CRM ID"
                    name="crm_id"
                    id="user_profile_form_crm_id"
                    value={draftUser.crm_id || "--"}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <HgTextField
                    fullWidth
                    label="AMM ID"
                    name="amm_id"
                    id="user_profile_form_amm_id"
                    value={draftUser.amm_id || "--"}
                    className={classes.root}
                    InputProps={{
                      disabled: true,
                      className: classes.readOnlyText,
                    }}
                  />
                </Grid>
              </Grid>
            </section>
          )}

          <Grid container spacing={Number(styleVars.gridSpacing)} justifyContent="flex-end">
            <Grid item xs={12} sm={3} md={2}>
              <Button fullWidth onClick={this.handleCancel} color="secondary" variant="contained">
                Cancel
              </Button>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <Button
                fullWidth
                type="submit"
                color="primary"
                variant="contained"
                disabled={submitting}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </ValidatorForm>
      </React.Fragment>
    );
  }
}

const sxFieldGroup = (theme) => ({
  marginBottom: theme.spacing(2),
});

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    systemRoles: state.app_meta.data.systemRoles,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({
  refreshSelf: () => {
    dispatch(refreshCurrentUserData());
  },
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(User));
