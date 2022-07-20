import React, { useState, useEffect, useRef } from "react";
import { isArray, isEmpty, isNil } from "lodash";
import { requestCriterionResources } from "api/requests";
import isResourceDetailUrl from "utils/isResourceDetailUrl";
import { Link } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function CriterionResources({
  callerResources,
  headerTagLevel,
  headerText,
  criterionId,
  quantity,
}) {
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [HeaderTag, setHeaderTag] = useState("h3");
  const classes = useStyles();

  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Set header tag.
  useEffect(() => {
    let newHeaderTag = "h3";
    if (headerTagLevel) {
      let cast = parseInt(headerTagLevel, 10);
      newHeaderTag = `h${cast}`;
    }
    setHeaderTag(newHeaderTag);
  }, [headerTagLevel]);

  useEffect(() => {
    // Use callerResources prop if available, then
    // skip the rest of this method.
    if (isArray(callerResources)) {
      setLoading(false);
      setResources(callerResources);
      return;
    }
    setLoading(true);

    let perPage = !isNil(quantity) ? Number(quantity) : 10;

    requestCriterionResources(criterionId, { per_page: perPage })
      .then((res) => {
        if (200 === res.status) {
          if (mounted.current) {
            setLoading(false);
            setResources(res.data.data);
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving resource records");
        if (mounted.current) {
          setLoading(false);
          setResources([]);
        }
      });
  }, [callerResources, criterionId, quantity]);

  /**
   * Clips and adds ellipses to summary strings if longer
   * than 70 characters
   * @param {string} summary
   * @returns {string} summary
   */
  const resourceSummaryTrunc = (summary) => {
    if (summary.length < 70) {
      return summary;
    }
    return summary.substring(0, 70) + "...";
  };

  return (
    <React.Fragment>
      {headerText && <HeaderTag>{headerText}</HeaderTag>}
      {loading && <CircularProgress size="1em" />}
      {!isEmpty(resources) && (
        <ul>
          {resources.map((resource) => (
            <li key={`related_resource_${resource.id}`}>
              {isResourceDetailUrl(resource.link_url) ? (
                <Link
                  className={clsx("print-without-link-color", classes.overflowWrapContainer)}
                  to={`/app/resources/${resource.id}`}
                >
                  {resource.name}
                </Link>
              ) : (
                <a
                  className={clsx("print-without-link-color", classes.overflowWrapContainer)}
                  href={resource.link_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {resource.name}
                </a>
              )}
              {resource.summary && <p>{resourceSummaryTrunc(resource.summary)}</p>}
              <div className="only-print">
                https://healthiergeneration.org/app/resources/{resource.id}
              </div>
            </li>
          ))}
        </ul>
      )}
    </React.Fragment>
  );
}

const useStyles = makeStyles({
  overflowWrapContainer: {
    overflowWrap: "break-word",
    wordWrap: "break-word",
    hyphens: "auto",
  },
});

CriterionResources.propTypes = {
  callerResources: PropTypes.array, // If BYOing your resources
  criterionId: PropTypes.number.isRequired,
  headerText: PropTypes.string,
  headerTagLevel: PropTypes.number,
  quantity: PropTypes.number, // only applies if this component requests them from API
};
