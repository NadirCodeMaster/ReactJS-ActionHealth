import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { each, get, find, isString, forEach, isNil, isEmpty, values } from "lodash";
import qs from "qs";
import { withStyles } from "@mui/styles";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import UserOrganizationsPending from "components/views/UserOrganizationsPending.js";
import MyOrganizationsCta from "components/views/MyOrganizationsCta.js";
import {
  Grid,
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
import AddCircleIcon from "@mui/icons-material/AddCircle";
import TableSearchBarNoExpansion from "components/ui/TableSearchBarNoExpansion";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import { requestUserOrganizations } from "api/requests";
import stateCodes from "constants/state_codes";
import orgCityAndState from "utils/orgCityAndState";
import orgTypeName from "utils/orgTypeName";
import generateTitle from "utils/generateTitle";
import filterContentMachineNames from "utils/filterContentMachineNames";
import generateQsPrefix from "utils/generateQsPrefix";
import { fetchContents } from "store/actions";
import errorSuffix from "utils/errorSuffix";
import userBelongsToOrg from "utils/userBelongsToOrg";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Display index table of organizations for the current user.
 */
class Organizations extends Component {
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
    this.defaultQsPrefix = "org_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      name: "",
      organization_type_id: "",
      state_id: "",
    };

    let stateCodesForSearch = stateCodes;
    stateCodesForSearch.unshift(["", "Select..."]);

    let orgTypesForSearch = values(organizationTypes);
    orgTypesForSearch.unshift({ organization_id: "", name: "Select..." });

    // Search fields we'll use with TableSearchBar.
    // Make sure each is present in browserParamsToApiParamsMap AND in the
    // initial value for this.state.search.
    this.searchFields = [
      {
        label: "Organization Name",
        name: "name",
        type: "text",
        minWidth: "300px",
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
        minWidth: "150px",
        parseInt: true,
      },
      {
        label: "State",
        name: "state_id",
        type: "select",
        minWidth: "100px",
        options: stateCodesForSearch.map((code) => (
          <MenuItem key={`search_states_${code[0]}`} value={code[0]}>
            {code[1]}
          </MenuItem>
        )),
      },
    ];

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
        stateName: "currentOrganizationTypeId",
        paramName: "organization_type_id",
        defaultParamValue: this.defaultBrowserParamValues.organization_type_id,
        valueType: "str",
      },
      {
        stateName: "currentStateId",
        paramName: "state_id",
        defaultParamValue: this.defaultBrowserParamValues.state_id,
        valueType: "str",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      orgs: [],
      orgsLoading: false,
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
      currentOrganizationTypeId: currentUrlParamValue(
        "organization_type_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.organization_type_id
      ),
      currentStateId: currentUrlParamValue(
        "state_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.state_id
      ),
    });

    // Initial call to populate our results.
    // this.populateOrgs();
    this.populateOrgsPending();
    this.populateUserOrgCount();
    this.addContentsToStore();
    generateTitle("My Organizations");
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, history, location, qsPrefix } = this.props;
    const { qsPrefix: prevQsPrefix, currentUser: prevCurrentUser } = prevProps;

    const {
      actualQsPrefix,
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentOrganizationTypeId,
      currentStateId,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentName: prevCurrentName,
      currentOrganizationTypeId: prevCurrentOrganizationTypeId,
      currentStateId: prevCurrentStateId,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }

    if (prevCurrentUser && currentUser.data.id !== prevCurrentUser.data.id) {
      this.populateOrgsPending();
      this.populateUserOrgCount();
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
      prevCurrentOrganizationTypeId !== currentOrganizationTypeId ||
      prevCurrentStateId !== currentStateId ||
      currentUser.data.id !== prevCurrentUser.data.id
    ) {
      // Updates orgs
      this.populateOrgs();

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
   * Populate state.orgs.
   */
  populateOrgs = () => {
    const { currentUser, perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentName,
      currentOrganizationTypeId,
      currentStateId,
    } = this.state;

    this.firstLoadRequested = true;

    this.setState({
      orgsLoading: true,
      search: this.getSearchObject(),
    });

    requestUserOrganizations(currentUser.data.id, {
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      name: currentName,
      organization_type_id: currentOrganizationTypeId,
      state_id: currentStateId,
    })
      .then((res) => {
        // SUCCESS
        if (!this.isCancelled) {
          this.setState({
            orgsLoading: false,
            orgs: res.data.data,
            requestMeta: res.data.meta,
          });
        }
      })
      .catch((error) => {
        // FAILURE
        if (!this.isCancelled) {
          this.setState({
            orgsLoading: false,
            orgs: [],
            requestMeta: {},
          });
        }
        hgToast("An error occurred while executing your search. " + errorSuffix(error), "error");
      });
  };

  /**
   * Populate state.userOrgCount
   */
  populateUserOrgCount = () => {
    const { currentUser } = this.props;

    this.setState({
      userOrgCountLoading: true,
    });

    // We'll call the standard user orgs request and extract
    // the value from the request meta.
    requestUserOrganizations(currentUser.data.id, {
      per_page: 1,
      access_approved: 1,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            userOrgCountLoading: false,
            userOrgCount: res.data.meta.total,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({
            userOrgCountLoading: false,
            userOrgCount: 0,
          });
        }
        hgToast("An error occurred while executing your search. " + errorSuffix(error), "error");
      });
  };

  /**
   * Populate state.orgsPending
   */
  populateOrgsPending = () => {
    const { currentUser } = this.props;

    this.setState({
      orgsPendingLoading: true,
    });

    requestUserOrganizations(currentUser.data.id, {
      access_approved: 0,
    })
      .then((res) => {
        // SUCCESS
        if (!this.isCancelled) {
          this.setState({
            orgsPendingLoading: false,
            orgsPending: res.data.data,
          });
        }
      })
      .catch((error) => {
        // FAILURE
        if (!this.isCancelled) {
          this.setState({
            orgsPendingLoading: false,
            orgsPending: [],
          });
        }
        hgToast("An error occurred while executing your search. " + errorSuffix(error), "error");
      });
  };

  /**
   * Get the opposite sort direction of what was provided.
   * @returns {String}
   */
  reversedSortDir = (dir) => {
    return dir === "asc" ? "desc" : "asc";
  };

  /**
   * Get "pending organization request" output for current user.
   */
  orgsPendingOutput = () => {
    const { orgsPending } = this.state;

    if (orgsPending && orgsPending.length > 0) {
      return (
        <React.Fragment>
          <UserOrganizationsPending
            orgs={orgsPending}
            afterRemoveRequest={this.populateOrgsPending}
            includeAlert={true}
          />
        </React.Fragment>
      );
    }
    return null;
  };

  /**
   * Returns a displayable string for the parent org of an org.
   */
  displayableParent(org) {
    const { currentUser } = this.props;

    if (!isNil(org.parent_organization)) {
      let parent = org.parent_organization;

      if (parent) {
        // If user is associated with parent, we'll link it. We determine
        // association based on whether there's a `pivot` property on the
        // parent org object for this user.
        let linkable = false;
        if (userBelongsToOrg(currentUser.data.id, org)) {
          linkable = true;
        }

        return (
          <React.Fragment>
            {linkable && <Link to={`/app/account/organizations/${parent.id}`}>{parent.name}</Link>}
            {!linkable && <span>{parent.name}</span>}
          </React.Fragment>
        );
      }
    }
    return "--";
  }

  /**
   * Called when user requests a specific result page via table pagination.
   *
   * We put incorporate that into the api request params state obj, which
   * then triggers a request for the next page of API results.
   */
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

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
   * Handle changes to search fields.
   *
   * Used with TableSearchBar.
   *
   * Runs whenever a search field changes.
   */
  handleSearchChange = (search) => this.setState({ search });

  /**
   * Execute search.
   *
   * Used with TableSearchBar.
   *
   * This method is passed the search object by TableSearchBar
   */
  handleSearch = (search) => {
    let newCurrentParams = { currentPage: 1 };

    forEach(this.utilDefinitions, (ud) => {
      let searchValue = search[ud.paramName];
      let searchKey = ud.stateName;
      newCurrentParams[searchKey] = searchValue;
    });

    this.setState(newCurrentParams);
  };

  /**
   * Reset search.
   *
   * Used with TableSearchBar.
   *
   * This is run by TableSearchBar when user clicks the "clear" button.
   */
  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      name: null,
      state_id: null,
      organization_type_id: null,
    });
  };

  // Used with TableSearchBar
  // ------------------------
  lastSearch = () => {
    return this.parseLocationSearch().search;
  };

  // Used with TableSearchBar
  // ------------------------
  // Actually, it's used with lastSearch() and that's what's used with
  // TableSearchBar.
  parseLocationSearch = () => {
    const { location } = this.props;
    return qs.parse(location.search, { ignoreQueryPrefix: true });
  };

  render() {
    const { organizationTypes, classes, width, perPage } = this.props;
    const {
      orgs,
      orgsLoading,
      requestMeta,
      search,
      currentSortDir,
      sortField,
      userOrgCount,
      currentPage,
      orgsPending,
    } = this.state;

    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;

    // Other vars we'll use.
    let userHasOrgs = 0 !== userOrgCount;
    let noSearchResults = !orgsLoading && orgs.length === 0;
    let orgsPendingOutput = this.orgsPendingOutput();
    let tableCols = 8;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path="/app/account/organizations">My Organizations</Breadcrumb>
        </Breadcrumbs>

        <h1>My Organizations</h1>

        {/* Call to Action top tip box */}
        <Grid item xs={12} md={8} lg={8}>
          <Paper className={classes.myOrganizationsCtaContainer}>
            <MyOrganizationsCta />
          </Paper>
        </Grid>

        {orgsPendingOutput && (
          <React.Fragment>
            <Paper style={{ padding: styleVars.paperPadding }}>{orgsPendingOutput}</Paper>
            <br />
          </React.Fragment>
        )}

        <React.Fragment>
          {userOrgCount > 9 && (
            <div className={classes.tableSearchBar}>
              <TableSearchBarNoExpansion
                searchBarText={"Search My Organizations"}
                fields={this.searchFields}
                lastSearch={this.lastSearch()}
                onClear={this.handleSearchClear}
                onChange={this.handleSearchChange}
                onSearch={this.handleSearch}
                search={search}
              />
            </div>
          )}
          <Paper>
            {orgsLoading ? (
              <div className={classes.skeletonContainer}>
                <HgSkeleton variant="text" />
                <HgSkeleton variant="text" />
                <HgSkeleton variant="text" />
                <HgSkeleton variant="text" />
                <HgSkeleton
                  className={classes.joinOrgSkeleton}
                  variant="rect"
                  width={"100%"}
                  height={40}
                />
              </div>
            ) : (
              <React.Fragment>
                <div className={classes.orgTableContainer}>
                  <Table className={classes.orgTable}>
                    {/* TABLE HEADER */}
                    {userHasOrgs && (
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Tooltip title="Sort">
                              <TableSortLabel
                                onClick={() => this.handleSortClick("name")}
                                active={sortField === "name"}
                                direction={currentSortDir}
                                classes={{ icon: classes.nameSortLabel }}
                              >
                                <React.Fragment>Name</React.Fragment>
                              </TableSortLabel>
                            </Tooltip>
                          </TableCell>
                          {sizeStr === "lg" && (
                            <React.Fragment>
                              {/* Only show these columns on desktop view */}
                              <TableCell>City/State</TableCell>
                              <TableCell>Parent Org</TableCell>
                              <TableCell>Type</TableCell>
                            </React.Fragment>
                          )}
                          <TableCell align="right">
                            <Tooltip title="Sort">
                              <TableSortLabel
                                onClick={() => this.handleSortClick("organization_id")}
                                active={sortField === "organization_id"}
                                direction={currentSortDir}
                              >
                                <React.Fragment>ID</React.Fragment>
                              </TableSortLabel>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                    )}

                    {/* TABLE BODY: USER HAS NO ORGS TO VIEW/SEARCH */}
                    {isEmpty(orgsPending) && !userHasOrgs && (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={tableCols}>
                            <p>
                              You don't belong to any organizations yet.{" "}
                              <Link to="/app/account/organizations/join">Join one here</Link>.
                            </p>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}

                    {/* TABLE BODY: NO SEARCH RESULTS */}
                    {noSearchResults && userHasOrgs && (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={tableCols}>
                            <p style={{ textAlign: "center" }}>
                              <br />
                              <em>None of your organizations matched the search criteria.</em>
                              <br />
                              <br />
                            </p>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}

                    {/* TABLE BODY: RECORDS TO SHOW */}
                    {!noSearchResults && (
                      <TableBody className={classes.orgTableBody}>
                        <React.Fragment>
                          {orgs.map((o) => {
                            return (
                              <TableRow key={o.id}>
                                {sizeStr === "lg" ? (
                                  <React.Fragment>
                                    {/* Desktop view for a row, 5 columns */}
                                    <TableCell>
                                      <Link to={`/app/account/organizations/${o.id}`}>
                                        {o.name}
                                      </Link>
                                    </TableCell>
                                    <TableCell>{orgCityAndState(o)}</TableCell>
                                    <TableCell>{this.displayableParent(o)}</TableCell>
                                    <TableCell>{orgTypeName(o, organizationTypes)}</TableCell>
                                    <TableCell className={classes.orgTableRightCell} align="right">
                                      <Link to={`/app/account/organizations/${o.id}`}>{o.id}</Link>
                                    </TableCell>
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    {/* Mobile view for a row, 2 columns */}
                                    <TableCell className={classes.nameCellSmall}>
                                      <Link to={`/app/account/organizations/${o.id}`}>
                                        {o.name}
                                      </Link>
                                      <div>{orgCityAndState(o)}</div>
                                      <div>{this.displayableParent(o)}</div>
                                      <div>{orgTypeName(o, organizationTypes)}</div>
                                    </TableCell>
                                    <TableCell className={classes.orgTableRightCell} align="right">
                                      <Link to={`/app/account/organizations/${o.id}`}>{o.id}</Link>
                                    </TableCell>
                                  </React.Fragment>
                                )}
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      </TableBody>
                    )}
                  </Table>
                  {this.firstLoadRequested && (
                    <HgPagination
                      handlePageChange={this.handlePageChange}
                      itemsPerPage={perPage}
                      itemsTotal={tpCount}
                      currentPage={currentPage}
                    />
                  )}
                </div>
                {/* Add Another Org link (Dotted boxed) */}
                {!isEmpty(orgsPending) && userHasOrgs && (
                  <div className={classes.orgTypeItem}>
                    <Link
                      className={classes.orgTypeLink}
                      style={{}}
                      to={`/app/account/organizations/join/`}
                    >
                      <div className={classes.orgTypeFauxButton} style={{}}>
                        <AddCircleIcon className={classes.orgTypeFauxButtonIcon} />
                        <span className={classes.orgTypeFauxButtonText}>
                          Join another Organization
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </React.Fragment>
            )}
          </Paper>
        </React.Fragment>
      </React.Fragment>
    );
  }
}

const componentContentMachineNames = ["my_organizations_tip_1_body"];

const maxSmWidth = 699;

const styles = (theme) => ({
  nameCellSmall: {
    "& div": {
      fontSize: styleVars.txtFontSizeXs,
    },
  },
  nameSortLabel: {
    color: `${styleVars.colorPrimaryExtraContrast} !important`,
  },
  orgSearchBarContainer: {
    alignItems: "center",
    display: "flex",
  },
  orgSearchBarText: {
    marginLeft: theme.spacing(0.5),
  },
  orgTypeItem: {
    margin: theme.spacing(0, 4, 4, 4),
  },
  orgTypeLink: {
    border: `2px dashed ${styleVars.colorLightGray}`,
    display: "flex",
    padding: theme.spacing(3, 2.5, 3, 2.5),
    "&:hover": {
      border: `2px dashed ${theme.palette.primary.main}`,
    },
  },
  orgTypeFauxButton: {
    alignItems: "center",
    display: "inline-flex",
    flex: "0 0 auto",
    paddingRight: theme.spacing(),
    whiteSpace: "nowrap",
  },
  orgTypeFauxButtonIcon: {
    marginRight: theme.spacing(),
  },
  orgTypeFauxButtonText: {
    whiteSpace: "normal",
    fontSize: styleVars.txtFontSizeSm,
  },
  orgTableContainer: {
    padding: theme.spacing(4),
  },
  orgTableBody: {
    "& tr": {
      border: `2px solid ${styleVars.colorLightGray}`,
    },
  },
  orgTableRightCell: {
    borderRight: `2px solid ${styleVars.colorLightGray}`,
  },
  orgTableRowBottom: {
    "& td": {
      border: "none",
    },
  },
  myOrganizationsCtaContainer: {
    padding: styleVars.paperPadding,
    margin: theme.spacing(3, 0, 3, 0),
  },
  joinOrgLinkWrapper: {},
  joinOrgLink: {
    alignItems: "center",
    display: "flex",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(),
  },
  joinOrgLinkIconWrapper: {
    display: "inline-flex",
    flex: `0 1 ${theme.spacing(3)}`,
  },
  joinOrgLinkIcon: { width: "80%" },
  joinOrgLinkText: {
    flex: `0 1 auto`,
    lineHeight: 1.2,
  },
  skeletonContainer: {
    margin: theme.spacing(4),
  },
  joinOrgSkeleton: {
    margin: theme.spacing(4, 0, 0, 0),
  },
  tableSearchBar: {
    margin: theme.spacing(0, 0, 1, 0),
  },
});

const mapStateToProps = (state) => {
  return {
    contents: state.contents,
    currentUser: state.auth.currentUser,
    organizationTypes: state.app_meta.data.organizationTypes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addToContents: (machineNames) => {
      dispatch(
        fetchContents({
          machine_name: machineNames,
        })
      );
    },
  };
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withResizeDetector(withStyles(styles, { withTheme: true })(Organizations)));
