import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import InviteTeamMemberCta from "components/views/InviteTeamMemberCta";
import PendingUsers from "components/views/PendingOrganizationUsersForOrganization";
import generateTitle from "utils/generateTitle";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Display pending user requests for org.
 */
class Pending extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationTypes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      approveAccessChecked: false,
      userCanApprove: false,
      inviteAccessChecked: false,
      userCanInvite: false,
    };
  }

  componentDidMount() {
    const { organization } = this.props;
    this.checkAccess(organization);
    generateTitle(`Pending Requests for ${organization.name}`);
  }

  componentDidUpdate(prevProps, prevState) {
    const { organization: prevOrganization } = prevProps;
    const { organization } = this.props;

    if (organization.id !== prevOrganization.id) {
      this.checkAccess(organization);
      generateTitle(`Pending Requests for ${organization.name}`);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Perform org access checks required by this component.
   *
   * @param {Object} org Organization object to check for.
   */
  checkAccess(org) {
    const { currentUser } = this.props;

    let userCanApprove = userCan(currentUser, org, "approve_organization_user");
    let userCanInvite = userCan(currentUser, org, "invite_team_member");

    if (!this.isCancelled) {
      this.setState({
        approveAccessChecked: true,
        inviteAccessChecked: true,
        userCanApprove,
        userCanInvite,
      });
    }
  }

  render() {
    const { organizationTypes, currentUser, organization } = this.props;
    const { inviteAccessChecked, approveAccessChecked, userCanInvite, userCanApprove } = this.state;

    if (!inviteAccessChecked || !approveAccessChecked) {
      return <CircularProgressGlobal />;
    }

    if (!userCanApprove) {
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
          <Breadcrumb path={`/app/account/organizations/${organization.id}/pending`}>
            Pending Users
          </Breadcrumb>
        </Breadcrumbs>

        <h1>Pending Users for {organization.name}</h1>
        <p>
          Users listed below have requested to join {organization.name} but are awaiting approval.
        </p>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} md={8}>
            <Paper>
              <PendingUsers organizationId={organization.id} />
            </Paper>
          </Grid>

          {userCanInvite && (
            <Grid item xs={12} md={4}>
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
)(withStyles(styles, { withTheme: true })(Pending));
