import React, { Component } from "react";
import UserProfileForm from "components/views/UserProfileForm";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

class UserNew extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
  };

  componentDidMount() {
    generateTitle("New User");
  }

  componentDidUpdate() {
    generateTitle("New User");
  }

  render() {
    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/users" root>
            User Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/users/new`}>New User</Breadcrumb>
        </Breadcrumbs>

        <h1>New User</h1>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <UserProfileForm />
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(UserNew);
