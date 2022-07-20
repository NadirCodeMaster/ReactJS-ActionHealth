import React from "react";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";

/**
 * This is fixed-position circular progress.
 *
 * Intended to provide a "globally visible" spinner regardless of where a
 * user may be scrolled to in a given display.
 *
 * This component will center the spinner on the content portion of the
 * site.  This is important because if the global menu is visible, we need
 * to accommodate for its with so our spinner centers properly.  There are
 * three scenarios, detailed in comments in our render method.
 *
 */
function CircularProgressGlobal(props) {
  const windowWidth = window.innerWidth;
  return (
    <Box
      sx={{
        left: `${windowWidth / 2 - 30}px`,
        position: "fixed",
        top: "30%",
        zIndex: "modal",
      }}
    >
      <CircularProgress {...props} />
    </Box>
  );
}

export default CircularProgressGlobal;
