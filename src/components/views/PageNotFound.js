import React, { Component } from "react";
import { withStyles } from "@mui/styles";

const styles = (theme) => ({});

class PageNotFound extends Component {
  render() {
    return (
      <React.Fragment>
        <h1>Page not found.</h1>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PageNotFound);
