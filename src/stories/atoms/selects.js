import React from "react";
import HgSelect from "components/ui/HgSelect";
import theme from "../../theme.js";
import * as demoContent from "../_support/demoContent";
import * as demoStyles from "../_support/demoStyles";
import styleVars from "style/_vars.scss";
import reactSelectStyles from "style/reactSelectStyles";

export default {
  title: "Atoms/Selects",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

const demoSelectOptions = [
  { value: "value1", label: "Item one label" },
  { value: "value2", label: "Item two label" },
  { value: "value3", label: "Item three label" },
  { value: "value4", label: "Item four label" },
  { value: "value5", label: "Item five label" },
  { value: "value6", label: "Item six label" },
  { value: "value7", label: "Item seven label" },
];

const demoSelectOptionsVarying = [
  { value: "value1", label: "Item one label" },
  { value: "value2", label: demoContent.demoSentence },
  { value: "value3", label: "Item three label" },
  { value: "value4", label: "Item four label" },
  { value: "value5", label: demoContent.demoParagraph },
  { value: "value6", label: demoContent.demoSentence },
  { value: "value7", label: "Item seven label" },
];

const storyOutput = (params) => {
  const { isMulti, name, options } = params;

  return (
    <React.Fragment>
      <div style={demoStyles.disclaimerBlock}>
        <p>
          <strong>Select note:</strong> We use{" "}
          <a href="https://react-select.com/" target="_blank" rel="noopener noreferrer">
            react-select
          </a>{" "}
          for most select fields (not MUI).
        </p>
      </div>
      <HgSelect
        styles={reactSelectStyles}
        placeholder="This is the placeholder value..."
        name={name}
        isMulti={isMulti}
        options={options}
        aria-label="This is the aria-label value..."
      />
    </React.Fragment>
  );
};

export const SingleShortText = () =>
  storyOutput({
    isMulti: false,
    name: "standard_select",
    options: demoSelectOptions,
  });

export const MultiShortText = () =>
  storyOutput({
    isMulti: true,
    name: "multi_select",
    options: demoSelectOptions,
  });

export const SingleLongText = () =>
  storyOutput({
    isMulti: false,
    name: "standard_select_long",
    options: demoSelectOptionsVarying,
  });

export const MultiLongText = () =>
  storyOutput({
    isMulti: true,
    name: "multi_select_long",
    options: demoSelectOptionsVarying,
  });
