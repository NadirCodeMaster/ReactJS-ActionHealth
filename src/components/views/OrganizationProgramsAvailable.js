import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { CircularProgress, List, ListItem } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestOrganizationPrograms } from "api/requests";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";

const styles = (theme) => ({});

// @TODO Restrict access if appropriate

/**
 * Basic list of Programs applicable to the Organization.
 */
class OrganizationProgramsAvailable extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    // If we've made an initial request for data from API.
    this.firstLoadRequested = false;

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    // Parameters passed to the organization sets API request.
    this.apiRequestParams = {
      per_page: 1000,
      page: 1,
    };

    this.state = {
      organizationProgramsLoading: false,
      organizationPrograms: null,
      requestMeta: null,
      userCanView: false,
    };
  }

  /**
   * Populate state.organizationPrograms.
   */
  populateOrganizationPrograms = () => {
    const { organization } = this.props;

    if (organization && organization.id) {
      this.firstLoadRequested = true;
      this.setState({
        organizationProgramsLoading: true,
      });

      requestOrganizationPrograms(organization.id, this.apiRequestParams)
        .then((res) => {
          if (!this.isCancelled) {
            // https://stackoverflow.com/a/50429904/1191154
            this.setState({
              organizationProgramsLoading: false,
              organizationPrograms: res.data.data,
              requestMeta: res.data.meta,
            });
          }
        })
        .catch((error) => {
          // ERROR
          if (!this.isCancelled) {
            this.setState({ organizationProgramsLoading: false });
            console.error("An error occurred retrieving the organization programs data.");
          }
        });
    }
  };

  componentDidMount() {
    const { currentUser, organization } = this.props;

    if (userCan(currentUser, organization, "view_assessment")) {
      this.setState({ userCanView: true });
    }
    // Initial call to populate our results.
    this.populateOrganizationPrograms();
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, organization } = this.props;
    const { currentUser: prevCurrentUser, organization: prevOrganization } = prevProps;

    // Re-check access if user or org changes.
    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      let userCanView = userCan(currentUser, organization, "view_assessment");
      this.setState({ userCanView: userCanView });
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { organizationPrograms, organizationProgramsLoading } = this.state;

    if (organizationProgramsLoading) {
      return (
        <List>
          <ListItem>
            <CircularProgress size="1em" />
          </ListItem>
        </List>
      );
    }

    if (!organizationPrograms) {
      // Code would only get to here if the API request failed.
      return null;
    }

    return (
      <React.Fragment>
        {organizationPrograms.length < 1 && (
          <List>
            <ListItem>No programs are available for this organization.</ListItem>
          </List>
        )}

        {organizationPrograms.length > 0 && (
          <List disablePadding>
            {organizationPrograms.map((prog, idx) => (
              <ListItem key={idx}>{prog.name}</ListItem>
            ))}
          </List>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    programs: state.programs,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // ...
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(OrganizationProgramsAvailable));
