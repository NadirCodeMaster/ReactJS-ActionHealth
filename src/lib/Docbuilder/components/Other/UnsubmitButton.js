import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { requestUnsubmitSubmittableDocbuilder } from "../../requests";
import ConfirmButton from "components/ui/ConfirmButton";

//
// "Unsubmit" button unsubmitting a doc.
// -------------------------------------
// Only use with submittable docbuilders.
//

export default function UnsubmitButton({
  buttonText,
  confirmationText,
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

  const [unsubmitting, setUnsubmitting] = useState(false);

  // Handler for button click.
  const handleClick = useCallback(() => {
    setUnsubmitting(true);
    requestUnsubmitSubmittableDocbuilder(docbuilderSlug, organizationId)
      .then((res) => {
        if (204 === res.status) {
          if (onSuccessFn && mounted.current) {
            onSuccessFn();
          }
        }
        if (mounted.current) {
          setUnsubmitting(false);
        }
      })
      .catch((err) => {
        if (onFailureFn && mounted.current) {
          onFailureFn(err.message);
          setUnsubmitting(false);
        }
      });
  }, [docbuilderSlug, onFailureFn, onSuccessFn, organizationId]);

  return (
    <ConfirmButton
      onConfirm={handleClick}
      color="primary"
      variant="contained"
      disabled={disabled || unsubmitting}
      title={confirmationText}
      size={size}
    >
      {buttonText}
    </ConfirmButton>
  );
}

UnsubmitButton.propTypes = {
  buttonText: PropTypes.string,
  confirmationText: PropTypes.string,
  disabled: PropTypes.bool,
  docbuilderSlug: PropTypes.string.isRequired,
  onFailureFn: PropTypes.func,
  onSuccessFn: PropTypes.func,
  organizationId: PropTypes.number.isRequired,
  size: PropTypes.string.isRequired,
};
