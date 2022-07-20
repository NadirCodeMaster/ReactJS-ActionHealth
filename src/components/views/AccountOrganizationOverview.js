import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import AssessmentsList from "components/views/AssessmentsList";
import AccountOrganizationActionPlanBlock from "components/views/AccountOrganizationActionPlanBlock";
import AccountOrganizationResourcesBlock from "components/views/AccountOrganizationResourcesBlock";
import AccountOrganizationFeaturedResource from "components/views/AccountOrganizationFeaturedResource";
import AccountOrganizationTeamMembers from "components/views/AccountOrganizationTeamMembers";
import OrganizationChildren from "components/views/OrganizationChildren";
import PendingUsers from "components/views/PendingOrganizationUsersForOrganization";
import HgSkeleton from "components/ui/HgSkeleton";
import filterContentMachineNames from "utils/filterContentMachineNames";
import userIsPendingApprovalForOrg from "utils/userIsPendingApprovalForOrg";
import userCan from "utils/userCan";
import { get, includes, isEmpty, isNumber } from "lodash";
import { fetchContents } from "store/actions";
import {
  requestOrganizationPlan,
  requestOrganizationPlanItems,
  requestOrganizationUsers,
  requestUserFunctionResources,
} from "api/requests";
import styleVars from "style/_vars.scss";

const componentContentMachineNames = [
  "organization_overview_action_plan_help",
  "organization_overview_invite_help",
  "organization_overview_tip_1_body",
  "organization_overview_tip_1_link",
  "organization_overview_tip_2_body",
  "organization_overview_tip_2_link",
];

/**
 * User/organization overview tab content.
 *
 * @extends Component
 */
class AccountOrganizationOverview extends Component {
  static propTypes = {
    // From caller.
    // ------------
    userCanApproveOrgUsers: PropTypes.bool.isRequired,
    userCanInviteOrgUsers: PropTypes.bool.isRequired,
    userCanViewOrgUsers: PropTypes.bool.isRequired,
    userCanViewActionPlan: PropTypes.bool.isRequired,
    userCanViewAssessment: PropTypes.bool.isRequired,
    organization: PropTypes.object.isRequired,
    orgType: PropTypes.object.isRequired,

    // progressDataUpdated: Arbitrary changing value (typically a timestamp)
    //  to force re-rendering in components that might otherwise ignore to
    //  changes to progress data that's deeply nested in organization prop.
    progressDataUpdated: PropTypes.number,

    // From HOCs.
    // ----------
    theme: PropTypes.object.isRequired, // via withStyles
  };

  constructor(props) {
    super(props);

    // Max number of users to show in "pending users" box.
    this.pendingUsersLimit = 5;

    // Org types to show the child orgs box for.
    this.showChildOrgsBoxFor = ["district", "ost", "cmo", "esd"];

    this.isCancelled = false;

    this.state = {
      updatedByData: {},
      updatedByDataLoading: false,
      pendingUsers: null,
      qtyTeamMembers: 0,
      qtyTeamMembersLoading: false,
      userIsPendingApproval: userIsPendingApprovalForOrg(
        this.props.currentUser.data.id,
        this.props.organization
      ),
      resources: [],
      resourcesLoading: false,
    };
    this.populatePendingUsers = this.populatePendingUsers.bind(this);
  }

  componentDidMount() {
    const { currentUser, organization } = this.props;
    this.addContentsToStore();

    if (
      userCan(currentUser, organization, "view_action_plan") &&
      userCan(currentUser, organization, "view_team")
    ) {
      this.populateOrgPlanData();
      this.populateQtyPlanItems();
      this.populateQtyTeamMembers();
      this.populateResources();
    }
  }

