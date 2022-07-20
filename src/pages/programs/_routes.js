import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Route, Switch } from "react-router-dom";
// import PropTypes from 'prop-types'; // @TODO IMPLEMENT
import { isNil } from "lodash";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import PagePrograms from "./index.js";
import ProgramRouting from "./_components/ProgramRouting";

class ProgramRoutes extends React.Component {
  componentDidMount() {}

  render() {
    const { currentUser, programs } = this.props;

    // Must have programs loaded before proceeding.
    if (isNil(programs) || !programs.loaded) {
      return <CircularProgressGlobal />;
    }

    return (
      <Switch>
        {/* PROGRAM INDEX */}
        <Route exact path="/app/programs" render={() => <PagePrograms />} />

        {/* ALL PROGRAM-SPECIFIC ROUTES */}
        <Route
          path="/app/programs/:program_id"
          render={({ match }) => (
            <ProgramRouting
              program={programs.data[match.params.program_id]}
              currentUser={currentUser}
            />
          )}
        />
      </Switch>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth, programs }) => ({
      appMeta: app_meta,
      programs,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(ProgramRoutes);
