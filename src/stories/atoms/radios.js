import React, { Fragment, useState } from "react";
import RadioGroupBuilder from "components/ui/RadioGroupBuilder";
import * as demoContent from "../_support/demoContent";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Radio",
  argTypes: {
    radioTextOne: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the radio labels",
      control: {
        type: "text",
      },
    },
    radioTextTwo: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the radio labels",
      control: {
        type: "text",
      },
    },
    radioTextThree: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the radio labels",
      control: {
        type: "text",
      },
    },
  },
};

const defaultRadioTextOne = demoContent.demoSentence;
const defaultRadioTextTwo = demoContent.demoSentence;
const defaultRadioTextThree = demoContent.demoSentence;

export const Multiple = (args) => {
  const { radioTextOne, radioTextTwo, radioTextThree } = args;
  const [groupValue, setGroupValue] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;

    setGroupValue(value);
  };

  const radios = [
    {
      value: "demoValue1",
      label: radioTextOne,
    },
    {
      value: "demoValue2",
      label: radioTextTwo,
    },
    {
      value: "demoValue3",
      label: radioTextThree,
    },
  ];

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <RadioGroupBuilder
        handleChange={handleChange}
        groupValue={groupValue}
        groupName={"demoGroupName"}
        controlName={"demoControlName"}
        radios={radios}
      />
    </Fragment>
  );
};

Multiple.args = {
  radioTextOne: defaultRadioTextOne,
  radioTextTwo: defaultRadioTextTwo,
  radioTextThree: defaultRadioTextThree,
};

const disclaimer = (
  <React.Fragment>
    <p>Standard radio buttons</p>
  </React.Fragment>
);
