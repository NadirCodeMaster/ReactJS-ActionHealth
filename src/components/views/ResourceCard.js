import React, { Component } from "react";
import { compose } from "redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { forEach, filter, isEmpty } from "lodash";
import { withStyles } from "@mui/styles";
import nl2br from "react-nl2br";
import isResourceDetailUrl from "utils/isResourceDetailUrl";
import clsx from "clsx";
import resourceDefaultBackgroundImage from "images/resource_list_item_default_background.svg";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Card component for resources (as seen in resource lists)
 */
class ResourceCard extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    resourceId: PropTypes.number.isRequired,
    resourceName: PropTypes.string.isRequired,
    handleSearch: PropTypes.func.isRequired,
    resourceImage: PropTypes.string,
    resourceHiResImage: PropTypes.string,
    resourceTagsOutput: PropTypes.object,
    resourceTags: PropTypes.array,
    resourceSummary: PropTypes.string,
    restricted: PropTypes.bool,
    resourceLinkUrl: PropTypes.string,
  };

  /**
   * Creates tag jsx for hyperlinked tag list given tag array
   * from a single resource
   * @returns {object} jsx
   */
  linkedTagJsx() {
    const { handleSearch, resourceTags } = this.props;
    let tagsJsx;

    if (!resourceTags) {
      return;
    }

    let filteredTags = filter(resourceTags, (tag) => {
      return !tag.internal;
    });

    if (!isEmpty(filteredTags)) {
      tagsJsx = [];

      forEach(filteredTags, (tag) => {
        let isNotLastOfMultiple =
          filteredTags.length > 1 && filteredTags[filteredTags.length - 1] !== tag;

        tagsJsx.push(
          <span
            key={`resource_tag_${tag.id}`}
            style={{
              color: styleVars.colorPrimary,
              textTransform: "uppercase",
              fontWeight: styleVars.txtFontWeightDefaultMedium,
              fontSize: "10px",
              cursor: "pointer",
            }}
            onClick={(e) => {
              handleSearch({ tags: tag.slug }, e);
            }}
          >
            {tag.name}
            {isNotLastOfMultiple && ", "}
          </span>
        );
      });
    }

    return tagsJsx;
  }

  /**
   * Creates translation jsx for linked translation list given translations array
   * from a single resource
   * @returns {object} jsx
   */
  resourceTranslationsOutput = () => {
    const { resourceTranslations } = this.props;
    let resourceTranslationOutput = [];

    if (isEmpty(resourceTranslations)) {
      return;
    }

    forEach(resourceTranslations, (rt) => {
      if (isResourceDetailUrl(rt.link_url)) {
        resourceTranslationOutput.push(
          <Link key={`resource_translation_${rt.id}`} to={`/app/resources/${rt.id}`}>
            {rt.language.endonym}
          </Link>
        );
      }
      if (!isResourceDetailUrl(rt.link_url)) {
        resourceTranslationOutput.push(
          <a
            key={`resource_translation_${rt.id}`}
            href={rt.link_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {rt.language.endonym}
          </a>
        );
      }
    });

    // add pipe delimiter to resource translation link jsx
    return resourceTranslationOutput.reduce((accu, elem) => {
      return accu === null ? [elem] : [...accu, " | ", elem];
    }, null);
  };

  render() {
    const {
      classes,
      currentUser,
      resourceImage,
      resourceHiResImage,
      resourceSummary,
      restricted,
      resourceLinkUrl,
      resourceId,
      resourceName,
      resourceTags,
      resourceTranslations,
      widthSizeStr,
    } = this.props;

    return (
      <div
        key={`resource_list_item_${resourceId}`}
        style={{ width: widthSizeStr }}
        className={clsx(classes.resourceDetailWrapper)}
      >
        {isResourceDetailUrl(resourceLinkUrl) ? (
          <Link className={classes.resourceImageWrapper} to={`/app/resources/${resourceId}`}>
            <img
              src={resourceImage || resourceDefaultBackgroundImage}
              className={classes.resourceImage}
              alt={resourceName}
              {...(resourceHiResImage && {
                srcSet: resourceHiResImage,
              })}
            />
          </Link>
        ) : (
          <a
            className={classes.resourceImageWrapper}
            href={resourceLinkUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              src={resourceImage || resourceDefaultBackgroundImage}
              className={classes.resourceImage}
              alt={resourceName}
              {...(resourceHiResImage && {
                srcSet: resourceHiResImage,
              })}
            />
          </a>
        )}
        {resourceTags && <div className={classes.resourceListTags}>{this.linkedTagJsx()}</div>}
        {isResourceDetailUrl(resourceLinkUrl) ? (
          <Link className={classes.resourceTitleWrapper} to={`/app/resources/${resourceId}`}>
            <h2 className={classes.resourceItemTitle}>{resourceName}</h2>
          </Link>
        ) : (
          <a
            className={classes.resourceTitleWrapper}
            href={resourceLinkUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <h2 className={classes.resourceItemTitle}>{resourceName}</h2>
          </a>
        )}
        {resourceSummary && (
          <div className={classes.resourceSummaryWrapper}>
            <div>{nl2br(resourceSummary)}</div>
          </div>
        )}
        {!isEmpty(resourceTranslations) && (
          <div className={classes.resourceLanguagesContainer}>
            {this.resourceTranslationsOutput()}
          </div>
        )}
        {restricted && !currentUser.isAuthenticated && (
          <div className={classes.resourceListLoginRequired}>Log in required</div>
        )}
      </div>
    );
  }
}

const styles = (theme) => ({
  resourceListLoginRequired: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  resourceSummaryWrapper: {
    margin: theme.spacing(0, 0, 0.5, 0),
  },
  resourceListTags: {
    fontSize: styleVars.txtFontSizeXs,
    margin: theme.spacing(0, 0, 0.5, 0),
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  resourceTitleWrapper: {
    margin: theme.spacing(0, 0, 0.5, 0),
    display: "block",
  },
  resourceItemTitle: {
    color: styleVars.colorPrimary,
    lineHeight: 1.25,
    margin: 0,
    fontSize: styleVars.txtFontSizeLg,
  },
  resourceImageWrapper: {
    backgroundColor: "#eee",
    position: "relative",
    width: "100%",
    paddingTop: "57.6%",
    display: "block",
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourceImage: {
    left: "0",
    objectFit: "cover",
    maxWidth: "unset",
    height: "100%",
    position: "absolute",
    top: "0",
    width: "100%",
  },
  resourceDetailWrapper: {
    marginBottom: theme.spacing(2),
    marginRight: "1%",
    flex: "0 0 auto",
    "&.sm": {
      width: "100%",
    },
    "&.md": {
      width: "49%",
    },
    "&.lg": {
      width: "24%",
    },
  },
});

export default compose(withStyles(styles, { withTheme: true }))(ResourceCard);
