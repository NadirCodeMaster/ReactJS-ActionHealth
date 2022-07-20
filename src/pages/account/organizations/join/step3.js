import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PageNotFound from "components/views/PageNotFound";
import PropTypes from "prop-types";
import { get, sortBy } from "lodash";
import { Button, CircularProgress, Dialog, DialogContent, DialogTitle, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import {
  requestCreateUserActivity,
  requestLinkOrganizationUser,
  requestOrganization,
} from "api/requests";
import generateTitle from "utils/generateTitle";
import orgTypeForMachineName from "utils/orgTypeForMachineName";
import filterUserFunctionsByUserFunctionCategory from "utils/filterUserFunctionsByUserFunctionCategory";
import filterUserFunctionCategoriesByOrganizationType from "utils/filterUserFunctionCategoriesByOrganizationType";
import errorSuffix from "utils/errorSuffix";
import { refreshCurrentUserData } from "store/actions";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

/**
 * Step 3 of joining an org: UI for user function cat/user function selection.
 */
class Step3 extends Component {
  static propTypes = {
    orgTypeMachineName: PropTypes.string.isRequired,
    organizationId: PropTypes.number.isRequired,
    appMeta: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    refreshCurrentUserData: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    let nameFirst = get(props, "currentUser.data.name_first", "");
    let title = `Welcome, ${nameFirst}!`;

    this.state = {
      confDialogIsOpen: false,
      organization: null,
      organizationLoading: false,
      requestedOrgType: null,
      orgTypeIsInvalid: null, // if type in prop doesnt match org @TODO
      title: title,
      userFunctionCategories: [],
      userFunctions: [],
      selectedUserFunctionCategoryId: null,
      selectedUserFunctionId: null,
      submitting: false,
    };
  }

  componentDidMount() {
    const { organizationId, orgTypeMachineName } = this.props;
    const { title } = this.state;
    this.initForOrgType(orgTypeMachineName);
    this.populateOrganization(organizationId);
    generateTitle(title);
  }

  componentDidUpdate(prevProps, prevState) {
    const { organizationId, orgTypeMachineName } = this.props;
    const { organizationId: prevOrganizationId, orgTypeMachineName: prevOrgTypeMachineName } =
      prevProps;
    const { title, selectedUserFunctionCategoryId, selectedUserFunctionId } = this.state;
    const {
      title: prevTitle,
      selectedUserFunctionCategoryId: prevSelectedUserFunctionCategoryId,
      selectedUserFunctionId: prevSelectedUserFunctionId,
    } = prevState;

    // Handle changes to UFC.
    if (selectedUserFunctionCategoryId !== prevSelectedUserFunctionCategoryId) {
      this.populateUserFunctions(selectedUserFunctionCategoryId);
    }

    // Handle selection of user function.
    if (selectedUserFunctionId && selectedUserFunctionId !== prevSelectedUserFunctionId) {
      this.sendToApi();
    }

    // Handle change to org type prop.
    if (orgTypeMachineName !== prevOrgTypeMachineName) {
      this.initForOrgType(orgTypeMachineName);
    }

    // Handle change to org prop.
    if (organizationId !== prevOrganizationId) {
      this.populateOrganization(organizationId);
    }

    // Handle title updates.
    if (!title !== prevTitle) {
      generateTitle(title);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Init for org type.
   *
   * @param {String} orgTypeMachineName
   */
  initForOrgType(orgTypeMachineName) {
    const { appMeta } = this.props;

    // Establish the org type provided by caller. It's typically provided
    // in the URL as a machine name and we'll validate the requested org
    // against to avoid UI mismatches. (org type is intended to allow
    // type-specific UI refinements and to allow us to prep the UF/Cs
    // before we have the actual org object ready)
    let requestedOrgType = orgTypeForMachineName(
      orgTypeMachineName,
      appMeta.data.organizationTypes
    );

    // Populate the UFCs.
    let userFunctionCategories = filterUserFunctionCategoriesByOrganizationType(
      appMeta.data.userFunctionCategories,
      requestedOrgType.id
    );

    // Sort the UFCs.
    userFunctionCategories = sortBy(userFunctionCategories, ["weight", "name"]);

    // Add that stuff to state.
    this.setState({
      requestedOrgType: requestedOrgType,
      userFunctionCategories: userFunctionCategories,
    });
  }

  /**
   * Populate the UFs based on a UFC.
   * @param {Number} userFunctionCategoryId
   */
  populateUserFunctions(userFunctionCategoryId) {
    const { appMeta } = this.props;
    let newUfs = [];
    if (userFunctionCategoryId) {
      newUfs = filterUserFunctionsByUserFunctionCategory(
        appMeta.data.userFunctions,
        userFunctionCategoryId
      );
    }

    // Sort em.
    newUfs = sortBy(newUfs, ["weight", "name"]);

    this.setState({
      userFunctions: newUfs,
      selectedUserFunctionId: null,
    });
  }

  /**
   * Populate the organization object in state.
   *
   * @param {Number} orgId
   */
  populateOrganization(orgId) {
    this.setState({
      organizationLoading: true,
    });

    requestOrganization(orgId)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: res.data.data,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: null,
          });
        }
        hgToast(
          "An error occurred while retrieving the organization record. " + errorSuffix(error),
          "error"
        );
      });
  }

  /**
   * Sends join request to server using info in component state & props.
   */
  sendToApi() {
    const { appMeta, currentUser, organizationId, refreshCurrentUserData } = this.props;
    const { organization, requestedOrgType, selectedUserFunctionId } = this.state;

    this.setState({ submitting: true });

    // Default organization role for the specified user function.
    let orgRoleId = appMeta.data.userFunctions[selectedUserFunctionId].default_organization_role_id;

    // Proceed with associating user.
    requestLinkOrganizationUser(
      currentUser.data.id,
      organizationId,
      orgRoleId,
      selectedUserFunctionId
    ).then((linkOrgUserRes) => {
      if (201 === linkOrgUserRes.status && !this.isCancelled) {
        // Log it.
        requestCreateUserActivity(
          `organization_registration_completed_${requestedOrgType.machine_name}`
        );

        // Reload info about current user to get
        // updated org counts.
        refreshCurrentUserData();

        // Open confirmation dialog.
        this.setState({
          confDialogIsOpen: true,
          submitting: false,
        });
      } else {
        // Failed
        if (!this.isCancelled) {
          this.setState({ submitting: false });
        }
        hgToast(
          `An error occurred while associating ${currentUser.data.name_first} with ${organization.name}`,
          "error"
        );
      }
    });
  }

  /**
   * Handle closing of confirmation dialog.
   */
  onCloseConfDialog = () => {
    // Nothing for now
  };

  /**
   * Handle change to user function category field.
   * @param {Number} ufcId UserFunctionCategory ID
   */
  handleUfcSelectionChange = (ufcId) => {
    this.setState({ selectedUserFunctionCategoryId: ufcId });
  };

  /**
   * Handle change to user function field.
   * @param {Number} ufId UserFunction ID
   */
  handleUfSelectionChange = (ufId) => {
    // We'll capture this in didUpdate and send to server.
    this.setState({ selectedUserFunctionId: ufId });
  };

  /**
   * Clear the selected UserFunctionCategory ID stored in state.
   */
  unsetSelectedUserFunctionCategoryId = () => {
    this.setState({
      selectedUserFunctionCategoryId: null,
      selectedUserFunctionId: null,
    });
  };

  /**
   * Determines if current user can auto join org or needs approval
   * @returns {boolean}
   */
  requiresAccessApproval = () => {
    const { appMeta, currentUser } = this.props;
    const { requestedOrgType } = this.state;

    if (!currentUser || !requestedOrgType) {
      return false;
    }

    let requiresAccessApproval = get(
      appMeta.data,
      `organizationTypes.${requestedOrgType.id}.requires_access_approval`,
      false
    );

    return !currentUser.isAdmin && requiresAccessApproval;
  };

  render() {
    const { classes, width } = this.props;
    const {
      confDialogIsOpen,
      organization,
      organizationLoading,
      requestedOrgType,
      selectedUserFunctionCategoryId,
      selectedUserFunctionId,
      userFunctionCategories,
      userFunctions,
      submitting,
      title,
    } = this.state;

    let pageIsReady = !organizationLoading && organization && requestedOrgType;

    // Make sure the org and requested org type align.
    if (pageIsReady && requestedOrgType.id !== organization.organization_type_id) {
      return <PageNotFound />;
    }
    let showUfcSelector = pageIsReady && !Boolean(selectedUserFunctionCategoryId);
    let showUfSelector = pageIsReady && Boolean(selectedUserFunctionCategoryId);

    let pathToOrgSelection = "";
    let pathToOrgDashboard = "";

    if (pageIsReady) {
      // Set up pathToOrgSelection.
      let _o = requestedOrgType.machine_name;
      let _s = organization.state_id;
      pathToOrgSelection = `/app/account/organizations/join/${_o}/find/${_s}`;
      if (organization.parent_id) {
        pathToOrgSelection += "/" + organization.parent_id;
      }
      // Set up pathToOrgDashboard.
      pathToOrgDashboard = `/app/account/organizations/${organization.id}`;
    }

    return (
      <React.Fragment>
        <Paper style={{ padding: styleVars.paperPadding }}>
          <div className={classes.textWrapper}>
            <h1>{title}</h1>
            {!pageIsReady ? (
              <CircularProgress size="1em" />
            ) : (
              <React.Fragment>
                {showUfcSelector && <div>What is your role at {organization.name}?</div>}
                {showUfSelector && <div>Which of these best describes your role?</div>}
              </React.Fragment>
            )}
          </div>

          {showUfcSelector && (
            <React.Fragment>
              {userFunctionCategories.map((ufc) => (
                <div key={ufc.id} className={classes.optionButtonWrapper}>
                  <Button
                    fullWidth
                    disabled={submitting}
                    color="primary"
                    className={classes.optionButton}
                    onClick={() => {
                      this.handleUfcSelectionChange(ufc.id);
                    }}
                    variant={selectedUserFunctionCategoryId === ufc.id ? "contained" : "outlined"}
                  >
                    {ufc.name}
                  </Button>
                </div>
              ))}
              <div className={classes.prevNextButtonWrapper}>
                <Button
                  fullWidth
                  disabled={submitting}
                  color="primary"
                  className={classes.prevNextButton}
                  component={Link}
                  variant="contained"
                  to={pathToOrgSelection}
                >
                  <span className={classes.prevNextButtonText}>Change {requestedOrgType.name}</span>
                </Button>
              </div>
            </React.Fragment>
          )}

          {showUfSelector && (
            <React.Fragment>
              {userFunctions.map((uf) => (
                <div key={uf.id} className={classes.optionButtonWrapper}>
                  <Button
                    disabled={submitting}
                    fullWidth
                    color="primary"
                    className={classes.optionButton}
                    onClick={() => {
                      this.handleUfSelectionChange(uf.id);
                    }}
                    variant={selectedUserFunctionId === uf.id ? "contained" : "outlined"}
                  >
                    {uf.name}
                  </Button>
                </div>
              ))}
              <div className={classes.prevNextButtonWrapper}>
                <Button
                  disabled={submitting}
                  fullWidth
                  color="primary"
                  className={classes.prevNextButton}
                  variant="contained"
                  onClick={this.unsetSelectedUserFunctionCategoryId}
                >
                  Go back
                </Button>
              </div>
            </React.Fragment>
          )}
        </Paper>

        {/* @TODO Enable fullScreen at xs width */}
        {organization && (
          <Dialog
            open={confDialogIsOpen}
            onClose={this.onCloseConfDialog}
            aria-labelledby="conf-dialog-title"
            fullScreen={width === "xs"}
            fullWidth={true}
            maxWidth="sm"
          >
            <DialogTitle id="conf-dialog-title">
              <div className={classes.confIconWrapper}>
                <CheckCircleIcon className={classes.confIcon} />
              </div>
              {this.requiresAccessApproval() && (
                <React.Fragment>
                  <p className={classes.confText}>
                    We've received your request to join {organization.name}!
                  </p>
                  <div className={classes.confSubText}>
                    Your request to join must be approved by an existing{" "}
                    {requestedOrgType.name.toLowerCase()} team member or our{" "}
                    <a
                      href={`https://www.healthiergeneration.org/take-action/get-help`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Member Engagement & Support Team
                    </a>
                    . We’ll aim to review your request within one business day
                  </div>
                </React.Fragment>
              )}
              {!this.requiresAccessApproval() && (
                <p className={classes.confText}>You've joined {organization.name}!</p>
              )}
            </DialogTitle>
            <DialogContent>
              <Button
                fullWidth
                component={Link}
                to={pathToOrgDashboard}
                disabled={submitting}
                color="primary"
                className={classes.confButton}
                variant="contained"
              >
                Go to the {requestedOrgType.name}'s dashboard
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  confIconWrapper: {
    marginBottom: theme.spacing(),
    textAlign: "center",
  },
  confIcon: {
    color: theme.palette.success.main,
    fontSize: "4.5em",
  },
  confText: {
    fontSize: "1.25em",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  confSubText: {
    fontSize: styleVars.txtFontSizeXs,
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  confButton: {
    marginBottom: theme.spacing(),
  },
  textWrapper: {
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  optionButtonWrapper: {
    marginBottom: theme.spacing(),
    maxWidth: "310px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  optionButton: {
    marginBottom: theme.spacing(),
    width: "100%",
  },
  prevNextButtonWrapper: {
    marginBottom: theme.spacing(),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "310px",
  },
  prevNextButton: {
    marginBottom: theme.spacing(),
    width: "100%",
  },
  prevNextButtonText: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
});

const mapStateToProps = (state) => {
  return {
    appMeta: state.app_meta,
    currentUser: state.auth.currentUser,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, { refreshCurrentUserData }),
  withStyles(styles, { withTheme: true }),
  withWidth()
)(Step3);
