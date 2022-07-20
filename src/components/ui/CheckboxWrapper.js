import React from "react";
import { useTheme, Checkbox, FormControlLabel } from "@mui/material";
import PropTypes from "prop-types";

/**
 * Checkbox wrapper functional component, reduce boilerplate code and standardize
 * checkboxes.  The main styling difference form standard material design is
 * to align multi line text block with the top of the checkbox, instead of
 * aligning in the center of the block.
 *
 * This is for a single checkbox.
 *
 */
CheckboxWrapper.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  // If no label provided, we do not wrap in FormControlLabel
  // This also removes the need for flex styling to keep text top-aligned
  // Label could be string or jsx (EX: wrapped in a <span> tag)
  label: PropTypes.node,
  disabled: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default function CheckboxWrapper({
  name,
  value,
  label,
  disabled,
  checked,
  handleChange,
  ...props
}) {
  const theme = useTheme();

  return (
    <ConditionalLabelWrapper
      key={`checkbox_${name}`}
      condition={label}
      wrapper={(children) => {
        return (
          <FormControlLabel
            style={{
              alignItems: "flex-start",
              marginBottom: theme.spacing(0.25),
            }}
            label={label}
            control={children}
          />
        );
      }}
    >
      <Checkbox
        color="primary"
        style={{ margin: label ? theme.spacing(-1, 0, 0, 0) : 0 }}
        checked={checked}
        onChange={handleChange}
        name={name}
        disabled={disabled || false}
        {...props}
      />
    </ConditionalLabelWrapper>
  );
}

const ConditionalLabelWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;
