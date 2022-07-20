import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { List, ListItem, ListItemText, ListSubheader } from "@mui/material";
import { sxActiveLink, sxAdminListItem, sxAdminListItemText, sxAdminList } from "./_common";

//
// Primary menu: Submenu for admin users.
//

function AdminSubmenu({ currentUserIsAdmin }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!currentUserIsAdmin) {
    return null;
  }

  return (
    <List sx={{ ...sxAdminList }}>
      <ListSubheader
        disableSticky
        sx={{
          color: "#FFFFFF",
          fontSize: 12,
          lineHeight: "2",
          paddingLeft: 2,
        }}
      >
        <strong>Administration</strong>
      </ListSubheader>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/content"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Content" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/criteria"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Criteria" />
      </ListItem>
      {/* @TODO RE-ENABLE
        (see todos in src/pages/admin/_routes.js) */}
      {/*
      <ListItem
        button
        component={NavLink}
        to="/app/admin/docbuilders"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (
          isActive ? sxActiveLink : {}
        )}
      >
        <ListItemText disableTypography
          sx={{ ...sxAdminListItemText }}
          primary="Docbuilders"
        />
      </ListItem>
      */}
      <ListItem
        button
        component={NavLink}
        to="/app/admin/organizations"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Organizations" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/pending/requests"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText
          disableTypography
          sx={{ ...sxAdminListItemText }}
          primary="Pending Requests"
        />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/pending/invites"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Pending Invites" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/programs"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Programs" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/resources"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Resources" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/resource-soft-gate-logs"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Soft-gate Logs" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/tags"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Tags" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/terms"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Terms" />
      </ListItem>
      <ListItem
        button
        component={NavLink}
        to="/app/admin/users"
        sx={{ ...sxAdminListItem }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemText disableTypography sx={{ ...sxAdminListItemText }} primary="Users" />
      </ListItem>
    </List>
  );
}

AdminSubmenu.propTypes = {
  currentUserIsAdmin: PropTypes.bool.isRequired,
};

export default AdminSubmenu;
