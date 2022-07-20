import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

//
// "Download" button for use in final view.
// ----------------------------------------
// Works for submittable and non-submittable docbuilders. May
// be used as the primary or secondary action as needed.
//

export default function FinalActionDownloadButton({
  buttonText,
  disabled,
  docbuilderSlug,
  organizationId,
  size,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [dest, setDest] = useState("#");

  useEffect(() => {
    let apiBaseUrl = process.env.REACT_APP_API_URL;
    let newDest = `${apiBaseUrl}/api/v1/docbuilders/${docbuilderSlug}/organizations/${organizationId}/doc/binary`;
    if (mounted.current) {
      setDest(newDest);
    }
  }, [docbuilderSlug, organizationId]);

  return (
    <Button
      component="a"
      href={dest}
      color="primary"
      variant="contained"
      disabled={disabled}
      size={size}
    >
      {buttonText}
    </Button>
  );
}

FinalActionDownloadButton.propTypes = {
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
  docbuilderSlug: PropTypes.string.isRequired,
  organizationId: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
};
