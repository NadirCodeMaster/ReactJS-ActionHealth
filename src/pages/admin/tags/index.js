import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { withRouter } from "react-router";
import { get } from "lodash";
import { Switch } from "react-router-dom";
import AdminRoute from "components/ui/AdminRoute";
import PropTypes from "prop-types";
import PageTags from "../tags/components/list.js";
import PageTagNew from "../tags/components/new.js";
import PageTag from "../tags/components/detail.js";
import {
  requestCreateTag,
  requestDeleteTag,
  requestUpdateTag,
  requestResources,
  requestTag,
  requestTags,
} from "api/requests";
import isUrlSlug from "utils/isUrlSlug";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * Routing for `/app/tags`, backend calls, and common methods
 */
class TagsController extends React.Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      deletingTag: false,
      loadingTag: false,
      loadingTags: false,
      tag: null,
      tags: [],
      requestTagsMeta: {},
      tagResources: [],
    };
  }

  createTag = (tag) => {
    const { history } = this.props;

    requestCreateTag(tag)
      .then((res) => {
        if (!this.isCancelled) {
          // Create succeeded
          if (201 === res.status) {
            let newTagId = get(res, "data.data.id", "");
            hgToast(`Created tag ${newTagId}`);
            history.push(`/app/admin/tags/${newTagId}`);
          }
        }
      })
      .catch((error) => {
        hgToast("Error creating tag. " + errorSuffix(error), "error");
      });
  };

  deleteTag = (tagId) => {
    const { history } = this.props;
    this.setState({ deletingTag: true });

    requestDeleteTag(tagId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted question ${tagId}`);
          this.setState({
            deletingTag: false,
          });
          history.push(`/app/admin/tags/`);
        } else {
          // Delete failed
          hgToast("An error occurred deleting question", "error");
          this.setState({
            deletingTag: false,
          });
        }
      }
    });
  };

  updateTag = (tagId, draftTag) => {
    requestUpdateTag(tagId, draftTag)
      .then((res) => {
        if (!this.isCancelled) {
          if (200 === res.status) {
            // Update succeeded
            let updatedTag = res.data.data;
            this.setState({
              tag: updatedTag,
            });
            hgToast(`Updated tag ${updatedTag.name}`);
          }
        }
      })
      .catch((error) => {
        hgToast("Error updating tag", "error");
      });
  };

  /**
   * Get Resources associated with a tag
   * @params {object} params
   */
  getTagResources = (params) => {
    requestResources(params)
      .then((res) => {
        if (!this.isCancelled) {
          if (200 === res.status) {
            // Update succeeded
            this.setState({
              tagResources: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        console.error("Could not retrieve tag resources");
      });
  };

  /**
   * Populate state.tag
   */
  getTag = (tagId, e) => {
    this.setState({ loadingTag: true });

    requestTag(tagId)
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            loadingTag: false,
            tag: res.data.data,
          };
          this.setState(updatedStateVals);
          this.getTagResources({ tags: res.data.data.slug });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            loadingTag: false,
          });
          console.error("An error occurred loading tag");
        }
      });
  };

  /**
   * Populate state.tags
   */
  getTags = (requestObject) => {
    this.setState({
      loadingTags: true,
    });

    requestTags(requestObject).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          loadingTags: false,
          tags: res.data.data,
          requestTagsMeta: res.data.meta,
        });
      }
    });
  };

  /**
   * Validate slug is valid
   * @param {string} slug
   * @returns {string} valid slug
   */
  validateTagSlug = (url) => {
    return isUrlSlug(url);
  };

  render() {
    const { currentUser } = this.props;
    const { loadingTag, loadingTags, tag, tags, tagResources, requestTagsMeta } = this.state;

    return (
      <React.Fragment>
        <Switch>
          {/* TAG LIST */}
          <AdminRoute
            exact
            path="/app/admin/tags"
            currentUser={currentUser}
            render={({ match }) => (
              <PageTags
                currentUser={currentUser}
                getTagsRequest={this.getTags}
                loadingTags={loadingTags}
                tags={tags}
                requestTagsMeta={requestTagsMeta}
              />
            )}
          />

          {/* TAG NEW */}
          <AdminRoute
            exact
            path="/app/admin/tags/new"
            currentUser={currentUser}
            render={({ match }) => (
              <PageTagNew
                currentUser={currentUser}
                createTag={this.createTag}
                validateTagSlug={this.validateTagSlug}
              />
            )}
          />

          {/* TAG DETAIL */}
          <AdminRoute
            exact
            path="/app/admin/tags/:tag_id"
            currentUser={currentUser}
            render={({ match }) => (
              <PageTag
                currentUser={currentUser}
                deleteTag={this.deleteTag}
                updateTag={this.updateTag}
                getTagRequest={this.getTag}
                loadingTag={loadingTag}
                tag={tag}
                tagId={Number(match.params.tag_id)}
                tagResources={tagResources}
                validateTagSlug={this.validateTagSlug}
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
    tagTypes: state.app_meta.data.tagTypes,
    currentUser: state.auth.currentUser,
    programs: state.programs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(TagsController);
