import React from "react";
import { capitalize, includes } from "lodash";
import * as demoStyles from "../_support/demoStyles";
import theme from "../../theme.js";
import styleVars from "style/_vars.scss";

export default {
  title: "Branding/Colors",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Colors = (args) => {
  const colorDemo = (key) => {
    let validKeys = ["primary", "secondary", "error", "warning", "info", "success"];

    if (includes(validKeys, key)) {
      return (
        <React.Fragment>
          <div style={{ color: styleVars.txtColor }}>
            <h3>{capitalize(key)}</h3>
            <p>
              Text below rendered in theme.palette.{key}.contrastText (
              <code>{theme.palette[key].contrastText}</code>).
            </p>
          </div>
          <div style={{ color: theme.palette[key].contrastText }}>
            <div
              style={{
                backgroundColor: theme.palette[key].main,
                padding: theme.spacing(),
              }}
            >
              <strong>{key}.main</strong>
              <br />
              <code>{theme.palette[key].main}</code>
            </div>
            <div
              style={{
                backgroundColor: theme.palette[key].light,
                padding: theme.spacing(),
              }}
            >
              <strong>{key}.light</strong>
              <br />
              <code>{theme.palette[key].light}</code>
            </div>
            <div
              style={{
                backgroundColor: theme.palette[key].dark,
                padding: theme.spacing(),
              }}
            >
              <strong>{key}.dark</strong>
              <br />
              <code>{theme.palette[key].dark}</code>
            </div>
          </div>
        </React.Fragment>
      );
    }
  };

  return (
    <React.Fragment>
      <div style={demoStyles.itemStyle}>{colorDemo("primary")}</div>
      <div style={demoStyles.itemStyle}>{colorDemo("secondary")}</div>
      <div style={demoStyles.itemStyle}>{colorDemo("error")}</div>
      <div style={demoStyles.itemStyle}>{colorDemo("warning")}</div>
      <div style={demoStyles.itemStyle}>{colorDemo("info")}</div>
      <div style={demoStyles.itemStyle}>{colorDemo("success")}</div>
    </React.Fragment>
  );
};
