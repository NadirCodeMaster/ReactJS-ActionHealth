import React, { Fragment, Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, forEach, get, find, isEmpty, isNil, isString, values } from "lodash";
import moment from "moment";
import {
  Button,
  Icon,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import HgPagination from "components/ui/HgPagination";
import TableSearchBarNoExpansion from "components/ui/TableSearchBarNoExpansion";
import generateQsPrefix from "utils/generateQsPrefix";
import generateTitle from "utils/generateTitle";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import styleVars from "style/_vars.scss";

/**
 * This is a paginated table of resources for use by admins.
 */

class ResourcesList extends Component {
  static defaultProps = {
    perPage: 24,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "admrec_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      resource_type_id: "",
      tags: "",
      language_id: "",
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
      {
        stateName: "currentPublished",
        paramName: "published",
        defaultParamValue: this.defaultBrowserParamValues.published,
        valueType: "str",
      },
      {
        stateName: "currentDirectDownload",
        paramName: "direct_download",
        defaultParamValue: this.defaultBrowserParamValues.direct_download,
        valueType: "str",
      },
      {
        stateName: "currentRestricted",
        paramName: "restricted",
        defaultParamValue: this.defaultBrowserParamValues.restricted,
        valueType: "str",
      },
      {
        stateName: "currentSoftGate",
        paramName: "soft_gate",
        defaultParamValue: this.defaultBrowserParamValues.soft_gate,
        valueType: "str",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      // organizations: [],
      // Org list meta (per API payload)
      // requestMeta: {},
      // Whether we're currently try to load orgs.
      loading: false,
      currentPage: 1,
      currentSortDir: "asc",
      currentSortName: "name_sort",
      currentSearch: null,
      currentType: null,
      currentLanguage: null,
      currentTags: null,
      currentPublished: null,
      currentDirectDownload: null,
      currentRestricted: null,
      currentSoftGate: null,
      search: {},
    };

    // Used as filter browser url params conversion to search state
    this.searchFields = [
      {
        name: "search",
      },
      {
        name: "resource_type_id",
      },
      {
        name: "tags",
      },
      {
        name: "language_id",
      },
      {
        name: "published",
      },
      {
        name: "direct_download",
      },
      {
        name: "restricted",
      },
      {
        name: "soft_gate",
      },
    ];
  }

  static propTypes = {
    getResourcesRequest: PropTypes.func.isRequired,
    getTagsRequest: PropTypes.func.isRequired,
    loadingResources: PropTypes.bool.isRequired,
    resources: PropTypes.array.isRequired,
    requestResourcesMeta: PropTypes.object.isRequired,
  };

  /**
   * Gets search fields for search bar functionality
   * @returns {object}
   */
  getSearchFields = () => {
    const { classes, resourceTypes, tags, languages } = this.props;
    const { search } = this.state;

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

    let binarySelectArray = [
      {
        name: "Select...",
        value: "",
      },
      {
        name: "Yes",
        value: "true",
      },
      {
        name: "No",
        value: "false",
      },
    ];

    return [
      {
        label: "Search",
        name: "search",
        type: "text",
      },
      {
        label: "Type",
        name: "resource_type_id",
        type: "select",
        minWidth: "100px",
        options: Object.values(resourceTypesForSearch).map((resourceType) => (
          <MenuItem key={`search_type_${resourceType.id}`} value={resourceType.id}>
            {resourceType.name}
          </MenuItem>
        )),
      },
      {
        label: "Tag",
        name: "tags",
        type: "select",
        width: "100px",
        options: Object.values(tagsForSearch).map((tag) => {
          let isMultipleTagsOption = multipleTags.length > 1 && tag.slug === multipleTags.join(",");
          let isInternal = get(tag, "internal", false);
          return (
            <MenuItem key={`search_tag_${tag.slug}`} value={tag.slug}>
              {isMultipleTagsOption ? (
                <em>{tag.name}</em>
              ) : (
                <React.Fragment>
                  {tag.name}
                  {isInternal && <small className={classes.tagInternalDropdown}>(internal)</small>}
                </React.Fragment>
              )}
            </MenuItem>
          );
        }),
      },
      {
        label: "Language",
        name: "language_id",
        type: "select",
        width: "100px",
        options: Object.values(languagesForSearch).map((language) => (
          <MenuItem key={`search_type_${language.id}`} value={language.id}>
            {language.exonym}
          </MenuItem>
        )),
      },
      {
        label: "Public",
        name: "published",
        type: "select",
        width: "80px",
        options: binarySelectArray.map((option) => (
          <MenuItem key={`search_public_${option.value}`} value={option.value}>
            {option.name}
          </MenuItem>
        )),
      },
      {
        label: "Direct Download",
        name: "direct_download",
        type: "select",
        width: "80px",
        options: binarySelectArray.map((option) => (
          <MenuItem key={`search_direct_download_${option.value}`} value={option.value}>
            {option.name}
          </MenuItem>
        )),
      },
      {
        label: "Restricted",
        name: "restricted",
        type: "select",
        width: "80px",
        options: binarySelectArray.map((option) => (
          <MenuItem key={`search_restricted_${option.value}`} value={option.value}>
            {option.name}
          </MenuItem>
        )),
      },
      {
        label: "Soft Gated",
        name: "soft_gate",
        type: "select",
        width: "80px",
        options: binarySelectArray.map((option) => (
          <MenuItem key={`search_soft_gate_${option.value}`} value={option.value}>
            {option.name}
          </MenuItem>
        )),
      },
    ];
  };

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { getTagsRequest } = this.props;
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);
    generateTitle("Resource Management");
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
      currentTags: currentUrlParamValue(
        "tags",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.tags
      ),
      currentLanguage: currentUrlParamValue(
        "language_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.language_id
      ),
      currentPublished: currentUrlParamValue(
        "published",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.published
      ),
      currentDirectDownload: currentUrlParamValue(
        "direct_download",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.direct_download
      ),
      currentRestricted: currentUrlParamValue(
        "restricted",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.restricted
      ),
      currentSoftGate: currentUrlParamValue(
        "soft_gate",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.soft_gate
      ),
    });

    getTagsRequest({ include_internal: true, name_sort: "asc" });
  }

  componentDidUpdate(prevProps, prevState) {
    const { getResourcesRequest, history, location, qsPrefix } = this.props;
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
      currentPublished,
      currentDirectDownload,
      currentRestricted,
      currentSoftGate,
      search,
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
      currentPublished: prevCurrentPublished,
      currentDirectDownload: prevCurrentDirectDownload,
      currentRestricted: prevCurrentRestricted,
      currentSoftGate: prevCurrentSoftGate,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }
    generateTitle("Resource Management");
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
      prevCurrentTags !== currentTags ||
      prevCurrentPublished !== currentPublished ||
      prevCurrentDirectDownload !== currentDirectDownload ||
      prevCurrentRestricted !== currentRestricted ||
      prevCurrentSoftGate !== currentSoftGate
    ) {
      // Updates contents
      getResourcesRequest(this.getResourceRequestObject());
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

      // If defaultSearchExpanded is falsy, check for values in search
      // object. If they exist set defaultSearchExpanded to true
      if (!this.defaultSearchExpanded) {
        each(search, (searchField) => {
          if (searchField.length > 0) {
            this.defaultSearchExpanded = true;
            return false;
          }
        });
      }
    }
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
      currentPublished,
      currentDirectDownload,
      currentRestricted,
      currentSoftGate,
    } = this.state;

    return {
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      search: currentSearch,
      resource_type_id: currentType,
      language_id: currentLanguage,
      tags: currentTags,
      published: currentPublished,
      direct_download: currentDirectDownload,
      restricted: currentRestricted,
      soft_gate: currentSoftGate,
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

  /**
   * Get the opposite sort direction of what was provided.
   * @returns {string}
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

  // Used with TableSearchBarNoExpansion
  // This is run whenever a search field changes.
  handleSearchChange = (search) => this.setState({ search });

  // Used with TableSearchBarNoExpansion
  // This method is passed the search object by TableSearchBarNoExpansion. We
  // add those values into apiRequestParams, which makes them available
  // for the next API request for results. That API request is then
  // triggered automatically via componentDidUpdate().
  handleSearch = (search) => {
    let newCurrentParams = { currentPage: 1 };

    forEach(this.utilDefinitions, (ud) => {
      let searchValue = search[ud.paramName];
      let searchKey = ud.stateName;
      newCurrentParams[searchKey] = searchValue || "";
    });

    this.setState(newCurrentParams);
  };

  // Used with TableSearchBarNoExpansion
  // This is run by TableSearchBarNoExpansion when user clicks the "clear" button.
  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      resource_type_id: null,
      language_id: null,
      name: null,
      tags: null,
    });
  };

  /**
   * Handle click of a sortable col header.
   * @param {object} v
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
   * Should we display card (mobile) view given width
   */
  isCardView = () => {
    const { width } = this.props;

    return width <= maxSmWidth;
  };

  render() {
    const {
      classes,
      loadingResources,
      getResourceTypeName,
      resources,
      requestResourcesMeta,
      perPage,
    } = this.props;
    const { currentPage, search, currentSortDir, sortField } = this.state;

    let tpCount = requestResourcesMeta.total ? requestResourcesMeta.total : 0;
    let noResources = !loadingResources && isEmpty(resources);

    return (
      <React.Fragment>
        <h1>
          Resource Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/resources/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>

        <div className={classes.tableSearchBarContainer}>
          <TableSearchBarNoExpansion
            defaultSearchExpanded={this.defaultSearchExpanded}
            fields={this.getSearchFields()}
            onClear={this.handleSearchClear}
            onChange={this.handleSearchChange}
            onSearch={this.handleSearch}
            search={search}
          />
        </div>

        <Paper>
          {loadingResources && <CircularProgressGlobal />}

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip title="Sort">
                    <TableSortLabel
                      onClick={() => this.handleSortClick("name")}
                      active={sortField === "name"}
                      direction={currentSortDir}
                    >
                      Name
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>

                {!this.isCardView() && (
                  <Fragment>
                    <TableCell>Type</TableCell>

                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("updated_at")}
                          active={sortField === "updated_at"}
                          direction={currentSortDir}
                        >
                          Updated
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("created_at")}
                          active={sortField === "created_at"}
                          direction={currentSortDir}
                        >
                          Created
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">Public</TableCell>

                    <TableCell align="right">Restricted</TableCell>

                    <TableCell align="right">Direct Download</TableCell>

                    <TableCell align="right">Soft Gate</TableCell>
                  </Fragment>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              <React.Fragment>
                {noResources && (
                  <TableRow>
                    <TableCell className={classes.noResourcesCell}>No resources found</TableCell>
                  </TableRow>
                )}

                {resources.map((r) => {
                  let resourceTypeName = getResourceTypeName(r.resource_type_id);
                  let updatedAt = moment.utc(r.updated_at).fromNow();
                  let createdAt = moment.utc(r.created_at).fromNow();
                  let published = r.published ? "Yes" : "No";
                  let restricted = r.restricted ? "Yes" : "No";
                  let directDownload = r.direct_download ? "Yes" : "No";
                  let softGate = r.soft_gate ? "Yes" : "No";

                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div>
                          <Link to={`/app/admin/resources/${r.id}`}>{r.name}</Link>
                        </div>
                        {this.isCardView() && (
                          <Fragment>
                            <div className={classes.smallFontSubcategory}>
                              Type: {resourceTypeName}
                            </div>
                            <div className={classes.smallFontSubcategory}>Updated: {updatedAt}</div>
                            <div className={classes.smallFontSubcategory}>Created: {updatedAt}</div>
                            <div className={classes.smallFontSubcategory}>Public: {published}</div>
                            <div className={classes.smallFontSubcategory}>
                              Restricted: {restricted}
                            </div>
                            <div className={classes.smallFontSubcategory}>
                              Direct Download: {directDownload}
                            </div>
                            <div className={classes.smallFontSubcategory}>
                              Soft Gated: {softGate}
                            </div>
                          </Fragment>
                        )}
                      </TableCell>
                      {!this.isCardView() && (
                        <Fragment>
                          <TableCell>{resourceTypeName}</TableCell>

                          <TableCell>{updatedAt}</TableCell>

                          <TableCell>{createdAt}</TableCell>

                          <TableCell align="right">{published}</TableCell>

                          <TableCell align="right">{restricted}</TableCell>

                          <TableCell align="right">{directDownload}</TableCell>

                          <TableCell align="right">{softGate}</TableCell>
                        </Fragment>
                      )}
                    </TableRow>
                  );
                })}
              </React.Fragment>
            </TableBody>
          </Table>
          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={perPage}
            itemsTotal={tpCount}
            currentPage={currentPage}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const maxSmWidth = 780;

const styles = (theme) => ({
  noResourcesCell: {
    fontStyle: "italic",
  },
  tagInternalDropdown: {
    margin: theme.spacing(0.5, 0, 0, 0.5),
  },
  smallFontSubcategory: {
    fontSize: styleVars.txtFontSizeXs,
  },
  tableSearchBarContainer: {
    marginBottom: theme.spacing(),
  },
});

const mapStateToProps = (state) => {
  return {
    resourceTypes: state.app_meta.data.resourceTypes,
    languages: state.app_meta.data.languages,
  };
};

const mapDispatchToProps = {};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withResizeDetector(withStyles(styles, { withTheme: true })(ResourcesList)));
