import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import clsx from "clsx";

//
// Primary content column for Docbuilder modals.
// ---------------------------------------------
//

export default function PrimaryWrapper({ children }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.primaryWrapper, "docbuilder-modal-primary-content-wrapper")}>
      {children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  primaryWrapper: {},
}));

PrimaryWrapper.propTypes = {
  children: PropTypes.node,
};
