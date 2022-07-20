import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, find, get, forEach, isNil, isString, values } from "lodash";
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
import stateCodes from "constants/state_codes";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import { requestUserReports } from "api/requests";
import orgTypeName from "utils/orgTypeName";
import orgCityAndState from "utils/orgCityAndState";
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * This is a paginated table of organizations a user can view reports for.
 *
 * Each page of results is requested directly from the server as needed because
 * the orgs are not just those that a user is directly associated with; the
 * orgs here may include schools that are children of a district the user is
 * associated with, for example.
 */
const styles = (theme) => ({});

class Reports extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
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
    this.defaultQsPrefix = "reports_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      id: "",
      location_id: "",
      name: "",
      organization_type_id: "",
      parent_id: "",
      pid: "",
      state_id: "",
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

    let stateCodesForSearch = stateCodes;
    stateCodesForSearch.unshift(["", "Select..."]);

    let orgTypesForSearch = values(organizationTypes);
    orgTypesForSearch.unshift({ id: "", name: "Select..." });

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
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
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
        "id",
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

    generateTitle("My Reports");
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

    // Begin populating the rest of state once actualQsPrefix is set
    // (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    generateTitle("My Reports");

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
      this.getReports();

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
  getReports = () => {
    const { currentUser, perPage } = this.props;
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
    if (!this.isCancelled) {
      this.setState({
        loading: true,
        search: this.getSearchObject(),
      });
    }

    requestUserReports(currentUser.data.id, {
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
  // This method is passed the search object by TableSearchBar.
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
   * Returns a displayable output for the reports (sets) of an org.
   */
  displayableReports(org) {
    if (!isNil(org.available_sets)) {
      return (
        <ul style={{ padding: "0 0 0 2em", margin: "0" }}>
          {org.available_sets.map((set) => (
            <li key={`${org.id}_set_${set.id}`}>
              <Link
                to={`/app/programs/${set.program_id}/organizations/${org.id}/sets/${set.id}/report`}
              >
                {set.name}
              </Link>
            </li>
          ))}
        </ul>
      );
    }
    return "";
  }

  /**
   * Returns a displayable string for the parent org of an org.
   */
  displayableParent(org) {
    // Note: Leaving in case we decide to eager-load parent orgs.
    if (!isNil(org.parent_organization)) {
      return <React.Fragment>{org.parent_organization.name}</React.Fragment>;
    }
    return "";
  }

  render() {
    const { organizationTypes, perPage } = this.props;
    const { loading, requestMeta, organizations, search, currentSortDir, sortField, currentPage } =
      this.state;

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path="/app/account/reports">Reports</Breadcrumb>
        </Breadcrumbs>

        <h1>My Reports</h1>

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
                      <React.Fragment>Organization</React.Fragment>
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>

                <TableCell>Reports</TableCell>

                <Hidden smDown>
                  <TableCell>Type</TableCell>
                </Hidden>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.firstLoadRequested && (
                <React.Fragment>
                  {organizations.map((o) => {
                    return (
                      <TableRow key={o.id}>
                        <TableCell>
                          <strong>{o.name}</strong> <em>{this.displayableParent(o)}</em>
                          <div>
                            <small>{orgCityAndState(o)}</small>
                          </div>
                        </TableCell>

                        <TableCell>{this.displayableReports(o)}</TableCell>

                        <Hidden smDown>
                          <TableCell>{orgTypeName(o, organizationTypes)}</TableCell>
                        </Hidden>
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

const mapStateToProps = (state) => {
  return {
    organizationTypes: state.app_meta.data.organizationTypes,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    // ...
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Reports));
