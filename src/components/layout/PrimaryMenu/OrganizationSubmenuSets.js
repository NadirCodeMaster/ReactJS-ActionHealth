import React, { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { ListItem, ListItemText } from "@mui/material";
import { sxActiveLink, sxListItemLevel3, sxListItemTextLongTypography } from "./_common";

const OrganizationSubmenuSets = ({ activeOrgId, availableSets }) => {
  return (
    <Fragment>
      {availableSets.map((set) => (
        <Fragment key={set.id}>
          <ListItem
            button
            component={NavLink}
            to={`/app/programs/${set.program_id}/organizations/${activeOrgId}/sets/${set.id}`}
            sx={{ ...sxListItemLevel3 }}
            style={(isActive) => (isActive ? sxActiveLink : {})}
          >
            <ListItemText
              disableTypography
              sx={{ ...sxListItemTextLongTypography }}
              primary={set.name}
            />
          </ListItem>
        </Fragment>
      ))}
    </Fragment>
  );
};

export default OrganizationSubmenuSets;
