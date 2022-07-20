import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, forEach, find, get, isNil, isString, values } from "lodash";
import {
  Hidden,
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
import TableSearchBar from "components/ui/TableSearchBar";
import HgPagination from "components/ui/HgPagination";
import { requestOrganizations } from "api/requests";
import stateCodes from "constants/state_codes";
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import orgCityAndState from "utils/orgCityAndState";
import orgTypeName from "utils/orgTypeName";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * This is a paginated table of organizations for use by admins.
 *
 * Each page of results is requested directly from the server as needed. We're
 * not storing this list in redux due to size.
 */

class Organizations extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    programs: PropTypes.object.isRequired,
    perPage: PropTypes.number,
    organizationTypes: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    const { organizationTypes } = props;

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "admorg_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      id: "",
      location_id: "",
      organization_type_id: "",
      parent_id: "",
      pid: "",
      state_id: "",
    };

    let stateCodesForSearch = stateCodes;
    stateCodesForSearch.unshift(["", "Select..."]);

    let orgTypesForSearch = values(organizationTypes);
    orgTypesForSearch.unshift({ id: "", name: "Select..." });

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
        stateName: "currentId",
        paramName: "id",
        defaultParamValue: this.defaultBrowserParamValues.id,
        valueType: "str",
      },
      {
        stateName: "currentLocationId",
        paramName: "location_id",
        defaultParamValue: this.defaultBrowserParamValues.location_id,
        valueType: "str",
      },
      {
        stateName: "currentOrganizationTypeId",
        paramName: "organization_type_id",
        defaultParamValue: this.defaultBrowserParamValues.organization_type_id,
        valueType: "str",
      },
      {
        stateName: "currentParentId",
        paramName: "parent_id",
        defaultParamValue: this.defaultBrowserParamValues.parent_id,
        valueType: "str",
      },
      {
        stateName: "currentPid",
        paramName: "pid",
        defaultParamValue: this.defaultBrowserParamValues.pid,
        valueType: "str",
      },
      {
        stateName: "currentStateId",
        paramName: "state_id",
        defaultParamValue: this.defaultBrowserParamValues.state_id,
        valueType: "str",
      },
    ];

    // Search fields we'll use with TableSearchBar.
    // Make sure each is present in browserParamsToApiParamsMap AND in the
    // initial value for this.state.search.
    this.searchFields = [
      {
        label: "ID",
        name: "id",
        type: "text",
      },
      {
        label: "Organization Name",
        name: "name",
        type: "text",
      },
      {
        label: "PID",
        name: "pid",
        type: "text",
      },
      {
        label: "Location ID",
        name: "location_id",
        type: "text",
      },
      {
        label: "State",
        name: "state_id",
        type: "select",
        minWidth: "80px",
        options: stateCodesForSearch.map((code) => (
          <MenuItem key={`search_states_${code[0]}`} value={code[0]}>
            {code[1]}
          </MenuItem>
        )),
      },
      {
        label: "Organization Type",
        name: "organization_type_id",
        type: "select",
        options: orgTypesForSearch.map((ot) => (
          <MenuItem key={`search_orgtypes_${ot.id}`} value={ot.id}>
            {ot.name}
          </MenuItem>
        )),
        minWidth: "170px",
        parseInt: true,
      },
      {
        label: "Parent ID",
        name: "parent_id",
        type: "text",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      organizations: [],
      // Org list meta (per API payload)
      requestMeta: {},
      // Whether we're currently try to load orgs.
      loading: false,
      currentPage: null,
      currentSortDir: "asc",
      currentSortName: null,
      currentName: null,
      currentId: null,
      currentLocationId: null,
      currentParentId: null,
      currentPid: null,
      currentStateId: null,
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
    generateTitle("Organization Management");
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
      currentId: currentUrlParamValue(
        "id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.id
      ),
      currentLocationId: currentUrlParamValue(
        "location_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.location_id
      ),
      currentOrganizationTypeId: currentUrlParamValue(
        "organization_type_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.organization_type_id
      ),
      currentParentId: currentUrlParamValue(
        "parent_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.parent_id
      ),
      currentPid: currentUrlParamValue(
        "pid",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.pid
      ),
      currentStateId: currentUrlParamValue(
        "state_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.state_id
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
      currentId,
      currentLocationId,
      currentOrganizationTypeId,
      currentParentId,
      currentPid,
      currentStateId,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentName: prevCurrentName,
      currentId: prevCurrentId,
      currentLocationId: prevCurrentLocationId,
      currentOrganizationTypeId: prevCurrentOrganizationTypeId,
      currentParentId: prevCurrentParentId,
      currentPid: prevCurrentPid,
      currentStateId: prevCurrentStateId,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }
    generateTitle("Organization Management");
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
      prevCurrentId !== currentId ||
      prevCurrentLocationId !== currentLocationId ||
      prevCurrentOrganizationTypeId !== currentOrganizationTypeId ||
      prevCurrentParentId !== currentParentId ||
      prevCurrentPid !== currentPid ||
      prevCurrentStateId !== currentStateId
    ) {
      // Updates contents
      this.getOrganizations();

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
   * Populate state.organizations.
   */
  getOrganizations = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentId,
      currentLocationId,
      currentOrganizationTypeId,
      currentParentId,
      currentPid,
      currentStateId,
    } = this.state;

    this.firstLoadRequested = true;

    this.setState({
      loading: true,
      search: this.getSearchObject(),
    });

    requestOrganizations({
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      name: currentName,
      id: currentId,
      location_id: currentLocationId,
      organization_type_id: currentOrganizationTypeId,
      parent_id: currentParentId,
      pid: currentPid,
      state_id: currentStateId,
    }).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          loading: false,
          organizations: res.data.data,
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
  // This is run by TableSearchBar when user clicks the "clear" button.
  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      id: null,
      name: null,
      pid: null,
      location_id: null,
      state_id: null,
      organization_type_id: null,
      parent_id: null,
    });
  };

  /**
   * Returns a displayable string for the parent org of an org.
   */
  displayableParent(org) {
    if (!isNil(org.parent_organization)) {
      return (
        <React.Fragment>
          <Link to={`/app/admin/organizations/${org.parent_organization.id}`}>
            {org.parent_organization.name}
          </Link>{" "}
          |{" "}
          <Link to={`/app/admin/organizations/${org.parent_organization.id}/team`}>
            team&raquo;
          </Link>
        </React.Fragment>
      );
    }
    return "--";
  }

  render() {
    const { organizationTypes, perPage } = this.props;
    const { loading, requestMeta, organizations, search, sortField, currentPage, currentSortDir } =
      this.state;

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;

    return (
      <React.Fragment>
        {/*
        <div className="no-print">
          <Breadcrumb path="/app/admin/organizations" root>
            Organization Management
          </Breadcrumb>
          <br />
          <br />
        </div>
        */}

        <h1>Organization Management</h1>

        <TableSearchBar
          searchBarText={"Search Organizations..."}
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

                <Hidden mdDown>
                  <TableCell>Parent Org</TableCell>
                </Hidden>

                <Hidden smDown>
                  <TableCell>Type</TableCell>
                </Hidden>

                <TableCell align="right">
                  <Tooltip title="Sort">
                    <TableSortLabel
                      onClick={() => this.handleSortClick("id")}
                      active={sortField === "id"}
                      direction={currentSortDir}
                    >
                      <React.Fragment>ID</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.firstLoadRequested && (
                <React.Fragment>
                  {organizations.map((o) => {
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link to={`/app/admin/organizations/${o.id}`}>{o.name}</Link> |{" "}
                          <Link to={`/app/admin/organizations/${o.id}/team`}>team&raquo;</Link>
                          <div>{orgCityAndState(o)}</div>
                        </TableCell>

                        <Hidden mdDown>
                          <TableCell>{this.displayableParent(o)}</TableCell>
                        </Hidden>

                        <Hidden smDown>
                          <TableCell>{orgTypeName(o, organizationTypes)}</TableCell>
                        </Hidden>

                        <TableCell align="right">
                          <Link to={`/app/admin/organizations/${o.id}`}>{o.id}</Link>
                        </TableCell>
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

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    organizationTypes: state.app_meta.data.organizationTypes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Organizations));
