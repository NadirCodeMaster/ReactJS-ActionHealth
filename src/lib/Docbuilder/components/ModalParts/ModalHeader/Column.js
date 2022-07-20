import React from "react";
import { makeStyles } from "@mui/styles";

//
// Column component to use as direct child of ./ModalHeader.
// ---------------------------------------------------------
// All elements used in a ModalHeader component should be wrapped in
// an instance of this component. Since it defines a single column,
// you'll put multiple items inside an instance when you want those
// items stacked vertically.
//

export default function Column({ children, style = {} }) {
  const classes = useStyles();

  return (
    <div style={{ ...style }} className={classes.col}>
      {children}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  col: {
    alignItems: "center",
    display: "inline-flex",
    flexGrow: 0, // override via style prop as needed
    padding: theme.spacing(0.5, 3, 0.5, 2),
    position: "relative",
  },
}));
