import { TextValidator } from "react-material-ui-form-validator";
import React from "react";

// @TODO Replace all of the form validator stuff with Formik
// (RMUIFV is a few versions behind and not especially useful for us)

/**
 * HG-customized version of TextValidator from RMUFV.
 *
 * Initially created so we could default "shrink" to true due to the difficulty
 * in consistently styling the non-shrunk labels across all the TextField
 * variants.
 *
 * @see lib/ui/HgTextField.js (non-validator version)
 */
const HgTextValidator = React.forwardRef(({ InputLabelProps = {}, ...props }, ref) => (
  <TextValidator
    ref={ref}
    InputLabelProps={{ ...InputLabelProps, shrink: true }}
    variant="outlined"
    {...props}
  />
));

export default HgTextValidator;
