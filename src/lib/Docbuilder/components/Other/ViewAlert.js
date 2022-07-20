import React, { useEffect, useRef, useState } from "react";
import { includes, isString } from "lodash";
import PropTypes from "prop-types";
import HgAlert from "components/ui/HgAlert";

//
// Alert display at used in Docbuilder page and modal views.
//
// Often populated with values from UIContent (primary_view_alert_message,
// primary_view_alert_severity, secondary_view_alert_message,
// secondary_view_alert_severity).
//

export default function ViewAlert({
  marginBottom,
  marginTop,
  message,
  severity,
  // Small imposes compactLayout on HgAlert.
  small,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [actualMessage, setActualMessage] = useState("");
  const [actualSeverity, setActualSeverity] = useState("info");

  useEffect(() => {
    let newActualMessage = "";
    if (isString(message)) {
      newActualMessage = message.trim();
    }
    if (mounted.current) {
      setActualMessage(newActualMessage);
    }
  }, [message]);

  useEffect(() => {
    let newActualSeverity = "info";
    if (includes(allowedSeverities, severity)) {
      newActualSeverity = severity;
    }
    if (mounted.current) {
      setActualSeverity(newActualSeverity);
    }
  }, [severity]);

  if (0 === actualMessage.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: marginBottom, marginTop: marginTop }}>
      <HgAlert
        includeIcon={true}
        compactLayout={small}
        message={actualMessage}
        severity={actualSeverity}
      ></HgAlert>
    </div>
  );
}

const allowedSeverities = ["error", "info", "success", "warning"];

ViewAlert.defaultProps = {
  marginBottom: "0",
  marginTop: "0",
  message: "",
  severity: "info",
  small: false,
};

ViewAlert.propTypes = {
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  message: PropTypes.string,
  severity: PropTypes.string,
  small: PropTypes.bool,
};
