import React from "react";
import { FormControlLabel, Switch } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Switch wrapper functional component, reduce boilerplate code and standardize
 * switches
 * NOTE: This is for the form switch, not routing switch
 */
SwitchWrapper.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  checked: PropTypes.bool,
  label: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default function SwitchWrapper({ name, value, checked, handleChange, label }) {
  return (
    <FormControlLabel
      control={
        <Switch
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
          color="primary"
        />
      }
      label={label}
    />
  );
}
