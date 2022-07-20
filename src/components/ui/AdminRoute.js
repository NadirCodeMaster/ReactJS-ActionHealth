import React from "react";
import { Route, Redirect } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

export const AdminRedirect = (props) => <Redirect {...props} to="/app/account/login" />;

const AdminRoute = ({ currentUser, component, ...props }) => {
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
  if (!currentUser.isAdmin) {
    return <Route {...props} render={() => <AdminRedirect />} />;
  }
  return <Route component={component} {...props} />;
};

export default AdminRoute;
