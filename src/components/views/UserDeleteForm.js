import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withStyles } from "@mui/styles";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import hgToast from "utils/hgToast";
import ConfirmButton from "components/ui/ConfirmButton";
import { requestDeleteUser } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

const styles = (theme) => ({
  deleteForeverIcon: {
    marginRight: theme.spacing(),
  },
});

class UserDeleteForm extends Component {
  constructor(props) {
    super(props);

    // We'll set this to true in ComponentWillUnmount() so we can
    // check it when running async operations.
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = false;
  }
  static propTypes = {
    subjectUserId: PropTypes.number.isRequired,
    currentUser: PropTypes.shape(currentUserShape),
    destinationUrl: PropTypes.string,
  };

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  deleteUser = () => {
    const { destinationUrl, history, subjectUserId } = this.props;
    const { isCancelled } = this.state;
    requestDeleteUser(subjectUserId)
      .then((res) => {
        // SUCCESS
        if (!isCancelled) {
          history.push(destinationUrl);
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred while attempting to delete this user.", "error");
      });
  };

  render() {
    const { classes, currentUser, subjectUserId } = this.props;

    // 1) Only admins can delete users.
    // 2) Users cannot delete themselves.
    if (!currentUser.isAdmin || parseInt(currentUser.data.id, 10) === parseInt(subjectUserId, 10)) {
      return null;
    }

    return (
      <React.Fragment>
        <ConfirmButton
          color="primary"
          fullWidth
          onConfirm={this.deleteUser}
          title="Are you sure you want to delete this user?"
          variant="contained"
        >
          <DeleteForeverIcon className={classes.deleteForeverIcon} />
          Delete user
        </ConfirmButton>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(UserDeleteForm));
