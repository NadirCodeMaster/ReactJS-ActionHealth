import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { Redirect, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import PagePrograms from "../programs/index.js";
import PageProgram from "../programs/detail.js";
import PageProgramOrganizations from "../programs/organizations";
import ProgramSetsRouting from "./ProgramSetsRouting.js";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Use this component to handle routes starting with
 * `/app/admin/programs`
 *
 * See propTypes for required props.
 */
class ProgramsRouting extends React.Component {
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
          {/* PROGRAMS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/programs"
            currentUser={currentUser}
            render={({ match }) => <PagePrograms programs={programs} currentUser={currentUser} />}
          />

          {/* PROGRAM DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgram programs={programs} program={programs.data[match.params.program_id]} />
            )}
          />

          {/* PROGRAM ORGANIZATIONS INDEX */}
          <AdminRoute
            exact
            path="/app/admin/programs/:program_id/organizations"
            currentUser={currentUser}
            render={({ match }) => (
              <PageProgramOrganizations
                program={programs.data[match.params.program_id]}
                programs={programs}
                currentUser={currentUser}
              />
            )}
          />

          {/* Redirct request for program-specific org admin
            detail page to the regular org admin detail page */}
          <Redirect
            exact
            from="/app/admin/programs/:program_id/organizations/:organization_id"
            to="/app/admin/organizations/:organization_id"
          />

          {/* ALL PROGRAM SET ROUTES */}
          <AdminRoute
            path="/app/admin/programs/:program_id/sets"
            currentUser={currentUser}
            render={({ match }) => (
              <ProgramSetsRouting
                currentUser={currentUser}
                programs={programs}
                program={programs.data[match.params.program_id]}
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
)(ProgramsRouting);
