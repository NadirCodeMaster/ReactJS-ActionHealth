import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { get, isEmpty, isNil } from "lodash";
import { Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import { withStyles } from "@mui/styles";
import PageResources from "../resources/components/list.js";
import PageResource from "../resources/components/detail.js";
import {
  requestUpdateResource,
  requestResource,
  requestResources,
  requestTags,
} from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * Routing for `/app/resources`, backend calls, and common methods
 */
class ResourcesController extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.hiRezImageForResource = this.hiRezImageForResource.bind(this);
    this.populateResource = this.populateResource.bind(this);
    this.populateResources = this.populateResources.bind(this);
    this.populateTags = this.populateTags.bind(this);
    this.updateResource = this.updateResource.bind(this);

    this.state = {
      deletingResource: false,
      loadingResource: false,
      loadingResources: false,
      relatedResources: [],
      loadingRelatedResources: false,
      resource: null,
      resources: [],
      requestResourcesMeta: {},
      tags: [],
      tagsLoading: false,
    };
  }

  /**
   * Update a given resource
   * @param {number} resourceId
   * @param {object} draftResource
   */
  updateResource = (resourceId, draftResource) => {
    requestUpdateResource(resourceId, draftResource).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedResource = res.data.data;
          this.setState({
            resource: updatedResource,
          });
          hgToast(`Updated resource ${updatedResource.name}`);
        } else {
          // Update failed
          hgToast("An error occurred deleting resource", "error");
        }
      }
    });
  };

  /**
   * Populate state.resource
   * @param {number} resourceId
   * @param {object} event
   */
  populateResource = (resourceId, e) => {
    this.setState({ loadingResource: true });

    requestResource(resourceId)
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            loadingResource: false,
            resource: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            loadingResource: false,
          });
          console.error("An error occurred loading resource");
        }
      });
  };

  /**
   * Populate state.resources
   * @param {object} requestObject
   */
  populateResources = (requestObject) => {
    this.setState({
      loadingResources: true,
    });

    requestObject.published = true;

    requestResources(requestObject).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          loadingResources: false,
          resources: res.data.data,
          requestResourcesMeta: res.data.meta,
        });
      }
    });
  };

  /**
   * Populate state.relatedResources
   * @param {array} relatedResourceIds
   */
  populateRelatedResources = (relatedResourceIds) => {
    if (isEmpty(relatedResourceIds)) {
      this.setState({ relatedResources: [] });
    }

    if (!isEmpty(relatedResourceIds)) {
      this.setState({
        loadingRelatedResources: true,
      });

      let requestObject = {
        resource_ids: relatedResourceIds,
        published: true,
      };

      requestResources(requestObject).then((res) => {
        if (!this.isCancelled) {
          this.setState({
            loadingRelatedResources: false,
            relatedResources: res.data.data,
          });
        }
      });
    }
  };

  /**
   * Sets state.tags w/list of tags given params.
   * @param {object} params
   */
  populateTags = (params) => {
    this.setState({ tagsLoading: true });

    requestTags(params)
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              tagsLoading: false,
              tags: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving item records");
        if (!this.isCancelled) {
          this.setState({
            tagsLoading: false,
            tags: [],
          });
        }
      });
  };

  /**
   * Get the feature media high rez image if available
   * @param {object} resource
   * @returns {string} resourceHiResImage
   */
  hiRezImageForResource = (resource) => {
    let resourceFeatureMedia = get(resource, "feature_media", {});
    let resourceHiResImageKey, resourceHiResImage;

    // Find hi rez key if available
    // Key is variable, could be hero@2x, hero@4x, etc.
    if (!isEmpty(resourceFeatureMedia)) {
      Object.keys(resource.feature_media).some(function (key) {
        let keyRegex = /hero.+/;
        let found = key.match(keyRegex);
        if (!isNil(found)) {
          resourceHiResImageKey = found[0];
        }
        return null;
      });
    }

    if (resourceHiResImageKey) {
      resourceHiResImage = get(resource, `feature_media.${resourceHiResImageKey}`, null);
    }

    return resourceHiResImage;
  };

  render() {
    const { currentUser, resourceTypes, resourceTrainingTypes } = this.props;
    const {
      loadingResource,
      loadingResources,
      resource,
      resources,
      relatedResources,
      loadingRelatedResources,
      requestResourcesMeta,
      tags,
      tagsLoading,
    } = this.state;

    return (
      <React.Fragment>
        <Switch>
          {/* RESOURCES LIST */}
          <Route
            exact
            path="/app/resources/"
            currentUser={currentUser}
            render={({ match }) => (
              <PageResources
                currentUser={currentUser}
                populateResources={this.populateResources}
                hiRezImageForResource={this.hiRezImageForResource}
                loadingResources={loadingResources}
                resources={resources}
                requestResourcesMeta={requestResourcesMeta}
                populateTags={this.populateTags}
                tags={tags}
                tagsLoading={tagsLoading}
              />
            )}
          />

          {/* RESOURCE DETAIL */}
          <Route
            exact
            path="/app/resources/:resource_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageResource
                currentUser={currentUser}
                updateResource={this.updateResource}
                hiRezImageForResource={this.hiRezImageForResource}
                populateResource={this.populateResource}
                loadingResource={loadingResource}
                resource={resource}
                resourceTypes={resourceTypes}
                resourceTrainingTypes={resourceTrainingTypes}
                resourceId={Number(match.params.resource_id)}
                populateRelatedResources={this.populateRelatedResources}
                relatedResources={relatedResources}
                loadingRelatedResources={loadingRelatedResources}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    resourceTypes: state.app_meta.data.resourceTypes,
    resourceTrainingTypes: state.app_meta.data.resourceTrainingTypes,
    currentUser: state.auth.currentUser,
    programs: state.programs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, { withTheme: true })
)(ResourcesController);
