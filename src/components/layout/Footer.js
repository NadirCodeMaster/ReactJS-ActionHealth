import React from "react";
import moment from "moment";

import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

const styles = (theme) => ({
  footer: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  tagLine: {
    fontSize: 12,
    fontWeight: styleVars.txtFontWeightDefaultSemibold,
    paddingBottom: theme.spacing(),
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: theme.spacing(),
  },
  tagLineLine: {
    display: "block",
    [theme.breakpoints.up("sm")]: {
      display: "inline",
    },
  },
  copyright: {
    fontSize: 11,
  },
  finePrint: {
    fontSize: 11,
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
});

export default withStyles(styles, { withTheme: true })(({ classes }) => (
  <footer className={classes.footer}>
    <div className={classes.tagLine}>
      <span className={classes.tagLineLine}>Every mind, every body, every young person</span>
      <span className={classes.tagLineLine}> healthy and ready to succeed </span>
    </div>
    <div className={classes.copyright}>
      &copy; {moment().year()} Alliance for a Healthier Generation
    </div>
    <div className={classes.finePrint}>
      <a className={classes.link} href="https://www.healthiergeneration.org/privacy-policy">
        Privacy Policy
      </a>
      &nbsp; | &nbsp;
      <a className={classes.link} href="https://www.healthiergeneration.org/terms-of-use">
        Terms of Use
      </a>
    </div>
  </footer>
));
