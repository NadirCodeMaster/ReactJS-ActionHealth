import React, { Component, Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import PropTypes from "prop-types";
import { forEach, find, get, isEmpty, isNil, isString, times, values } from "lodash";
import { MenuItem } from "@mui/material";
import { withStyles } from "@mui/styles";
import HgPagination from "components/ui/HgPagination";
import TableSearchBarNoExpansion from "components/ui/TableSearchBarNoExpansion";
import HgSkeleton from "components/ui/HgSkeleton";
import DynamicContent from "components/ui/DynamicContent";
import ResourceCard from "components/views/ResourceCard";
import generateTitle from "utils/generateTitle";
import clsx from "clsx";
import filterContentMachineNames from "utils/filterContentMachineNames";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";

import { fetchContents } from "store/actions";

const componentContentMachineNames = ["resource_header_description"];

/**
 * Paginated list of resources for public /app/resources route
 */

class ResourcesList extends Component {
  static defaultProps = {
    perPage: 24,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "resources_";

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "weight_sort",
      name: "",
      resource_type_id: "",
      tags: "",
      published: "",
      direct_download: "",
      restricted: "",
    };

    this.utilDefinitions = [
      {
        stateName: "currentPage",
        paramName: "page",
        defaultParamValue: this.defaultBrowserParamValues.page,
        valueType: "num",
      },
      {
        stateName: "currentSortDir",
        paramName: "sort_dir",
        defaultParamValue: this.defaultBrowserParamValues.sort_dir,
        valueType: "str",
      },
      {
        stateName: "currentSortName",
        paramName: "sort_name",
        defaultParamValue: this.defaultBrowserParamValues.sort_name,
        valueType: "str",
      },
      {
        stateName: "currentSearch",
        paramName: "search",
        defaultParamValue: this.defaultBrowserParamValues.search,
        valueType: "str",
      },
      {
        stateName: "currentType",
        paramName: "resource_type_id",
        defaultParamValue: this.defaultBrowserParamValues.resource_type_id,
        valueType: "str",
      },
      {
        stateName: "currentLanguage",
        paramName: "language_id",
        defaultParamValue: this.defaultBrowserParamValues.language_id,
        valueType: "str",
      },
      {
        stateName: "currentTags",
        paramName: "tags",
        defaultParamValue: this.defaultBrowserParamValues.tags,
        valueType: "str",
      },
    ];

    this.state = {
      loading: false,
      currentPage: 1,
      currentSortDir: "asc",
      currentSortName: "weight_sort",
      currentSearch: null,
      currentType: null,
      currentLanguage: null,
      currentTags: "",
      search: {},
    };

    // Used as filter browser url params conversion to search state
    this.searchFields = [
      {
        name: "search",
      },
      {
        name: "tags",
      },
      {
        name: "language_id",
      },
      {
        name: "resource_type_id",
      },
    ];
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { populateTags } = this.props;
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);

    let _actualQsPrefix = generateQsPrefix(this.defaultQsPrefix, qsPrefix);

    this.setState({
      actualQsPrefix: _actualQsPrefix,
      currentPage: currentUrlParamValue(
        "page",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.page
      ),
      currentSortDir: currentUrlParamValue(
        "sort_dir",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.sort_dir
      ),
      currentSortName: currentUrlParamValue(
        "sort_name",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.sort_name
      ),
      currentSearch: currentUrlParamValue(
        "search",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.search
      ),
      currentType: currentUrlParamValue(
        "resource_type_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.resource_type_id
      ),
      currentLanguage: currentUrlParamValue(
        "language_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.language_id
      ),
      currentTags: currentUrlParamValue(
        "tags",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.tags
      ),
    });

    populateTags({ name_sort: "asc" });
    generateTitle("Resources");
  }

  componentDidUpdate(prevProps, prevState) {
    const { populateResources, history, tagsLoading, tags, location, qsPrefix } = this.props;
    const { qsPrefix: prevQsPrefix } = prevProps;
    const {
      actualQsPrefix,
      currentPage,
      currentSortName,
      currentSortDir,
      currentSearch,
      currentType,
      currentLanguage,
      currentTags,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentSearch: prevCurrentSearch,
      currentType: prevCurrentType,
      currentLanguage: prevCurrentLanguage,
      currentTags: prevCurrentTags,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }

    // Begin populating the rest of state once actualQsPrefix is set
    // (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    // Watch for changes that require updating the org result
    // values in state.
    if (
      prevCurrentPage !== currentPage ||
      prevCurrentSortDir !== currentSortDir ||
      prevCurrentSortName !== currentSortName ||
      prevCurrentSearch !== currentSearch ||
      prevCurrentType !== currentType ||
      prevCurrentLanguage !== currentLanguage ||
      prevCurrentTags !== currentTags
    ) {
      // Updates contents
      populateResources(this.getResourceRequestObject());
      this.setState({ search: this.getSearchObject() });

      // If state and URL conflict, update URL.
      if (!compareStateWithUrlParams(this.state, location, this.utilDefinitions, actualQsPrefix)) {
        populateUrlParamsFromState(
          this.state,
          location,
          history,
          this.utilDefinitions,
          actualQsPrefix
        );
      }
    }

    let resourceTitle = "Resources";
    let resourcesTagString = this.getFilteredByTagNameString();

    if (!tagsLoading && !isEmpty(tags) && !isEmpty(resourcesTagString)) {
      resourceTitle += " tagged with " + resourcesTagString;
    }

    generateTitle(resourceTitle);
  }

  getResourceRequestObject = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortName,
      currentSortDir,
      currentSearch,
      currentType,
      currentLanguage,
      currentTags,
    } = this.state;

    return {
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      search: currentSearch,
      resource_type_id: currentType,
      language_id: currentLanguage,
      tags: currentTags,
    };
  };

  /**
   * Handle onpopstate
   */
  onPopState = (e) => {
    this.callPopulateStateFromUrlParams();
  };

  /**
   * Update component state based on URL changes.
   *
   * Wrapper to simplify calling populateStateFromUrlParams().
   */
  callPopulateStateFromUrlParams = () => {
    const { location } = this.props;
    const { actualQsPrefix } = this.state;

    populateStateFromUrlParams(this, location, this.utilDefinitions, actualQsPrefix);
  };

  // Add contents for this route to store unless
  // they have already been loaded into redux
  addContentsToStore = () => {
    const { addToContents, contents } = this.props;

    let paramMachineNames = filterContentMachineNames(contents, componentContentMachineNames);

    // Fetch content only if its not already in redux
    if (!isEmpty(paramMachineNames)) {
      addToContents(paramMachineNames);
    }
  };

  static propTypes = {
    populateResources: PropTypes.func.isRequired,
    populateTags: PropTypes.func.isRequired,
    hiRezImageForResource: PropTypes.func.isRequired,
    loadingResources: PropTypes.bool.isRequired,
    resources: PropTypes.array.isRequired,
    requestResourcesMeta: PropTypes.object.isRequired,
  };

  getSearchFields = () => {
    const { resourceTypes, tags, languages } = this.props;
    const { search } = this.state;

    let disableFields = isEmpty(tags);

    // Add "Select..." option for resourceTypes filter
    let resourceTypesForSearch = values(resourceTypes);
    resourceTypesForSearch.unshift({ id: "", name: "Select..." });

    // Add "Select..." option for language filter
    let languagesForSearch = values(languages);
    languagesForSearch.unshift({ id: "", exonym: "Select..." });

    // Add "Select..." and "multiple tag" options for tags filter
    let tagsForSearch = values(tags);
    let searchTags = get(search, "tags", "");
    let multipleTags = searchTags.split(",");

    // Only add "multiple tag" option if browser params have comma
    // delimited string
    if (multipleTags.length > 1) {
      tagsForSearch.unshift({
        slug: searchTags,
        name: "Filtering by multiple tags",
      });
    }

    tagsForSearch.unshift({ slug: "", name: "Select..." });

    return [
      {
        label: "Search",
        name: "search",
        type: "text",
        minWidth: "300px",
        disabled: disableFields,
      },
      {
        label: "Tag",
        name: "tags",
        type: "select",
        minWidth: "130px",
        options: Object.values(tagsForSearch).map((tag) => {
          let isMultipleTagsOption = multipleTags.length > 1 && tag.slug === multipleTags.join(",");
          return (
            <MenuItem key={`search_type_${tag.slug}`} value={tag.slug}>
              {isMultipleTagsOption ? <em>{tag.name}</em> : <Fragment>{tag.name}</Fragment>}
            </MenuItem>
          );
        }),
        disabled: disableFields,
      },
      {
        label: "Language",
        name: "language_id",
        type: "select",
        minWidth: "130px",
        options: Object.values(languagesForSearch).map((language) => (
          <MenuItem key={`search_type_${language.id}`} value={language.id}>
            {language.exonym}
          </MenuItem>
        )),
      },
      {
        label: "Type",
        name: "resource_type_id",
        type: "select",
        minWidth: "130px",
        options: Object.values(resourceTypesForSearch).map((resourceType) => (
          <MenuItem key={`search_type_${resourceType.id}`} value={resourceType.id}>
            {resourceType.name}
          </MenuItem>
        )),
        disabled: disableFields,
      },
    ];
  };

  /**
   * Get the opposite sort direction of what was provided.
   */
  getReversedSortDir = (dir) => {
    return dir === "asc" ? "desc" : "asc";
  };

  /**
   * Called when user requests a specific result page via table pagination.
   *
   * We put incorporate that into the api request params state obj, which
   * then triggers a request for the next page of API results.
   */
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  // Used with TableSearchBar
  // This is run whenever a search field changes.
  handleSearchChange = (search) => this.setState({ search });

  // Used with TableSearchBar
  // This method is passed the search object by TableSearchBar.
  handleSearch = (search, e) => {
    let newCurrentParams = { currentPage: 1 };

    forEach(this.utilDefinitions, (ud) => {
      let searchValue = search[ud.paramName];
      let searchKey = ud.stateName;
      newCurrentParams[searchKey] = searchValue || "";
    });

    this.setState(newCurrentParams);
  };

  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      resource_type_id: null,
      name: null,
      tags: null,
    });
  };

  /**
   * Handle click of a sortable col header.
   */
  handleSortClick = (v) => {
    const { currentSortDir, currentSortName } = this.state;

    if (!isNil(v)) {
      let vWithSuffix = v + "_sort";
      // If different than current sort selection, reset direction.
      if (vWithSuffix !== currentSortName) {
        this.setState({
          currentSortName: vWithSuffix,
          currentSortDir: "asc",
        });
      } else {
        let newCurrentSortDir = "asc"; // default
        if (isString(currentSortDir) && "asc" === currentSortDir.toLowerCase()) {
          newCurrentSortDir = "desc";
        }
        this.setState({ currentSortDir: newCurrentSortDir });
      }
    }
  };

  getSearchObject = () => {
    let tempSearchFields = this.searchFields;
    let searchObject = {};

    forEach(tempSearchFields, (searchField) => {
      let tempUtilDefs = this.utilDefinitions;
      let searchFieldStateName = find(tempUtilDefs, {
        paramName: searchField.name,
      }).stateName;
      searchObject[searchField.name] = get(this, `state.${searchFieldStateName}`, "");
    });

    return searchObject;
  };

  /**
   * Creates a tag name string by filtering from fetched tag list
   * with currently searched tags
   * @returns {string} tag name string
   */
  getFilteredByTagNameString = () => {
    const { tags } = this.props;
    const { currentTags } = this.state;

    let tagSlugsFromSearch = currentTags.split(",");
    let tagNameArray = [];

    forEach(tagSlugsFromSearch, (slug) => {
      let foundTag = find(tags, (t) => {
        return t.slug === slug;
      });
      if (foundTag) {
        tagNameArray.push(foundTag.name);
      }
    });

    return tagNameArray.join(", ");
  };

  /**
   * Display tag name sentence for top of resource list page
   * @returns {object} jsx
   */
  displaySearchTagNames = () => {
    const { tags, tagsLoading } = this.props;

    if (tagsLoading) {
      return <HgSkeleton variant="text" width={"40%"} />;
    }

    if (!tagsLoading && !isEmpty(tags)) {
      let tagNameString = this.getFilteredByTagNameString();

      if (!isEmpty(tagNameString)) {
        return (
          <div>
            <small>
              Filtering by tags: <em>{tagNameString}</em>
            </small>
          </div>
        );
      }
    }

    return;
  };

  widthSizeStr = () => {
    const { width } = this.props;
    let sizeStr = "24%";

    if (width < maxMdWidth) {
      sizeStr = "100%";
    }

    if (width > maxSmWidth && width < maxMdWidth) {
      sizeStr = "49%";
    }

    return sizeStr;
  };

  noResources = () => {
    const { loadingResources, resources } = this.props;

    return !loadingResources && isEmpty(resources);
  };

  listSkeletonScreenOutput = () => {
    const { classes } = this.props;
    let sizeStr = this.widthSizeStr();

    // Four skeleton boxes to fill out one row where sizeStr === 4
    let skeletonsArray = times(4, (index) => {
      return (
        <div key={index} className={clsx(classes.resourceDetailWrapper)} style={{ width: sizeStr }}>
          <div className={classes.resourceImageWrapper}>
            <HgSkeleton className={classes.resourceImage} variant="rect" />
          </div>
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
        </div>
      );
    });

    return <div className={classes.resourceListContainer}>{skeletonsArray}</div>;
  };

  render() {
    const {
      classes,
      currentUser,
      hiRezImageForResource,
      loadingResources,
      resources,
      requestResourcesMeta,
      perPage,
    } = this.props;
    const { search, currentPage } = this.state;

    return (
      <Fragment>
        <h1>Resources</h1>

        {this.displaySearchTagNames()}

        <div className={classes.resourceHeaderDescription}>
          <DynamicContent machineName={"resource_header_description"} />
        </div>

        <div className={classes.resourceSearchWrapper}>
          <TableSearchBarNoExpansion
            fields={this.getSearchFields()}
            onClear={this.handleSearchClear}
            onChange={this.handleSearchChange}
            onSearch={this.handleSearch}
            search={search}
          />
        </div>

        {/* @TODO: Once a determination has been made we will either implement
                   sorting functionality or remove it from this page.  Keeping
                   this here and commented out for now in case we want to
                   re-implement it.
        <div className={classes.resourceHeaderWrapper}>
          <TableSortLabel
            onClick={() => this.handleSortClick('weight')}
            active={sortField === 'weight'}
            direction={currentSortDir}
          >
            Relevance
          </TableSortLabel>
          <TableSortLabel>|</TableSortLabel>
          <TableSortLabel
            onClick={() => this.handleSortClick('name')}
            active={sortField === 'name'}
            direction={currentSortDir}
          >
            Name
          </TableSortLabel>
        </div>
        */}

        {this.noResources() && <div className={classes.noResources}>No Resources found</div>}

        {loadingResources ? (
          this.listSkeletonScreenOutput()
        ) : (
          <Fragment>
            <div className={classes.resourceListContainer}>
              {resources.map((r) => {
                return (
                  <ResourceCard
                    key={`resource_card_${r.id}`}
                    currentUser={currentUser}
                    handleSearch={this.handleSearch}
                    resourceImage={get(r, "feature_media.card", null)}
                    resourceHiResImage={hiRezImageForResource(r)}
                    resourceTags={r.tags || null}
                    resourceSummary={r.summary || null}
                    restricted={r.restricted || null}
                    resourceTranslations={r.translations || []}
                    resourceLinkUrl={r.link_url}
                    resourceId={r.id}
                    resourceName={r.name}
                    widthSizeStr={this.widthSizeStr()}
                  />
                );
              })}
            </div>

            <HgPagination
              handlePageChange={this.handlePageChange}
              itemsPerPage={perPage}
              itemsTotal={requestResourcesMeta.total ? requestResourcesMeta.total : 0}
              currentPage={Number(currentPage)}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

const maxSmWidth = 599;
const maxMdWidth = 899;

const styles = (theme) => ({
  noResources: {
    fontStyle: "italic",
  },
  resourceSearchWrapper: {
    margin: theme.spacing(2, 0, 2, 0),
  },
  resourceHeaderDescription: {
    margin: theme.spacing(1, 0, 1.5, 0),
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
  resourceListContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginRight: "-1%",
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

const mapStateToProps = (state) => {
  return {
    resourceTypes: state.app_meta.data.resourceTypes,
    languages: state.app_meta.data.languages,
  };
};

const mapDispatchToProps = (dispatch) => ({
  addToContents: (machineNames) => {
    dispatch(
      fetchContents({
        machine_name: machineNames,
      })
    );
  },
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withResizeDetector(withStyles(styles, { withTheme: true })(ResourcesList)));
