import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import HgButtonWithIconAndText from "components/ui/HgButtonWithIconAndText";

export default React.memo(PreviewButton);

//
// Preview button usable as a child of a ModalHeader Column.
// ---------------------------------------------------------
// CSS classes used here are styled via ModalHeader.js.
//

function PreviewButton({ closeWith, docbuilderSlug, hideText, organizationId }) {
  return (
    <div className={"docbuilder-modal-header-button-wrapper"}>
      <HgButtonWithIconAndText
        hideText={hideText}
        icon={VisibilityOutlinedIcon}
        buttonProps={{
          "aria-label": "preview",
          onClick: closeWith,
          component: Link,
          to: `/app/account/organizations/${organizationId}/builder/${docbuilderSlug}/preview`,
        }}
      >
        Preview
      </HgButtonWithIconAndText>
    </div>
  );
}

PreviewButton.propTypes = {
  closeWith: PropTypes.func.isRequired,
  docbuilderSlug: PropTypes.string.isRequired,
  hideText: PropTypes.bool,
  organizationId: PropTypes.number.isRequired,
};
