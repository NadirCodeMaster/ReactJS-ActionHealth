import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import PrivateRoute from "components/ui/PrivateRoute";
import Docbuilder from "lib/Docbuilder/components/Docbuilder";
import Docbuilders from "lib/Docbuilder/components/Docbuilders";
import { organizationShape } from "constants/propTypeShapes";
import userCan from "utils/userCan";

//
// Routing and controller for docbuilder functionality.
//

export default function DocbuilderController({ docbuilderSlug, organization }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const [userCanViewDocbuilders, setUserCanViewDocbuilders] = useState(false);
  const [userCanEditDocbuilders, setUserCanEditDocbuilders] = useState(false);

  // Check permissions.
  useEffect(() => {
    if (mounted.current) {
      setUserCanViewDocbuilders(userCan(currentUser, organization, "view_docbuilders"));
      setUserCanEditDocbuilders(userCan(currentUser, organization, "edit_docbuilders"));
    }
  }, [currentUser, organization]);

  return (
    <Fragment>
      <Switch>
        {/* List of builders for organization */}
        <PrivateRoute
          exact
          path="/app/account/organizations/:organization_id/builder"
          redirectBackOnLogin={true}
          currentUser={currentUser}
          render={() => (
            <Docbuilders
              organization={organization}
              userCanViewDocbuilders={userCanViewDocbuilders}
              userCanEditDocbuilders={userCanEditDocbuilders}
            />
          )}
        />

        {/* Builder: build view (short-form redirect) */}
        <Redirect
          exact
          from="/app/account/organizations/:organization_id/builder/:docbuilder_slug"
          to="/app/account/organizations/:organization_id/builder/:docbuilder_slug/build"
        />

        {/* Builder: build view */}
        <PrivateRoute
          exact
          path="/app/account/organizations/:organization_id/builder/:docbuilder_slug/build/:subsection_id?"
          redirectBackOnLogin={true}
          currentUser={currentUser}
          render={({ match }) => (
            <Docbuilder
              format="build"
              organization={organization}
              docbuilderSlug={match.params.docbuilder_slug}
              subsectionId={
                isNil(match.params.subsection_id) ? null : parseInt(match.params.subsection_id, 10)
              }
              userCanViewDocbuilders={userCanViewDocbuilders}
              userCanEditDocbuilders={userCanEditDocbuilders}
            />
          )}
        />

        {/* Builder: preview view */}
        <PrivateRoute
          exact
          path="/app/account/organizations/:organization_id/builder/:docbuilder_slug/preview/:subsection_id?"
          redirectBackOnLogin={true}
          currentUser={currentUser}
          render={({ match }) => (
            <Docbuilder
              format="preview"
              organization={organization}
              docbuilderSlug={match.params.docbuilder_slug}
              subsectionId={
                match.params.subsection_id ? parseInt(match.params.subsection_id, 10) : null
              }
              userCanViewDocbuilders={userCanViewDocbuilders}
              userCanEditDocbuilders={userCanEditDocbuilders}
            />
          )}
        />
      </Switch>
    </Fragment>
  );
}

DocbuilderController.propTypes = {
  docbuilderSlug: PropTypes.string,
  organization: PropTypes.shape(organizationShape).isRequired,
};
