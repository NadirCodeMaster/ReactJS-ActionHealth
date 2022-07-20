import React from "react";
import theme from "../../theme.js";
import { merge, forEach } from "lodash";
import * as demoContent from "../_support/demoContent";
import styleVars from "style/_vars.scss";

export default {
  title: "Branding/Style Variables",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const Colors = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("color")) {
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    marginBottom: theme.spacing(4),
                  }}
                >
                  <div>{valueString}</div>

                  <div
                    style={{
                      backgroundColor: key,
                      margin: theme.spacing(1, 0, 1, 0),
                      height: "30px",
                      width: "250px",
                      border: "1px solid black",
                    }}
                  ></div>

                  <pre
                    style={{
                      background: "grey",
                      width: "250px",
                      backgroundColor: "#eee",
                      border: "1px solid #999",
                      display: "block",
                      padding: theme.spacing(2),
                    }}
                  >
                    <code>color: {key}</code>
                  </pre>
                </div>
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const FontWeights = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("Weight")) {
            return (
              <React.Fragment key={i}>
                <StyleVarBlock
                  styleValue={key}
                  styleKey={"font-weight"}
                  styleKeyCc={"fontWeight"}
                  valueString={valueString}
                />
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const TextTransform = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("Transform")) {
            return (
              <React.Fragment key={i}>
                <StyleVarBlock
                  styleValue={key}
                  styleKey={"text-transform"}
                  styleKeyCc={"textTransform"}
                  valueString={valueString}
                />
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const FontFamilies = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("FontFamily")) {
            return (
              <React.Fragment key={i}>
                <StyleVarBlock
                  styleValue={key}
                  styleKey={"font-family"}
                  styleKeyCc={"fontFamily"}
                  valueString={valueString}
                />
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const Breakpoints = () => {
  let themeP2 = styleVars;

  return (
    <div>
      {Object.keys(themeP2).map((key, i) => {
        let value = themeP2[key];
        let lcKey = key.toLowerCase();

        if (typeof value !== "object" && typeof value !== "function" && lcKey.includes("bp")) {
          return (
            <div
              key={i}
              style={{
                width: value,
                backgroundColor: "#eee",
                border: "1px solid #999",
                marginBottom: theme.spacing(),
              }}
            >
              <span
                style={{
                  margin: theme.spacing(0, 0, 0, 1),
                }}
              >
                {key}
              </span>
              <pre
                style={{
                  width: "250px",
                  display: "block",
                  padding: theme.spacing(2),
                }}
              >
                <code>width: {value}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export const LineHeight = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("LineHeight")) {
            return (
              <React.Fragment key={i}>
                <StyleVarBlockSentence
                  styleValue={key}
                  styleKey={"line-height"}
                  styleKeyCc={"lineHeight"}
                  valueString={valueString}
                />
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const LetterSpacing = () => {
  let themeP2Grouped = themeGroupedByKey();

  return (
    <div>
      {Object.keys(themeP2Grouped).map((key, i) => {
        let value = themeP2Grouped[key];

        if (Array.isArray(value)) {
          let valueString = value.join(", ");
          if (valueString.includes("LetterSpacing")) {
            return (
              <React.Fragment key={i}>
                <StyleVarBlockSentence
                  styleValue={key}
                  styleKey={"letter-spacing"}
                  styleKeyCc={"letterSpacing"}
                  valueString={valueString}
                />
              </React.Fragment>
            );
          }
        }

        return null;
      })}
    </div>
  );
};

export const MarginBottom = () => {
  let themeP2 = styleVars;

  return (
    <div>
      {Object.keys(themeP2).map((key, i) => {
        let value = themeP2[key];
        let lcKey = key.toLowerCase();

        if (
          typeof value !== "object" &&
          typeof value !== "function" &&
          lcKey.includes("marginbottom")
        ) {
          return (
            <div
              style={{
                width: "50%",
                marginBottom: theme.spacing(),
              }}
              key={i}
            >
              {key}
              <div
                style={{
                  backgroundColor: styleVars.colorGreen,
                }}
              >
                <div
                  style={{
                    marginBottom: value,
                    backgroundColor: "#eee",
                    border: "1px solid #999",
                  }}
                >
                  Top Content
                </div>
                <div
                  style={{
                    backgroundColor: "#eee",
                    border: "1px solid #999",
                  }}
                >
                  Bottom content
                </div>
              </div>
              <pre
                style={{
                  width: "250px",
                  display: "block",
                  padding: theme.spacing(2),
                  border: "1px solid #999",
                  backgroundColor: "#eee",
                }}
              >
                <code>margin-bottom: {value}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const StyleVarBlock = (props) => {
  return (
    <div
      style={{
        marginBottom: theme.spacing(4),
      }}
    >
      <div
        style={{
          [props.styleKeyCc]: props.styleValue,
        }}
      >
        {props.valueString}
      </div>

      <pre
        style={{
          background: "grey",
          width: "250px",
          backgroundColor: "#eee",
          border: "1px solid #999",
          display: "block",
          padding: theme.spacing(2),
        }}
      >
        <code>
          {props.styleKey}: {props.styleValue}
        </code>
      </pre>
    </div>
  );
};

const StyleVarBlockSentence = (props) => {
  return (
    <div
      style={{
        marginBottom: theme.spacing(4),
      }}
    >
      <div
        style={{
          marginBottom: theme.spacing(1),
        }}
      >
        {props.valueString}
      </div>

      <div
        style={{
          [props.styleKeyCc]: props.styleValue,
        }}
      >
        {demoContent.demoParagraph}
      </div>

      <pre
        style={{
          background: "grey",
          width: "250px",
          backgroundColor: "#eee",
          border: "1px solid #999",
          display: "block",
          padding: theme.spacing(2),
        }}
      >
        <code>
          {props.styleKey}: {props.styleValue}
        </code>
      </pre>
    </div>
  );
};

const themeGroupedByKey = () => {
  let themeP2 = styleVars;
  let themeP2Grouped = {};

  forEach(themeP2, (value, key) => {
    if (typeof key !== "string") {
      return;
    }
    if (!themeP2Grouped.hasOwnProperty(value)) {
      let objPair = { [value]: [key] };
      merge(themeP2Grouped, objPair);
    } else if (themeP2Grouped.hasOwnProperty(value)) {
      themeP2Grouped[value].push(key);
    }
  });

  return themeP2Grouped;
};
