import React, { Component } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import SuccessIcon from "@mui/icons-material/CheckCircle";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

/**
 * Standardized "alerts".
 *
 * This may eventually be replaced with the MUI Alert component, but
 * we're waiting until that is stabilized and included in MUI Core.
 * (as of right now, it's part of MUI Labs)
 *
 * Use the "action" prop to include a close button (or similar). Include
 * your own event handler on it.
 *
 * Message can contain JSX and HTML.
 */
class HgAlert extends Component {
  static propTypes = {
    severity: PropTypes.oneOf(["success", "warning", "error", "info"]).isRequired,
    message: PropTypes.node.isRequired,
    role: PropTypes.string, // ARIA role attribute
    title: PropTypes.string,
    includeIcon: PropTypes.bool,
    action: PropTypes.node,
    compactLayout: PropTypes.bool, // smaller
  };

  static defaultProps = {
    compactLayout: false,
    role: "alert",
  };

  render() {
    const { action, compactLayout, classes, includeIcon, message, role, title, severity } =
      this.props;

    const SeverityIcon = severityIcons[severity];

    let wrapperClasses = [
      "hgalert-wrapper",
      classes.hgAlertWrapper,
      classes["hgAlertWrapper_" + severity],
    ];

    if (compactLayout) {
      wrapperClasses.push(classes.hgAlertWrapperCompact);
    }

    // Note: CSS classes not based in JS are included
    // below so we can apply IE hacks in App.scss.
    // Don't use them for applying other styles; use
    // our JS-based styles for that.

    return (
      <div role={role} className={clsx(wrapperClasses)}>
        <React.Fragment>
          {includeIcon && (
            <div className={clsx("hgalert-icon-wrapper", classes.hgAlertIconWrapper)}>
              <SeverityIcon
                className={clsx(
                  "hgalert-icon",
                  classes.hgAlertIcon,
                  classes["hgAlertIcon_" + severity]
                )}
                aria-label={severity}
              />
            </div>
          )}
        </React.Fragment>
        <div className={clsx("hgalert-text", classes.hgAlertText)}>
          <React.Fragment>
            {title && <div className={clsx("hgalert-title", classes.hgAlertTitle)}>{title}</div>}
          </React.Fragment>
          <div className={clsx("hgalert-message", classes.hgAlertMessage)}>{message}</div>
        </div>
        <React.Fragment>
          {action && (
            <div className={clsx("hgalert-action-wrapper", classes.hgAlertActionWrapper)}>
              {action}
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}

const severityIcons = {
  success: SuccessIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const styles = (theme) => ({
  // Outer wrapper.
  hgAlertWrapper: {
    // Common styles for wrapper across all severities.
    borderRadius: "3px",
    borderStyle: "solid",
    borderWidth: "2px",
    display: "flex",
    fontFamily: styleVars.txtFontFamilyDefault,
    padding: theme.spacing(1.5),
  },
  // Outer wrapper adjustments for "compact" layout.
  hgAlertWrapperCompact: {
    padding: theme.spacing(0.125, 1, 0.125, 1),
  },
  hgAlertWrapper_error: {
    // Wrapper styles for "error"
    backgroundColor: styleVars.colorStatusError,
    borderColor: styleVars.colorStatusErrorBorder,
    color: styleVars.colorStatusErrorContrast,
  },
  hgAlertWrapper_warning: {
    // Wrapper styles for "warning"
    backgroundColor: styleVars.colorStatusWarning,
    borderColor: styleVars.colorStatusWarningBorder,
    color: styleVars.colorStatusWarningContrast,
  },
  hgAlertWrapper_info: {
    // Wrapper styles for "info"
    backgroundColor: styleVars.colorStatusInfo,
    borderColor: styleVars.colorStatusInfoBorder,
    color: styleVars.colorStatusInfoContrast,
  },
  hgAlertWrapper_success: {
    // Wrapper styles for "success"
    backgroundColor: styleVars.colorStatusSuccess,
    borderColor: styleVars.colorStatusSuccessBorder,
    color: styleVars.colorStatusSuccessContrast,
  },

  // Text content (including title, message).
  hgAlertText: {
    display: "inline-flex",
    flex: "1 1 auto",
    flexDirection: "column",
    marginTop: theme.spacing(0.125),
    justifyContent: "center",
  },
  hgAlertTitle: {
    fontWeight: styleVars.txtFontWeightDefaultBold,
  },
  hgAlertMessage: {},

  // Icon (if included)
  hgAlertIconWrapper: {
    // wraps icon
    alignItems: "center",
    display: "inline-flex",
    flex: "0 0 auto",
    paddingRight: theme.spacing(2),
    textAlign: "center",
  },
  hgAlertIcon: {
    // icon itself
    // Common styles for icon across all severities.
    height: theme.spacing(2.75),
    width: theme.spacing(2.75),
    opacity: 0.9,
  },

  // Wrapper for action (if provided).
  hgAlertActionWrapper: {
    alignItems: "center",
    display: "inline-flex",
    flex: "0 0 auto",
    marginTop: theme.spacing(0.125),
    paddingLeft: theme.spacing(),
    textAlign: "center",
  },
});

export default withStyles(styles, { withTheme: true })(HgAlert);
