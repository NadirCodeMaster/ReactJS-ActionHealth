import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import PageCriteria from "../criteria/index.js";
import PageCriterion from "../criteria/detail.js";
import PageCriterionNew from "../criteria/new.js";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with `/app/admin/criteria`
 *
 * See propTypes for required props.
 */
class CriteriaRouting extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    match: PropTypes.object.isRequired,
  };

  render() {
    const { currentUser } = this.props;

    return (
      <React.Fragment>
        <Switch>
          {/* CRITERIA INDEX */}
          <AdminRoute
            exact
            path="/app/admin/criteria"
            currentUser={currentUser}
            render={({ match }) => <PageCriteria currentUser={currentUser} />}
          />

          {/* CREATE NEW CRITERION */}
          <AdminRoute
            exact
            path="/app/admin/criteria/new"
            currentUser={currentUser}
            render={({ match }) => <PageCriterionNew currentUser={currentUser} />}
          />

          {/* CRITERION DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/criteria/:criterion_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageCriterion
                currentUser={currentUser}
                criterionId={Number(match.params.criterion_id)}
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
    ({ auth }) => ({
      currentUser: auth.currentUser,
    }),
    {}
  )
)(CriteriaRouting);
