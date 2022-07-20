import React, { Fragment, useState } from "react";
import Switch from "components/ui/SwitchWrapper";
import * as demoContent from "../_support/demoContent";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Switch",
  argTypes: {
    switchTextOne: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the switch labels",
      control: {
        type: "text",
      },
    },
    switchTextTwo: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the switch labels",
      control: {
        type: "text",
      },
    },
    switchTextThree: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the switch labels",
      control: {
        type: "text",
      },
    },
  },
};

const defaultSwitchTextOne = demoContent.demoShortSentence;
const defaultSwitchTextTwo = demoContent.demoSentence;
const defaultSwitchTextThree = demoContent.demoParagraph;

export const Standard = (args) => {
  const { switchTextOne, switchTextTwo, switchTextThree } = args;
  const [switchValues, setSwitchValues] = useState({
    demoValue1: false,
    demoValue2: false,
    demoValue3: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setSwitchValues({ ...switchValues, [name]: checked });
  };

  const switches = [
    {
      name: "demoValue1",
      value: "demoValue1",
      label: switchTextOne,
      checked: switchValues.demoValue1,
      handleChange,
    },
    {
      name: "demoValue2",
      value: "demoValue2",
      label: switchTextTwo,
      checked: switchValues.demoValue2,
      handleChange,
    },
    {
      name: "demoValue3",
      value: "demoValue3",
      label: switchTextThree,
      checked: switchValues.demoValue3,
      handleChange,
    },
  ];

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      {switches.map((s, index) => (
        <Switch
          key={`switch_demo_${index}`}
          name={s.name}
          value={s.value}
          label={s.label}
          checked={s.checked}
          handleChange={handleChange}
        />
      ))}
    </Fragment>
  );
};

Standard.args = {
  switchTextOne: defaultSwitchTextOne,
  switchTextTwo: defaultSwitchTextTwo,
  switchTextThree: defaultSwitchTextThree,
};

const disclaimer = (
  <React.Fragment>
    <p>Switches</p>
  </React.Fragment>
);
