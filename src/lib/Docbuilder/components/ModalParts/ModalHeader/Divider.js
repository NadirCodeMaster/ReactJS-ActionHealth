import React from "react";
import styleVars from "style/_vars.scss";

export default React.memo(ModalHeaderDivider);

//
// Vertical divider used to separate Columns in a ModalHeader.
// -----------------------------------------------------------
//

function ModalHeaderDivider() {
  return (
    <div
      style={{
        backgroundColor: styleVars.colorLightGray,
        flexGrow: 0,
        flexShrink: 0,
        height: "inherit",
        maxWidth: "2px",
        width: "2px",
      }}
    ></div>
  );
}
