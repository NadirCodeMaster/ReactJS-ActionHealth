import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import PagePendingRoles from "../pending/requests/index.js";
import PagePendingTeams from "../pending/invites/index.js";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/pending`
 *
 * See propTypes for required props.
 */
class PendingRouting extends React.Component {
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
          {/* PENDING REQUESTS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/pending/requests"
            currentUser={currentUser}
            render={({ match }) => (
              <PagePendingRoles currentUser={currentUser} programs={programs} />
            )}
          />

          {/* PENDING INVITES INDEX */}
          <AdminRoute
            exact
            path="/app/admin/pending/invites"
            currentUser={currentUser}
            render={({ match }) => (
              <PagePendingTeams currentUser={currentUser} programs={programs} />
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
)(PendingRouting);
