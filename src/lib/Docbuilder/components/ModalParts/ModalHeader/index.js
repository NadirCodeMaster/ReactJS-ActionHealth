import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

//
// Header for Docbuilder modals.
// -----------------------------
// This component should be placed adjacent to an instance of
// `../ModalContent/ModalContent.js` for correct rendering. The expected
// usage is for ModalHeader and ModalContent to be the entirety of the
// JSX used in a given modal.
//
// Only the following components should be used as direct children:
//
// - `./Column.js`
// - `./Divider.js`
//
// The `Column.js` component is intended to wrap any custom markup/JSX
// that will be placed in a ModalHeader. `Divider.js` provides a vertical
// divider to use as needed.
//

export default function ModalHeader({ children, idForHeader }) {
  const classes = useStyles();

  return (
    <header id={idForHeader} className={classes.modalHeader}>
      {children}
    </header>
  );
}

const useStyles = makeStyles((theme) => ({
  modalHeader: {
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    display: "flex",
  },
}));

ModalHeader.propTypes = {
  children: PropTypes.node,
  idForHeader: PropTypes.string.isRequired,
};
