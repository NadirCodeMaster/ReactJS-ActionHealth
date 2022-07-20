import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

// FIXME checkout https://mui.com/components/use-media-query/#migrating-from-withwidth
const withWidth = () => (WrappedComponent) => (props) => <WrappedComponent {...props} width="xs" />;

/**
 * Displays "logged out" confirmation.
 *
 * Doesn't log the user out. That's handled by `logout.js`.
 */
class LoggedOut extends Component {
  componentDidMount() {
    generateTitle(pageTitle);

    // Help prevent back button leading user back into app. This was
    // only a problem in certain circumstances, but this should prevent
    // it from being an issue at all.
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener("popstate", function (event) {
      window.history.pushState(null, document.title, window.location.href);
    });
  }

  render() {
    return (
      <div>
        <h1>{pageTitle}</h1>
        <Paper style={{ padding: styleVars.paperPadding }}>
          <p>We hope to see you again soon!</p>
        </Paper>
      </div>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

const pageTitle = "You are logged out";

export default compose(
  connect(mapStateToProps, {}),
  withStyles(styles, { withTheme: true }),
  withWidth()
)(LoggedOut);
