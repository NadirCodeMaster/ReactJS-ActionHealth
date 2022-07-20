import React from "react";
import { capitalize } from "lodash";
import { Button } from "@mui/material";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Buttons",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Contained = () => variantOutput("contained");
export const Outlined = () => variantOutput("outlined");
export const Text = () => variantOutput("text");

const variantOutput = (buttonVariant) => {
  const demoButtonColors = ["default", "primary", "secondary"];
  const demoButtonSizes = ["small", "medium" /*, 'large' */]; // EXCLUDE LARGE
  return (
    <React.Fragment key={buttonVariant}>
      {demoButtonColors.map((btnColor) => (
        <React.Fragment key={buttonVariant + btnColor}>
          <section style={demoStyles.sectionStyle}>
            <h3>
              {capitalize(buttonVariant)} (color: {btnColor})
            </h3>
            <div style={demoStyles.itemStyle}>
              {demoButtonSizes.map((btnSize) => (
                <div>
                  <Button variant={buttonVariant} color={btnColor} size={btnSize}>
                    {btnSize} button
                  </Button>{" "}
                  <Button variant={buttonVariant} color={btnColor} size={btnSize} disabled>
                    {btnSize} disabled button
                  </Button>
                  <br />
                  <br />
                </div>
              ))}
            </div>
          </section>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};
