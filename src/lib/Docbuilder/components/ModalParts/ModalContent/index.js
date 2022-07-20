import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";

//
// Content wrapper for Docbuilder modals.
// --------------------------------------
// This component should be placed adjacent to an instance of
// `../ModalHeader/ModalHeader.js` for correct rendering. The expected
// usage is for ModalHeader and ModalContent to be the entirety of the
// JSX used in a given modal.
//
// Components used as children of this component should be limited to:
//
// - `./PrimaryWrapper.js`
// - `./SecondaryWrapper.js`
// - `./TertiaryWrapper.js`
//

export default function ModalContent({ children }) {
  const classes = useStyles();

  return <div className={classes.modalContent}>{children}</div>;
}

const minBpForHorizontalLayout = "md";

const useStyles = makeStyles((theme) => ({
  modalContent: {
    padding: theme.spacing(3, 2, 2, 2),
    [theme.breakpoints.up(minBpForHorizontalLayout)]: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      padding: theme.spacing(4, 2, 3, 2),
    },
    "& .docbuilder-modal-primary-content-wrapper": {
      // Primary content. @see ./PrimaryWrapper.js
      marginBottom: theme.spacing(4),
      [theme.breakpoints.up(minBpForHorizontalLayout)]: {
        flex: "0 0 60%",
        marginBottom: 0,
        paddingRight: theme.spacing(6.75),
      },
    },
    "& .docbuilder-modal-secondary-content-wrapper": {
      // Secondary content. @see ./SecondaryWrapper.js
      marginBottom: theme.spacing(2),
      [theme.breakpoints.up(minBpForHorizontalLayout)]: {
        flex: "0 0 40%",
        marginBottom: 0,
      },
    },
    "& .docbuilder-modal-tertiary-content-wrapper": {
      // Secondary content. @see ./TertiaryWrapper.js
      flex: "0 0 100%",
      zIndex: 1, // fixes unclickable links in tertiary
    },
  },
}));

ModalContent.propTypes = {
  children: PropTypes.node,
};
