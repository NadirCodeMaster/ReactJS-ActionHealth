import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";

//
// PlanItem block showing "Complete" toggle.
// -------------------------------------------
//

export default function CompletionToggleBlock({
  handleToggleChange,
  isComplete,
  readOnly,
  savingChanges,
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

  // Button props we set based on current component values.
  const [buttonColor, setButtonColor] = useState("secondary");
  const [buttonAriaLabel, setButtonAriaLabel] = useState("");
  const [buttonTitle, setButtonTitle] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonValue, setButtonValue] = useState("open"); // 'open'|'close'
  const [printFriendlyLabelText, setPrintFriendlyLabelText] = useState("");

  // Set the button props.
  useEffect(() => {
    if (isComplete) {
      if (mounted.current) {
        setButtonColor("secondary");
        setButtonAriaLabel("Reopen");
        setButtonTitle("Are you sure you want to re-open this Action Plan item?");
        setButtonText("Reopen");
        setButtonValue("open");
        setPrintFriendlyLabelText("Completed");
      }
    } else {
      if (mounted.current) {
        setButtonColor("primary");
        setButtonAriaLabel("Mark as completed");
        setButtonTitle("Are you sure you want to mark this item as complete on your Action Plan?");
        setButtonText("Mark as completed");
        setButtonValue("close");
        setPrintFriendlyLabelText("Not yet completed");
      }
    }
  }, [isComplete]);

  return (
    <div className={classes.wrapper}>
      <div className="no-print">
        <ConfirmButton
          fullWidth
          disabled={readOnly || savingChanges}
          color={buttonColor}
          onConfirm={() => handleToggleChange(buttonValue)}
          title={buttonTitle}
          aria-label={buttonAriaLabel}
          variant="contained"
        >
          {buttonText}
        </ConfirmButton>
      </div>
      <div className="only-print">{printFriendlyLabelText}</div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {},
}));

CompletionToggleBlock.propTypes = {
  handleToggleChange: PropTypes.func.isRequired,
  isComplete: PropTypes.bool,
  readOnly: PropTypes.bool,
  savingChanges: PropTypes.bool,
};
