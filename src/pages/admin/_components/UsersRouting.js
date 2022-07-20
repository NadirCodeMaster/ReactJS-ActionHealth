import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import PageUsers from "../users/index.js";
import PageUser from "../users/detail.js";
import PageUserNew from "../users/new.js";
import PageUserOrganizations from "../users/organizations/index.js";
import PageUserOrganization from "../users/organizations/detail.js";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/users`
 *
 * See propTypes for required props.
 */
class UsersRouting extends React.Component {
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
          {/* USERS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/users"
            currentUser={currentUser}
            render={({ match }) => <PageUsers currentUser={currentUser} programs={programs} />}
          />

          {/* CREATE NEW USER */}
          <AdminRoute
            exact
            path="/app/admin/users/new"
            currentUser={currentUser}
            render={({ match }) => <PageUserNew currentUser={currentUser} programs={programs} />}
          />

          {/* USER DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/users/:user_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageUser
                currentUser={currentUser}
                subjectUserId={Number(match.params.user_id)}
                programs={programs}
              />
            )}
          />

          {/* USER ORGANIZATIONS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/users/:user_id/organizations"
            currentUser={currentUser}
            render={({ match }) => (
              <PageUserOrganizations
                currentUser={currentUser}
                subjectUserId={Number(match.params.user_id)}
                programs={programs}
              />
            )}
          />

          {/* USER ORGANIZATION DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/users/:user_id/organizations/:organization_id"
            currentUser={currentUser}
            render={({ match }) => {
              return (
                <PageUserOrganization
                  currentUser={currentUser}
                  subjectUserId={Number(match.params.user_id)}
                  organizationId={Number(match.params.organization_id)}
                  programs={programs}
                />
              );
            }}
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
)(UsersRouting);
