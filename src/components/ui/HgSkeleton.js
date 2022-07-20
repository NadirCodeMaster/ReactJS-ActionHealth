import React from "react";
import Skeleton from "@mui/material/Skeleton";

/**
 * HG-customized version of MUI's Skeleton
 * https://material-ui.com/components/skeleton/
 *
 * Primary purpose is to ensure animation prop is consistant
 * throughout the application.
 *
 * Commmon props:
 *  - variant: 'rect', 'circle', 'text'
 *  - width: '40' (40px) or '40%' (40 percent)
 *  - height: '40' (40px) or '40%' (40 percent)
 */
function HgSkeleton({ ...props }) {
  return <Skeleton animation="wave" {...props} />;
}

export default HgSkeleton;
