import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { requestOrganization } from "api/requests";
import { isNil } from "lodash";
import PrimaryMenuDrawer from "./PrimaryMenuDrawer";
import { useLocation } from "react-router-dom";
import userCan from "utils/userCan";
import AnonSubmenu from "./AnonSubmenu";
import AuthSubmenu from "./AuthSubmenu";
import AdminSubmenu from "./AdminSubmenu";
import { currentUserShape } from "constants/propTypeShapes";

//
// Primary menu for the Action Center.
//

function PrimaryMenu({ activeOrgId, currentUser, expandedAtMobileRes, toggleDrawer }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentLocation = useLocation();

  // For organization-specific submenu.
  const [activeOrg, setActiveOrg] = useState(null);
  const [showingAuthSubmenu, setShowingAuthSubmenu] = useState(false);
  const [showingOrganizationSubmenu, setShowingOrganizationSubmenu] = useState(false);
  const [showingOrganizationSubmenuSets, setShowingOrganizationSubmenuSets] = useState(false); // @TODO RENAME

  // Permissions.
  const [userCanViewActionPlan, setUserCanViewActionPlan] = useState(false);
  const [userCanViewAssessment, setUserCanViewAssessment] = useState(false);
  const [userCanViewDocbuilders, setUserCanViewDocbuilders] = useState(false);
  const [userCanViewTeam, setUserCanViewTeam] = useState(false);

  // Reset all org permissions.
  const resetAccess = () => {
    if (mounted.current) {
      setUserCanViewActionPlan(false);
      setUserCanViewAssessment(false);
      setUserCanViewDocbuilders(false);
      setUserCanViewTeam(false);
    }
  };

  // Check and set all org permissions.
  const establishAccess = (_activeOrg, _currentUser) => {
    if (_activeOrg && _currentUser && _currentUser.isAuthenticated) {
      let _viewActionPlan = userCan(_currentUser, _activeOrg, "view_action_plan");
      let _viewAssessment = userCan(_currentUser, _activeOrg, "view_assessment");
      let _viewDocbuilders = userCan(_currentUser, _activeOrg, "view_docbuilders");
      let _viewTeam = userCan(_currentUser, _activeOrg, "view_team");

      if (mounted.current) {
        setUserCanViewActionPlan(_viewActionPlan);
        setUserCanViewAssessment(_viewAssessment);
        setUserCanViewDocbuilders(_viewDocbuilders);
        setUserCanViewTeam(_viewTeam);
      }
      return;
    }
    // Otherwise, reset to no access.
    resetAccess();
  };

  // Retrieve org record from API.
  const populateActiveOrg = (_activeOrgId, _currentUser) => {
    // Note that this gets called _before_ checking permissions so we have
    // the org object to evaluate against.
    resetAccess();

    if (mounted.current) {
      setActiveOrg(null);
    }

    // Be sure we have all we need to retrieve an org record.
    if (_activeOrgId && _currentUser && _currentUser.isAuthenticated) {
      requestOrganization(_activeOrgId)
        .then((res) => {
          let newActiveOrg = null;
          if (!isNil(res.data.data)) {
            newActiveOrg = res.data.data;
          }
          if (mounted.current) {
            // Note: Perm checks are done elsewhere upon change to activeOrg.
            setActiveOrg(newActiveOrg);
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setActiveOrg(null);
            console.error("An error occurred retrieving activeOrg.");
          }
        });
    }
  };

  // Initializations when user or org props change.
  useEffect(() => {
    populateActiveOrg(activeOrgId, currentUser);
  }, [activeOrgId, currentUser]); // eslint-disable-line

  // Check permissions when active org object changes.
  useEffect(() => {
    if (activeOrg && currentUser && currentUser.isAuthenticated) {
      establishAccess(activeOrg, currentUser);
      return;
    }
    resetAccess();
  }, [activeOrg, currentUser]); // eslint-disable-line

  // Determine what parts of menu should be expanded.
  //
  // NOTE: Was a standalone method (setDefaultCollapse())
  // prior to our MUI5 upgrade.
  useEffect(() => {
    let p = currentLocation.pathname;

    // Ex: /app/admin/organizations/10
    // Ex: /app/admin/organizations/10/team/asdf
    let orgAdminPathMatch = Boolean(p.match(/^\/app\/admin\/organizations\/[0-9]+(?:\/.*)?$/));

    // Ex: /app/account/organizations/10
    // Ex: /app/account/organizations/10/plan/asdfa
    let orgAccountPathMatch = Boolean(p.match(/^\/app\/account\/organizations\/[0-9]+(?:\/.*)?$/));

    // Ex: /app/account/organizations/10/sets
    // Ex: /app/account/organizations/10/sets/
    // (NOTHING AFTER "sets" except maybe a slash)
    let orgAccountSetsPathMatch = Boolean(
      p.match(/^\/app\/account\/organizations\/[0-9]+\/sets(\/)?$/)
    );

    // Ex: /app/account/organizations/10/sets/234
    // Ex: /app/account/organizations/10/sets/234/whatever
    let orgSetPathMatch = Boolean(
      p.match(/^\/app\/programs\/[0-9]+\/organizations\/[0-9]+\/sets\/[0-9]+(?:\/.*)?$/)
    );

    if (mounted.current) {
      setShowingOrganizationSubmenu(orgAccountPathMatch || orgSetPathMatch || orgAdminPathMatch);
      setShowingOrganizationSubmenuSets(orgSetPathMatch || orgAccountSetsPathMatch);
    }
  }, [currentLocation]);

  const toggleOrganizationSubmenu = useCallback((expand) => {
    if (mounted.current) {
      setShowingOrganizationSubmenu(Boolean(expand));
    }
  }, []);

  const toggleOrganizationSubmenuSets = useCallback((expand) => {
    if (mounted.current) {
      setShowingOrganizationSubmenuSets(Boolean(expand));
    }
  }, []);

  const toggleAuthSubmenu = useCallback((expand) => {
    if (mounted.current) {
      setShowingAuthSubmenu(Boolean(expand));
    }
  }, []);

  return (
    <PrimaryMenuDrawer expandedAtMobileRes={expandedAtMobileRes} toggle={toggleDrawer}>
      {!currentUser.loading && (
        <Fragment>
          {/* ANON USER MENU LIST */}
          {!currentUser.isAuthenticated && (
            <Fragment>
              <AnonSubmenu currentUserIsAuthenticated={currentUser.isAuthenticated} />
            </Fragment>
          )}

          {/* AUTHENTICATED USER MENU LIST */}
          {currentUser.isAuthenticated && (
            <Fragment>
              <AuthSubmenu
                activeOrg={activeOrg}
                currentUserIsAuthenticated={currentUser.isAuthenticated}
                expanded={showingAuthSubmenu}
                toggleExpanded={toggleAuthSubmenu}
                organizationSubmenuExpanded={showingOrganizationSubmenu}
                organizationSubmenuSetsExpanded={showingOrganizationSubmenuSets}
                toggleOrganizationSubmenuExpanded={toggleOrganizationSubmenu}
                toggleOrganizationSubmenuSetsExpanded={toggleOrganizationSubmenuSets}
                userCanViewActionPlan={userCanViewActionPlan}
                userCanViewAssessment={userCanViewAssessment}
                userCanViewDocbuilders={userCanViewDocbuilders}
                userCanViewTeam={userCanViewTeam}
              />

              {/* ADMIN MENU */}
              {currentUser.isAdmin && (
                <Fragment>
                  <AdminSubmenu currentUserIsAdmin={currentUser.isAdmin} />
                </Fragment>
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </PrimaryMenuDrawer>
  );
}

PrimaryMenu.propTypes = {
  activeOrgId: PropTypes.number,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  children: PropTypes.node,
  expandedAtMobileRes: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default PrimaryMenu;
