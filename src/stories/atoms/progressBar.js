import React from "react";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import ProgressBar from "../../lib/ui/ProgressBar";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Atoms/Progress Bar",
  component: ProgressBar,
  argTypes: {
    // Note: We can't just pull prop details from the ProgressBar component
    // because it's wrapped in HOCs. (Storybook can't parse propType info
    // when using HOCs)
    linkIfZero: {
      description:
        'Whether to render a link in the progress bar if the value is 0. Used for including text like "Get started."',
      control: { type: "boolean" },
    },
    linkIfZeroText: {
      description:
        'If `linkIfZero:true`, this is the text that\'ll be shown for the link (i.e., "Get started").',
      control: { type: "text" },
    },
    value: {
      description: "Percentage of progress (0-100) to show.",
      control: { type: "range", min: 0, max: 100 },
    },
  },
};

const history = createMemoryHistory();

const Story = (args) => {
  const { value, linkIfZero, linkIfZeroText } = args;

  if (linkIfZero) {
    return (
      <Router history={history}>
        <ProgressBar
          value={value}
          linkIfZero={linkIfZero}
          linkIfZeroText={linkIfZeroText}
          linkIfZeroTo="#"
        />
      </Router>
    );
  } else {
    return (
      <ProgressBar
        value={value}
        linkIfZero={linkIfZero}
        linkIfZeroText={linkIfZeroText}
        linkIfZeroTo="#"
      />
    );
  }
};

export const ProgressBarStory = Story.bind({});
ProgressBarStory.storyName = "Progress Bar";
ProgressBarStory.args = {
  value: 67,
  linkIfZero: true,
  linkIfZeroText: demoContent.demoShortSentence,
};
