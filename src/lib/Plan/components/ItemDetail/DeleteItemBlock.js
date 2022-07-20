import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import ConfirmButton from "components/ui/ConfirmButton";

//
// PlanItem block showing "delete" button.
// ---------------------------------------
//

export default function DeleteItemBlock({ handle, readOnly, savingChanges }) {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      <div className="no-print">
        <ConfirmButton
          fullWidth
          className={classes.button}
          disabled={readOnly || savingChanges}
          color="primary"
          onConfirm={handle}
          title="Are you sure you want to remove this item from your Action Plan?"
          aria-label="Remove this item from Action Plan"
          variant="text"
        >
          Remove this item from Action Plan
        </ConfirmButton>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  button: {
    fontWeight: "normal",
  },
  wrapper: {},
}));

DeleteItemBlock.propTypes = {
  handle: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  savingChanges: PropTypes.bool,
};
