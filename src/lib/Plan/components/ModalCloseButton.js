import React from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import HgButtonWithIconAndText from "components/ui/HgButtonWithIconAndText";

export default React.memo(ModalCloseButton);

//
// Close button for action plan modals.
// ------------------------------------
// See Plan.js for styling.
//

function ModalCloseButton({ closeWith, hideText }) {
  return (
    <div className={"plan-modal-close-button-wrapper"}>
      <HgButtonWithIconAndText
        icon={CloseIcon}
        hideText={hideText}
        buttonProps={{
          "aria-label": "close",
          onClick: closeWith,
        }}
      >
        Close
      </HgButtonWithIconAndText>
    </div>
  );
}

ModalCloseButton.propTypes = {
  closeWith: PropTypes.func.isRequired,
  hideText: PropTypes.bool,
};
