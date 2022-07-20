import React from "react";
import PropTypes from "prop-types";
import { Box, Drawer } from "@mui/material";
import useIsWidthUp from "hooks/useIsWidthUp";
import styleVars from "style/_vars.scss";

function PrimaryMenuDrawer({ expandedAtMobileRes, toggle, children }) {
  let isLargerDisplay = useIsWidthUp(expandAtBp);

  return (
    <Drawer
      variant={isLargerDisplay ? "permanent" : "temporary"}
      open={isLargerDisplay || expandedAtMobileRes}
      anchor={"left"}
      onClose={toggle}
      className="no-print"
      ModalProps={{
        // Better open performance on mobile.
        // (at least in earlier versions of MUI)
        keepMounted: true,
      }}
      sx={(theme) => ({
        borderRadius: 4,
        display: {
          sm: "block",
        },
        "&.MuiDrawer-docked": {
          height: "100%",
          zIndex: theme.zIndex.appBar - 1,
        },
        "& .MuiDrawer-paper": {
          height: "100%",
          marginRight: 0,
          padding: 0,
          paddingTop: {
            [expandAtBp]: theme.spacing(7),
          },
          width: styleVars.siteSidebarMenuWidth,
          zIndex: theme.zIndex.appBar - 1,
        },
      })}
    >
      <Box component={"nav"} sx={{ marginTop: 1.5 }}>
        {children}
      </Box>
    </Drawer>
  );
}

// Breakpoint dividing small/large display differences.
const expandAtBp = "md";

PrimaryMenuDrawer.propTypes = {
  children: PropTypes.node,
  toggle: PropTypes.func.isRequired,
  expandedAtMobileRes: PropTypes.bool,
};

export default PrimaryMenuDrawer;
