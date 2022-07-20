import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import { docbuilderSubsectionWithRenderShape } from "../../prop-type-shapes";
import { Markup } from "interweave";
import { statuses } from "../../utils/subsection/constants";

//
// Single subsection as displayed in DocbuilderPreviewSection.
//

export default function Subsection({ subsectionWithRender, subsectionStatus }) {
  const classes = useStyles();

  // NOTE! We use allowElements below to prevent Markup from stripping things
  // things out due to potentially invalid hierarchy. In particular, it was
  // removing some tags (like `<ul>`) if `<ins>` tags were wrapping them.
  // (HTML spec allows `<ins>` wrap both inline and block-level elements, but
  //  I assume the underlying problem was Markup considered it invalid).
  //
  // Regardless, the `_render` property we use below is guaranteed to be
  // sanitized and escaped at the API level, so all we need to do is render it.
  //
  // @see https://interweave.dev/docs/
  return (
    <div className={classes.subsectionWrapper}>
      {subsectionStatus && statuses.EXCLUDING === subsectionStatus ? (
        <div>
          <ins data-docbuilder-preview-highlight>
            <em>(This content is excluded based on your selections)</em>
          </ins>
        </div>
      ) : (
        <Markup allowElements={true} content={subsectionWithRender._render} />
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  // FYI: Special docbuilder styles are provided by the API
  // at `/api/v1/docbuilder-css`
  subsectionWrapper: {
    "& p": {
      margin: "1em 0",
    },
  },
}));

Subsection.propTypes = {
  subsectionWithRender: PropTypes.shape(docbuilderSubsectionWithRenderShape).isRequired,
  subsectionStatus: PropTypes.number,
};
