import React, { Component } from "react";
import { Link } from "react-router-dom";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

class Breadcrumb extends Component {
  render() {
    const { path, children, classes, root } = this.props;
    return (
      <div className={classes.wrapper}>
        {!root && (
          <span className={classes.separator} aria-hidden="true">
            &gt;
          </span>
        )}
        <Link to={path} style={{ minWidth: "auto" }} className={classes.link}>
          {children}
        </Link>
      </div>
    );
  }
}

const styles = (theme) => ({
  link: {
    textDecoration: "none",
    color: styleVars.siteBreadcrumbColor,
    "&:link": { color: styleVars.siteBreadcrumbColorLink },
    "&:visited": { color: styleVars.siteBreadcrumbColorLink },
    "&:hover": { color: styleVars.siteBreadcrumbColorLinkHover },
    "&:active": { color: styleVars.siteBreadcrumbColorLinkActive },
    "&:focus": { color: styleVars.siteBreadcrumbColorLinkActive },
  },
  wrapper: {
    display: "inline-block",
    fontSize: 11,
    letterSpacing: "0.5px",
    marginRight: theme.spacing(),
    maxWidth: "140px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  separator: {
    display: "inline",
    fontSize: 11,
    marginLeft: 0,
    marginRight: theme.spacing(),
    position: "relative",
    bottom: "1px",
  },
});

export default withStyles(styles, { withTheme: true })(Breadcrumb);
