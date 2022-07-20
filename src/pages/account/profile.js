import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { isNil } from "lodash";
import { Button, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import LockIcon from "@mui/icons-material/Lock";
import UserProfileForm from "components/views/UserProfileForm";
import ChangeOwnPasswordForm from "components/views/ChangeOwnPasswordForm";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class Profile extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      passwordFormIsOpen: false,
    };
  }

  onPasswordFormClosed = () => {
    this.setState({ passwordFormIsOpen: false });
  };

  openPasswordForm = () => {
    this.setState({ passwordFormIsOpen: true });
  };

  componentDidMount() {
    generateTitle("Profile");
  }

  componentDidUpdate() {
    generateTitle("Profile");
  }

  render() {
    const { classes, currentUser } = this.props;

    if (isNil(currentUser.data) || currentUser.loading) {
      return <CircularProgressGlobal />;
    }
    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path="/app/account/profile">Profile</Breadcrumb>
        </Breadcrumbs>

        <div className={classes.wrapper}>
          <h1>Profile</h1>

          <Paper style={{ padding: styleVars.paperPadding }}>
            <UserProfileForm subjectUserId={currentUser.data.id} />
          </Paper>
          <br />
          <Paper style={{ padding: styleVars.paperPadding }}>
            <Button color="primary" fullWidth onClick={this.openPasswordForm}>
              <LockIcon fontSize="small" sx={{ marginRight: 1 }} />
              Change account password
            </Button>
          </Paper>

          <div className={classes.deactivateWrapper}>
            <small>
              <Link className="muted_link" to="/app/account/deactivate">
                Deactivate Account
              </Link>
            </small>
          </div>

          <ChangeOwnPasswordForm
            onClose={this.onPasswordFormClosed}
            isOpen={this.state.passwordFormIsOpen}
            currentUser={currentUser}
          />
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  wrapper: {
    margin: "0 auto",
  },
  deactivateWrapper: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
});

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
)(withStyles(styles, { withTheme: true })(Profile));
