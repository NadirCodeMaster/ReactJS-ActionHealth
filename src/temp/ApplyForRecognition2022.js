import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { find, get } from "lodash";
import { Box } from "@mui/material";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import HgAlert from "components/ui/HgAlert";
import PropTypes from "prop-types";

/**
 * Temporary component that displays an alert banner for Recognition 2022 application.
 *
 * Prop values inform whether the component renders anything. If they indicate it's
 * not applicable or appropriate to show, there's no output.
 *
 * Automatically renders nothing when that docbuilder is closed.
 *
 * @TODO Remove after April 2022
 */
function ApplyForRecognition2022({
  activeOrganizationId,
  activeOrganizationIsSchool,
  userCanViewDocbuilders,
}) {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const allDocbuilders = useSelector((state) => state.app_meta.data.docbuilders);
  const [hideThis, setHideThis] = useState(true);

  useEffect(() => {
    let newHideThis = true;
    if (activeOrganizationId && activeOrganizationIsSchool && allDocbuilders) {
      // Grab the recognition docbuilder.
      let docb = find(allDocbuilders, (d) => {
        return d.machine_name === "recognition_2022";
      });
      // If we found it and it's open, show it.
      if (docb) {
        let isClosed = get(docb, "closed", false);
        if (!isClosed) {
          newHideThis = false;
        }
      }
    }
    if (mounted.current) {
      setHideThis(newHideThis);
    }
  }, [activeOrganizationId, activeOrganizationIsSchool, allDocbuilders, userCanViewDocbuilders]);

  if (hideThis) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: 2 }}>
      <HgAlert
        severity="info"
        includeIcon={false}
        message={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TrophyIcon fontSize="small" sx={{ marginRight: 1 }} />{" "}
            <Link
              to={`/app/account/organizations/${activeOrganizationId}/builder/recognition-2022/build`}
            >
              <strong>Apply for the 2022 Healthier Generation Award</strong>
            </Link>
          </Box>
        }
      />
    </Box>
  );
}

ApplyForRecognition2022.propTypes = {
  activeOrganizationId: PropTypes.number,
  activeOrganizationIsSchool: PropTypes.bool,
  userCanViewDocbuilders: PropTypes.bool,
};

export default ApplyForRecognition2022;
