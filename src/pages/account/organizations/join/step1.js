import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { filter, has, includes, map } from "lodash";
import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import currentUserOrgCount from "utils/currentUserOrgCount";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";
import sp from "style/utils/sp";

/**
 * Step 1 of joining an org: UI for selecting the organization type.
 *
 * Selecting the org type here routes the user to Step 2.
 */
function Step1() {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const organizationTypes = useSelector((state) => state.app_meta.data.organizationTypes);
  const [filteredOrgTypes, setFilteredOrgTypes] = useState([]);
  const [userHasOrgs, setUserHasOrgs] = useState(false);
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Set page title.
  useEffect(() => {
    generateTitle(pageTitle);
  }, []);

  // Populate filteredOrgTypes.
  useEffect(() => {
    let _ots = filter(organizationTypes, (ot) => {
      return includes(includedOrgTypeMachineNames, ot.machine_name);
    });
    if (mounted.current) {
      setFilteredOrgTypes(_ots);
    }
  }, [organizationTypes]);

  // Populate userHasOrgs.
  useEffect(() => {
    let newUserHasOrgs = false;
    if (has(currentUser, "data")) {
      newUserHasOrgs = !!currentUserOrgCount(currentUser.data);
    }
    if (mounted.current) {
      setUserHasOrgs(newUserHasOrgs);
    }
  }, [currentUser]);

  return (
    <React.Fragment>
      <Paper sx={{ padding: styleVars.paperPadding }}>
        <Box
          sx={{
            mb: 2,
            textAlign: "center",
          }}
        >
          <h1>{pageTitle}</h1>
          {!userHasOrgs && (
            <p>You don't belong to any organizations yet. Join one below to get started!</p>
          )}
        </Box>

        <Box>
          {map(filteredOrgTypes, (orgType) => (
            <React.Fragment key={orgType.id}>
              <Box>
                <Link
                  style={{
                    alignItems: "center",
                    border: `2px dashed ${styleVars.colorLightGray}`,
                    display: smallScreen ? "block" : "flex",
                    marginBottom: sp(3),
                    paddingTop: sp(3),
                    paddingBottom: sp(3),
                    paddingLeft: sp(2.5),
                    paddingRight: sp(2.5),
                    "&:hover": {
                      border: `2px dashed ${styleVars.colorPrimary}`,
                    },
                  }}
                  to={`/app/account/organizations/join/${orgType.machine_name}/find`}
                >
                  {/* LEFT */}
                  <Box
                    sx={{
                      alignItems: "center",
                      display: "inline-flex",
                      flex: "0 0 auto",
                      mb: smallScreen ? 2 : 0,
                      pr: 1,
                      whiteSpace: "nowrap",
                      width: smallScreen ? "100%" : "160px",
                    }}
                  >
                    <AddCircleIcon sx={{ mr: 1 }} />
                    <Box
                      component="span"
                      sx={{
                        whiteSpace: "normal",
                        fontSize: styleVars.txtFontSizeSm,
                      }}
                    >
                      Join {orgType.name}
                    </Box>
                  </Box>

                  {/* RIGHT */}
                  <Box
                    sx={{
                      display: "flex",
                      fontSize: styleVars.txtFontSizeSm,
                      fontStyle: "italic",
                    }}
                  >
                    {orgTypeDescriptions[orgType.machine_name] && (
                      <p>{orgTypeDescriptions[orgType.machine_name]}</p>
                    )}
                  </Box>
                </Link>
              </Box>
              {/* DIVIDER JUST AFTER OST */}
              {orgType.machine_name === "ost" && (
                <hr
                  style={{
                    border: `1px solid ${styleVars.colorLightGray}`,
                    marginBottom: sp(3),
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
    </React.Fragment>
  );
}

const pageTitle = "Join Your Organization's Team";

// The orrg types (via machine_name) and order we'll render.
const includedOrgTypeMachineNames = [
  "school",
  "district",
  "ost",
  "esd",
  "cmo",
  // 'jj'   @TODO Enable JJ when launching Juvenile Justice
];

// Define org type descriptions (not yet in data structure).
const orgTypeDescriptions = {
  school:
    "For principals, teachers, nurses, food service staff, and others who work with a specific school",
  district: "For superintendents, food service directors, and other district administrators",
  ost: "For out-of-school site directors, coordinators, and staff",
  jj: "",
  esd: "For educational service agency administrators and staff that support multiple districts in a service area, region, or county. (i.e., Regional Office of Education, Board of Cooperative Education Services, County Office of Education)",
  cmo: "For charter organization administrators and staff supporting multiple charter schools",
};

Step1.propTypes = {};

export default Step1;
