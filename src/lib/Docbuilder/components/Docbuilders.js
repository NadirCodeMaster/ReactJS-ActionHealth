import React, { Fragment, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { CircularProgress, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import { organizationShape } from "constants/propTypeShapes";
import { requestDocbuilders } from "../requests";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

// List of builders available to an organization.

export default function Docbuilders({
  organization,
  userCanViewDocbuilders,
  userCanEditDocbuilders,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [docbuilders, setDocbuilders] = useState([]);

  // Set page title as props change.
  useEffect(() => {
    if (organization && userCanViewDocbuilders) {
      generateTitle(`Document Builders for ${organization.name}`);
    }
  }, [organization, userCanViewDocbuilders]);

  // Retrieve docbuilders available for org.
  useEffect(() => {
    if (!userCanViewDocbuilders) {
      // Bail if user can't view docbuilders.
      return;
    }
    if (mounted.current) {
      setLoading(true);
    }
    requestDocbuilders({
      organization_type_id: organization.organization_type_id,
      page: 1,
      per_page: 10,
    })
      .then((res) => {
        if (mounted.current) {
          setDocbuilders(res.data.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          console.error(err.message);
          setDocbuilders([]);
          setLoading(false);
        }
      });
  }, [currentUser, organization, userCanViewDocbuilders]);

  // Return 404 for users w/out access.
  if (!userCanViewDocbuilders) {
    return <PageNotFound />;
  }

  // If there's exactly one available docbuilder, forward the user to it
  // rather than showing it as one-item list.
  if (1 === docbuilders.length) {
    return (
      <Redirect
        to={`/app/account/organizations/${organization.id}/builder/${docbuilders[0].slug}`}
      />
    );
  }

  return (
    <Fragment>
      <h1>Document Builders</h1>
      <p>available for {organization.name}</p>
      <Paper style={{ padding: styleVars.paperPadding }}>
        {loading && <CircularProgress size="1em" />}
        {docbuilders.length === 0 ? (
          <div>
            <em>No document builders available.</em>
          </div>
        ) : (
          <ul className={classes.docbuildersList}>
            {docbuilders.map((docbuilder) => (
              <li key={docbuilder.id} className={classes.docbuildersListItem}>
                <Link
                  to={`/app/account/organizations/${organization.id}/builder/${docbuilder.slug}/build`}
                >
                  {docbuilder.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Paper>
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  docbuildersList: {},
  docbuildersListItem: {},
}));

Docbuilders.propTypes = {
  organization: PropTypes.shape(organizationShape).isRequired,
  userCanViewDocbuilders: PropTypes.bool,
  userCanEditDocbuilders: PropTypes.bool,
};
