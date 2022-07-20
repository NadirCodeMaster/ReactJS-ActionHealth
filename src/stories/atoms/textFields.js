import React from "react";
import { capitalize } from "lodash";
import HgTextField from "../../lib/ui/HgTextField";
import { Paper } from "@mui/material";
import * as demoStyles from "../_support/demoStyles";
import theme from "../../theme.js";
import styleVars from "style/_vars.scss";

export default {
  title: "Atoms/Text Fields",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Standard = () => storyOutput("standard");
export const Outlined = () => storyOutput("outlined");

const storyOutput = (textFieldVariant) => {
  const demoTextFieldTypes = [
    "text",
    "date",
    "email",
    "number",
    "password",
    "search",
    "tel",
    "time",
    "url",
  ];

  return (
    <React.Fragment>
      <Paper style={{ padding: styleVars.paperPadding }}>
        <p>
          <strong>Text field note:</strong> Material UI provides multiple styles of form fields,
          referred to as "<strong>variants</strong>". In the interest of consistency, we use only
          two of these variants:
        </p>
        <ul>
          <li>
            <strong>standard</strong>: This is our default and should be used in most places. Label
            is above the field.{" "}
          </li>
          <li>
            <strong>outlined</strong>: We use this in a few situations where space is limited and
            having a the label above the field isn't appropriate, such as expandable search bars.
            The label is displayed legend-style in the top border of the field.
          </li>
        </ul>
        <p>
          When coding, use our custom <code>HgTextField</code> component instead of calling MUI's{" "}
          <code>TextField</code> component directly. This helps enforce correct usage and cetralizes
          other logic and styling.
        </p>
      </Paper>

      <React.Fragment key={textFieldVariant}>
        {demoTextFieldTypes.map((tfType) => (
          <section key={textFieldVariant + tfType} style={demoStyles.sectionStyle}>
            <div style={demoStyles.itemLabelStyle}>
              {capitalize(textFieldVariant)} {capitalize(tfType)}
            </div>
            <div style={demoStyles.itemStyle}>
              <HgTextField
                variant={textFieldVariant}
                label={capitalize(tfType)}
                defaultValue=""
                placeholder="Placeholder text"
                type={tfType}
              />
            </div>
            <div style={demoStyles.itemStyle}>
              <HgTextField
                variant={textFieldVariant}
                label={capitalize(tfType) + " w/error"}
                error
                defaultValue=""
                placeholder="Placeholder text"
                type={tfType}
              />
            </div>
            <div style={demoStyles.itemStyle}>
              <HgTextField
                variant={textFieldVariant}
                label={capitalize(tfType) + " w/helperText"}
                helperText="This is helperText nec diam vel turpis laoreet varius at in orci. Proin nibh nisi, volutpat sed condimentum id, sagittis scelerisque urna. Donec justo ligula, hendrerit sed pulvinar ut, pretium ac lacus. Aenean ligula sem, blandit porttitor sodales ut, pellentesque vitae tellus. Vestibulum imperdiet enim euismod ipsum iaculis congue. Vestibulum molestie blandit aliquam."
                defaultValue=""
                placeholder="Placeholder text"
                type={tfType}
              />
            </div>
          </section>
        ))}
      </React.Fragment>
    </React.Fragment>
  );
};
