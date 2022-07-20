import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import useGoogleAnalytics from "hooks/useGoogleAnalytics";
import { currentUserShape } from "constants/propTypeShapes";

// Routing components.
import AdminRoute from "components/ui/AdminRoute";
import PrivateRoute from "components/ui/PrivateRoute";

// Routes
import AccountRoutes from "pages/account/_routes.js";
import DeeplinkRoutes from "pages/deeplinks/_routes.js";
import ProgramRoutes from "pages/programs/_routes.js";
import AdminRoutes from "pages/admin/_routes.js";
import ResourceRoutes from "pages/resources/index.js";

//
// Top-level routing for our app.
//

function Routes({ currentUser, programs }) {
  useGoogleAnalytics();

  return (
    <Switch>
      <Redirect exact from="/" to="/app" />
      <Redirect exact path="/app" to="/app/account/dashboard" />

      <Route path="/app/account" component={AccountRoutes} />
      <Route path="/app/programs" component={ProgramRoutes} />
      <Route path="/app/resources" component={ResourceRoutes} />

      <PrivateRoute
        path="/app/deeplinks"
        currentUser={currentUser}
        redirectBackOnLogin={true}
        render={() => <DeeplinkRoutes currentUser={currentUser} programs={programs} />}
      />

      <AdminRoute path="/app/admin" component={AdminRoutes} currentUser={currentUser} />
    </Switch>
  );
}

Routes.propTypes = {
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  programs: PropTypes.object.isRequired,
};

export default Routes;
