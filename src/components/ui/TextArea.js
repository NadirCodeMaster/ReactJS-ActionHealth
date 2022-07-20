import React from "react";
import hgStyled from "style/hgStyled";
import { TextField } from "@mui/material";
import PropTypes from "prop-types";

const PREFIX = "TextArea";

const classes = {
  textFieldMultiLine: `${PREFIX}-textFieldMultiLine`,
};

const StyledTextField = hgStyled(TextField)(({ theme }) => ({
  [`& .${classes.textFieldMultiLine}`]: {
    "& .MuiInputBase-root": {
      padding: 0,
      "& .MuiInput-inputMultiline": {
        padding: theme.spacing(1.5),
      },
    },
  },
}));

// @TODO Rename to HgTextArea

/**
 * Custom TextField multiline
 */
TextArea.propTypes = {
  InputLabelProps: PropTypes.object,
};

export default function TextArea({ InputLabelProps = {}, ...props }) {
  return (
    <TextField
      InputLabelProps={{ ...InputLabelProps, shrink: true }}
      variant="standard"
      multiline={true}
      classes={{
        root: classes.textFieldMultiLine,
      }}
      {...props}
    />
  );
}
