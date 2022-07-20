import React from "react";
import PropTypes from "prop-types";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import { get } from "lodash";
import InviteTeamMemberCta from "components/views/InviteTeamMemberCta";
import inviteTeamMemberIcon from "images/invite_team_member.svg";
import guideIcon from "images/guide.svg";
import glossaryIcon from "images/glossary.svg";
import viewReportIcon from "images/view_report.svg";
import actionPlanIcon from "images/action_plan.svg";
import styleVars from "style/_vars.scss";

/**
 * Other Steps box
 */

export default function OtherStepsBox({ assessment, userCanInvite, organization, orgTypesData }) {
  const classes = useStyles();
  const theme = useTheme();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const _setDownloadUrl = get(assessment, "download_url", null);

  return (
    <div className={classes.otherStepsContainer}>
      <h3 className={classes.otherStepsH3}>Other Steps</h3>
      <List classes={{ root: classes.listRoot }} component="nav">
        <ListItem
          button
          component={Link}
          to={`/app/account/organizations/${organization.id}/plan`}
          classes={{ root: classes.listItemTextContainer }}
        >
          <ListItemIcon>
            <img alt="" src={actionPlanIcon} />
          </ListItemIcon>
          <ListItemText
            primary="Go to Action Plan"
            className={classes.listItemText}
            disableTypography
          />
        </ListItem>

        {_setDownloadUrl && (
          <ListItem
            button
            component="a"
            href={_setDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            classes={{ root: classes.listItemTextContainer }}
          >
            <ListItemIcon>
              <img alt="" src={guideIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Download Guide"
              className={classes.listItemText}
              disableTypography
            />
          </ListItem>
        )}

        <ListItem
          button
          component={Link}
          to={`/app/programs/${assessment.program_id}/organizations/${organization.id}/sets/${assessment.id}/glossary`}
          classes={{ root: classes.listItemTextContainer }}
        >
          <ListItemIcon>
            <img alt="" src={glossaryIcon} />
          </ListItemIcon>
          <ListItemText
            primary="Explore Glossary"
            className={classes.listItemText}
            disableTypography
          />
        </ListItem>

        <ListItem
          button
          component={Link}
          to={`/app/programs/${assessment.program_id}/organizations/${organization.id}/sets/${assessment.id}/report`}
          classes={{ root: classes.listItemTextContainer }}
        >
          <ListItemIcon>
            <img alt="" src={viewReportIcon} />
          </ListItemIcon>
          <ListItemText primary="View Report" className={classes.listItemText} disableTypography />
        </ListItem>
        <InviteTeamMemberCta
          currentUser={currentUser}
          organization={organization}
          orgTypesData={orgTypesData}
          asListItem={true}
          customImageIcon={inviteTeamMemberIcon}
          customText="Invite a Team Member"
          customListItemStyle={{ padding: theme.spacing(0, 3, 0, 3) }}
        />
      </List>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  listRoot: {
    padding: 0,
  },
  listItemTextContainer: {
    padding: theme.spacing(0, 3, 0, 3),
    color: styleVars.txtColorLink,
  },
  listItemText: {
    color: styleVars.txtColorLink,
  },
  otherStepsH3: {
    marginBottom: theme.spacing(0.5),
    paddingLeft: styleVars.paperPadding,
    paddingRight: styleVars.paperPadding,
  },
}));

OtherStepsBox.propTypes = {
  assessment: PropTypes.object,
  userCanInvite: PropTypes.bool,
  organization: PropTypes.object,
  orgTypesData: PropTypes.object,
};
