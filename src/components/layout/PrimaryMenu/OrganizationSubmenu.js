import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { get } from "lodash";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Collapse, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import Assignment from "@mui/icons-material/AssignmentOutlined";
import ExpandMore from "@mui/icons-material/ArrowRightOutlined";
import ExpandLess from "@mui/icons-material/ArrowDropDownOutlined";
import SupervisorAccount from "@mui/icons-material/SupervisorAccountOutlined";
import AssignmentTurnedIn from "@mui/icons-material/AssignmentTurnedInOutlined";
import { organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";
import OrganizationSubmenuSets from "./OrganizationSubmenuSets";
import {
  sxActiveLink,
  sxExpandCollapseIconsLevel1,
  sxExpandCollapseIconsLevel2,
  sxList,
  sxListItemIcon,
  sxListItemLevel1,
  sxListItemLevel2,
  sxListItemText,
  sxListItemTextLongTypography,
} from "./_common";
import DocbuilderUtils from "lib/Docbuilder/classes/DocbuilderUtils";

//
// Primary menu: Organization-specific submenu used by AuthSubmenu.
//

function OrganizationSubmenu({
  activeOrg,
  expanded,
  expandedSets,
  toggleExpanded,
  toggleExpandedSets,
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

  const [availableSets, setAvailableSets] = useState(null);
  const [docbuildersForOrg, setDocbuildersForOrg] = useState([]);
  const allDocbuilders = useSelector((state) => state.app_meta.data.docbuilders);

  // Populate sets, docbuilders when props change.
  useEffect(() => {
    let newAvailableSets = null;
    let newDocbuildersForOrg = [];
    if (activeOrg) {
      // Collect sets available to this org.
      newAvailableSets = userCanViewAssessment ? get(activeOrg, "available_sets", null) : null;

      // Collect docbuilders available to active org.
      if (allDocbuilders) {
        newDocbuildersForOrg = DocbuilderUtils.docbuildersForOrganization(
          allDocbuilders,
          activeOrg,
          false // false to exclude closed docbuilders
        );
      }
    }
    if (mounted.current) {
      setAvailableSets(newAvailableSets);
      setDocbuildersForOrg(newDocbuildersForOrg);
    }
  }, [activeOrg, allDocbuilders, userCanViewAssessment, userCanViewDocbuilders]);

  return (
    <Fragment>
      <Fragment key={activeOrg.id}>
        {/* Only show expansion if user has access to one or more links inside. */}
        {(userCanViewAssessment || userCanViewTeam) && (
          <Fragment>
            {expanded ? (
              <ExpandLess
                sx={{ ...sxExpandCollapseIconsLevel1 }}
                onClick={() => toggleExpanded(!expanded)}
              />
            ) : (
              <ExpandMore
                sx={{ ...sxExpandCollapseIconsLevel1 }}
                onClick={() => toggleExpanded(!expanded)}
              />
            )}
          </Fragment>
        )}
        <ListItem
          button
          component={NavLink}
          to={`/app/account/organizations/${activeOrg.id}`}
          sx={{
            ...sxListItemLevel1,
            fontWeight: styleVars.txtFontWeightDefaultMedium,
            paddingLeft: 2.6,
          }}
          style={(isActive) => (isActive ? sxActiveLink : {})}
        >
          <ListItemText
            disableTypography
            sx={{ ...sxListItemTextLongTypography }}
            primary={activeOrg.name}
          />
        </ListItem>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List sx={{ ...sxList }}>
            {availableSets && userCanViewAssessment && (
              <Fragment>
                {expandedSets ? (
                  <ExpandLess
                    sx={{ ...sxExpandCollapseIconsLevel2 }}
                    onClick={() => toggleExpandedSets(!expandedSets)}
                  />
                ) : (
                  <ExpandMore
                    sx={{ ...sxExpandCollapseIconsLevel2 }}
                    onClick={() => toggleExpandedSets(!expandedSets)}
                  />
                )}

                <ListItem
                  button
                  key={activeOrg.id}
                  component={NavLink}
                  to={`/app/account/organizations/${activeOrg.id}/sets`}
                  sx={{ ...sxListItemLevel2 }}
                  style={(isActive) => (isActive ? sxActiveLink : {})}
                >
                  <ListItemIcon sx={{ ...sxListItemIcon }}>
                    <Assignment color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    disableTypography
                    sx={{ ...sxListItemText }}
                    primary="Assessments"
                  />
                </ListItem>
                <Collapse in={expandedSets} timeout="auto" unmountOnExit>
                  <List sx={{ ...sxList }}>
                    <OrganizationSubmenuSets
                      activeOrgId={activeOrg.id}
                      availableSets={availableSets}
                    />
                  </List>
                </Collapse>
              </Fragment>
            )}

            {userCanViewActionPlan && (
              <ListItem
                button
                component={NavLink}
                to={`/app/account/organizations/${activeOrg.id}/plan`}
                sx={{ ...sxListItemLevel2 }}
                style={(isActive) => (isActive ? sxActiveLink : {})}
              >
                <ListItemIcon sx={{ ...sxListItemIcon }}>
                  <AssignmentTurnedIn color="primary" />
                </ListItemIcon>
                <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Action Plan" />
              </ListItem>
            )}

            {userCanViewAssessment && (
              <ListItem
                button
                component={NavLink}
                to={`/app/account/organizations/${activeOrg.id}/reports`}
                sx={{ ...sxListItemLevel2 }}
                style={(isActive) => (isActive ? sxActiveLink : {})}
              >
                <ListItemIcon sx={{ ...sxListItemIcon }}>
                  <AssessmentOutlined color="primary" />
                </ListItemIcon>
                <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Reports" />
              </ListItem>
            )}

            {docbuildersForOrg.length > 0 && (
              <Fragment>
                {docbuildersForOrg.map((_d) => {
                  let DocbuilderIcon = DocbuilderUtils.menuItemIcon(_d);
                  return (
                    <ListItem
                      key={_d.machine_name}
                      button
                      component={NavLink}
                      to={`/app/account/organizations/${activeOrg.id}/builder/${_d.slug}`}
                      sx={{ ...sxListItemLevel2 }}
                      style={(isActive) => (isActive ? sxActiveLink : {})}
                    >
                      <ListItemIcon sx={{ ...sxListItemIcon }}>
                        <DocbuilderIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        disableTypography
                        sx={{ ...sxListItemText }}
                        primary={_d.name}
                      />
                    </ListItem>
                  );
                })}
              </Fragment>
            )}

            {userCanViewTeam && (
              <ListItem
                button
                component={NavLink}
                to={`/app/account/organizations/${activeOrg.id}/team`}
                sx={{ ...sxListItemLevel2 }}
                style={(isActive) => (isActive ? sxActiveLink : {})}
              >
                <ListItemIcon sx={{ ...sxListItemIcon }}>
                  <SupervisorAccount color="primary" />
                </ListItemIcon>
                <ListItemText disableTypography sx={{ ...sxListItemText }} primary="Team" />
              </ListItem>
            )}
          </List>
        </Collapse>
      </Fragment>
    </Fragment>
  );
}

OrganizationSubmenu.propTypes = {
  activeOrg: PropTypes.shape(organizationShape).isRequired, // avail sets not required (but recommended)
  expanded: PropTypes.bool,
  expandedSets: PropTypes.bool,
  toggleExpanded: PropTypes.func.isRequired,
  toggleExpandedSets: PropTypes.func.isRequired,
  userCanViewActionPlan: PropTypes.bool,
  userCanViewAssessment: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
  userCanViewTeam: PropTypes.bool,
};

export default OrganizationSubmenu;
