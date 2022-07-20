import React, { Fragment } from "react";
import ConfirmButton from "components/ui/ConfirmButton";
import * as demoStyles from "../_support/demoStyles";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Molecules/Confirm Buttons",
  argTypes: {
    confirmTitle: {
      description:
        "This option is only for the styleguide demo. This option allows customized title",
      control: {
        type: "text",
      },
    },
    confirmText: {
      description:
        "This option is only for the styleguide demo. This option allows customized text",
      control: {
        type: "text",
      },
    },
    confirmColor: {
      description:
        "This option is only for the styleguide demo. This option allows customized color",
      control: {
        type: "select",
        options: ["primary", "secondary"],
      },
    },
  },
};

const defaultConfirmTitle = demoContent.demoShortSentence;
const defaultConfirmText = demoContent.demoShortSentence;
const defaultConfirmColor = "primary";

export const Confirm = (args) => {
  const { confirmColor, confirmTitle, confirmText } = args;
  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <ConfirmButton
        onConfirm={() => {}}
        color={confirmColor}
        title={confirmTitle}
        aria-label={confirmTitle}
      >
        {confirmText}
      </ConfirmButton>
    </Fragment>
  );
};

Confirm.args = {
  confirmTitle: defaultConfirmTitle,
  confirmText: defaultConfirmText,
  confirmColor: defaultConfirmColor,
};

const disclaimer = (
  <React.Fragment>
    <p>
      Confirm button is a button that opens a dialog with simple Cancel/Confirm options. The style
      of the button can be customized the same way a material ui button can be customized (color,
      size, label, etc.). Please note that this demo doesn't actually do anything on submit
    </p>
  </React.Fragment>
);
