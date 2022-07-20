import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import InviteTeamMemberCta from "components/views/InviteTeamMemberCta";
import styleVars from "style/_vars.scss";

/**
 * Team member account box, used in Organization Overview page
 */
export default function AccountOrganizationTeamMembers({
  organization,
  qtyTeamMembers,
  userCanInviteOrgUsers,
  userCanViewOrgUsers,
}) {
  const classes = useStyles();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const organizationTypes = useSelector((state) => state.app_meta.data.organizationTypes);
  const [orgType, setOrgType] = useState(null);

  const showTeamLink = () => {
    return !userCanInviteOrgUsers && userCanViewOrgUsers;
  };

  const teamLinkText = () => {
    if (qtyTeamMembers === 1) {
      return "Build your team";
    }

    return "View Team";
  };

  const teamLabel = () => {
    if (qtyTeamMembers === 1) {
      return "Team Member";
    }

    return "Team Members";
  };

  useEffect(() => {
    let newOrgType = null;
    if (organization) {
      let orgTypeId = get(organization, "organization_type_id", null);
      if (orgTypeId && organizationTypes) {
        newOrgType = get(organizationTypes, orgTypeId, null);
      }
    }
    setOrgType(newOrgType);
  }, [organization, organizationTypes]);

  return (
    <div className={classes.teamBlockContainer}>
      <div className={classes.statusContainer} style={{ flex: "0 1 100%" }}>
        <div className={classes.statusValue}>
          {userCanViewOrgUsers && (
            <React.Fragment>
              <Link to={`/app/account/organizations/${organization.id}/team`}>
                {qtyTeamMembers}
              </Link>
            </React.Fragment>
          )}
          {!userCanViewOrgUsers && <React.Fragment>{qtyTeamMembers}</React.Fragment>}
        </div>
        <div className={classes.statusLabel}>{teamLabel()}</div>

        <div className={classes.statusLinkWrapper}>
          {userCanInviteOrgUsers && (
            <InviteTeamMemberCta
              currentUser={currentUser}
              organization={organization}
              orgTypesData={organizationTypes}
            />
          )}
          {showTeamLink() && (
            <Link
              className={classes.statusLink}
              to={`/app/account/organizations/${organization.id}/team`}
            >
              {teamLinkText()}
            </Link>
          )}
        </div>
      </div>
      <div className={classes.teamMemberBlurb}>
        {orgType && (
          <React.Fragment>
            Invite members to join your team! {orgType.name_plural} with teams are more likely to
            collaborate, prioritize, and implement sustainable improvements.
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  statusContainer: {
    textAlign: "center",
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statusValue: {
    color: theme.palette.primary.main,
    fontSize: "3.2rem",
  },
  statusLabel: {
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  statusLinkWrapper: {
    marginTop: theme.spacing(1),
  },
}));

AccountOrganizationTeamMembers.propTypes = {
  organization: PropTypes.object,
  qtyTeamMembers: PropTypes.number,
  userCanInviteOrgUsers: PropTypes.bool,
  userCanViewOrgUsers: PropTypes.bool,
};
