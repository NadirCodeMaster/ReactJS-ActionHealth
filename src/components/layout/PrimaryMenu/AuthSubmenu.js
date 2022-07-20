import React, { Fragment, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { organizationShape } from "constants/propTypeShapes";
import { Link, NavLink } from "react-router-dom";
import { Collapse, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import IconAccountBalance from "@mui/icons-material/AccountBalanceOutlined";
import IconAccountCircle from "@mui/icons-material/AccountCircleOutlined";
import IconExpandMore from "@mui/icons-material/ArrowRightOutlined";
import IconExpandLess from "@mui/icons-material/ArrowDropDownOutlined";
import IconHome from "@mui/icons-material/HomeOutlined";
import IconBuild from "@mui/icons-material/BuildOutlined";
import IconContactSupport from "@mui/icons-material/ContactSupportOutlined";
import IconSchool from "@mui/icons-material/SchoolOutlined";
import IconExitToApp from "@mui/icons-material/ExitToApp";

import OrganizationSubmenu from "./OrganizationSubmenu";
import {
  sxActiveLink,
  sxExpandCollapseIconsLevel1,
  sxList,
  sxListItemIcon,
  sxListItemLevel1,
  sxListItemLevel2,
  sxListItemText,
} from "./_common";

//
// Primary menu: Submenu for authenticated users.
//

function AuthSubmenu({
  activeOrg,
  currentUserIsAuthenticated,
  expanded,
  toggleExpanded,
  organizationSubmenuExpanded,
  organizationSubmenuSetsExpanded,
  toggleOrganizationSubmenuExpanded,
  toggleOrganizationSubmenuSetsExpanded,
  userCanViewActionPlan,
  userCanViewAssessment,
  userCanViewDocbuilders,
  userCanViewTeam,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!currentUserIsAuthenticated) {
    return null;
  }

  return (
    <List sx={{ ...sxList }}>
      <Fragment>
        {expanded ? (
          <IconExpandLess
            sx={{ ...sxExpandCollapseIconsLevel1 }}
            onClick={() => toggleExpanded(!expanded)}
          />
        ) : (
          <IconExpandMore
            sx={{ ...sxExpandCollapseIconsLevel1 }}
            onClick={() => toggleExpanded(!expanded)}
          />
        )}
        <ListItem
          button
          component={NavLink}
          to="/app/account/dashboard"
          sx={{
            ...sxListItemLevel1,
            zIndex: 0, // @TODO Use theme value
          }}
          style={(isActive) => (isActive ? sxActiveLink : {})}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconHome color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Dashboard" />
        </ListItem>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List sx={{ ...sxList }}>
            <ListItem
              button
              component={NavLink}
              to="/app/account/profile"
              sx={{
                ...sxListItemLevel2,
              }}
              style={(isActive) => (isActive ? sxActiveLink : {})}
            >
              <ListItemIcon sx={{ ...sxListItemIcon }}>
                <IconAccountCircle color="primary" />
              </ListItemIcon>
              <ListItemText disableTypography sx={{ ...sxListItemText }} primary="My Account" />
            </ListItem>
          </List>
        </Collapse>

        <Divider sx={{ marginBottom: 1.5, marginTop: 1.5 }} />

        <ListItem
          button
          component={NavLink}
          to={"/app/account/organizations"}
          sx={{
            ...sxListItemLevel1,
          }}
          style={(isActive) => (isActive ? sxActiveLink : {})}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconAccountBalance color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="My Organizations" />
        </ListItem>

        {activeOrg && (
          <Fragment>
            <OrganizationSubmenu
              activeOrg={activeOrg}
              expanded={organizationSubmenuExpanded}
              expandedSets={organizationSubmenuSetsExpanded}
              toggleExpanded={toggleOrganizationSubmenuExpanded}
              toggleExpandedSets={toggleOrganizationSubmenuSetsExpanded}
              userCanViewActionPlan={userCanViewActionPlan}
              userCanViewAssessment={userCanViewAssessment}
              userCanViewDocbuilders={userCanViewDocbuilders}
              userCanViewTeam={userCanViewTeam}
            />
          </Fragment>
        )}

        <Divider sx={{ marginBottom: 1.5, marginTop: 1.5 }} />

        <ListItem
          button
          component={NavLink}
          to="/app/resources"
          sx={{
            ...sxListItemLevel1,
          }}
          style={(isActive) => (isActive ? sxActiveLink : {})}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconBuild color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Resources" />
        </ListItem>

        {/* NOTE: react-router-dom <Link> requires absolute URLs omit
            any protocol (i.e., `https:`) and simply begin with `//`. */}
        <ListItem
          button
          component={Link}
          target="_blank"
          rel="noopener noreferrer"
          to="//www.healthiergeneration.org/resources/trainings"
          sx={{
            ...sxListItemLevel1,
          }}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconSchool color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Training" />
        </ListItem>

        {/* NOTE: react-router-dom <Link> requires absolute URLs omit
            any protocol (i.e., `https:`) and simply begin with `//`. */}
        <ListItem
          button
          component={Link}
          target="_blank"
          rel="noopener noreferrer"
          to="//www.healthiergeneration.org/node/6639"
          sx={{
            ...sxListItemLevel1,
          }}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconContactSupport color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Get Help" />
        </ListItem>

        <ListItem
          button
          component={NavLink}
          to="/app/account/logout"
          sx={{
            ...sxListItemLevel1,
          }}
          style={(isActive) => (isActive ? sxActiveLink : {})}
        >
          <ListItemIcon sx={{ ...sxListItemIcon }}>
            <IconExitToApp color="primary" />
          </ListItemIcon>
          <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Log Out" />
        </ListItem>
      </Fragment>
    </List>
  );
}

AuthSubmenu.propTypes = {
  activeOrg: PropTypes.shape(organizationShape), // avail sets not required
  currentUserIsAuthenticated: PropTypes.bool.isRequired,
  expanded: PropTypes.bool,
  toggleExpanded: PropTypes.func.isRequired,
  organizationSubmenuExpanded: PropTypes.bool,
  organizationSubmenuSetsExpanded: PropTypes.bool,
  toggleOrganizationSubmenuExpanded: PropTypes.func.isRequired,
  toggleOrganizationSubmenuSetsExpanded: PropTypes.func.isRequired,
  userCanViewActionPlan: PropTypes.bool,
  userCanViewAssessment: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
  userCanViewTeam: PropTypes.bool,
};

export default AuthSubmenu;
