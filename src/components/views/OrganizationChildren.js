import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, get, find, isString, includes, forEach, isEmpty, isNil, values } from "lodash";
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
import HgSkeleton from "components/ui/HgSkeleton";
import stateCodes from "constants/state_codes";
import { requestOrganizations } from "api/requests";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import userCan from "utils/userCan";
import { currentUserShape } from "constants/propTypeShapes";

//
// Provides a table of orgs that are children of a given org.
//

class OrganizationChildren extends Component {
  static propTypes = {
    // -- Via caller
    // title to display, if any.
    title: PropTypes.string,
    titleHeaderLevel: PropTypes.string, // i.e., 'h3'
    // determines detail link paths
    adminMode: PropTypes.bool,
    parent: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    alwaysShow: PropTypes.bool,
    perPage: PropTypes.number,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationTypes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  static defaultProps = {
    adminMode: false,
    perPage: 25,
  };

  constructor(props) {
    super(props);

    const { organizationTypes } = props;

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "orgchild_";
    this.defaultSearchExpanded = false;

    // Accepted values for titleHeaderLevel.
    this.validTitleHeaderLevels = ["h2", "h3", "h4", "h5"];

    // Default titleHeaderLevel.
    this.defaultTitleHeaderLevel = "h2";

    // Map URL param names from browser to corresponding API params. Also
    // serves as a whitelist for getting/setting user-facing parameters.
    //
    // @see this.searchFields
    // @see this.state.search
    this.browserParamsToApiParamsMap = {
      page: "page",
      name_sort: "name_sort",
      // Params below are integrated with
      // the table search functionality.
      id: "id",
      location_id: "location_id",
      name: "name",
      organization_type_id: "organization_type_id",
      pid: "pid",
      state_id: "state_id",
    };

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      id: "",
      location_id: "",
      organization_type_id: "",
      pid: "",
      state_id: "",
    };

    let stateCodesForSearch = stateCodes;
    stateCodesForSearch.unshift(["", "Select..."]);

    let orgTypesForSearch = values(organizationTypes);
    orgTypesForSearch.unshift({ id: "", name: "Select..." });

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
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      organizations: [],
      // Array of IDs for orgs user can view prog detail pg of.
      linkableOrgIds: [],
      // Org list meta (per API payload)
      requestMeta: {},
      loading: false,
      currentPage: null,
      currentSortDir: "asc",
      currentSortName: null,
      currentName: null,
      currentId: null,
      currentLocationId: null,
      currentPid: null,
      currentStateId: null,
      search: {},
      emptySearchYieldsResults: false,
      initialLoading: false,
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
      prevCurrentPid !== currentPid ||
      prevCurrentStateId !== currentStateId
    ) {
      // Updates orgs
      this.getOrgs();

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

  // Populate state.organizations.
  getOrgs = () => {
    const { currentUser, parent, perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentId,
      currentLocationId,
      currentOrganizationTypeId,
      currentPid,
      currentStateId,
      emptySearchYieldsResults,
    } = this.state;

    this.firstLoadRequested = true;

    this.setState({
      loading: true,
      search: this.getSearchObject(),
    });

    requestOrganizations({
      parent_id: parent.id,
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      name: currentName,
      id: currentId,
      location_id: currentLocationId,
      organization_type_id: currentOrganizationTypeId,
      pid: currentPid,
      state_id: currentStateId,
    }).then((res) => {
      if (!this.isCancelled) {
        let newLinkableOrgIds = [];
        each(res.data.data, (org) => {
          if (userCan(currentUser, org, "view_assessment")) {
            newLinkableOrgIds.push(org.id);
          }
        });

        let setStateObject = {
          loading: false,
          organizations: res.data.data,
          requestMeta: res.data.meta,
          linkableOrgIds: newLinkableOrgIds,
        };

        if (this.emptySearchYieldsResults(res.data.data) && !emptySearchYieldsResults) {
          setStateObject.emptySearchYieldsResults = true;
        }

        this.setState(setStateObject);
      }
    });
  };

  /**
   * Determines if we should display table based on if initial lookup,
   * where search is empty, yields results. test
   * @returns {boolean}
   */
  emptySearchYieldsResults = (organizations) => {
    const {
      currentName,
      currentId,
      currentLocationId,
      currentOrganizationTypeId,
      currentPid,
      currentStateId,
    } = this.state;

    if (
      !isEmpty(organizations) &&
      !currentName &&
      !currentId &&
      !currentLocationId &&
      !currentOrganizationTypeId &&
      !currentPid &&
      !currentStateId
    ) {
      return true;
    }

    return false;
  };

  /**
   * Determines if current search is empty
   * @returns {boolean}
   */
  currentSearchIsEmpty = () => {
    const {
      currentName,
      currentId,
      currentLocationId,
      currentOrganizationTypeId,
      currentPid,
      currentStateId,
    } = this.state;

    if (
      currentName ||
      currentId ||
      currentLocationId ||
      currentOrganizationTypeId ||
      currentPid ||
      currentStateId
    ) {
      return false;
    }

    return true;
  };

  // Called when user requests a specific result page via
  // table pagination.
  //
  // We put incorporate that into the api request params state
  // obj, which then triggers a request for the next page of API
  // results.
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  /**
   * Get the opposite sort direction of what was provided.
   */
  getReversedSortDir = (dir) => {
    return dir === "asc" ? "desc" : "asc";
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
    });
  };

  okToLink = (orgId) => {
    return -1 !== this.state.linkableOrgIds.indexOf(orgId);
  };

  headerOutput = () => {
    const { title, titleHeaderLevel } = this.props;
    if (isEmpty(title)) {
      return null;
    }

    let _titleHeaderLevel = titleHeaderLevel
      ? titleHeaderLevel.toLowerCase()
      : this.defaultTitleHeaderLevel;
    if (!includes(this.validTitleHeaderLevels, _titleHeaderLevel)) {
      _titleHeaderLevel = this.defaultTitleHeaderLevel;
    }

    let HeaderLevelTag = _titleHeaderLevel;

    return (
      <header>
        <HeaderLevelTag>{title}</HeaderLevelTag>
      </header>
    );
  };

  render() {
    const { adminMode, perPage } = this.props;
    const {
      loading,
      requestMeta,
      organizations,
      search,
      sortField,
      currentSortDir,
      currentPage,
      emptySearchYieldsResults,
      alwaysShow,
    } = this.state;

    let colCount = 2;
    let displayedOrgCount = organizations.length;

    if (!emptySearchYieldsResults && loading) {
      return <CircularProgressGlobal />;
    }

    if (!alwaysShow && this.currentSearchIsEmpty() && !emptySearchYieldsResults && !loading) {
      return null;
    }

    return (
      <React.Fragment>
        {this.headerOutput()}
        <TableSearchBar
          defaultSearchExpanded={this.defaultSearchExpanded}
          fields={this.searchFields}
          onClear={this.handleSearchClear}
          onChange={this.handleSearchChange}
          onSearch={this.handleSearch}
          search={search}
        />
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={colCount}>
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
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={colCount}>
                    <HgSkeleton variant="text" />
                  </TableCell>
                </TableRow>
              ) : (
                <React.Fragment>
                  {displayedOrgCount === 0 && <caption>No organizations found.</caption>}
                  {displayedOrgCount > 0 && (
                    <React.Fragment>
                      {organizations.map((org) => {
                        let stateAbbr = get(org, "state_id", "");
                        stateAbbr = isString(stateAbbr) ? stateAbbr.toUpperCase() : "";
                        let okToLink = this.okToLink(org.id);
                        let linkTo = `/app/account/organizations/${org.id}`;
                        if (adminMode) {
                          linkTo = `/app/admin/organizations/${org.id}`;
                        }
                        return (
                          <TableRow key={org.id}>
                            <TableCell component="th" scope="row">
                              {okToLink && <Link to={linkTo}>{org.name}</Link>}
                              {!okToLink && (
                                <React.Fragment>
                                  <strong>{org.name}</strong>
                                </React.Fragment>
                              )}
                              <div>
                                <small>
                                  {org.city}
                                  {org.city && stateAbbr.length > 0 && (
                                    <React.Fragment>{", "}</React.Fragment>
                                  )}
                                  {stateAbbr.length > 0 && (
                                    <React.Fragment>{stateAbbr}</React.Fragment>
                                  )}
                                </small>
                              </div>
                            </TableCell>

                            <TableCell>
                              &nbsp; {/* @TODO Display list of the sets for this particular org */}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </TableBody>
          </Table>
          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={perPage}
            itemsTotal={requestMeta.total ? requestMeta.total : 0}
            currentPage={currentPage}
            scrollToTopOnPageChange={false}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    organizationTypes: state.app_meta.data.organizationTypes,
    currentUser: state.auth.currentUser,
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps)
)(withStyles(styles, { withTheme: true })(OrganizationChildren));
