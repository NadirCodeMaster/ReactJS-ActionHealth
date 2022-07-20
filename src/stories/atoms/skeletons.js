import React from "react";
import HgSkeleton from "components/ui/HgSkeleton";
import * as demoStyles from "../_support/demoStyles";

export default {
  title: "Atoms/Skeletons",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Text = (args) => {
  const { width } = args;
  return (
    <React.Fragment>
      {skeletonDisclaimer}
      <HgSkeleton variant="text" width={width} />
    </React.Fragment>
  );
};
Text.argTypes = {
  width: { type: "number" },
};
Text.args = {
  width: 210,
};

export const Rectangle = (args) => {
  const { height, width } = args;
  return (
    <React.Fragment>
      {skeletonDisclaimer}
      <HgSkeleton variant="rect" width={width} height={height} />
    </React.Fragment>
  );
};
Rectangle.argTypes = {
  height: { type: "number" },
  width: { type: "number" },
};
Rectangle.args = {
  height: 118,
  width: 210,
};

export const Circle = (args) => {
  const { height, width } = args;
  return (
    <React.Fragment>
      {skeletonDisclaimer}
      <HgSkeleton variant="circle" width={width} height={height} />
    </React.Fragment>
  );
};
Circle.argTypes = {
  height: { type: "number" },
  width: { type: "number" },
};
Circle.args = {
  height: 40,
  width: 40,
};

export const Combination = (args) => {
  const { textWidth, circleHeight, circleWidth, rectHeight, rectWidth } = args;
  return (
    <React.Fragment>
      {skeletonDisclaimer}
      <HgSkeleton variant="text" width={textWidth} />
      <HgSkeleton variant="circle" width={circleWidth} height={circleHeight} />
      <HgSkeleton variant="rect" width={rectWidth} height={rectHeight} />
    </React.Fragment>
  );
};
Combination.argTypes = {
  textWidth: { type: "number" },
  circleHeight: { type: "number" },
  circleWidth: { type: "number" },
  rectHeight: { type: "number" },
  rectWidth: { type: "number" },
};
Combination.args = {
  textWidth: 210,
  circleHeight: 40,
  circleWidth: 40,
  rectHeight: 118,
  rectWidth: 210,
};

const skeletonDisclaimer = (
  <div style={demoStyles.disclaimerBlock}>
    <p>
      <strong>Skeleton note: </strong>
      The widths and heights<sup>*</sup> of skeleton components can be customized using pixel
      (numeric) or percentage values. Here we've used pixel values you can override using the
      Storybook controls.
      <br />
      <small>
        <sup>*</sup>However, we don't typically specify a custom height on text skeletons.
      </small>
    </p>
  </div>
);
