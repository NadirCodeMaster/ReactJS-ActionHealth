import React, { Fragment, useEffect, useRef, useState } from "react";
import { isNumber } from "lodash";
import PropTypes from "prop-types";
import Done from "@mui/icons-material/Done";
import Publish from "@mui/icons-material/Publish";
import SaveAlt from "@mui/icons-material/SaveAlt";
import Submittable from "../../classes/MetaHandlers/Submittable";

//
// Icon used in final action link at upper right of
// build, preview pages.
//

export default function FinalLinkIcon({ submittableStatus }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [LibraryIcon, setLibraryIcon] = useState(
    statusIconMap[Submittable.submittableStatuses.UNKNOWN]
  );

  useEffect(() => {
    let defStatus = Submittable.submittableStatuses.UNKNOWN;
    let sim = statusIconMap;
    let newVal = isNumber(submittableStatus) ? sim[submittableStatus] : sim[defStatus];
    if (mounted.current) {
      setLibraryIcon(newVal);
    }
  }, [submittableStatus]);

  return (
    <Fragment>
      <LibraryIcon color="primary" />
    </Fragment>
  );
}

const statusIconMap = {
  [Submittable.submittableStatuses.UNKNOWN]: SaveAlt,
  [Submittable.submittableStatuses.NOT_APPLICABLE]: SaveAlt,
  [Submittable.submittableStatuses.NOT_SUBMITTED]: Publish,
  [Submittable.submittableStatuses.SUBMITTED_AND_PENDING]: Done,
  [Submittable.submittableStatuses.SUBMITTED_AND_LOCKED]: Done,
};

FinalLinkIcon.propTypes = {
  submittableStatus: PropTypes.number,
};
