import React from "react";
import { includes } from "lodash";
import { AppBar, Tab, Tabs } from "@mui/material";

// @TOOD Add horizontal scrolling (via #3311 if nothing else)

export default {
  title: "Molecules/Tabs",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const DefaultColor = () => <React.Fragment>{tabsDemoForColor("default")}</React.Fragment>;
export const PrimaryColor = () => <React.Fragment>{tabsDemoForColor("primary")}</React.Fragment>;
export const SecondaryColor = () => (
  <React.Fragment>{tabsDemoForColor("secondary")}</React.Fragment>
);
export const LongText = () => <React.Fragment>{tabsDemoForColor("default", true)}</React.Fragment>;

// -------------------
// Supporting elements
// -------------------

const tabsDemoForColor = (color, includeLongText = false) => {
  let validColors = ["primary", "secondary", "default"];
  if (includes(validColors, color)) {
    let labelThree = "Item three";
    if (includeLongText) {
      labelThree = "Item three odio libero, semper id gravida id, bibendum quis mi";
    }
    return (
      <AppBar position="static" color={color}>
        <Tabs value="two" variant="scrollable" scrollButtons="auto">
          <Tab value="one" label="Item one" />
          <Tab value="two" label="Item two" />
          <Tab value="three" label={labelThree} />
          <Tab value="four" label="Item four" />
          <Tab value="five" label="Item five" />
        </Tabs>
      </AppBar>
    );
  }
};
