import React, { Fragment } from "react";
import { Button } from "@mui/material";
import CircularProgressFloat from "components/ui/CircularProgressFloat";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";

export default {
  title: "Atoms/Circular Progress",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Float = (args) => {
  return (
    <React.Fragment>
      <CircularProgressFloat />
    </React.Fragment>
  );
};

export const Buttons = (args) => {
  const { containerWidth } = args;
  return (
    <div style={{ width: containerWidth }}>
      <Button type="submit" color="primary" variant="contained" fullWidth={true}>
        <CircularProgressForButtons />
      </Button>
    </div>
  );
};
Buttons.argTypes = {
  containerWidth: { type: "number" },
};
Buttons.args = {
  containerWidth: "150px",
};

export const Global = (args) => {
  return (
    <Fragment>
      <CircularProgressGlobal />
    </Fragment>
  );
};
