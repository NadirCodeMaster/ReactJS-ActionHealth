import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import UserProfileForm from "components/views/UserProfileForm";
import UserDeleteForm from "components/views/UserDeleteForm";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import { requestUser } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({});

class UserDetail extends Component {
  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;

    this.state = {
      subjectUserLoading: false,
      subjectUser: null,
      subjectUserOrganizationsLoading: false,
      subjectUserOrganizations: null,
    };
  }

  static propTypes = {
    subjectUserId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  /**
   * Load up the subject user and add them to component state.
   */
  getUser = (id) => {
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
    const { subjectUserId } = this.props;
    this.getUser(subjectUserId);
    generateTitle(`User ${subjectUserId}`);
  }

  componentDidUpdate(prevProps) {
    const { subjectUserId: prevSubjectUserId } = prevProps;
    const { subjectUserId } = this.props;
    if (subjectUserId !== prevSubjectUserId) {
      this.getUser(subjectUserId);
    }
    generateTitle(`User ${subjectUserId}`);
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  render() {
    const { subjectUserId } = this.props;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/users" root>
            User Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/users/${subjectUserId}`}>{subjectUserId}</Breadcrumb>
        </Breadcrumbs>

        <h1>
          User Detail (#
          {subjectUserId})
        </h1>
        <p>
          Manage{" "}
          <Link to={`/app/admin/users/${subjectUserId}/organizations`}>
            associated organizations
          </Link>
          &raquo;
        </p>

        <Paper style={{ padding: styleVars.paperPadding }}>
          <UserProfileForm adminMode={true} subjectUserId={subjectUserId} />
        </Paper>

        <br />
        <br />
        <Grid container direction="row" justifyContent="flex-end">
          <Grid item xs={12} sm={4}>
            <UserDeleteForm subjectUserId={subjectUserId} destinationUrl="/app/admin/users" />
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
)(withStyles(styles, { withTheme: true })(UserDetail));
