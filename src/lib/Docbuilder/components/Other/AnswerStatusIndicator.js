import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { CircularProgress, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CloudDone, CloudUpload, Warning } from "@mui/icons-material";
import clsx from "clsx";
import { errorInUnsavedAnswersMessage } from "../../utils/subsection/constants";
import styleVars from "style/_vars.scss";

//
// Provides icon based on answer status.
// ---------------------------------------------------------------
//
export default React.memo(AnswerStatusIndicator);

function AnswerStatusIndicator({
  changesPresent,
  disabled,
  invalid,
  onClick,
  saveInProgress,
  increasedVisibilityWhenSavable,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const [status, setStatus] = useState(statuses.UNKNOWN);

  // Set status.
  useEffect(() => {
    // Save in progress takes precedence over all other statuses.
    if (saveInProgress) {
      if (mounted.current) {
        setStatus(statuses.SAVING);
      }
      return;
    }

    // Beyond that, we refine based on whether changes are present.
    if (changesPresent && invalid) {
      if (mounted.current) {
        setStatus(statuses.INVALID_WITH_UNSAVED_CHANGES);
      }
      return;
    }

    if (changesPresent && !invalid) {
      if (mounted.current) {
        setStatus(statuses.VALID_WITH_UNSAVED_CHANGES);
      }
      return;
    }

    // If we've exhausted all other cases, we consider it valid and
    // in alignment with the server-stored value.
    if (mounted.current) {
      setStatus(statuses.VALID_WITH_NO_UNSAVED_CHANGES);
    }
    return;
  }, [changesPresent, increasedVisibilityWhenSavable, invalid, saveInProgress]);

  const displayIcon = () => {
    switch (status) {
      // -----------------------------------------------
      case statuses.SAVING:
        return <CircularProgress size="0.5em" className={classes.circularProgress} />;
      // -----------------------------------------------
      case statuses.INVALID_WITH_UNSAVED_CHANGES:
        return <Warning className={clsx(classes.icon, classes.iconInvalid)} />;
      // -----------------------------------------------
      case statuses.VALID_WITH_NO_UNSAVED_CHANGES:
        return <CloudDone className={clsx(classes.icon)} />;
      // -----------------------------------------------
      case statuses.VALID_WITH_UNSAVED_CHANGES:
        let saveClass = classes.iconChangesPresentNotIncreasedVis;
        if (increasedVisibilityWhenSavable) {
          saveClass = classes.iconChangesPresentNotIncreasedVis;
        }
        return <CloudUpload className={clsx(classes.icon, saveClass)} />;
      // -----------------------------------------------
      case statuses.UNKNOWN:
      default:
        return null;
      // -----------------------------------------------
    }
  };

  // Get text for tooltip based on status.
  const tooltipTitle = () => {
    switch (status) {
      // -----------------------------------------------
      case statuses.SAVING:
        return "Saving changes...";
      // -----------------------------------------------
      case statuses.INVALID_WITH_UNSAVED_CHANGES:
        return errorInUnsavedAnswersMessage;
      // -----------------------------------------------
      case statuses.VALID_WITH_NO_UNSAVED_CHANGES:
        return "No unsaved changes present.";
      // -----------------------------------------------
      case statuses.VALID_WITH_UNSAVED_CHANGES:
        return "Will save changes momentarily...";
      // -----------------------------------------------
      case statuses.UNKNOWN:
      default:
        return "Calculating...";
      // -----------------------------------------------
    }
  };

  return (
    <Tooltip title={tooltipTitle()} arrow>
      <span
        className={clsx(classes.iconWrapper, {
          [classes.iconWrapperInvalid]: status === statuses.INVALID_WITH_UNSAVED_CHANGES,
        })}
      >
        {displayIcon()}
      </span>
    </Tooltip>
  );
}

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    color: styleVars.colorBrandOrange,
    animationDuration: "450ms",
  },
  iconWrapperInvalid: {
    // "fadeIn" animation defined in App.scss
    animation: "fadeIn 1.25s",
  },
  icon: {
    color: styleVars.colorSecondary,
    opacity: "0.25",
  },
  iconInvalid: {
    color: styleVars.colorStatusError,
    opacity: "1.0",
  },
  iconChangesPresentIncreasedVis: {
    color: styleVars.colorStatusInfo,
    opacity: "1.0",
  },
  iconChangesPresentNotIncreasedVis: {
    //
  },
}));

const statuses = {
  // Default to use prior to calculating actual status.
  UNKNOWN: 0,
  // When answer is being submitted to server.
  SAVING: 10,
  // Values are invalid and unsaved.
  //   This is the typical scenario when a form isn't yet complete or
  //   there are validation problems. (We don't submit invalid changes,
  //   so there's no INVALID_WITH_SAVED_CHANGES status.)
  INVALID_WITH_UNSAVED_CHANGES: 20,
  // Values are valid and same as on the server.
  VALID_WITH_NO_UNSAVED_CHANGES: 30,
  // Values are valid and _NOT_ the same as on server.
  VALID_WITH_UNSAVED_CHANGES: 40,
};

AnswerStatusIndicator.propTypes = {
  changesPresent: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  invalid: PropTypes.bool,
  saveInProgress: PropTypes.bool,
  increasedVisibilityWhenSavable: PropTypes.bool,
};
