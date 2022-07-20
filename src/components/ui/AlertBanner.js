import React, { Component } from "react";
import PropTypes from "prop-types";
import DynamicContent from "components/ui/DynamicContent";
import ErrorIcon from "@mui/icons-material/ErrorOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { withStyles } from "@mui/styles";

class AlertBanner extends Component {
  static propTypes = {
    classes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      closed: false,
    };
  }

  onClose = () => {
    this.setState({ closed: true });
  };

  render() {
    const { classes } = this.props;
    const { closed } = this.state;

    return (
      <React.Fragment>
        <div
          className={closed ? classes.alertBannerContainerHide : classes.alertBannerContainerShow}
        >
          <div className={classes.alertBannerIcon}>
            <ErrorIcon />
          </div>
          <div className={classes.alertBannerText}>
            <DynamicContent machineName="sitewide_alert" />
          </div>
          <div className={classes.alertBannerClose}>
            <IconButton aria-label="Close" color="inherit" onClick={this.onClose} size="small">
              <CloseIcon className={classes.alertBannerCloseIcon} />
            </IconButton>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  alertBannerContainerHide: {
    display: "none",
  },
  alertBannerContainerShow: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2.5),
    display: "flex",
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  alertBannerIcon: {
    marginRight: theme.spacing(1.5),
  },
  alertBannerText: {
    "& a": {
      color: theme.palette.primary.contrastText,
      textDecoration: "underline",
    },
  },
  alertBannerClose: {
    marginLeft: "auto",
  },
  alertBannerCloseIcon: {},
});

export default withStyles(styles, { withTheme: true })(AlertBanner);
