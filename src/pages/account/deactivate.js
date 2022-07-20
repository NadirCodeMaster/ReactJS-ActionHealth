import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";
import { deactivateAccount } from "store/actions";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class Deactivate extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape),
  };

  deactivate = () => {
    this.props.deactivateAccount();
  };

  componentDidMount() {
    generateTitle("Deactivate");
  }

  render() {
    const { classes, currentUser } = this.props;

    if ((!currentUser || !currentUser.isAuthenticated) && !currentUser.loading) {
      return <Redirect to="/app/account/login" />;
    }

    return (
      <Paper className={classes.paper}>
        <div className={classes.content}>
          <h1>Deactivate your account</h1>
          <p>Are you sure you want to deactivate your account?</p>
          <p>You can reactivate at any time.</p>

          <ConfirmButton
            fullWidth
            className={classes.submitButton}
            variant="contained"
            color="primary"
            onConfirm={this.deactivate}
            title="Are you sure you want to deactivate your account with Healthier Generation?"
          >
            Deactivate my account
          </ConfirmButton>
        </div>
      </Paper>
    );
  }
}

const styles = (theme) => ({
  content: {
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "410px",
  },
  paper: {
    marginLeft: "auto",
    marginRight: "auto",
    padding: styleVars.paperPadding,
    textAlign: "center",
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
});

export default connect(
  ({ auth, programs }) => ({
    currentUser: auth.currentUser,
    programs,
  }),
  { deactivateAccount }
)(withStyles(styles, { withTheme: true })(Deactivate));
