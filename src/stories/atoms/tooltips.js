import React from "react";
import { Tooltip } from "@mui/material";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Tooltips",
  argTypes: {
    title: { type: "text" },
    placement: {
      control: {
        type: "select",
        // Options per placment values at
        // https://material-ui.com/api/tooltip/#props
        options: [
          "bottom-end",
          "bottom-start",
          "bottom",
          "left-end",
          "left-start",
          "left",
          "right-end",
          "right-start",
          "right",
          "top-end",
          "top-start",
          "top",
        ],
      },
    },
  },
};

const Story = (args) => {
  const { title, placement } = args;
  return (
    <Tooltip title={title} placement={placement}>
      <span style={demoStyles.tooltipTextStyle}>Hover over text for a tooltip</span>
    </Tooltip>
  );
};

export const Tooltips = Story.bind({});
Tooltips.args = {
  title: "Tooltip!",
  placement: "right",
};
