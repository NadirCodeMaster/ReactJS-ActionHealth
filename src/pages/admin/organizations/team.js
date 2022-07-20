import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import OrganizationTeam from "components/views/OrganizationTeam";
import { Paper } from "@mui/material";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestOrganization } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

const styles = (theme) => ({});

/**
 * Admin display of users associated with an org.
 *
 * These are not stored in redux.
 */
class Team extends Component {
  static propTypes = {
    // -- Via caller
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationId: PropTypes.number.isRequired,
    programs: PropTypes.object.isRequired,
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
    generateTitle(`Organization ${organizationId} Team`);
  }

  componentDidUpdate(prevProps) {
    const { organizationId: prevOrganizationId } = prevProps;
    const { organizationId } = this.props;

    if (organizationId !== prevOrganizationId) {
      this.getOrganization();
    }
    generateTitle(`Organization ${organizationId} Team`);
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
          <Breadcrumb path={`/app/admin/organizations/${organization.id}/team`}>Team</Breadcrumb>
        </Breadcrumbs>
        <h1>{organization.name} Team</h1>
        <Paper>
          <OrganizationTeam organization={organization} />
        </Paper>
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
)(withStyles(styles, { withTheme: true })(Team));
