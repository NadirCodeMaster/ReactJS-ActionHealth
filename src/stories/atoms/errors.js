import React, { Fragment } from "react";
import Errors from "components/ui/Errors";
import * as demoStyles from "../_support/demoStyles";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Atoms/Errors",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Error = () => {
  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <Errors errors={sampleError} />
    </Fragment>
  );
};

const sampleError = [demoContent.demoSentence];

const disclaimer = (
  <React.Fragment>
    <p>Errors always come with the ! icon and a red background</p>
  </React.Fragment>
);
