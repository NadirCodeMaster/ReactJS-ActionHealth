import React, { Component } from "react";
import { CircularProgress } from "@mui/material";

/**
 * Circular progress standardized for our use in Buttons.
 *
 * Props passed to this component will pass through to
 * the actual CircularProgress, though in most cases
 * it should be ready to use as-is.
 *
 * Automatically injects whitespace before the spinner
 * so you shouldn't need to do that on your own.
 *
 * Usage example:
 * ```
 * <Button>
 *    Save
 *    {this.props.saving && (<CircularProgressForButtons />)}
 * </Button>
 * ```
 */
class CircularProgressForButtons extends Component {
  render() {
    return (
      <React.Fragment>
        {" "}
        <CircularProgress size="1em" color="secondary" {...this.props} />
      </React.Fragment>
    );
  }
}

export default CircularProgressForButtons;
