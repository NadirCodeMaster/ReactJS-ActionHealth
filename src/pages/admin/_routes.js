import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import PageNotFound from "components/views/PageNotFound";
import ContentsRouting from "./_components/ContentsRouting";
import CriteriaRouting from "./_components/CriteriaRouting";

// @TODO see related below
// import DocbuildersRouting from './docbuilders/index';

import OrganizationsRouting from "./_components/OrganizationsRouting";
import TermsRouting from "./_components/TermsRouting";
import ProgramsRouting from "./_components/ProgramsRouting";
import ResourcesRouting from "./resources/index";
import SoftGateRouting from "./softgate/index";
import TagsRouting from "./tags/index";
import UsersRouting from "./_components/UsersRouting";
import PendingRouting from "./_components/PendingRouting";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { currentUserShape } from "constants/propTypeShapes";

class AdminRoutes extends React.Component {
  static propTypes = {
    programs: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
  };

  render() {
    const { currentUser, programs } = this.props;

    // Make sure we have a user before proceeding.
    if (isNil(currentUser) || !currentUser.loaded || currentUser.loading) {
      return <CircularProgressGlobal />;
    }

    // Prevent access if user isn't an admin.
    if (!currentUser.isAdmin) {
      return <PageNotFound />;
    }

    // Make sure we have programs loaded.
    if (isNil(programs) || !programs.loaded || programs.loading) {
      return <CircularProgressGlobal />;
    }

    return (
      <Switch>
        <Redirect exact path="/app/admin" to="/app/admin/programs" />
        <Route path="/app/admin/criteria" component={CriteriaRouting} />
        <Route path="/app/admin/content" component={ContentsRouting} />
        {/* @TODO UPDATE DOCBUILDER ADMIN FOR NEW STRUCTURES, RE-ENABLE
        <Route path="/app/admin/docbuilders" component={DocbuildersRouting} />
        */}
        <Route path="/app/admin/organizations" component={OrganizationsRouting} />
        <Route path="/app/admin/terms" component={TermsRouting} />
        <Route path="/app/admin/resources" component={ResourcesRouting} />
        <Route path="/app/admin/resource-soft-gate-logs" component={SoftGateRouting} />
        <Route path="/app/admin/tags" component={TagsRouting} />
        <Route path="/app/admin/programs" component={ProgramsRouting} />
        <Route path="/app/admin/users" component={UsersRouting} />
        <Route path="/app/admin/pending" component={PendingRouting} />
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
)(AdminRoutes);
