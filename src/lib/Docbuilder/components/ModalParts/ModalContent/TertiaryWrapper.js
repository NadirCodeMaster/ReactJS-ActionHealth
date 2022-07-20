import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

//
// Bottom row for Docbuilder modals.
// ---------------------------------
//

export default function TertiaryWrapper({ children }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.secondaryWrapper, "docbuilder-modal-tertiary-content-wrapper")}>
      {children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  tertiaryWrapper: {},
}));

TertiaryWrapper.propTypes = {
  children: PropTypes.node,
};
