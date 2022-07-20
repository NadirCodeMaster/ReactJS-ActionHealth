import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import ForwardIcon from "@mui/icons-material/Forward";
import { sxActiveLink, sxList, sxListItemIcon } from "./_common";

//
// Primary menu: Submenu for anonymous users.
//

function AnonSubmenu({ currentUserIsAuthenticated }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (currentUserIsAuthenticated) {
    return null;
  }

  return (
    <List sx={{ ...sxList }}>
      <ListItem
        button
        component={NavLink}
        to="/app/account/login"
        sx={{
          paddingLeft: 2.5,
          textDecoration: "none",
          "&:link, &:visited, &:hover, &:active, &:focus": {
            textDecoration: "none",
          },
        }}
        style={(isActive) => (isActive ? sxActiveLink : {})}
      >
        <ListItemIcon sx={{ ...sxListItemIcon }}>
          <ForwardIcon color="primary" />
        </ListItemIcon>
        <ListItemText
          disableTypography
          sx={{
            color: "text.primary",
            fontSize: "default",
            textTransform: "none",
          }}
          primary="Log in"
        />
      </ListItem>
    </List>
  );
}

AnonSubmenu.propTypes = {
  currentUserIsAuthenticated: PropTypes.bool.isRequired,
};

export default AnonSubmenu;
