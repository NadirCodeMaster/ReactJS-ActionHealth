import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, find, forEach, get, isNil, isString } from "lodash";
import moment from "moment";
import {
  Button,
  Icon,
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
import TableSearchBar from "components/ui/TableSearchBar";
import stateCodes from "constants/state_codes";
import { requestCriteria } from "api/requests";
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { fetchSets } from "store/actions";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * This is a paginated table of criteria for use by admins.
 *
 * Each page of results is requested directly from the server as needed. We're
 * not storing this list in redux due to size.
 */
class Criteria extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    perPage: PropTypes.number,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "admcrit_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      id: "",
      criterion_instance_handle: "",
    };

    let stateCodesForSearch = stateCodes;
    stateCodesForSearch.unshift(["", "Select..."]);

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
        stateName: "currentCriterionInstanceHandle",
        paramName: "criterion_instance_handle",
        defaultParamValue: this.defaultBrowserParamValues.criterion_instance_handle,
        valueType: "str",
      },
      {
        stateName: "currentId",
        paramName: "id",
        defaultParamValue: this.defaultBrowserParamValues.id,
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
        label: "ID",
        name: "id",
        type: "text",
      },
      {
        label: "Instance Handle",
        name: "criterion_instance_handle",
        type: "text",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      criteria: [],
      // Org list meta (per API payload)
      requestMeta: {},
      // Whether we're currently try to load orgs.
      loading: false,
      // Direction of whatever sorting is applied.
      currentSortDir: "asc",
      // Field to sort by.
      currentSortName: null,
      currentName: null,
      currentCriterionInstanceHandle: null,
      currentId: null,
      search: {},
    };
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { fetchSets, location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);
    generateTitle("Criterion Management");
    let _actualQsPrefix = generateQsPrefix(this.defaultQsPrefix, qsPrefix);

    // Dispatch fetchSets action to store sets in redux store
    fetchSets();

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
      currentCriterionInstanceHandle: currentUrlParamValue(
        "criterion_instance_handle",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.criterion_instance_handle
      ),
      currentId: currentUrlParamValue(
        "id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.id
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
      currentCriterionInstanceHandle,
      currentId,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentName: prevCurrentName,
      currentCriterionInstanceHandle: prevCurrentCriterionInstanceHandle,
      currentId: prevCurrentId,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }
    generateTitle("Criterion Management");
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
      prevCurrentName !== currentName ||
      prevCurrentCriterionInstanceHandle !== currentCriterionInstanceHandle ||
      prevCurrentId !== currentId
    ) {
      // Updates criteria
      this.getCriteria();

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
   * Populate state.criteria.
   */
  getCriteria = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentCriterionInstanceHandle,
      currentId,
    } = this.state;

    this.firstLoadRequested = true;
    this.setState({
      loading: true,
      search: this.getSearchObject(),
    });

    requestCriteria({
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      name: currentName,
      criterion_instance_handle: currentCriterionInstanceHandle,
      id: currentId,
    }).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          loading: false,
          criteria: res.data.data,
          requestMeta: res.data.meta,
        });
      }
    });
  };

  /**
   * Called when criterion requests a specific result page via table pagination.
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
  handleSearchChange = (search) => this.setState({ search });

  // Used with TableSearchBar
  // ------------------------
  // This method is passed the search object by TableSearchBar. We
  // add those values into apiRequestParams, which makes them available
  // for the next API request for results. That API request is then
  // triggered automatically via componentDidUpdate().
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
  // This is run by TableSearchBar when criterion clicks the "clear" button.
  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      name: null,
      id: null,
      criterion_instance_handle: null,
    });
  };

  /**
   * Get path to criterion instance admin detail page.
   * @param {object} criterionInstance
   * @returns {string}
   */
  getCriterionInstancePath = (criterionInstance) => {
    const { sets } = this.props;

    let setObj = find(sets.data, ["id", criterionInstance.set_id]);
    if (setObj) {
      return `/app/admin/programs/${setObj.program_id}/sets/${setObj.id}/questions/${criterionInstance.id}`;
    }
    return "";
  };

  formatDate(date) {
    return moment(date).isValid() ? moment.utc(date).format("L") : "";
  }

  render() {
    const { classes, perPage } = this.props;
    const { currentPage, loading, requestMeta, search, currentSortDir, sortField, criteria } =
      this.state;

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;

    return (
      <React.Fragment>
        <h1>
          Criterion Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/criteria/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>

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
                      onClick={() => this.handleSortClick("name")}
                      active={sortField === "name"}
                      direction={currentSortDir}
                    >
                      <React.Fragment>Name</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Sort">
                    <TableSortLabel
                      onClick={() => this.handleSortClick("id")}
                      active={sortField === "id"}
                      direction={currentSortDir}
                    >
                      <React.Fragment>id</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">Instance Handle(s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.firstLoadRequested && (
                <React.Fragment>
                  {criteria.map((c) => {
                    let criterionInstances = get(c, "criterion_instances", []);
                    let cihString = criterionInstances.map((ci, ciItemIndex) => {
                      let separator = ciItemIndex + 1 < criterionInstances.length ? ", " : "";
                      return (
                        <span key={ciItemIndex}>
                          <Link
                            to={this.getCriterionInstancePath(ci)}
                            className={classes.ciHandleLink}
                          >
                            {ci.handle}
                          </Link>
                          {separator}
                        </span>
                      );
                    });

                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <Link to={`/app/admin/criteria/${c.id}`}>{c.name}</Link>
                        </TableCell>
                        <TableCell>{c.id}</TableCell>
                        <TableCell align="right">{cihString}</TableCell>
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
  ciHandleLink: {
    whiteSpace: "nowrap",
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
    sets: state.sets,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchSets: () => dispatch(fetchSets()),
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Criteria));
