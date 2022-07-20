import React, { Fragment, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { find, get, isEmpty } from "lodash";
import { makeStyles } from "@mui/styles";
import DraftEditor from "components/ui/DraftEditor";
import styleVars from "style/_vars.scss";

//
// Provides JSX for a single Criterion option label.
// -------------------------------------------------
// As of this writing, the intended usage is within the `label` attribute
// of a <FormControlLabel /> element (which should have a `control` attribute
// that contains the <Radio /> element).
//

export default function ResponseOptionLabel({ option, responseStructure, wrapperClassName }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();

  // The response value label (ex: "Not in place").
  const [rvLabel, setRvLabel] = useState(""); // plain text string

  // The criterion option label (in DB: criterion_options.display_label).
  const [coLabel, setCoLabel] = useState(""); // usually JSON for RTE

  // Set state vars based on props.
  useEffect(() => {
    let optionRsvId = get(option, "response_value_id", null);

    // Note: "response value" is actually an array of response values (plural)
    // when it's provided via a response structure object.
    let rsValues = get(responseStructure, "response_value", []);
    let rsValue = find(rsValues, (rsv) => {
      // Find the one that matches what option has.
      return optionRsvId === rsv.id;
    });

    let newRvLabel = "";
    if (rsValue) {
      newRvLabel = get(rsValue, "label", "");
    }
    let newCoLabel = get(option, "display_label", "");
    if (mounted.current) {
      setRvLabel(newRvLabel);
      setCoLabel(newCoLabel);
    }
  }, [option, responseStructure]);

  return (
    <div className={wrapperClassName}>
      {!isEmpty(rvLabel) && (
        <div className={classes.rvLabel}>
          <Fragment>{rvLabel}</Fragment>
        </div>
      )}
      {!isEmpty(coLabel) && (
        <div className={classes.coLabel}>
          <DraftEditor readOnly={true} value={coLabel} />
        </div>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  coLabel: {},
  rvLabel: {
    color: "#707070",
    fontSize: 10,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    marginBottom: "0.2em",
    textTransform: "uppercase",
  },
}));

ResponseOptionLabel.propTypes = {
  option: PropTypes.object.isRequired,
  responseStructure: PropTypes.object.isRequired,
  wrapperClassName: PropTypes.object,
};
