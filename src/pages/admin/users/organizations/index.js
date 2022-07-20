import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, isNil } from "lodash";
import UserAddToOrganizationForm from "components/views/UserAddToOrganizationForm.js";
import UserOrganizationsPaginatedTable from "components/views/UserOrganizationsPaginatedTable.js";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestUser } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

/**
 * Display index table of organizations for a user.
 *
 * These are not stored in redux.
 */
class Organizations extends Component {
  static propTypes = {
    subjectUserId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.incrementOrgsListVersion = this.incrementOrgsListVersion.bind(this);

    this.state = {
      // Increment orgsListVersion to have
      // <UserOrganizationsPaginatedTable> reload its orgs.
      orgsListVersion: 0,
      subjectUserLoading: false,
      subjectUser: null,
    };
  }

  /**
   * Load up the subject user and add them to component state.
   */
  populateUser = () => {
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

  /**
   * Increment version prop used for UserOrganizationsPaginatedTable.
   */
  incrementOrgsListVersion = () => {
    const { orgsListVersion } = this.state;

    this.setState({
      orgsListVersion: orgsListVersion + 1,
    });
  };

  componentDidMount() {
    const { subjectUserId } = this.props;
    this.populateUser();
    generateTitle(`User ${subjectUserId} Organizations`);
  }

  componentDidUpdate(prevProps) {
    const { subjectUserId: prevSubjectUserId } = prevProps;
    const { subjectUserId } = this.props;

    if (subjectUserId !== prevSubjectUserId) {
      this.populateUser();
    }
    generateTitle(`User ${subjectUserId} Organizations`);
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { subjectUserId } = this.props;

    const { orgsListVersion, subjectUser, subjectUserLoading } = this.state;

    if (isNil(subjectUser) || subjectUserLoading) {
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
        </Breadcrumbs>

        <h1>User Organizations</h1>
        {nameFirst && nameLast && (
          <p>
            For{" "}
            <Link to={`/app/admin/users/${subjectUserId}`}>
              {nameFirst} {nameLast}
            </Link>
          </p>
        )}
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <h3>Add this user to an Organization</h3>
              <UserAddToOrganizationForm
                subjectUser={subjectUser}
                callbackAfterAdd={this.incrementOrgsListVersion}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <UserOrganizationsPaginatedTable
              adminMode
              subjectUser={subjectUser}
              perPage={25}
              listVersion={orgsListVersion}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Organizations));
