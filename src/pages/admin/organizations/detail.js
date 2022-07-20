import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import OrganizationProfile from "components/views/OrganizationProfile";
import OrganizationSetActivity from "components/views/OrganizationSetActivity";
import OrganizationProgramsAvailable from "components/views/OrganizationProgramsAvailable";
import OrganizationChildren from "components/views/OrganizationChildren";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestOrganization } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

class Organization extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationId: PropTypes.number.isRequired,
    programs: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      organizationLoading: false,
      organization: null,
    };
  }

  /**
   * Retrieve the organization record from server, add to state.
   */
  getOrganization() {
    const { organizationId } = this.props;

    this.setState({ organizationLoading: true });

    requestOrganization(organizationId)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            organizationLoading: false,
            organization: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ organizationLoading: false });
          console.error("An error occurred retrieving the organization.");
        }
      });
  }

  componentDidMount() {
    const { organizationId } = this.props;
    this.getOrganization();
    generateTitle(`Organization ${organizationId}`);
  }

  componentDidUpdate(prevProps) {
    const { organizationId: prevOrganizationId } = prevProps;
    const { organizationId } = this.props;

    if (organizationId !== prevOrganizationId) {
      this.getOrganization();
    }
    generateTitle(`Organization ${organizationId}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { organization, organizationLoading } = this.state;

    if (!organization || organizationLoading) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/organizations" root>
            Organization Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/organizations/${organization.id}`}>
            {organization.name}
          </Breadcrumb>
        </Breadcrumbs>

        <h1 className="sr-only">{organization.name}</h1>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={10}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <OrganizationProfile organization={organization} adminMode />
            </Paper>
            <br />

            <h2>Activity</h2>
            <Paper>
              <OrganizationSetActivity organization={organization} />
            </Paper>
            <br />

            <h2>Available Programs</h2>
            <Paper>
              <OrganizationProgramsAvailable organization={organization} />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={10}>
            <OrganizationChildren
              adminMode={true}
              parent={organization}
              title={`Organizations in ${organization.name}`}
              titleHeaderLevel="h2"
              alwaysShow={true}
              perPage={25}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    // ...
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Organization));
