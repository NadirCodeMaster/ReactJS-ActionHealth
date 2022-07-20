import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { includes, isEmpty } from "lodash";
import { Tab, Tabs } from "@mui/material";
import { withStyles } from "@mui/styles";
import OverviewTab from "components/views/AccountOrganizationOverview";
import RelationshipTab from "components/views/AccountOrganizationRelationship";
import HgAlert from "components/ui/HgAlert";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import compareObjectIds from "utils/compareObjectIds";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import generateTitle from "utils/generateTitle";
import orgCityAndState from "utils/orgCityAndState";
import userBelongsToOrg from "utils/userBelongsToOrg";
import userIsPendingApprovalForOrg from "utils/userIsPendingApprovalForOrg";
import userCan from "utils/userCan";
import { withCookies } from "react-cookie";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import ApplyForRecognition2022 from "temp/ApplyForRecognition2022";

// Default tab value. (which is valid but shows as no tab in URL)
const tabDefault = "default";

// Whitelisted tab values. Include default.
const tabsValid = ["default", "info"];

/**
 * Organization page in context of current user.
 *
 * In most cases, this is the page where a user can view
 * and self-manage their relationship with an organization.
 * It's also accessible for organizations that the user has
 * indirect access to (such as a school they are not associated
 * with but belongs to a district they are associated with).
 *
 * Display is limited for indirect relationships.
 *
 */
