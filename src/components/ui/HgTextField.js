import React from "react";
import TextField from "@mui/material/TextField";

/**
 * HG-customized version of MUI's TextField.
 *
 * Initially created so we could default "shrink" to true due to the difficulty
 * in consistently styling the non-shrunk labels across all the TextField
 * variants.
 *
 * Also serves to standardize other props, such as the variant itself.
 */
function HgTextField({ InputLabelProps = {}, ...props }) {
  return (
    <TextField
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      variant="outlined"
      {...props}
    />
  );
}

export default HgTextField;
