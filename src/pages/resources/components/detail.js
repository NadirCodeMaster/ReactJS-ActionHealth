import React, { useCallback, useState, useEffect } from "react";
import authConfigs from "constants/authConfigs";
import { Link, Redirect, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import moment from "moment";
import { filter, find, get, forEach, isEmpty } from "lodash";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import { Button, Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import LeftChevronIcon from "@mui/icons-material/ChevronLeft";
import PageNotFound from "components/views/PageNotFound";
import ResourceTranslations from "components/views/ResourceTranslations";
import RelatedResources from "components/views/RelatedResources";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import DraftEditor from "components/ui/DraftEditor";
import HgDialog from "components/ui/HgDialog";
import HgAlert from "components/ui/HgAlert";
import SoftGateForm from "./softGateForm";
import generateTitle from "utils/generateTitle";
import isJsonTextEmpty from "utils/isJsonTextEmpty";
import { requestCreateResourceActivity, requestLogSoftGatedResource } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Public facing resource detail
 */
ResourceDetail.propTypes = {
  populateResource: PropTypes.func.isRequired,
  hiRezImageForResource: PropTypes.func.isRequired,
  loadingResource: PropTypes.bool.isRequired,
  resource: PropTypes.object,
  resourceId: PropTypes.number.isRequired,
  populateRelatedResources: PropTypes.func.isRequired,
  relatedResources: PropTypes.array,
  loadingRelatedResources: PropTypes.bool.isRequired,
  resourceTrainingTypes: PropTypes.object,
  resourceTypes: PropTypes.object,
  updateResource: PropTypes.func.isRequired,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
};

export default function ResourceDetail({
  populateResource,
  hiRezImageForResource,
  loadingResource,
  resource,
  resourceId,
  populateRelatedResources,
  relatedResources,
  loadingRelatedResources,
  resourceTrainingTypes,
  resourceTypes,
  updateResource,
  currentUser,
}) {
  const [softGateDialogOpen, setSoftGateDialogOpen] = useState(false);
  const [resourceActivityLogged, setResourceActivityLogged] = useState(false);
  const [softGateLogged, setSoftGateLogged] = useState(false);
  const [cookies, setCookie] = useCookies([authConfigs.softGateKey]);
  const classes = useStyles();
  const location = useLocation();
  const { width, ref } = useResizeDetector();
  const maxSmWidth = 599;

  /**
   * Call requestCreateResourceActivity for current resource.
   *
   * @param {string} requestedActivity Basic action to log. This
   *  value must be one of the white-listed options specified by
   *  this method (not an  API-based value). The whitelisted options
   *  will be translated to the appropriate API value based on
   *  details of the resource itself.
   *  Allowed values:
   *  - 'loaded_detail' (user loaded the resource detail page)
   *  - 'clicked_link' (user manually clicked link to resource file/external url).
   */
  const logResourceActivity = useCallback(
    (requestedActivity) => {
      // Bail if resource not populated.
      if (isEmpty(resource)) {
        return;
      }

      // Only log if user has access to the resource (i.e.,
      // if resource is restricted, we only log if user is
      // authenticated).
      if (!resource.restricted || currentUser.isAuthenticated) {
        // Map the allowed values to those required by API, applying
        // any special logic based on the resource structure.
        let activityType;

        switch (requestedActivity) {
          case "loaded_detail":
            // Default, used for resources where !direct_download
            activityType = "details";
            // Adjust for direct_download resources. (we also require
            // there be a URL, since we otherwise cannot forward them;
            // however, it's an edge case and means that the resource
            // is not correctly structured/configured)
            if (resource.direct_download && resource.url) {
              activityType = "detail_forward";
            }
            break;
          case "clicked_link":
            activityType = "view_resource";
            break;
          default:
            console.error("Invalid argument provided to logResourceActivity", requestedActivity);
            return;
        }

        let resourceId = get(resource, "id", null);
        let loggingParams = { resource_id: resourceId, type: activityType };

        requestCreateResourceActivity(loggingParams)
          .catch((error) => {
            console.error("An error occurred in the resource logger", error);
          })
          .finally(() => {
            // Execute the afterLog callback in finally() since we
            // don't want failed logging to block the user.
            setResourceActivityLogged(true);
          });
      }
    },
    [resource, currentUser]
  );

  // Initial population of resource object
  useEffect(() => {
    populateResource(resourceId);
  }, [populateResource, resourceId, currentUser.id]);

  // Standard tasks to run on resource change
  useEffect(() => {
    if (!isEmpty(resource)) {
      // Set states to default if resource is changed and not empty
      setResourceActivityLogged(false);
      setSoftGateLogged(false);
      setSoftGateDialogOpen(false);

      if (resource.id === resourceId) {
        // Log that we hit the detail page
        logResourceActivity("loaded_detail");

        // Set <title>
        let resourceTitle = get(resource, "name", "");
        generateTitle(`${resourceTitle} | Resources`);

        // Populate related resources prop array
        populateRelatedResources(resource.related_resource_ids.join());
      }
    }
  }, [resource, resourceId, logResourceActivity, populateRelatedResources]);

  /**
   * Navigate user, adjust history etc if resource is direct_download.
   * Verify all neccesary logging is completed
   *
   * Other resources will simply be ignored. Only call _after_ logging
   * of the detail view has completed.
   */
  useEffect(() => {
    if (
      !isEmpty(resource) &&
      resource.direct_download &&
      (resource.soft_gate === false || softGateLogged) &&
      resourceActivityLogged
    ) {
      if (resource.url) {
        // This will send the user to the actual resource itself and
        // remove the current entry (resource detail page) from the
        // browser history to avoid a loop with the back-button.
        window.location.replace(resource.url);
      } else {
        console.warn("resource with direct_download is missing url property", resource);
      }
    }
  }, [resource, resourceActivityLogged, softGateLogged]);

  /**
   * Soft gate logic.  Open soft gate dialog if no cookie is present
   * If cookie is populated or changes, log soft gate with api call
   */
  useEffect(() => {
    if (!isEmpty(resource) && resource.id === resourceId) {
      if (
        resource.soft_gate &&
        !currentUser.isAuthenticated &&
        !resource.restricted &&
        resource.published
      ) {
        let softGateCookie = get(cookies, authConfigs.softGateKey, null);

        if (!softGateCookie) {
          setSoftGateDialogOpen(true);
        }
        if (softGateCookie) {
          let requestParams = softGateCookie;
          requestParams.resource_id = resource.id;
          requestLogSoftGatedResource(requestParams)
            .catch((error) => {
              console.error("An error  occurred in the resource logger", error);
            })
            .finally(() => {
              // Execute the afterLog callback in finally() since we
              // don't want failed logging to block the user.
              setSoftGateLogged(true);
            });
        }
      }

      if (resource.soft_gate && currentUser.isAuthenticated) {
        setSoftGateLogged(true);
      }
    }
  }, [resource, resourceId, currentUser, cookies]);

  /**
   * Get resource type machine_name
   * @returns {string} machine_name
   */
  const extractResourceType = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return get(resourceTypes[resource.resource_type_id], "machine_name", "");
  };

  /**
   * Get resource training type, undefined if not training resource type
   * @returns {object} trainingType
   */
  const extractResourceTrainingType = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return find(resourceTrainingTypes, { id: resource.training_type_id });
  };

  /**
   * Get formatted start time
   * @returns {string} time
   */
  const formattedResourceStartTime = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return moment.utc(resource.start_time).format("LLL") + " ET";
  };

  /**
   * Get formatted duration string
   * @returns {string} duration
   */
  const formattedResourceDuration = () => {
    if (isEmpty(resource) || !resource.duration) {
      return null;
    }

    let resourceDurationArray = resource.duration.split(":");

    let hour = parseInt(resourceDurationArray[0]) !== 0 ? resourceDurationArray[0] + " hour" : "";
    let minute =
      parseInt(resourceDurationArray[1]) !== 0 ? resourceDurationArray[1] + " minute" : "";

    if (resourceDurationArray[0] > 1) {
      hour += "s";
    }

    if (resourceDurationArray[1] > 1) {
      minute += "s";
    }

    return hour + " " + minute;
  };

  /**
   * Handles resource link click and logging calls
   * @param {object} e (event object)
   */
  const onClickResourceLink = (e) => {
    e.preventDefault();

    if (isEmpty(resource)) {
      return null;
    }

    let resourceType = extractResourceType();

    // Call logResourceActivity to indicate user clicked
    // on resource link
    logResourceActivity("clicked_link");

    if (resourceType === "web_page") {
      window.open(resource.url, "_blank");
    }

    if (resourceType !== "web_page") {
      window.location = resource.url;
    }
  };

  /**
   * Creates tag jsx for hyperlinked tag list given tag array
   * from a single resource
   * @params {array} tags
   * @returns {object} jsx
   */
  const linkedTagJsx = (tags) => {
    let tagsJsx;

    let filteredTags = filter(tags, (tag) => {
      return !tag.internal;
    });

    if (!isEmpty(filteredTags)) {
      tagsJsx = [];
      tagsJsx.push(
        <span className={classes.resourceSpan} key={`resource_tag_start`}>
          Tags:{" "}
        </span>
      );

      forEach(filteredTags, (tag) => {
        let isNotLastOfMultiple =
          filteredTags.length > 1 && filteredTags[filteredTags.length - 1] !== tag;

        tagsJsx.push(
          <Link
            key={`resource_tag_${tag.id}`}
            style={{
              color: styleVars.colorPrimary,
              textTransform: "uppercase",
              fontWeight: styleVars.txtFontWeightDefaultMedium,
              fontSize: styleVars.txtFontSizeXs,
            }}
            to={`/app/resources/?resources_tags=${tag.slug}`}
          >
            {tag.name}
            {isNotLastOfMultiple && ", "}
          </Link>
        );
      });
    }

    return tagsJsx;
  };

  const handleSoftGateDialogSubmit = (params) => {
    // Set session cookie for soft-gate

    setCookie(authConfigs.softGateKey, params, {
      path: "/",
      secure: true,
      httpOnly: false,
      sameSite: "lax",
      domain: process.env.REACT_APP_SOFT_GATE_HOST,
    });

    setSoftGateDialogOpen(false);
  };

  const displayRelatedResources = () => {
    return !isEmpty(relatedResources) && !loadingRelatedResources;
  };

  const displayResourceTranslations = () => {
    return !isEmpty(resource.translations) && !loadingResource;
  };

  const isResourcePublished = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return resource.published;
  };

  /**
   * Is a resource not published and the user an admin
   */
  const isNonPublishedAdminUser = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return resource.published === false && currentUser.isAdmin;
  };

  const displayPageNotFound = () => {
    return (
      (!resource && !loadingResource) ||
      (!isResourcePublished() && !loadingResource && !currentUser.isAdmin)
    );
  };

  /**
   * Resource Link JSX output
   * @returns {object} JSX object
   */
  const resourceLinkOutput = () => {
    let sizeStr = width > maxSmWidth ? "lg" : "sm";
    let resourceType = extractResourceType();
    let resourceLinkOrEmbedded;

    if (!resource.url) {
      return <div className={classes.noResources}>No resource URL.</div>;
    }

    if (resource.direct_download === false) {
      // Button link to resource/download resource
      resourceLinkOrEmbedded = (
        <Button
          onClick={(e) => {
            onClickResourceLink(e);
          }}
          variant="contained"
          color="primary"
          className={classes.resourceButton}
        >
          Go to Resource
        </Button>
      );
    }

    if (resource.direct_download === true) {
      let ddTextVariance = resourceType === "web_page" ? "open" : "download";
      resourceLinkOrEmbedded = (
        <div className={clsx(classes.resourceDirectDownloadWrapper, sizeStr)}>
          <div style={{ fontStyle: "italic" }}>
            Your resource will automatically {ddTextVariance}
          </div>
          <div>
            If not,
            <span
              onClick={(e) => {
                onClickResourceLink(e);
              }}
              className={classes.resourceDirectDownloadLink}
            >
              click here
            </span>
          </div>
        </div>
      );
    }

    // Embedded video jsx
    if (resourceType === "video") {
      resourceLinkOrEmbedded = (
        <div className={classes.resourceVideoContainer}>
          <iframe
            className={classes.resourceVideo}
            src={resource.url}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="video"
          />
        </div>
      );
    }

    return resourceLinkOrEmbedded;
  };

  // We do not want to render resource if the resource.soft_gate === true
  // and the soft gate user data has yet to be logged
  const isResourceSoftGatedAndNotLogged = () => {
    return resource.soft_gate && !softGateLogged;
  };

  const userShouldRedirectToLogin = () => {
    if (isEmpty(resource)) {
      return null;
    }

    return resource.restricted === true && !currentUser.isAuthenticated;
  };

  // Login required for restricted records
  const redirectToLoginOutput = () => {
    const redirectTo = {
      pathname: "/app/account/login",
      state: { from: location },
    };

    return <Redirect to={redirectTo} />;
  };

  /**
   * Resource Detail JSX output
   * @returns {object} JSX object
   */
  const resourceDetailBodyOutput = () => {
    if (isEmpty(resource)) {
      return null;
    }

    let resourceType = extractResourceType();
    let resourceTrainingType = extractResourceTrainingType();
    let resourceStartTime, resourceDuration;
    if (
      resourceType === "training" &&
      resourceTrainingType &&
      resourceTrainingType.machine_name === "event"
    ) {
      resourceStartTime = formattedResourceStartTime();
      resourceDuration = formattedResourceDuration();
    }
    let resourceContent = get(resource, "content", "");
    let resourceContentIsEmpty = isJsonTextEmpty(resourceContent);
    let resourceImage = get(resource, "feature_media.detailPage", "");
    let resourceHiResImage = hiRezImageForResource(resource);
    let displayResourceImage = !isEmpty(resourceImage) && resourceType !== "video";
    let resourceTagsOutput;
    let resourceTags = get(resource, "tags", []);
    if (!isEmpty(resourceTags)) {
      resourceTagsOutput = linkedTagJsx(resourceTags);
    }
    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} s={8} md={8} lg={8}>
            <Paper className={classes.resourcePaper}>
              <div className={clsx(classes.resourceImageWrapper, sizeStr)}>
                {displayResourceImage && (
                  <img
                    src={resourceImage}
                    className={clsx(classes.resourceImage, sizeStr)}
                    alt=""
                    {...(resourceHiResImage && {
                      srcSet: resourceHiResImage,
                    })}
                  />
                )}
                {resource.direct_download === true && resource.url && (
                  <React.Fragment>{resourceLinkOutput()}</React.Fragment>
                )}
              </div>
              {resourceTagsOutput && (
                <div className={classes.resourceTags}>{resourceTagsOutput}</div>
              )}
              {resourceType === "training" && resourceTrainingType && (
                <React.Fragment>
                  <div className={classes.resourceTrainingField}>
                    <span className={classes.resourceSpan}>Type: </span>
                    {resourceTrainingType.name}
                    {resourceTrainingType.machine_name === "event" && (
                      <React.Fragment>
                        {resource.is_recorded && <span> (recorded)</span>}
                        {!resource.is_recorded && <span> (live)</span>}
                      </React.Fragment>
                    )}
                  </div>
                  {resourceTrainingType.machine_name === "event" && resourceTrainingType && (
                    <React.Fragment>
                      <div className={classes.resourceTrainingField}>
                        <span className={classes.resourceSpan}>Start Date & Time: </span>
                        {resourceStartTime}
                      </div>
                      <div className={classes.resourceTrainingField}>
                        <span className={classes.resourceSpan}>Duration: </span>
                        {resourceDuration}
                      </div>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
              {!resourceContentIsEmpty && (
                <div className={classes.resourcesContent}>
                  <DraftEditor readOnly={true} value={resource.content ? resource.content : ""} />
                </div>
              )}
              {resource.direct_download === false && (
                <React.Fragment>{resourceLinkOutput()}</React.Fragment>
              )}
              <div className={classes.returnToResourcesParentContainer}>
                <div className={classes.returnToResourcesContainer}>
                  <Link className={classes.returnToResourcesLink} to={`/app/resources`}>
                    <LeftChevronIcon color="primary" fontSize="large" />
                    View all resources
                  </Link>
                </div>
              </div>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            {displayRelatedResources() && (
              <Paper className={classes.rightGridPaper}>
                <h3>Related Resources</h3>
                <RelatedResources currentUser={currentUser} relatedResources={relatedResources} />
              </Paper>
            )}
            {displayResourceTranslations() && (
              <Paper className={classes.rightGridPaper}>
                <h3>Also available in:</h3>
                <ResourceTranslations
                  currentUser={currentUser}
                  translations={resource.translations}
                />
              </Paper>
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  };

  return (
    <div ref={ref}>
      {loadingResource && <CircularProgressGlobal />}
      {displayPageNotFound() && <PageNotFound />}
      {userShouldRedirectToLogin() && redirectToLoginOutput()}
      {resource && !loadingResource && (
        <React.Fragment>
          <Breadcrumbs>
            <Breadcrumb path="/app/resources" root>
              Resources
            </Breadcrumb>
            <Breadcrumb path={`/app/resources/${resourceId}`}>{resource.name}</Breadcrumb>
          </Breadcrumbs>

          {isNonPublishedAdminUser() && (
            <div>
              <HgAlert includeIcon={true} message={"Unpublished"} severity="warning" />
            </div>
          )}

          <h1>{resource.name}</h1>

          {!isResourceSoftGatedAndNotLogged() && (
            <React.Fragment>{resourceDetailBodyOutput()}</React.Fragment>
          )}

          <HgDialog
            open={softGateDialogOpen}
            disableClose={true}
            title={"Get access to this resource"}
            content={<SoftGateForm handleSubmit={handleSoftGateDialogSubmit} />}
            fullWidth={true}
            maxWidth={"xs"}
          />
        </React.Fragment>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  noResources: {
    fontStyle: "italic",
  },
  resourceButton: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourceActions: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  returnToResourcesContainer: {
    display: "inline-block",
  },
  returnToResourcesParentContainer: {
    margin: theme.spacing(2, 0, -1.5, -2),
  },
  returnToResourcesLink: {
    alignItems: "center",
    display: "flex",
  },
  resourceImage: {
    margin: theme.spacing(0, 0, 1, 0),
    "&.lg": {
      height: "144px",
      width: "240px",
      marginRight: theme.spacing(2),
    },
    "&.sm": {
      width: "100%",
    },
  },
  resourceImageWrapper: {
    "&.lg": {
      display: "flex",
    },
  },
  resourceDirectDownloadWrapper: {
    "&.lg": {
      alignSelf: "center",
    },
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourcesContent: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourcesHelperField: {
    marginBottom: theme.spacing(2),
  },
  resourcePaper: {
    padding: styleVars.paperPadding,
  },
  resourceLink: {
    color: styleVars.colorPrimary,
    cursor: "pointer",
  },
  resourceDirectDownloadLink: {
    color: styleVars.colorPrimary,
    cursor: "pointer",
    marginLeft: theme.spacing(0.5),
  },
  resourceTags: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourceSpan: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  resourceTrainingField: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourceVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  resourceVideoContainer: {
    position: "relative",
    paddingBottom: "56.25%" /* 16:9 */,
    paddingTop: 25,
    height: 0,
  },
  rightGridPaper: {
    padding: styleVars.paperPadding,
    marginBottom: theme.spacing(),
  },
}));