class AccountOrganizationPage extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    // progressDataUpdated: Arbitrary changing value (typically
    //  a timestamp) to force re-rendering in components that might
    //  otherwise ignore to changes to progress data that's deeply
    //  nested in organization prop.
    progressDataUpdated: PropTypes.number,
    // repopulateOrganization: Optional function that should
    //  repopulate the organization prop with new data from
    //  the server.
    repopulateOrganization: PropTypes.func,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationTypes: PropTypes.object.isRequired,
    programs: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      userIsDirectlyAssociated: false,
      userIsPendingApproval: false,
      userCanApproveOrgUsers: false,
      userCanApproveOrgUsersChecked: false,
      userCanEditAssessment: false,
      userCanEditAssessmentChecked: false,
      userCanInviteOrgUsers: false,
      userCanInviteOrgUsersChecked: false,
      userCanViewActionPlan: false,
      userCanViewActionPlanChecked: false,
      userCanViewAssessment: false,
      userCanViewAssessmentChecked: false,
      userCanViewDocbuilders: false,
      userCanViewDocbuildersChecked: false,
      userCanViewOrgUsers: false,
      userCanViewOrgUsersChecked: false,
    };
  }

  /**
   * Perform org access checks required by this component.
   *
   * @param {Object} org Organization object to check for.
   */
  checkAccess() {
    const { currentUser, organization } = this.props;

    let userCanApproveOrgUsers = userCan(currentUser, organization, "approve_organization_user");
    let userCanEditAssessment = userCan(currentUser, organization, "edit_assessment");
    let userCanInviteOrgUsers = userCan(currentUser, organization, "invite_team_member");
    let userCanViewActionPlan = userCan(currentUser, organization, "view_action_plan");
    let userCanViewAssessment = userCan(currentUser, organization, "view_assessment");
    let userCanViewDocbuilders = userCan(currentUser, organization, "view_docbuilders");
    let userCanViewOrgUsers = userCan(currentUser, organization, "view_team");

    let userIsDirectlyAssociated = userBelongsToOrg(currentUser.data.id, organization, true);

    if (!this.isCancelled) {
      this.setState({
        userIsDirectlyAssociated,
        userIsPendingApproval: userIsPendingApprovalForOrg(currentUser.data.id, organization),
        userCanApproveOrgUsers,
        userCanApproveOrgUsersChecked: true,
        userCanEditAssessment,
        userCanEditAssessmentChecked: false,
        userCanInviteOrgUsers,
        userCanInviteOrgUsersChecked: true,
        userCanViewActionPlan,
        userCanViewActionPlanChecked: true,
        userCanViewAssessment,
        userCanViewAssessmentChecked: true,
        userCanViewDocbuilders,
        userCanViewDocbuildersChecked: true,
        userCanViewOrgUsers,
        userCanViewOrgUsersChecked: true,
      });
    }
  }

  componentDidMount() {
    const { organization } = this.props;

    this.checkAccess();
    generateTitle(organization.name);
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, organization, progressDataUpdated, repopulateOrganization } = this.props;
    const {
      currentUser: prevCurrentUser,
      organization: prevOrganization,
      progressDataUpdated: prevProgressDataUpdated,
    } = prevProps;

    // If we're notified that progress data has been updated,
    // repopulate the organization so we can pull in the
    // other details of the change.
    if (progressDataUpdated !== prevProgressDataUpdated && repopulateOrganization) {
      repopulateOrganization();
    }

    if (
      !compareObjectIds(organization, prevOrganization) ||
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser)
    ) {
      this.checkAccess();
      generateTitle(organization.name);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  handleChangeTab = (event, value) => {
    const { history, organization } = this.props;

    let checkedVal = "";
    if (includes(tabsValid, value)) {
      // Only honor whitelisted tabs.
      checkedVal = value;
    }

    // Define the new path. The default tab value is represented
    // by no corresponding tab segment.
    let newPath = `/app/account/organizations/${organization.id}/overview`;
    if (checkedVal !== tabDefault) {
      newPath = `${newPath}/${checkedVal}`;
    }

    history.push(newPath);
  };

  awaitingApprovalMessage = (orgType) => {
    return (
      <React.Fragment>
        Your request to join must be approved by an existing {orgType.name.toLowerCase()} team
        member or our{" "}
        <a
          href={`https://www.healthiergeneration.org/take-action/get-help`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Member Engagement & Support Team
        </a>
        . We’ll aim to review your request within one business day
      </React.Fragment>
    );
  };

  render() {
    const { activeTab, organizationTypes, classes, organization, progressDataUpdated } = this.props;
    const {
      userCanApproveOrgUsers,
      userCanEditAssessment,
      userCanInviteOrgUsers,
      userCanViewOrgUsers,
      userCanViewActionPlan,
      userCanViewAssessment,
      userCanViewDocbuilders,
      userIsDirectlyAssociated,
      userIsPendingApproval,
    } = this.state;

    if (!organization) {
      return <CircularProgressGlobal />;
    }

    let orgType = organizationTypes[organization.organization_type_id];

    let orgCityAndStateStr = orgCityAndState(organization, "");

    let tabsVariant = "standard"; // @TODO Use fullWidth for mobile

    // Whether to include "info" tab. It's only applicable for users
    // directly associated with the org.
    let includeInfoTab = false;
    if (userIsDirectlyAssociated) {
      includeInfoTab = true;
    }

    // Allow path without a "tab" segment after overview/ to be treated
    // as the default tab selection.
    let _activeTab = activeTab ? activeTab : "default";

    if (!includeInfoTab && "info" === activeTab) {
      _activeTab = "default";
    }

    return (
      <React.Fragment>
        {/*
        Breadcrumbs intentionally omitted on this page  per ticket #3792
          (AK, July 2021)
        */}
        <h1>{organization.name}</h1>
        <p>
          <small>
            {orgType.name}
            {!isEmpty(orgCityAndStateStr) && (
              <React.Fragment> in {orgCityAndStateStr}</React.Fragment>
            )}
          </small>
        </p>

        <div className={classes.tabsWrapper}>
          <Tabs
            value={_activeTab}
            onChange={this.handleChangeTab}
            className={classes.tabs}
            indicatorColor="primary"
            textColor="primary"
            variant={tabsVariant}
          >
            <Tab label="Overview" value="default" className={classes.tab} />
            {includeInfoTab && <Tab label="Info" value="info" className={classes.tab} />}
          </Tabs>
        </div>

        {userIsPendingApproval && (
          <div className={classes.alertContainer}>
            <HgAlert
              severity="info"
              includeIcon={true}
              message={this.awaitingApprovalMessage(orgType)}
            />
          </div>
        )}

        {/* TEMP MESSAGE RE: RECOGNITION DOCBUILDER */}
        <ApplyForRecognition2022
          activeOrganizationId={organization.id}
          activeOrganizationIsSchool={"school" === orgType.machine_name}
          userCanViewDocbuilders={userCanViewDocbuilders}
        />

        <div className={classes.tabContent}>
          {_activeTab === "default" && (
            <OverviewTab
              progressDataUpdated={progressDataUpdated}
              organization={organization}
              orgType={orgType}
              userCanEditAssessment={userCanEditAssessment}
              userCanViewAssessment={userCanViewAssessment}
              userCanViewActionPlan={userCanViewActionPlan}
              userCanApproveOrgUsers={userCanApproveOrgUsers}
              userCanInviteOrgUsers={userCanInviteOrgUsers}
              userCanViewOrgUsers={userCanViewOrgUsers}
            />
          )}
          {_activeTab === "info" && includeInfoTab && (
            <RelationshipTab
              organization={organization}
              userIsDirectlyAssociated={userIsDirectlyAssociated}
            />
          )}
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  alertContainer: {
    marginBottom: theme.spacing(2),
  },
  tabsWrapper: {
    marginBottom: theme.spacing(3),
  },
  tabContent: {},
});

const mapStateToProps = (state) => {
  return {
    organizationTypes: state.app_meta.data.organizationTypes,
    programs: state.programs,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  withCookies,
  withStyles(styles, { withTheme: true }),
  connect(mapStateToProps, mapDispatchToProps)
)(AccountOrganizationPage);
