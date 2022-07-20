import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { isEmpty } from "lodash";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { requestDefaultUserOrganization } from "api/requests";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Deeplink router.
 *
 * Most P2 routes are necessarily organization-specific,
 * but some MarCom communications require us to make a
 * best guess as to a user's primary organization.
 * We refer to these as "deeplinks" and this component
 * is the single router that controls them all.
 *
 * The default organization is calculated by the API
 * (see the requestDefaultUserOrganization() method).
 *
 * @extends React
 */
class DeeplinkRoutes extends React.Component {
  static propTypes = {
    // Via calling code. Must be fully loaded by time we
    // mount this component.
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      defaultOrg: null,
      defaultOrgNotFound: false,
      defaultOrgLoading: true,
      defaultOrgLoaded: false,
    };
  }

  componentDidMount() {
    this.populateDefaultOrg();
  }

  componentDidUpdate(prevProps) {
    const { currentUser } = this.props;
    const { currentUser: prevCurrentUser } = prevProps;

    if (!compareCurrentUserObjectIds(currentUser, prevCurrentUser)) {
      this.populateDefaultOrg();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  // Retrieve the default organization for current user (if any)
  // and set it in component state.
  populateDefaultOrg = () => {
    if (!this.isCancelled) {
      this.setState({ defaultOrgLoading: true });
    }

    requestDefaultUserOrganization()
      .then((res) => {
        let org = !isEmpty(res.data) ? res.data : null;
        if (!this.isCancelled) {
          this.setState({
            defaultOrg: org,
            defaultOrgNotFound: !Boolean(org),
            defaultOrgLoaded: Boolean(org),
            defaultOrgLoading: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            defaultOrg: null,
            defaultOrgNotFound: true,
            defaultOrgLoaded: false,
            defaultOrgLoading: false,
          });
          console.error("An error occurred retrieving default organization.");
        }
      });
  };

  render() {
    const { defaultOrg, defaultOrgLoading, defaultOrgNotFound } = this.state;

    // Must have default org to continue.
    // -- still trying to load it...
    if (defaultOrgLoading || (!defaultOrg && !defaultOrgNotFound)) {
      return <CircularProgressGlobal />;
    }
    // -- failed to find one.
    if (!defaultOrg && !defaultOrgLoading && defaultOrgNotFound) {
      console.error("Failed to locate default organization.");
      return <Redirect to="/app/account/dashboard" />;
    }

    return (
      <Switch>
        {/* Note we don't use PrivateRoute in the routes below
              because this component should already be called
              using it. */}

        {/* ACTION PLAN (ticket #2394) */}
        <Route
          exact
          path="/app/deeplinks/plan"
          render={({ match }) => (
            <Redirect to={`/app/account/organizations/${defaultOrg.id}/plan`} />
          )}
        />

        {/* ORGANIZATION/PROGRAM DASHBOARD */}
        <Route
          exact
          path="/app/deeplinks/programs/:program_id"
          render={({ match }) => (
            <Redirect
              to={`/app/programs/${match.params.program_id}/organizations/${defaultOrg.id}`}
            />
          )}
        />

        {/* ORGANIZATION/PROGRAM/SET DASHBOARD */}
        <Route
          exact
          path="/app/deeplinks/programs/:program_id/sets/:set_id"
          render={({ match }) => (
            <Redirect
              to={`/app/programs/${match.params.program_id}/organizations/${defaultOrg.id}/sets/${match.params.set_id}`}
            />
          )}
        />

        {/* ORGANIZATION/PROGRAM/SET/MODULE DASHBOARD */}
        <Route
          exact
          path="/app/deeplinks/programs/:program_id/sets/:set_id/modules/:module_id"
          render={({ match }) => (
            <Redirect
              to={`/app/programs/${match.params.program_id}/organizations/${defaultOrg.id}/sets/${match.params.set_id}/modules/${match.params.module_id}`}
            />
          )}
        />

        {/* QUESTION DETAIL */}
        <Route
          exact
          path="/app/deeplinks/programs/:program_id/sets/:set_id/questions/:question_id"
          render={({ match }) => (
            <Redirect
              to={`/app/programs/${match.params.program_id}/organizations/${defaultOrg.id}/sets/${match.params.set_id}/questions/${match.params.question_id}`}
            />
          )}
        />

        {/* ORGANIZATION TEAM */}
        <Route
          exact
          path="/app/deeplinks/team"
          render={({ match }) => (
            <Redirect to={`/app/account/organizations/${defaultOrg.id}/team`} />
          )}
        />
      </Switch>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(DeeplinkRoutes);
