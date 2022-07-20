import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@mui/styles";

//
// Sidebar for Docbuilder modals.
// ------------------------------
//

export default function SecondaryWrapper({ children }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.secondaryWrapper, "docbuilder-modal-secondary-content-wrapper")}>
      {children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  secondaryWrapper: {},
}));

SecondaryWrapper.propTypes = {
  children: PropTypes.node,
};
