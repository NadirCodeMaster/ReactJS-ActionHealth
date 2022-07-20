import React from "react";
import { Paper } from "@mui/material";
import * as demoContent from "../_support/demoContent";
import theme from "../../theme.js";
import styleVars from "style/_vars.scss";

export default {
  title: "Atoms/Paper",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

const storyOutput = (params) => {
  const { styles, customText } = params;
  return (
    <Paper style={styles}>
      <p>
        {customText} Text shown here is wrapped with a paragraph tag. {demoContent.demoParagraph}
      </p>
    </Paper>
  );
};

export const Padded = () =>
  storyOutput({
    styles: { padding: styleVars.paperPadding },
    customText: (
      <React.Fragment>
        When we don't want content to be flush with the edge of Paper, we pad the paper with our{" "}
        <code>styleVars.paperPadding</code> value.
      </React.Fragment>
    ),
  });

export const NotPadded = () =>
  storyOutput({
    styles: {},
    customText: <React.Fragment>Paper without typical padding applied.</React.Fragment>,
  });
