import React from "react";
import { useSelector } from "react-redux";
import { Grid, Paper } from "@mui/material";
import UserOrganization from "components/views/UserOrganization";
import styleVars from "style/_vars.scss";

/**
 * User/organization tab content.
 */
function AccountOrganizationRelationship({ organization, userIsDirectlyAssociated }) {
  const currentUser = useSelector((state) => state.auth.currentUser);

  return (
    <React.Fragment>
      <Grid container spacing={Number(styleVars.gridSpacing)}>
        {userIsDirectlyAssociated && (
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <UserOrganization organization={organization} subjectUser={currentUser.data} />
            </Paper>
          </Grid>
        )}
      </Grid>
    </React.Fragment>
  );
}

export default AccountOrganizationRelationship;
