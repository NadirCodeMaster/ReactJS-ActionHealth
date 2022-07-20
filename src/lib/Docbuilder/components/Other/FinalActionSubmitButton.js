import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { requestSubmitSubmittableDocbuilder } from "../../requests";
import { Button } from "@mui/material";

//
// "Submit" button for use in final view.
// --------------------------------------
// Only use with submittable docbuilders. May be used
// as the primary or secondary action as needed.
//

export default function FinalActionSubmitButton({
  buttonText,
  disabled,
  docbuilderSlug,
  onFailureFn,
  onSuccessFn,
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

  const [submitting, setSubmitting] = useState(false);

  // Handler for button click.
  const handleClick = useCallback(() => {
    setSubmitting(true);
    requestSubmitSubmittableDocbuilder(docbuilderSlug, organizationId)
      .then((res) => {
        if (200 === res.status) {
          if (onSuccessFn && mounted.current) {
            onSuccessFn(res.data.submittable);
          }
        }
        if (mounted.current) {
          setSubmitting(false);
        }
      })
      .catch((err) => {
        if (onFailureFn && mounted.current) {
          onFailureFn(err.message);
          setSubmitting(false);
        }
      });
  }, [docbuilderSlug, onFailureFn, onSuccessFn, organizationId]);

  return (
    <Button
      onClick={handleClick}
      color="primary"
      variant="contained"
      disabled={disabled || submitting}
      size={size}
    >
      {buttonText}
    </Button>
  );
}

FinalActionSubmitButton.propTypes = {
  buttonText: PropTypes.string,
  disabled: PropTypes.bool,
  docbuilderSlug: PropTypes.string.isRequired,
  onFailureFn: PropTypes.func,
  onSuccessFn: PropTypes.func,
  organizationId: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
};
