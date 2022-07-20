import React from "react";
import HgAlert from "../../lib/ui/HgAlert";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as demoStyles from "../_support/demoStyles";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Atoms/Alerts",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

const storyOutput = (styleName, styleShortName, useCompactLayout) => {
  const demoSeverities = ["error", "warning", "info", "success"];

  const severityAction = (demoSeverity) => {
    console.log(`${demoSeverity} action clicked`);
  };

  return (
    <div>
      <h3>{styleName} size: Long text, plain</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_long_plain`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                message={demoContent.demoParagraphWithLinks}
                includeIcon={false}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Long text w/icons</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_long_icon`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                message={demoContent.demoParagraph}
                includeIcon={true}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Long text w/icons, titles</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_long_icon_title`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                title={`Title for ${demoSeverity}`}
                message={demoContent.demoParagraph}
                includeIcon={true}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Long text w/icons, titles, actions</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_long_icon_title_action`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                title={`Title for ${demoSeverity}`}
                message={demoContent.demoParagraph}
                includeIcon={true}
                action={
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => severityAction(demoSeverity)}
                    size="large"
                  >
                    <CloseIcon />
                  </IconButton>
                }
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Short text, plain</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_short_plain`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                message={demoContent.demoShortSentence}
                includeIcon={false}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Short text w/icons</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_short_icon`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                message={demoContent.demoShortSentence}
                includeIcon={true}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Short text w/icons, titles</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_short_icon_title`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                title={`Title for ${demoSeverity}`}
                message={demoContent.demoShortSentence}
                includeIcon={true}
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>

      <hr />

      <h3>{styleName} size: Short text w/icons, titles, actions</h3>
      <div style={demoStyles.itemStyle}>
        {demoSeverities.map((demoSeverity) => (
          <React.Fragment>
            <div key={`${demoSeverity}_${styleShortName}_short_icon_title_action`}>
              <HgAlert
                compactLayout={useCompactLayout}
                severity={demoSeverity}
                title={`Title for ${demoSeverity}`}
                message={demoContent.demoShortSentence}
                includeIcon={true}
                action={
                  <IconButton
                    key="close"
                    aria-label="Close"
                    color="inherit"
                    onClick={() => severityAction(demoSeverity)}
                    size="large"
                  >
                    <CloseIcon />
                  </IconButton>
                }
              />
            </div>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const Standard = () => storyOutput("Standard", "std", false);

export const Compact = () => storyOutput("Compact", "cmpct", true);
