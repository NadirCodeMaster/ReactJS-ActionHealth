import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

//
// Block for Docbuilder modals sidebars.
// -------------------------------------
// These should placed as top-level children of ./SecondaryWrapper.
//

export default function SecondaryBlock({ title, children }) {
  const classes = useStyles();

  return (
    <div className={classes.block}>
      {title && <div className={classes.title}>{title}</div>}
      <div className={classes.content}>{children}</div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  block: {
    borderLeft: `2px solid ${styleVars.colorLightGray}`,
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2.5),
  },
  title: {
    color: styleVars.txtColorH3,
    fontSize: styleVars.txtFontSizeH3,
    fontWeight: styleVars.txtFontWeightH3,
    marginBottom: theme.spacing(0.5),
    textTransform: styleVars.txtTextTransformH3,
  },
  content: {
    // Only expecting logo and similar images, so we're
    // applying some basic styles to help them sit well.
    "& img": {
      margin: "0.25em 0",
      maxWidth: "54%",
    },
  },
}));

SecondaryBlock.propTypes = {
  title: PropTypes.string,
  content: PropTypes.node,
};
