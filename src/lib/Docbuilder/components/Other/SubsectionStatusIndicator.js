import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { isNumber, has } from "lodash";
import { statuses } from "../../utils/subsection/constants";
import { Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorIcon from "@mui/icons-material/Error";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

//
// Provides an icon indicating status of a subsection.
// ---------------------------------------------------
//

export default React.memo(SubsectionStatusIndicator);

function SubsectionStatusIndicator({ errorPresent, errorText, fontSize = "26px", status }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const [statusInfo, setStatusInfo] = useState(null);

  useEffect(() => {
    let statusInfo = findStatusInfo(status);
    if (mounted.current) {
      setStatusInfo(statusInfo);
    }
  }, [status]);

  if (!statusInfo) {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      {statusIcon(statusInfo, errorPresent, classes, fontSize)}
      {errorPresent && (
        <div className={classes.error}>
          <Tooltip title={errorText} arrow>
            <ErrorIcon />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

// Returns the "properties" for a specified status value (number).
const findStatusInfo = (status = null) => {
  let effectiveStatusNum = isNumber(status) ? status : statuses.PENDING;
  if (has(statuses.properties, effectiveStatusNum)) {
    return statuses.properties[effectiveStatusNum];
  }
  return null;
};

// Returns the status icon JSX for the provided status info object.
const statusIcon = (statusInfo, errorPresent, classes, fontSize) => {
  if (!statusInfo || !has(statusInfo, "machine_name")) {
    return null;
  }
  switch (statusInfo.machine_name) {
    case "ready":
      return (
        <CheckCircleIcon
          className={clsx(classes.iconCommon, classes.ready, {
            [classes.iconWithError]: errorPresent,
          })}
          titleAccess={statusInfo.name}
          style={{ fontSize: fontSize }}
        />
      );
    case "excluding":
      return (
        <BlockOutlinedIcon
          className={clsx(classes.iconCommon, classes.excluding, {
            [classes.iconWithError]: errorPresent,
          })}
          titleAccess={statusInfo.name}
          style={{ fontSize: fontSize }}
        />
      );
    case "not_applicable":
      return (
        <DescriptionIcon
          className={clsx(classes.iconCommon, classes.notApplicable, {
            [classes.iconWithError]: errorPresent,
          })}
          titleAccess={statusInfo.name}
          style={{ fontSize: fontSize }}
        />
      );
    case "pending":
    default:
      return (
        <RadioButtonUncheckedIcon
          className={clsx(classes.iconCommon, classes.pending, {
            [classes.iconWithError]: errorPresent,
          })}
          titleAccess={statusInfo.name}
          style={{ fontSize: fontSize }}
        />
      );
  }
};

const useStyles = makeStyles((theme) => ({
  wrapper: {
    alignItems: "center",
    display: "inline-flex",
    position: "relative",
  },
  error: {
    color: "#bbb",
    fontSize: theme.spacing(0.75),
    position: "absolute",
    right: theme.spacing(-0.75),
    top: theme.spacing(-1),
    // "fadeIn" animation defined in App.scss
    animation: "fadeIn 2s",
  },
  iconCommon: {
    opacity: 1,
    transition: "opacity 1.25s ease-in-out",
  },
  pending: {
    color: styleVars.colorLightGray,
  },
  notApplicable: {
    color: styleVars.colorDarkGray,
  },
  ready: {
    color: styleVars.colorStatusSuccess,
  },
  excluding: {
    color: styleVars.colorDarkGray,
  },
  iconWithError: {
    opacity: "0.25",
  },
}));

SubsectionStatusIndicator.propTypes = {
  errorPresent: PropTypes.bool,
  errorText: PropTypes.string,
  status: PropTypes.number,
  fontSize: PropTypes.string,
};
