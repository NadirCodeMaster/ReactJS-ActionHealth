import React, { Fragment } from "react";
import DraftEditor from "components/ui/DraftEditor";
import * as demoStyles from "../_support/demoStyles";
import * as demoContent from "../_support/demoContent";

export default {
  title: "Molecules/Draft Editor",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const ReadOnly = () => {
  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <DraftEditor readOnly={true} value={demoContent.demoEditorJson} />
    </Fragment>
  );
};

export const Edit = () => {
  return (
    <Fragment>
      <div style={demoStyles.disclaimerBlock}>{disclaimer}</div>
      <DraftEditor onChange={() => {}} value={""} />
    </Fragment>
  );
};

const disclaimer = (
  <React.Fragment>
    <p>
      The Draft editor has two "modes". Read Only and Edit. Note that in edit mode we can customize
      what options are availabel (bold, italic, etc.)
    </p>
  </React.Fragment>
);
