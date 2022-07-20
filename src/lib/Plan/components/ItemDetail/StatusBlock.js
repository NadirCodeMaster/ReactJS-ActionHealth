import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { get, isNil, trim } from "lodash";
import moment from "moment";
import { makeStyles } from "@mui/styles";
import { responseWithResponseValueShape } from "constants/propTypeShapes";
import alignmentValueImages from "utils/alignmentValueImages";
import styleVars from "style/_vars.scss";

// @TODO move this to lib/Criterion/components

export default function StatusBlock({ response }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();

  const [alignmentValue, setAlignmentValue] = useState(null);
  const [statusText, setStatusText] = useState("");
  const [statusImgSrc, setStatusImgSrc] = useState(null);
  const [updatedText, setUpdatedText] = useState("");

  // Set various state vars based on response.
  useEffect(() => {
    let newAlignmentValue = null;
    let newStatusText = get(response, "response_value.label", "");
    let newUpdatedText = "";

    // Confirm response is populated before trying to use it.
    if (!isNil(response)) {
      newAlignmentValue = get(response, "response_value.alignment", 0);

      // Assemble name of user that made last update (if available).
      let updatedBy = "";
      let updatedByUser = get(response, "user", null);
      if (updatedByUser) {
        let namef = trim(get(updatedByUser, "name_first", ""));
        let namel = trim(get(updatedByUser, "name_last", ""));
        if (namel.length > 0) {
          // reduce last name to initial w/period.
          namel = namel.charAt(0) + ".";
        }
        // Put together the string.
        if (namef && namel) {
          updatedBy = ` by ${namef} ${namel}`;
        }
      }

      // Format datetime of last update (if available);
      let updatedAt = "";
      let updatedAtSrc = get(response, "created_at", null);
      if (updatedAtSrc && moment(updatedAtSrc).isValid()) {
        updatedAt = " " + moment.utc(updatedAtSrc).fromNow();
      }

      // If we have a user and/or date, put populate the updated string.
      if (updatedBy.length > 0 || updatedAt.length > 0) {
        newUpdatedText = `Updated ${updatedBy} ${updatedAt}`;
      }
    }

    if (mounted.current) {
      setAlignmentValue(newAlignmentValue);
      setUpdatedText(newUpdatedText);
      setStatusText(newStatusText);
    }
  }, [response]);

  // Set statusImgSrc when alignmentValue changes.
  useEffect(() => {
    let newStatusImgSrc = null;
    if (!isNil(alignmentValue)) {
      newStatusImgSrc = alignmentValueImages(alignmentValue);
    }
    setStatusImgSrc(newStatusImgSrc);
  }, [alignmentValue]);

  if (isNil(response)) {
    return null;
  }
  return (
    <div className={classes.wrapper}>
      <h3>Status</h3>
      <div className={classes.status}>
        {statusImgSrc && <img alt="" className={classes.statusImg} src={statusImgSrc} />}
        <div className={classes.statusText}>{statusText}</div>
      </div>
      {updatedText.length > 0 && <div className={classes.updatedText}>{updatedText}</div>}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  status: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(0.25),
  },
  statusImg: {
    height: styleVars.txtFontSizeLg, // '15px',
    marginRight: theme.spacing(0.75),
  },
  statusText: {
    // ...
  },
  updatedText: {
    fontSize: styleVars.txtFontSizeXs,
  },
  wrapper: {},
}));

StatusBlock.propTypes = {
  response: PropTypes.shape(responseWithResponseValueShape),
};
