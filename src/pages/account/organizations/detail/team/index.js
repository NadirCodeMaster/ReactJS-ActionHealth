import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import OrganizationTeam from "components/views/OrganizationTeam";
import PageNotFound from "components/views/PageNotFound";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import InviteTeamMemberCta from "components/views/InviteTeamMemberCta";
import generateTitle from "utils/generateTitle";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Display paginated table of users associated with org.
 */
class Team extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationTypes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      viewAccessChecked: false,
      userCanView: false,
      inviteAccessChecked: false,
      userCanInvite: false,
    };
  }

  componentDidMount() {
    const { organization } = this.props;
    this.checkAccess();
    generateTitle(organization.name + " Team");
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser: prevCurrentUser, organization: prevOrganization } = prevProps;
    const { currentUser, organization } = this.props;

    if (
      !compareObjectIds(organization, prevOrganization) ||
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser)
    ) {
      this.checkAccess();
      generateTitle(organization.name + " Team");
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  /**
   * Perform org access checks required by this component.
   */
  checkAccess() {
    const { currentUser, organization } = this.props;

    let userCanView = null;
    let userCanInvite = null;

    if (currentUser.isAuthenticated && !isNil(organization)) {
      userCanView = userCan(currentUser, organization, "view_team");
      userCanInvite = userCan(currentUser, organization, "invite_team_member");
    }

    if (!this.isCancelled) {
      this.setState({
        viewAccessChecked: true,
        inviteAccessChecked: true,
        userCanView,
        userCanInvite,
      });
    }
  }

  render() {
    const { organizationTypes, currentUser, organization } = this.props;
    const { inviteAccessChecked, viewAccessChecked, userCanInvite, userCanView } = this.state;

    if (!inviteAccessChecked || !viewAccessChecked) {
      return <CircularProgressGlobal />;
    }

    if (!userCanView) {
      return <PageNotFound />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${organization.id}`}>
            {organization.name}
          </Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${organization.id}/team`}>Team</Breadcrumb>
        </Breadcrumbs>

        <h1>{organization.name} Team</h1>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          {userCanInvite && (
            <Grid item xs={12} sm={6}>
              <div className="no-print">
                <Paper style={{ padding: styleVars.paperPadding }}>
                  <div styles={{ textAlign: "center" }}>
                    <InviteTeamMemberCta
                      currentUser={currentUser}
                      organization={organization}
                      orgTypesData={organizationTypes}
                    />
                  </div>
                </Paper>
              </div>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper>
              <OrganizationTeam organization={organization} />
            </Paper>
            <br />
            <div
              style={{
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
              }}
            >
              Options for modifying and removing other users from this organization are dependent on
              your role with the organization and with Healthier Generation.
            </div>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
    organizationTypes: state.app_meta.data.organizationTypes,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Team));
