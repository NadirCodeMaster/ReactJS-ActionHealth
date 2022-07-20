import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { find, get, isEmpty, includes, map, sortBy } from "lodash";
import { Switch } from "react-router-dom";
import PropTypes from "prop-types";
import AdminRoute from "components/ui/AdminRoute";
import isAbsoluteUrl from "utils/isAbsoluteUrl";
import errorSuffix from "utils/errorSuffix";
import PageResources from "../resources/components/list.js";
import PageResource from "../resources/components/detail.js";
import PageResourceNew from "../resources/components/new.js";
import {
  requestCreateResource,
  requestCreateResourceFile,
  requestDeleteResource,
  requestUpdateResource,
  requestResource,
  requestResources,
  requestResourceTags,
  requestLinkResourceTag,
  requestUnlinkTagResource,
  requestTags,
  requestResourceCriteria,
  requestLinkResourceCriterion,
  requestUnlinkResourceCriterion,
  requestCriteria,
  requestLinkRelatedResource,
  requestUnlinkRelatedResource,
  requestLinkResourceUserFunction,
  requestUnlinkResourceUserFunction,
  requestResourceUserFunctions,
  requestUserFunctions,
} from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * Use this component to handle routes starting with `/app/admin/resources`
 *
 * See propTypes for required props.
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

    this.state = {
      deletingResource: false,
      loadingResource: false,
      loadingResources: false,
      resource: null,
      resources: [],
      requestResourcesMeta: {},
      tags: [],
      tagsLoading: false,
      tagsNeedRefresh: false,
      criteriaNeedRefresh: false,
      searchedTags: [],
      searchedCriteria: [],
      searchingTags: false,
      searchingCriteria: false,
      resourceTags: [],
      resourceCriteria: [],
      resourceTagsLoading: false,
      resourceCriteriaLoading: false,
      resourceFilesLoading: false,
      resourceFiles: [],
      resourceUrlError: false,
      relatedResources: [],
      relatedNeedRefresh: false,
      relatedResourcesLoading: false,
      userFunctionsNeedRefresh: false,
      searchedUserFunctions: [],
      searchingUserFunctions: false,
      userFunctions: [],
      userFunctionsLoading: false,
    };
  }

  /**
   * Creates a new resource
   * @param {object} resource
   */
  createResource = (resource) => {
    const { history } = this.props;

    requestCreateResource(resource).then((res) => {
      if (!this.isCancelled) {
        // Create succeeded
        if (200 === res.status) {
          let newResourceId = get(res, "data.data.id", "");
          hgToast(`Created resource ${newResourceId}`);
          history.push(`/app/admin/resources/${newResourceId}`);
        } else {
          // Create failed
          hgToast("An error occurred creating resource. " + errorSuffix(res), "error");
        }
      }
    });
  };

  /**
   * Create a new resource file/add resource file to system
   * Will immediatly call updateResource() on success
   * @param {object} recDocument
   * @param {string} fieldName
   * @param {number} resourceId
   */
  createResourceFile = (recDocument, fieldName, resourceId) => {
    this.setState({ loadingResource: true });

    requestCreateResourceFile(recDocument).then((res) => {
      if (!this.isCancelled) {
        // Create succeeded
        if (201 === res.status) {
          let newResourceFileId = get(res, "data.data.id", "");
          hgToast(`Created resource file ${newResourceFileId}!`);
          let updatePayload = { [fieldName]: newResourceFileId };
          this.updateResource(resourceId, updatePayload);
        }
        if (422 === res.status) {
          hgToast(`Invalid file type`, "error");
          this.setState({ loadingResource: false });
        }
        if (res.status !== 422 && res.status !== 201) {
          hgToast("An error occurred creating resource file.", "error");
          this.setState({ loadingResource: false });
        }
      }
    });
  };

  /**
   * Delete a resource
   * @param {number} resourceId
   */
  deleteResource = (resourceId) => {
    const { history } = this.props;
    this.setState({ deletingResource: true });

    requestDeleteResource(resourceId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted resource ${resourceId}`);
          this.setState({
            deletingResource: false,
          });
          history.push(`/app/admin/resources/`);
        } else {
          // Delete failed
          hgToast("An error occurred deleting question", "error");
          this.setState({
            deletingResource: false,
          });
        }
      }
    });
  };

  /**
   * Unpublished popup jsx
   * @param {string} resourceName
   @ @param {string} absentCriticalField
   * @returns {object}
   */
  unpublishedPopupOutput = (resourceName, absentCriticalField) => {
    return (
      <React.Fragment>
        <div>Updated resource {resourceName}</div>
        <div>
          Resource has been unpublished due to the field "{absentCriticalField}" being empty
        </div>
        <div>"{absentCriticalField}" must be populated before resource can be published</div>
      </React.Fragment>
    );
  };

  /**
   * Update given resource with parameters
   * @param {number} resourceId
   * @param {object} draftResource
   * @param {string} absentCriticalField
   */
  updateResource = (resourceId, draftResource, absentCriticalField) => {
    this.setState({ loadingResource: true });

    requestUpdateResource(resourceId, draftResource).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedResource = res.data.data;
          this.setState({
            resource: updatedResource,
            loadingResource: false,
          });

          if (!isEmpty(absentCriticalField)) {
            hgToast(
              this.unpublishedPopupOutput(updatedResource.name, absentCriticalField),
              "info",
              { autoClose: 0 }
            );
          }

          if (isEmpty(absentCriticalField)) {
            if (!updatedResource.published) {
              hgToast(
                `Updated resource ${updatedResource.name}.  This resource is unpublished`,
                "info",
                { autoClose: 0 }
              );
            }
            if (updatedResource.published) {
              hgToast(`Updated resource ${updatedResource.name}`);
            }
          }
        } else {
          // Update failed
          hgToast("An error occurred deleting resource. " + errorSuffix(res), "error");
          this.setState({
            loadingResource: false,
          });
        }
      }
    });
  };

  /**
   * Populate state.resource
   * @param {number} resourceId
   * @param {object} event
   */
  getResource = (resourceId, e) => {
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

  populateTranslationGroupResource = (resourceId) => {
    if (resourceId === null) {
      this.setState({
        translationGroupResource: null,
      });
    }

    if (resourceId) {
      requestResource(resourceId)
        .then((res) => {
          if (!this.isCancelled) {
            let updatedStateVals = {
              translationGroupResource: res.data.data,
            };
            this.setState(updatedStateVals);
          }
        })
        .catch((error) => {
          // ERROR
          if (!this.isCancelled) {
            console.error("An error occurred loading resource");
          }
        });
    }
  };

  /**
   * Populate state.resources
   * @param {object} requestObject
   */
  getResources = (requestObject, filterIfSearch) => {
    this.setState({
      loadingResources: true,
    });

    requestResources(requestObject).then((res) => {
      if (!this.isCancelled) {
        let resources = res.data.data;

        if (filterIfSearch) {
          resources = resources.filter((ar) => !filterIfSearch.find((rm) => rm.id === ar.id));
        }

        this.setState({
          loadingResources: false,
          resources,
          requestResourcesMeta: res.data.meta,
        });
      }
    });
  };

  linkRelatedResource = (resourceId, relatedResourceId) => {
    this.setState({ loadingResource: true });

    requestLinkRelatedResource(resourceId, {
      related_resource_id: relatedResourceId,
    })
      .then((res) => {
        // SUCCESS
        hgToast(`Associated related resource`);
        this.setState({
          loadingResource: false,
          relatedNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while associating item with criterion. " + errorSuffix(error),
            "error"
          );
        }
      });
  };

  unlinkRelatedResource = (resourceId, relatedResourceId) => {
    this.setState({ loadingResource: true });

    requestUnlinkRelatedResource(resourceId, relatedResourceId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated related resource");
        this.setState({
          relatedNeedRefresh: true,
          loadingResource: false,
        });
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating item. " + errorSuffix(error), "error");
      });
  };

  getRelatedResources = (resourceId) => {
    this.setState({
      relatedResourcesLoading: true,
    });

    requestResource(resourceId)
      .then((res) => {
        if (!this.isCancelled) {
          let relatedResourceIds = get(res.data.data, "related_resource_ids", []);

          if (isEmpty(relatedResourceIds)) {
            this.setState({
              relatedResourcesLoading: false,
              relatedResources: [],
            });
          }

          if (!isEmpty(relatedResourceIds)) {
            requestResources({ resource_ids: relatedResourceIds.join() }).then((res) => {
              if (!this.isCancelled) {
                this.setState({
                  relatedResourcesLoading: false,
                  relatedResources: res.data.data,
                  requestResourcesMeta: res.data.meta,
                });
              }
            });
          }
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
   * Get all tags associated with a resource
   * @param {number} resourceId
   */
  getResourceTags = (resourceId) => {
    this.setState({ resourceTagsLoading: true });
    requestResourceTags(resourceId, { include_internal: true })
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              resourceTagsLoading: false,
              resourceTags: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving tag records");
        if (!this.isCancelled) {
          this.setState({
            resourceTagsLoading: false,
            resourceTags: [],
          });
        }
      });
  };

  /**
   * Link a tag to a specified resource
   */
  linkResourceTags = (resourceId, tagId) => {
    requestLinkResourceTag(resourceId, { tag_id: tagId })
      .then((res) => {
        // SUCCESS
        hgToast(`Associated tag with resource`);
        this.setState({
          tagsNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while associating item with criterion. " + errorSuffix(error),
            "error"
          );
        }
      });
  };

  /**
   * Unlink a tag from a specified resource
   */
  unlinkResourceTags = (resourceId, tagId) => {
    requestUnlinkTagResource(resourceId, tagId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated tag from resource");
        this.setState({
          tagsNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating item. " + errorSuffix(error), "error");
      });
  };

  /**
   * Get a list of all available tags (used for admin dropdown)
   */
  getTags = (params) => {
    this.setState({ tagsLoading: true });
    requestTags(params).then((res) => {
      if (!this.isCancelled) {
        let tags = res.data.data;
        this.setState({
          tags,
          tagsLoading: false,
        });
      }
    });
  };

  /**
   * Get a list available tags for searching purposes
   * and filter by tag param array
   * @param {object} params (api params)
   * @param {array} tags
   */
  getSearchTags = (params, tags) => {
    this.setState({ searchingTags: true });

    params.include_internal = true;

    requestTags(params).then((res) => {
      if (!this.isCancelled) {
        let searchedTags = res.data.data;

        // Filter out ones that are already included
        if (tags && tags.length > 0) {
          let tagsIds = map(tags, "id");
          searchedTags = searchedTags.filter((tag) => !includes(tagsIds, tag.id));
        }

        this.setState({
          searchedTags,
          searchingTags: false,
        });
      }
    });
  };

  /**
   * Indicate to child components that they have the most
   * up-to-date list of tags (componentDidUpdate methods use this)
   */
  tagsAreRefreshed = () => {
    this.setState({ tagsNeedRefresh: false });
  };

  relatedAreRefreshed = () => {
    this.setState({ relatedNeedRefresh: false });
  };

  /**
   * Get all criteria associated with a resource
   * @param {number} resourceId
   */
  populateResourceCriteria = (resourceId) => {
    this.setState({ resourceCriteriaLoading: true });
    requestResourceCriteria(resourceId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              resourceCriteriaLoading: false,
              resourceCriteria: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving criteria records");
        if (!this.isCancelled) {
          this.setState({
            resourceCriteriaLoading: false,
            resourceCriteria: [],
          });
        }
      });
  };

  /**
   * Get all user functions associated with a resource
   * @param {number} resourceId
   */
  populateUserFunctions = (resourceId) => {
    this.setState({ userFunctionsLoading: true });
    requestResourceUserFunctions(resourceId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              userFunctionsLoading: false,
              userFunctions: this.userFunctionsWithCategoryName(res.data.data),
            });
          }
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving user function records");
        if (!this.isCancelled) {
          this.setState({
            userFunctionsLoading: false,
            userFunctions: [],
          });
        }
      });
  };

  /**
   * Add user_function_category_name to userFunctions object, and sort
   * Sorting is done via userFunctionCategory name, then userfunction name
   * @params {array} userFunctions
   * @returns {array} sorted user functions with additional category property
   */
  userFunctionsWithCategoryName = (userFunctions) => {
    const { userFunctionCategories, organizationTypes } = this.props;

    let _userFunctions = userFunctions.map((uf) => {
      let userFunctionCategory = userFunctionCategories[uf.user_function_category_id];
      let orgTypeName = organizationTypes[userFunctionCategory.organization_type_id].name;

      return {
        ...uf,
        organization_type_name: orgTypeName,
        user_function_category_name: userFunctionCategories[uf.user_function_category_id].name,
      };
    });

    return sortBy(_userFunctions, [
      "organization_type_name",
      "user_function_category_name",
      "name",
    ]);
  };

  /**
   * Link a criterion to a specified
   */
  linkResourceCriterion = (resourceId, criterionId) => {
    requestLinkResourceCriterion(resourceId, { criterion_id: criterionId })
      .then((res) => {
        // SUCCESS
        hgToast(`Associated criterion with resource`);
        this.setState({
          criteriaNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while associating item with criterion. " + errorSuffix(error),
            "error"
          );
        }
      });
  };

  /**
   * Link a user function to a specified resource
   */
  linkUserFunction = (resourceId, userFunctionId) => {
    requestLinkResourceUserFunction(resourceId, {
      user_function_id: userFunctionId,
    })
      .then((res) => {
        // SUCCESS
        hgToast(`Associated user function with resource`);
        this.setState({
          userFunctionsNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while associating item with resource. " + errorSuffix(error),
            "error"
          );
        }
      });
  };

  /**
   * Unlink a criterion from a specified resource
   */
  unlinkResourceCriterion = (resourceId, criterionId) => {
    requestUnlinkResourceCriterion(resourceId, criterionId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated criterion from resource");
        this.setState({
          criteriaNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating item. " + errorSuffix(error), "error");
      });
  };

  /**
   * Unlink a user function from a specified resource
   */
  unlinkUserFunction = (resourceId, userFunctionId) => {
    requestUnlinkResourceUserFunction(resourceId, userFunctionId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated user function from resource");
        this.setState({
          userFunctionsNeedRefresh: true,
        });
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating item. " + errorSuffix(error), "error");
      });
  };

  /**
   * Get a list available criteria for searching purposes
   * and filter by criterion param array
   * @param {object} params (api params)
   * @param {array} criteria
   */
  getSearchCriteria = (params, criteria) => {
    this.setState({ searchingCriteria: true });
    requestCriteria(params).then((res) => {
      if (!this.isCancelled) {
        let searchedCriteria = res.data.data;

        // Filter out ones that are already included
        if (criteria && criteria.length > 0) {
          let criteriaIds = map(criteria, "id");
          searchedCriteria = searchedCriteria.filter(
            (criterion) => !includes(criteriaIds, criterion.id)
          );
        }

        this.setState({
          searchedCriteria,
          searchingCriteria: false,
        });
      }
    });
  };

  /**
   * Get a list available user functions for searching purposes
   * and filter by user function param array
   * @param {object} params (api params)
   * @param {array} userFunctions
   */
  getSearchUserFunctions = (params, userFunctions) => {
    this.setState({ searchingUserFunctions: true });
    requestUserFunctions(params).then((res) => {
      if (!this.isCancelled) {
        let searchedUserFunctions = res.data.data;

        // Filter out ones that are already included
        if (userFunctions && userFunctions.length > 0) {
          let userFunctionsIds = map(userFunctions, "id");
          searchedUserFunctions = searchedUserFunctions.filter(
            (uf) => !includes(userFunctionsIds, uf.id)
          );
        }

        this.setState({
          searchedUserFunctions: this.userFunctionsWithCategoryName(searchedUserFunctions),
          searchingUserFunctions: false,
        });
      }
    });
  };

  /**
   * Indicate to child components that they have the most
   * up-to-date list of criteria (componentDidUpdate methods use this)
   */
  criteriaAreRefreshed = () => {
    this.setState({ criteriaNeedRefresh: false });
  };

  /**
   * Indicate to child components that they have the most
   * up-to-date list of user functions (componentDidUpdate methods use this)
   */
  userFunctionsAreRefreshed = () => {
    this.setState({ userFunctionsNeedRefresh: false });
  };

  /**
   * Validate url entered for resources is absolute
   * @param {string} url
   * @returns {string} valid url
   */
  validateResourceUrl = (url) => {
    return isAbsoluteUrl(url);
  };

  /**
   * Options array used for resource option <select>
   * @param {object} event
   * @returns {array} options for <select>
   */
  getResourceOptions = () => {
    const { resourceTypes } = this.props;

    return Object.values(resourceTypes).map((resourceType) => {
      return {
        value: resourceType.id,
        label: resourceType.name,
      };
    });
  };

  /**
   * Options array used for resource training type option <select>
   * @param {object} event
   * @returns {array} options for <select>
   */
  getResourceTrainingTypeOptions = () => {
    const { resourceTrainingTypes } = this.props;

    return Object.values(resourceTrainingTypes).map((resourceTrainingType) => {
      return {
        value: resourceTrainingType.id,
        label: resourceTrainingType.name,
      };
    });
  };

  /**
   * Resource type machine_name given a resource type ID
   * @param {number} id
   * @returns {string} machine_name for given resource type id
   */
  getResourceTypeMachineName = (id) => {
    const { resourceTypes } = this.props;

    return get(find(resourceTypes, { id: id }), "machine_name", "");
  };

  /**
   * Resource type name given a resource type ID
   * @param {number} id
   * @returns {string} machine_name for given resource type id
   */
  getResourceTypeName = (id) => {
    const { resourceTypes } = this.props;

    return get(find(resourceTypes, { id: id }), "name", "");
  };

  /**
   * Resource type allowed file extensions name given a resource type ID
   * @param {number} id
   * @returns {string} comma delimited string
   */
  getResourceTypeAllowedExt = (id) => {
    const { resourceTypes } = this.props;

    let resourceType = find(resourceTypes, { id: id });
    let fileTypeString = get(resourceType, "allowed_file_types", []).join();

    if (isEmpty(fileTypeString)) {
      fileTypeString = "*";
    }

    return fileTypeString;
  };

  render() {
    const { currentUser, resourceTrainingTypes } = this.props;
    const {
      deletingResource,
      loadingResource,
      loadingResources,
      resource,
      resources,
      resourceTags,
      resourceTagsLoading,
      requestResourcesMeta,
      tags,
      tagsLoading,
      tagsNeedRefresh,
      searchedTags,
      searchingTags,
      resourceCriteria,
      searchedCriteria,
      searchingCriteria,
      resourceCriteriaLoading,
      criteriaNeedRefresh,
      userFunctions,
      searchedUserFunctions,
      searchingUserFunctions,
      userFunctionsLoading,
      userFunctionsNeedRefresh,
      translationGroupResource,
      relatedResources,
      relatedNeedRefresh,
      relatedResourcesLoading,
    } = this.state;

    return (
      <React.Fragment>
        <Switch>
          {/* RESOURCES LIST */}
          <AdminRoute
            exact
            path="/app/admin/resources/"
            currentUser={currentUser}
            render={({ match }) => (
              <PageResources
                currentUser={currentUser}
                getResourcesRequest={this.getResources}
                getResourceTypeName={this.getResourceTypeName}
                getTagsRequest={this.getTags}
                tags={tags}
                tagsLoading={tagsLoading}
                loadingResources={loadingResources}
                resources={resources}
                requestResourcesMeta={requestResourcesMeta}
              />
            )}
          />

          {/* RESOURCE NEW */}
          <AdminRoute
            exact
            path="/app/admin/resources/new"
            currentUser={currentUser}
            render={({ match }) => (
              <PageResourceNew
                currentUser={currentUser}
                createResource={this.createResource}
                createResourceFile={this.createResourceFile}
                getResourceOptions={this.getResourceOptions}
                getResourceTrainingTypeOptions={this.getResourceTrainingTypeOptions}
              />
            )}
          />

          {/* RESOURCE DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/resources/:resource_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageResource
                currentUser={currentUser}
                createResourceFile={this.createResourceFile}
                deleteResource={this.deleteResource}
                deletingResource={deletingResource}
                updateResource={this.updateResource}
                getResourceOptions={this.getResourceOptions}
                getResourceRequest={this.getResource}
                loadingResource={loadingResource}
                resource={resource}
                resourceId={Number(match.params.resource_id)}
                tags={resourceTags}
                searchedTags={searchedTags}
                searchingTags={searchingTags}
                tagsLoading={resourceTagsLoading}
                tagsNeedRefresh={tagsNeedRefresh}
                tagsAreRefreshed={this.tagsAreRefreshed}
                getResourceTypeAllowedExt={this.getResourceTypeAllowedExt}
                getTagsRequest={this.getSearchTags}
                getResourceTagsRequest={this.getResourceTags}
                getResourceTypeMachineName={this.getResourceTypeMachineName}
                getResourceTypeName={this.getResourceTypeName}
                linkResourceTagsRequest={this.linkResourceTags}
                unlinkResourceTagsRequest={this.unlinkResourceTags}
                resourceTrainingTypes={resourceTrainingTypes}
                validateResourceUrl={this.validateResourceUrl}
                criteria={resourceCriteria}
                searchedCriteria={searchedCriteria}
                searchingCriteria={searchingCriteria}
                criteriaLoading={resourceCriteriaLoading}
                criteriaNeedRefresh={criteriaNeedRefresh}
                criteriaAreRefreshed={this.criteriaAreRefreshed}
                getCriteriaRequest={this.getSearchCriteria}
                getResourceCriteriaRequest={this.populateResourceCriteria}
                linkResourceCriteriaRequest={this.linkResourceCriterion}
                unlinkResourceCriteriaRequest={this.unlinkResourceCriterion}
                userFunctions={userFunctions}
                searchedUserFunctions={searchedUserFunctions}
                searchingUserFunctions={searchingUserFunctions}
                userFunctionsLoading={userFunctionsLoading}
                userFunctionsNeedRefresh={userFunctionsNeedRefresh}
                userFunctionsAreRefreshed={this.userFunctionsAreRefreshed}
                getUserFunctionsRequest={this.getSearchUserFunctions}
                getResourceUserFunctionsRequest={this.populateUserFunctions}
                linkUserFunctionsRequest={this.linkUserFunction}
                unlinkUserFunctionsRequest={this.unlinkUserFunction}
                getResourcesRequest={this.getResources}
                resourcesLoading={loadingResources}
                resources={resources}
                populateTranslationGroupResource={this.populateTranslationGroupResource}
                translationGroupResource={translationGroupResource}
                linkRelatedResourceRequest={this.linkRelatedResource}
                unlinkRelatedResourceRequest={this.unlinkRelatedResource}
                getRelatedResourcesRequest={this.getRelatedResources}
                relatedResources={relatedResources}
                relatedNeedRefresh={relatedNeedRefresh}
                relatedAreRefreshed={this.relatedAreRefreshed}
                relatedResourcesLoading={relatedResourcesLoading}
              />
            )}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    resourceTypes: state.app_meta.data.resourceTypes,
    userFunctionCategories: state.app_meta.data.userFunctionCategories,
    resourceTrainingTypes: state.app_meta.data.resourceTrainingTypes,
    organizationTypes: state.app_meta.data.organizationTypes,
    currentUser: state.auth.currentUser,
    programs: state.programs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ResourcesController);
