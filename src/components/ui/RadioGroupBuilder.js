import React from "react";
import hgStyled from "style/hgStyled";
import { FormControl, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import PropTypes from "prop-types";

const PREFIX = "RadioGroupBuilder";

const classes = {
  radioFormControlLabel: `${PREFIX}-radioFormControlLabel`,
  radio: `${PREFIX}-radio`,
};

const StyledFormControl = hgStyled(FormControl)(({ theme }) => ({
  [`& .${classes.radioFormControlLabel}`]: {
    alignItems: "flex-start",
  },

  [`& .${classes.radio}`]: {
    margin: theme.spacing(-1, 0, 0, 0),
  },
}));

/**
 * Radios functional component, reduce boilerplate code and standardize radios
 *
 * This is used for multiple radios
 */
RadioGroupBuilder.propTypes = {
  controlName: PropTypes.string,
  groupValue: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  /* Array of objects to map for single radios
  EX:
  [
    {
      value: 'demoValue1',
      label: 'demo label 1'
    },
    {
      value: 'demoValue2',
      label: 'demo label 2'
    },
    {
      value: 'demoValue3',
      label: 'demo label 3'
    },
  ]
  */
  radios: PropTypes.array.isRequired,
};

export default function RadioGroupBuilder({
  controlName,
  groupValue,
  groupName,
  handleChange,
  radios,
  ...props
}) {
  return (
    <StyledFormControl component="fieldset" name={controlName} variant="standard">
      <RadioGroup name={groupName} onChange={handleChange} value={groupValue}>
        {radios.map((radio, index) => (
          <FormControlLabel
            className={classes.radioFormControlLabel}
            key={`radio_${index}`}
            value={radio.value}
            control={<Radio {...props} className={classes.radio} />}
            label={radio.label}
          />
        ))}
      </RadioGroup>
    </StyledFormControl>
  );
}
