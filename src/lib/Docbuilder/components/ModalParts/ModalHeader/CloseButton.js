import React from "react";
import PropTypes from "prop-types";
import CloseIcon from "@mui/icons-material/Close";
import HgButtonWithIconAndText from "components/ui/HgButtonWithIconAndText";

export default React.memo(CloseButton);

//
// Close button usable as a child of a ModalHeader Column.
// -------------------------------------------------------
// CSS classes used here are styled via ModalHeader.js.
//

function CloseButton({ closeWith, hideText }) {
  return (
    <div className={"docbuilder-modal-header-button-wrapper"}>
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

CloseButton.propTypes = {
  closeWith: PropTypes.func.isRequired,
  hideText: PropTypes.bool,
};
