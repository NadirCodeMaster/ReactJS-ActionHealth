import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Redirect, Switch } from "react-router-dom";
import { isNil } from "lodash";
import DocbuilderController from "./builder/index.js";
import PlanRouting from "./plan/index.js";
import PropTypes from "prop-types";
import PrivateRoute from "components/ui/PrivateRoute";
import OverviewPage from "./overview/index.js";
import ReportsPage from "./reports/index.js";
import SetsPage from "./sets/index.js";
import TeamPage from "./team/index.js";
import PendingPage from "./pending/index.js";
import { requestOrganization } from "api/requests";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import applyPusherUserOrgSetProgressData from "utils/applyPusherUserOrgSetProgressData";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import getPusherInstance from "api/getPusherInstance";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Root of all account organization detail displays.
 *
 * Provides routing for /app/account/organizations/{id}(/*)
 */
class OrgDetailRouting extends React.Component {
  static propTypes = {
    organizationId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.state = {
      organizationLoading: false,
      organization: null,
      // progressDataUpdated: Should be set to a timestamp (i.e.,
      //  Date.now())whenever websocket updates to progress data are
      //  received and applied to the organization object. This
      //  provides a mechanism for downstream components to be
      //  forced to re-render (by receiving this value as a prop)
      //  when the progress information in the organization object
      //  changes. It appears some components are not otherwise
      //  able to recognize the need to re-render, presumably because
      //  the changed value(s) are deeploy nested in the organization
      //  object.
      progressDataUpdated: null,
    };

    // Define a method child components can call to
    // repopulate the organization if needed.
    this.repopulateOrganization = this.populateOrganization.bind(this);
  }

  componentDidMount() {
    const { currentUser } = this.props;
    this.populateOrganization();
    this.bindPusherEvents(currentUser.data.id);
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, organizationId } = this.props;
    const { currentUser: prevCurrentUser, organizationId: prevOrganizationId } = prevProps;

    if (organizationId !== prevOrganizationId) {
      this.populateOrganization();
    }

    // Changes that require updating pusher bindings.
    if (!compareCurrentUserObjectIds(currentUser, prevCurrentUser)) {
      // Unbind for prev user.
      this.unbindPusherEvents(prevCurrentUser.data.id);

      // Bind for current user.
      this.bindPusherEvents(currentUser.data.id);
    }
  }

  componentWillUnmount() {
    const { currentUser } = this.props;
    this.isCancelled = true;
    this.unbindPusherEvents(currentUser.data.id);
  }

  /**
   * Retrieves org object, puts in component state.
   *
   * Org record comes from server to ensure the latest data is included.
   *
   * @param {Number} organizationId
   */
  populateOrganization = () => {
    const { organizationId } = this.props;

    this.setState({ organizationLoading: true });

    requestOrganization(organizationId)
      .then((res) => {
        let org = null;
        if (!isNil(res.data.data)) {
          org = res.data.data;
        }
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: org,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: null,
          });
          console.error("An error occurred retrieving the organization.");
        }
      });
  };

  /**
   * Bind to Pusher events that impact this component.
   * @see this.unbindPusherEvents()
   *
   * @param {Number} userId
   *  Note: This can only be the current user Id (users
   *  cannot subscribe to other user channels).
   */
  bindPusherEvents = (userId) => {
    let pusherInstance = getPusherInstance();

    if (!isNil(pusherInstance)) {
      let userChannelName = `private-users.${userId}.organizations`;

      // We may already be subscribed to the required channel,
      // so we'll try to retrieve it.
      let userChannel = pusherInstance.channel(userChannelName);

      // If not already subscribed, subscribe.
      if (!userChannel) {
        try {
          userChannel = pusherInstance.subscribe(userChannelName);
        } catch (e) {
          console.error(e);
        }
      }
      if (userChannel) {
        userChannel.bind("user-org-set-progress", this.applyUpdatedProgressData);
      }
    }
  };

  /**
   * Unbind from Pusher events that impact this component.
   * @see this.bindPusherEvents()
   *
   * @param {Number} userId
   *  User ID used in channel name.
   */
  unbindPusherEvents = (userId) => {
    let pusherInstance = getPusherInstance();
    if (!isNil(pusherInstance)) {
      let userChannelName = `private-users.${userId}.organizations`;
      let userChannel = pusherInstance.channel(userChannelName);
      if (userChannel) {
        userChannel.unbind("user-org-set-progress", this.applyUpdatedProgressData);
      }
    }
  };

  /**
   * Modify org.available_sets.set.percentComplete property
   *
   * If a change comes in from Pusher.
   */
  applyUpdatedProgressData = (pusherData) => {
    const { organization } = this.state;

    if (organization && pusherData) {
      let updatedOrg = applyPusherUserOrgSetProgressData(organization, pusherData);

      if (!this.isCancelled) {
        this.setState({
          organization: updatedOrg,
          progressDataUpdated: Date.now(),
        });
      }
    }
  };

  render() {
    const { currentUser } = this.props;
    const { organization, organizationLoading, progressDataUpdated } = this.state;

    if (!organization || !organization.id) {
      if (organizationLoading) {
        return <CircularProgressGlobal />;
      }
      return null;
    }

    return (
      <React.Fragment>
        <Switch>
          {/* Sets and all child routes. */}
          <PrivateRoute
            exact
            path="/app/account/organizations/:organization_id/sets"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <SetsPage organization={organization} progressDataUpdated={progressDataUpdated} />
            )}
          />

          {/* Reports and all child routes. */}
          <PrivateRoute
            exact
            path="/app/account/organizations/:organization_id/reports"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <ReportsPage organization={organization} progressDataUpdated={progressDataUpdated} />
            )}
          />

          {/* Pending users and all child routes. */}
          <PrivateRoute
            exact
            path="/app/account/organizations/:organization_id/pending"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => <PendingPage organization={organization} />}
          />

          {/* Plan and all child routes. */}
          <PrivateRoute
            path="/app/account/organizations/:organization_id/plan"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => <PlanRouting organization={organization} />}
          />

          {/* Team and all child routes. */}
          <PrivateRoute
            exact
            path="/app/account/organizations/:organization_id/team"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => <TeamPage organization={organization} />}
          />

          {/* Docbuilders and all child routes. */}
          <PrivateRoute
            path="/app/account/organizations/:organization_id/builder/:docbuilder_slug?"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <DocbuilderController
                docbuilderSlug={match.params.docbuilder_slug}
                organization={organization}
              />
            )}
          />

          {/* Redirect org-specific account routes without a specific destination
              to the corresponding "overview" (dashboard). */}
          <Redirect
            exact
            from="/app/account/organizations/:organization_id"
            to="/app/account/organizations/:organization_id/overview"
          />

          {/* Org-specific account overview, with tabs. */}
          <PrivateRoute
            exact
            path="/app/account/organizations/:organization_id/overview/:tab?"
            redirectBackOnLogin={true}
            currentUser={currentUser}
            render={({ match }) => (
              <OverviewPage
                organization={organization}
                progressDataUpdated={progressDataUpdated}
                repopulateOrganization={this.repopulateOrganization}
                activeTab={match.params.tab}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

export default compose(
  withRouter,
  connect(
    (state) => ({
      currentUser: state.auth.currentUser,
    }),
    {}
  )
)(OrgDetailRouting);
