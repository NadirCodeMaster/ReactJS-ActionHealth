import React from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { withStyles } from "@mui/styles";
import isResourceDetailUrl from "utils/isResourceDetailUrl";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

/**
 * Displays list of Related Resources
 *
 * Intended as simple, user-facing list typically displayed resource detail pages
 */
class RelatedResources extends React.Component {
  /**
   * Clips and adds ellipses to summary strings if longer
   * than 70 characters
   * @param {string} summary
   * @returns {string} summary
   */
  resourceSummaryTrunc = (summary) => {
    if (summary.length < 70) {
      return summary;
    }

    return summary.substring(0, 70) + "...";
  };

  /**
   * Determines if we display Log In Required text
   * @param {object} resource
   * @returns {boolean}
   */
  displayLogInRequired = (resource) => {
    const { currentUser } = this.props;

    return resource.restricted && !currentUser.isAuthenticated;
  };

  render() {
    const { classes, relatedResources } = this.props;

    return (
      <ul>
        {relatedResources.map((resource) => (
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
            {this.displayLogInRequired(resource) && (
              <span className={classes.resourceLogInRequired}>Log In Required</span>
            )}
            {resource.summary && <p>{this.resourceSummaryTrunc(resource.summary)}</p>}
            <div className="only-print">
              https://healthiergeneration.org/app/resources/{resource.id}
            </div>
          </li>
        ))}
      </ul>
    );
  }
}

const styles = (theme) => ({
  overflowWrapContainer: {
    overflowWrap: "break-word",
    wordWrap: "break-word",
    hyphens: "auto",
  },
  resourceLogInRequired: {
    fontSize: styleVars.txtFontSizeXs,
    marginLeft: theme.spacing(),
    fontStyle: "italic",
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(RelatedResources));
