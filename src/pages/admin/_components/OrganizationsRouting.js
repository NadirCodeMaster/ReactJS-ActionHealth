import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import PageOrganizations from "../organizations/index.js";
import PageOrganization from "../organizations/detail.js";
import PageOrganizationTeam from "../organizations/team.js";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/organizations`
 *
 * See propTypes for required props.
 */
class OrganizationsRouting extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  render() {
    const { currentUser, programs } = this.props;

    return (
      <React.Fragment>
        <Switch>
          {/* ORGANIZATIONS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/organizations"
            currentUser={currentUser}
            render={() => <PageOrganizations currentUser={currentUser} programs={programs} />}
          />

          {/* Note: We use the component prop with a double arrow
              function below to ensure the display changes whenever
              the organization ID changes in location. Neither the
              render prop or standard (non-double arrow) component
              props consistently did this correctly when going from
              one detail to another. */}

          {/* ORGANIZATION DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/organizations/:organization_id"
            currentUser={currentUser}
            component={({ match }) => (
              <PageOrganization
                organizationId={Number(match.params.organization_id)}
                currentUser={currentUser}
                programs={programs}
              />
            )}
          />

          {/* ORGANIZATION TEAM */}
          <AdminRoute
            exact
            path="/app/admin/organizations/:organization_id/team"
            currentUser={currentUser}
            component={({ match }) => (
              <PageOrganizationTeam
                organizationId={Number(match.params.organization_id)}
                currentUser={currentUser}
                programs={programs}
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
    ({ auth, programs }) => ({
      programs,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(OrganizationsRouting);
