import React from "react";
import { Link } from "@mui/material";
/**
 * @TODO This might not be needed, possible candidate for deletion.
 *
 * HG-customized version of MUI's Link
 * https://material-ui.com/components/link/
 *
 * Primary purpose is to ensure underline prop is consistant
 * throughout the application.  We use react-router's Link in the majority of
 * places, and an anchor href in cases where we link outside the app.  However,
 * there are instances where we need to use a Link component that links outside
 * to pass AND can be passed as a prop with a ref
 *
 */
const HgMaterialLink = React.forwardRef((props, ref) => (
  <Link underline="none" {...props} ref={ref} />
));

export default HgMaterialLink;
