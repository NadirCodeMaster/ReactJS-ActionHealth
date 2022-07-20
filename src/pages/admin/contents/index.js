import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { each, forEach, find, get, isNil, isString } from "lodash";
import {
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
import TableSearchBar from "components/ui/TableSearchBar";
import HgPagination from "components/ui/HgPagination";
import { requestContents } from "api/requests";
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";

/**
 * This is a paginated table of contents for use by admins.
 *
 * Each page of results is requested directly from the server as needed. We're
 * not storing this list in redux due to size.
 */
class Contents extends Component {
  static propTypes = {
    // -- Via withRouter
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    perPage: PropTypes.number,
    height: PropTypes.number, // via withResizeDetector
    width: PropTypes.number, // via withResizeDetector
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "content_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      internal_title: "",
      machine_name: "",
    };

    // Defintions array passed to certain utilities.
    // @see utils/compareStateWithUrlParams()
    // @see utils/populateStateFromUrlParams()
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
        stateName: "currentName",
        paramName: "name",
        defaultParamValue: this.defaultBrowserParamValues.name,
        valueType: "str",
      },
      {
        stateName: "currentInternalTitle",
        paramName: "internal_title",
        defaultParamValue: this.defaultBrowserParamValues.internal_title,
        valueType: "str",
      },
      {
        stateName: "currentMachineName",
        paramName: "machine_name",
        defaultParamValue: this.defaultBrowserParamValues.machine_name,
        valueType: "str",
      },
    ];

    // Search fields we'll use with TableSearchBar.
    // Make sure each is present in browserParamsToApiParamsMap AND in the
    // initial value for this.state.search.
    this.searchFields = [
      {
        label: "Name",
        name: "name",
        type: "text",
      },
      {
        label: "Internal title",
        name: "internal_title",
        type: "text",
      },
      {
        label: "Machine name",
        name: "machine_name",
        type: "text",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      contents: [],
      requestMeta: {},
      loading: false,
      currentPage: null,
      currentSortDir: "asc",
      currentSortName: null,
      currentName: null,
      currentInternalTitle: null,
      currentMachineName: null,
      search: {},
    };
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);
    generateTitle("Content Management");
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
      currentName: currentUrlParamValue(
        "name",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.name
      ),
      currentInternalTitle: currentUrlParamValue(
        "internal_title",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.internal_title
      ),
      currentMachineName: currentUrlParamValue(
        "machine_name",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.machine_name
      ),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { history, location, qsPrefix } = this.props;
    const { qsPrefix: prevQsPrefix } = prevProps;
    const {
      actualQsPrefix,
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentInternalTitle,
      currentMachineName,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentName: prevCurrentName,
      currentInternalTitle: prevCurrentInternalTitle,
      currentMachineName: prevCurrentMachineName,
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

    if (
      prevCurrentPage !== currentPage ||
      prevCurrentSortDir !== currentSortDir ||
      prevCurrentSortName !== currentSortName ||
      prevCurrentName !== currentName ||
      prevCurrentInternalTitle !== currentInternalTitle ||
      prevCurrentMachineName !== currentMachineName
    ) {
      // Updates contents
      this.getContents();
      generateTitle("Content Management");
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
   */
  getReversedSortDir = (dir) => {
    return dir === "asc" ? "desc" : "asc";
  };

  /**
   * Populate state.contents.
   */
  getContents = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentInternalTitle,
      currentMachineName,
    } = this.state;

    this.firstLoadRequested = true;

    this.setState({
      loading: true,
      search: this.getSearchObject(),
    });

    requestContents({
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      name: currentName,
      internal_title: currentInternalTitle,
      machine_name: currentMachineName,
    }).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          loading: false,
          contents: res.data.data,
          requestMeta: res.data.meta,
        });
      }
    });
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

  handleRowClick = (e, row) => {
    const { history } = this.props;

    history.push(`/app/admin/content/${row.machine_name}`);
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

  // Used with TableSearchBar
  // ------------------------
  // This is run whenever a search field changes.
  handleSearchChange = (search) => {
    this.setState({ search });
  };

  // Used with TableSearchBar
  // ------------------------
  // This method is passed the search object by TableSearchBar.
  // Map search object to currentState values defined in utilDefinitions
  handleSearch = (search) => {
    let newCurrentParams = { currentPage: 1 };

    forEach(this.utilDefinitions, (ud) => {
      let searchValue = search[ud.paramName];
      let searchKey = ud.stateName;
      newCurrentParams[searchKey] = searchValue;
    });

    this.setState(newCurrentParams);
  };

  // Used with TableSearchBar
  // ------------------------
  // This is run by TableSearchBar when user clicks the "clear" button.
  handleSearchClear = () => {
    this.setState({
      search: {},
    });
    // Run search with empty search object.
    this.handleSearch({
      internal_title: null,
      machine_name: null,
      name: null,
    });
  };

  render() {
    const { loading, requestMeta, search, currentSortDir, sortField, contents, currentPage } =
      this.state;
    const { classes, width, perPage } = this.props;

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;
    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
        <h1>Content Management</h1>

        <TableSearchBar
          defaultSearchExpanded={this.defaultSearchExpanded}
          fields={this.searchFields}
          onClear={this.handleSearchClear}
          onChange={this.handleSearchChange}
          onSearch={this.handleSearch}
          search={search}
        />

        <Paper>
          {loading && <CircularProgressGlobal />}

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip title="Sort">
                    <TableSortLabel
                      onClick={() => this.handleSortClick("internal_title")}
                      active={sortField === "internal_title"}
                      direction={currentSortDir}
                    >
                      <React.Fragment>Internal Title</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>

                <TableCell className={clsx(classes.contentsTableHeader, sizeStr)}>
                  <Tooltip title="Sort">
                    <React.Fragment>Internal Description</React.Fragment>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Tooltip title="Sort">
                    <TableSortLabel
                      onClick={() => this.handleSortClick("machine_name")}
                      active={sortField === "machine_name"}
                      direction={currentSortDir}
                    >
                      <React.Fragment>Machine Name</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.firstLoadRequested && (
                <React.Fragment>
                  {contents.map((content) => {
                    return (
                      <TableRow
                        style={{ cursor: "pointer" }}
                        key={content.id}
                        onClick={(e) => this.handleRowClick(e, content)}
                        hover
                      >
                        <TableCell>{content.internal_title}</TableCell>

                        {/* Eric hide this too */}
                        <TableCell className={clsx(classes.contentsTableCell, sizeStr)}>
                          {content.internal_description}
                        </TableCell>

                        <TableCell>{content.machine_name}</TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              )}
            </TableBody>
          </Table>
          {this.firstLoadRequested && (
            <HgPagination
              handlePageChange={this.handlePageChange}
              itemsPerPage={perPage}
              itemsTotal={tpCount}
              currentPage={currentPage}
            />
          )}
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  contentsTableHeader: {
    display: "none",
    "&.lg": {
      display: "table-cell",
    },
  },
  contentsTableCell: {
    display: "none",
    "&.lg": {
      display: "table-cell",
    },
  },
});

const maxSmWidth = 799;

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  withResizeDetector,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Contents));
