import React, { Fragment, useState } from "react";
import Checkbox from "components/ui/CheckboxWrapper";
import * as demoContent from "../_support/demoContent";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Checkbox",
  argTypes: {
    checkboxTextOne: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the checkbox labels",
      control: {
        type: "text",
      },
    },
    checkboxTextTwo: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the checkbox labels",
      control: {
        type: "text",
      },
    },
    checkboxTextThree: {
      description:
        "This option is only for the styleguide demo. This option allows customized text to see how it fills the checkbox labels",
      control: {
        type: "text",
      },
    },
  },
};

const defaultCheckboxTextOne = demoContent.demoShortSentence;
const defaultCheckboxTextTwo = demoContent.demoSentence;
const defaultCheckboxTextThree = demoContent.demoParagraph;

export const Multiple = (args) => {
  const { checkboxTextOne, checkboxTextTwo, checkboxTextThree } = args;
  const [checkboxValues, setCheckboxValues] = useState({
    demoValue1: false,
    demoValue2: false,
    demoValue3: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setCheckboxValues({ ...checkboxValues, [name]: checked });
  };

  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <Checkbox
        name={"demoValue1"}
        value={"demoValue1"}
        label={checkboxTextOne}
        checked={checkboxValues.demoValue1}
        handleChange={handleChange}
      />
      <Checkbox
        name={"demoValue2"}
        value={"demoValue2"}
        label={checkboxTextTwo}
        checked={checkboxValues.demoValue2}
        handleChange={handleChange}
      />
      <Checkbox
        name={"demoValue3"}
        value={"demoValue3"}
        label={checkboxTextThree}
        checked={checkboxValues.demoValue3}
        handleChange={handleChange}
      />
    </Fragment>
  );
};

Multiple.args = {
  checkboxTextOne: defaultCheckboxTextOne,
  checkboxTextTwo: defaultCheckboxTextTwo,
  checkboxTextThree: defaultCheckboxTextThree,
};

const disclaimer = (
  <React.Fragment>
    <p>Checkboxes</p>
  </React.Fragment>
);
