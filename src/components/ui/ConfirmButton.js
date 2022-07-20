import React from "react";
import PropTypes from "prop-types";
import { omit } from "lodash";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { withStyles } from "@mui/styles";

const styles = (theme) => ({});

class ConfirmButton extends React.Component {
  static propTypes = {
    confirmText: PropTypes.string,
    title: PropTypes.string,
    // others are spread to <Button>
  };

  static defaultProps = {
    confirmText: "Yes I'm sure",
  };

  state = {
    open: false,
  };

  onOpen = () => {
    this.setState({ open: true });
  };

  onClose = () => {
    this.setState({ open: false });
  };

  onConfirm = () => {
    const { onConfirm } = this.props;

    onConfirm();
    this.onClose();
  };

  render() {
    const { children, title, confirmText, ...buttonProps } = this.props;
    const { open } = this.state;

    // Remove irrelevant props to prevent warnings and unnecessary
    // weirdness when buttonProps is spread on <Button>.
    let filteredButtonProps = omit(buttonProps, ["onConfirm", "theme"]);

    return (
      <React.Fragment>
        <Button onClick={this.onOpen} {...filteredButtonProps}>
          {children}
        </Button>
        <Dialog open={open} onClose={this.onClose} aria-labelledby="confirm-dialog-title">
          <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
          <DialogActions>
            <Button onClick={this.onClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={this.onConfirm} color="primary" variant="contained" autoFocus>
              {confirmText}
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ConfirmButton);
