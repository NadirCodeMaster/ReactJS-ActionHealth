import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, isNil } from "lodash";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import UserOrganization from "components/views/UserOrganization";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestUserOrganizations, requestUser } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

class UserOrganizationPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      organizationLoading: false,
      organization: null,
      subjectUserLoading: false,
      subjectUser: null,
    };
  }

  static propTypes = {
    organizationId: PropTypes.number.isRequired,
    subjectUserId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  /**
   * Load up the organization w/pivot and add them to component state.
   */
  populateOrganization = () => {
    const { organizationId, subjectUserId } = this.props;

    this.setState({ organizationLoading: true });

    // Note: we're intentionally _not_ filtering out
    // orgs where user is not yet approved.
    requestUserOrganizations(subjectUserId, {
      organization_id: organizationId,
      per_page: 1,
    })
      .then((res) => {
        if (!this.isCancelled) {
          if (isNil(res.data.data[0])) {
            // not found.
            console.error("user/org relationship not found");
            this.setState({ organizationLoading: false });
          } else {
            let org = res.data.data[0];

            let updatedStateVals = {
              organizationLoading: false,
              organization: org,
            };
            this.setState(updatedStateVals);
          }
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ organizationLoading: false });
        }
      });
  };

  /**
   * Load up the subject user and add them to component state.
   *
   * Does not load any user/org pivot data.
   */
  populateSubjectUser = () => {
    const { subjectUserId } = this.props;

    this.setState({ subjectUserLoading: true });

    requestUser(subjectUserId)
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            subjectUserLoading: false,
            subjectUser: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ subjectUserLoading: false });
        }
      });
  };

  componentDidMount() {
    const { organizationId, subjectUserId } = this.props;
    this.populateOrganization();
    this.populateSubjectUser();
    generateTitle(`User ${subjectUserId} / Org. ${organizationId} Relationship`);
  }

  componentDidUpdate(prevProps) {
    const { organizationId: prevOrganizationId, subjectUserId: prevSubjectUserId } = prevProps;
    const { organizationId, subjectUserId } = this.props;

    // If userId changed, reload everything.
    if (subjectUserId !== prevSubjectUserId) {
      this.populateOrganization();
      this.populateSubjectUser();
    }
    // If only the organizationId changed, just call that loader
    // (it also provides the user-specific pivot data we need).
    else if (organizationId !== prevOrganizationId) {
      this.populateOrganization();
    }

    generateTitle(`User ${subjectUserId} / Org. ${organizationId} Relationship`);
  }

  render() {
    const { organizationId, subjectUserId } = this.props;
    const { subjectUserLoading, subjectUser, organizationLoading, organization } = this.state;

    if (isNil(subjectUser) || isNil(organization) || subjectUserLoading || organizationLoading) {
      return <CircularProgressGlobal />;
    }

    let nameFirst = get(subjectUser, "name_first", "");
    let nameLast = get(subjectUser, "name_last", "");

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/users" root>
            User Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/users/${subjectUserId}`}>{subjectUserId}</Breadcrumb>
          <Breadcrumb path={`/app/admin/users/${subjectUserId}/organizations`}>
            Organizations
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/users/${subjectUserId}/organizations/${organizationId}`}>
            {organization.name}
          </Breadcrumb>
        </Breadcrumbs>

        <h1>User / Organization Relationship</h1>
        <p>
          For{" "}
          <Link to={`/app/admin/users/${subjectUserId}`}>
            {nameFirst} {nameLast}
          </Link>{" "}
          and <Link to={`/app/admin/organizations/${organizationId}`}>{organization.name}</Link>
        </p>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <UserOrganization adminMode organization={organization} subjectUser={subjectUser} />
            </Paper>
          </Grid>
        </Grid>
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

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(UserOrganizationPage));
