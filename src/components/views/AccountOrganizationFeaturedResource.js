import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { organizationShape, organizationTypeShape } from "constants/propTypeShapes";
import PropTypes from "prop-types";

/**
 * Featured Resource Block, used in Organization Overview page
 */
function AccountOrganizationFeaturedResource({ organization, organizationType }) {
  const [headline, setHeadline] = useState(null);
  const [body, setBody] = useState(null);
  const [action, setAction] = useState(null);

  // -- Set headline based on org type.
  useEffect(() => {
    let newHeadline = null;
    switch (organizationType.machine_name) {
      // District-like orgs.
      case "cmo":
      case "district":
      case "esd":
        newHeadline = "Wellness Policy Builder";
        break;
      // All others.
      default:
        newHeadline = "Model Wellness Policy";
        break;
    }
    setHeadline(newHeadline);
  }, [organizationType]);

  // -- Set body based on org type.
  useEffect(() => {
    let newBody = null;
    switch (organizationType.machine_name) {
      // District-like orgs.
      case "cmo":
      case "district":
      case "esd":
        newBody =
          "This tool will walk you through creating a local school wellness policy that meets or exceeds federal regulations.";
        break;
      // OST
      case "ost":
        newBody =
          "This resource will guide you through the process to establish a wellness policy for your out-of-school time organization.";
        break;
      // All others. (esp schools)
      default:
        newBody =
          "This resource will guide you through the process to establish a local school wellness policy that meets or exceeds federal regulations.";
        break;
    }
    setBody(newBody);
  }, [organizationType]);

  // -- Set action based on org type, org data.
  useEffect(() => {
    let newAction = null;
    switch (organizationType.machine_name) {
      // District-like orgs.
      case "cmo":
      case "district":
      case "esd":
        newAction = (
          <Link to={`/app/account/organizations/${organization.id}/builder/wellness-policy`}>
            Explore the Wellness Policy Builder
          </Link>
        );
        break;
      // OST
      case "ost":
        newAction = <Link to={`/app/resources/87`}>View the Model Wellness Policy</Link>;
        break;
      // All others. (esp schools)
      default:
        newAction = <Link to={`/app/resources/2`}>View the Model Wellness Policy</Link>;
        break;
    }
    setAction(newAction);
  }, [organization, organizationType]);

  return (
    <Box>
      {headline && <h3>{headline}</h3>}
      {body && <Box sx={{ mb: 1 }}>{body}</Box>}
      {action && <Box>{action}</Box>}
    </Box>
  );
}

AccountOrganizationFeaturedResource.propTypes = {
  organization: PropTypes.shape(organizationShape).isRequired,
  organizationType: PropTypes.shape(organizationTypeShape).isRequired,
};

export default AccountOrganizationFeaturedResource;