  componentDidUpdate(prevProps) {
    const { organization: prevOrganization } = prevProps;
    const { currentUser, organization } = this.props;

    if (prevOrganization !== organization) {
      // On org change, recheck if user pending approval for the organization
      let userIsPendingApproval = userIsPendingApprovalForOrg(currentUser.data.id, organization);

      if (
        userCan(currentUser, organization, "view_action_plan") &&
        userCan(currentUser, organization, "view_team")
      ) {
        this.populateOrgPlanData();
        this.populateQtyPlanItems();
        this.populateQtyTeamMembers();
        this.populateResources();
      }

      this.setState({
        userIsPendingApproval,
      });
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  // Add contents for this route to store unless
  // they have already been loaded into redux
  addContentsToStore = () => {
    const { addToContents, contents } = this.props;

    let paramMachineNames = filterContentMachineNames(contents, componentContentMachineNames);

    // Fetch content only if its not already in redux
    if (!isEmpty(paramMachineNames)) {
      addToContents(paramMachineNames);
    }
  };

  /**
   * Populate latest three resources for use in resource block
   */
  populateResources() {
    const { organization } = this.props;

    // Ensure the organization prop has a populated requester_pivot w/user func property
    // before we attempt to request resources based on it.
    let userFuncId = get(organization, "requester_pivot.user_function_id", null);
    if (null === userFuncId || !isNumber(userFuncId)) {
      return;
    }

    this.setState({
      resourcesLoading: true,
    });

    requestUserFunctionResources(userFuncId, {
      exactly: 3,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            resourcesLoading: false,
            resources: res.data.data,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({ resourcesLoading: false, resources: [] });
          console.error("Unable to retrieve resources.");
        }
      });
  }

  /**
   * Populate qtyPlanItems state var based on current organiztion prop.
   */
  populateQtyPlanItems() {
    const { organization } = this.props;

    if (organization && organization.id) {
      this.setState({
        qtyPlanItemsLoading: true,
      });
      requestOrganizationPlanItems(organization.id)
        .then((res) => {
          let newQtyPlanItems = res.data.data ? res.data.data.length : 0;

          if (!this.isCancelled) {
            this.setState({
              qtyPlanItemsLoading: false,
              qtyPlanItems: newQtyPlanItems,
            });
          }
        })
        .catch((error) => {
          if (!this.isCancelled) {
            this.setState({ qtyPlanItemsLoading: false, qtyPlanItems: 0 });
            console.warn(
              "Unable to retrieve qtyPlanItems. This may be the expected result depending on user permissions relative to the organization."
            );
          }
        });
    }
  }

  /**
   * Populate updatedByData state based on current organiztion.id prop.
   */
  populateOrgPlanData() {
    const { organization } = this.props;

    if (organization && organization.id && !this.isCancelled) {
      this.setState({
        updatedByDataLoading: true,
      });
      requestOrganizationPlan(organization.id)
        .then((res) => {
          let updatedByData = get(res, "data.data", {});

          if (!this.isCancelled) {
            this.setState({
              updatedByDataLoading: false,
              updatedByData,
            });
          }
        })
        .catch((error) => {
          if (!this.isCancelled) {
            this.setState({ updatedByDataLoading: false, updatedByData: 0 });
            console.error(
              "Unable to retrieve updatedByData. This may be the expected result depending on user permissions relative to the organization."
            );
          }
        });
    }
  }

  /**
   * Populate qtyTeamMembers state var based on current organiztion prop.
   */
  populateQtyTeamMembers() {
    const { organization } = this.props;

    if (organization && organization.id && !this.isCancelled) {
      this.setState({
        qtyTeamMembersLoading: true,
      });
      requestOrganizationUsers(organization.id)
        .then((res) => {
          let newQtyTeamMembers = res.data.data ? res.data.data.length : 0;

          if (!this.isCancelled) {
            this.setState({
              qtyTeamMembersLoading: false,
              qtyTeamMembers: newQtyTeamMembers,
            });
          }
        })
        .catch((error) => {
          if (!this.isCancelled) {
            this.setState({ qtyTeamMembersLoading: false, qtyTeamMembers: 0 });
            console.error(
              "Unable to retrieve qtyTeamMembers. This may be the expected result depending on user permissions relative to the organization."
            );
          }
        });
    }
  }

  /**
   * Callback for pending users component to provide us with the result set.
   *
   * @param {Array} arrayOfUsers
   */
  populatePendingUsers(arrayOfUsers) {
    if (!this.isCancelled) {
      this.setState({ pendingUsers: arrayOfUsers });
    }
  }

  /**
   * Determines if we should show the organization status summary
   * (the box that has action plan and team member counts with links)
   * @returns {boolean}
   */
  showOrganizationStatusSummary = () => {
    const { userCanViewOrgUsers } = this.props;

    return userCanViewOrgUsers;
  };

  /**
   * Determines if we should show the organization overview table
   * @returns {boolean}
   */
  shouldDisplayOrgSetsTable = () => {
    const { userCanViewAssessment } = this.props;
    const { userIsPendingApproval } = this.state;

    return userIsPendingApproval || userCanViewAssessment;
  };

  render() {
    const {
      classes,
      organization,
      orgType,
      userCanApproveOrgUsers,
      userCanEditAssessment,
      userCanInviteOrgUsers,
      userCanViewAssessment,
      userCanViewOrgUsers,
    } = this.props;
    const {
      updatedByData,
      updatedByDataLoading,
      pendingUsers,
      resources,
      resourcesLoading,
      qtyPlanItems,
      qtyPlanItemsLoading,
      qtyTeamMembers,
      qtyTeamMembersLoading,
    } = this.state;

    let showPendingUsersBox = orgType.requires_access_approval && userCanApproveOrgUsers;

    let showChildOrgsBox = includes(this.showChildOrgsBoxFor, orgType.machine_name);

    return (
      <React.Fragment>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          {/* TOP ROW */}

          {/* Only show status box if they can actually see stuff inside. */}
          {this.showOrganizationStatusSummary() && (
            <Grid item xs={12} md={8} lg={8}>
              <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
                {qtyTeamMembersLoading || qtyPlanItemsLoading || updatedByDataLoading ? (
                  <div className={classes.skeletonContainer}>
                    <div className={classes.skeletonItem}>
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                    </div>
                    <div className={classes.skeletonItem}>
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                      <HgSkeleton variant="text" />
                    </div>
                  </div>
                ) : (
                  <AccountOrganizationActionPlanBlock
                    organization={organization}
                    qtyTeamMembers={qtyTeamMembers}
                    qtyPlanItems={qtyPlanItems}
                    updatedByData={updatedByData}
                  />
                )}
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={4} lg={4}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <AccountOrganizationFeaturedResource
                organization={organization}
                organizationType={orgType}
              />
            </Paper>
          </Grid>

          {this.shouldDisplayOrgSetsTable() && (
            <Grid item xs={12}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <h2>Assessments</h2>
                <p>
                  These are the assessments available for {organization.name}.{" "}
                  {userCanEditAssessment && (
                    <Link to={`/app/account/organizations/${organization.id}/sets`}>
                      Learn more here.
                    </Link>
                  )}
                </p>
                <AssessmentsList
                  orgId={organization.id}
                  assessments={organization.available_sets}
                  userCanViewSets={userCanViewAssessment}
                />
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={8} lg={8}>
            <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
              <AccountOrganizationResourcesBlock
                resources={resources}
                resourcesLoading={resourcesLoading}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={4}>
            <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
              <AccountOrganizationTeamMembers
                organization={organization}
                qtyTeamMembers={qtyTeamMembers}
                userCanInviteOrgUsers={userCanInviteOrgUsers}
                userCanViewOrgUsers={userCanViewOrgUsers}
              />
            </Paper>
          </Grid>

          {showPendingUsersBox && (
            <Grid item xs={12} className={classes.pendingUsersWrapper}>
              <br />
              <Paper>
                <h2 className={classes.pendingUsersHeader}>
                  Users awaiting approval to join {organization.name}
                </h2>

                <PendingUsers
                  limit={this.pendingUsersLimit}
                  organizationId={organization.id}
                  callbackWithResults={this.populatePendingUsers}
                />
                {pendingUsers && pendingUsers.length === this.pendingUsersLimit && (
                  <div
                    style={{
                      padding: "1em",
                      textAlign: "center",
                    }}
                  >
                    <Link to={`/app/account/organizations/${organization.id}/pending`}>
                      View all »
                    </Link>
                  </div>
                )}
              </Paper>
            </Grid>
          )}

          {showChildOrgsBox && (
            <Grid item xs={12}>
              <OrganizationChildren
                adminMode={false}
                parent={organization}
                title={`Organizations in ${organization.name}`}
                titleHeaderLevel="h2"
                perPage={5}
              />
            </Grid>
          )}
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  pendingUsersHeader: {
    padding: styleVars.paperPadding,
    paddingBottom: 0,
  },
  pendingUsersWrapper: {
    borderTop: `1px solid ${styleVars.colorLightGray}`,
    marginTop: theme.spacing(4),
  },
  tabBarWrapper: {},
  skeletonContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  skeletonItem: {
    width: "48%",
  },
});

const mapStateToProps = (state) => {
  return {
    contents: state.contents,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({
  addToContents: (machineNames) => {
    dispatch(
      fetchContents({
        machine_name: machineNames,
      })
    );
  },
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(AccountOrganizationOverview));
