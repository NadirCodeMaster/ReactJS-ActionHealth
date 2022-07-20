import React from "react";
import { Route, Redirect } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const PrivateRoute = ({ currentUser, redirectBackOnLogin = true, component, ...props }) => {
  if (currentUser.loading) {
    return (
      <Route
        {...props}
        render={() => (
          <div>
            <CircularProgress variant="indeterminate" />
          </div>
        )}
      />
    );
  }
  if (!currentUser.isAuthenticated) {
    return (
      <Route
        {...props}
        render={({ location }) => {
          const redirectTo = { pathname: "/app/account/login" };
          if (redirectBackOnLogin) {
            redirectTo.state = { from: location };
          }
          return <Redirect to={redirectTo} />;
        }}
      />
    );
  }
  return <Route component={component} {...props} />;
};

export default PrivateRoute;
