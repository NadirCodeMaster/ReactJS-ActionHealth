import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import TextOverflow from "components/ui/TextOverflow";
import { get, each, find, forEach, isNil, isString, lowerCase, values } from "lodash";
import moment from "moment";
import {
  Button,
  Hidden,
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
import TableSearchBar from "components/ui/TableSearchBar";
import { requestUsers } from "api/requests";
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * This is a paginated table of users for use by admins.
 *
 * Each page of results is requested directly from the server as needed. We're
 * not storing this list in redux due to size.
 */
class Users extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    systemRoles: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);
    const { systemRoles } = props;

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "useradmin_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "name_sort",
      id: "",
      email: "",
      name_first: "",
      name_last: "",
      system_role_id: "",
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
        stateName: "currentId",
        paramName: "id",
        defaultParamValue: this.defaultBrowserParamValues.id,
        valueType: "str",
      },
      {
        stateName: "currentEmail",
        paramName: "email",
        defaultParamValue: this.defaultBrowserParamValues.email,
        valueType: "str",
      },
      {
        stateName: "currentNameFirst",
        paramName: "name_first",
        defaultParamValue: this.defaultBrowserParamValues.name_first,
        valueType: "str",
      },
      {
        stateName: "currentNameLast",
        paramName: "name_last",
        defaultParamValue: this.defaultBrowserParamValues.name_last,
        valueType: "str",
      },
      {
        stateName: "currentSystemRoleId",
        paramName: "system_role_id",
        defaultParamValue: this.defaultBrowserParamValues.system_role_id,
        valueType: "str",
      },
    ];

    this.state = {
      // Array of items returned via the data prop of API payload
      contents: [],
      requestMeta: {},
      loading: false,
      currentPage: null,
      currentSortDir: "asc",
      currentId: null,
      currentEmail: null,
      currentNameFirst: null,
      currentNameLast: null,
      currentSystemRoleId: null,
      search: {},
    };

    let systemRolesForSearch = values(systemRoles);
    systemRolesForSearch.unshift({ id: "", name: "Select..." });

    this.searchFields = [
      {
        label: "ID",
        name: "id",
        type: "text",
      },
      {
        label: "Email",
        name: "email",
        type: "text",
      },
      {
        label: "First name",
        name: "name_first",
        type: "text",
      },
      {
        label: "Last name",
        name: "name_last",
        type: "text",
      },
      {
        label: "System role",
        name: "system_role_id",
        type: "select",
        options: systemRolesForSearch.map((sr) => (
          <MenuItem key={`search_sysroles_${sr.id}`} value={sr.id}>
            {sr.name}
          </MenuItem>
        )),
        minWidth: "170px",
        parseInt: true,
      },
    ];
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);
    generateTitle("User Management");
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
      currentId: currentUrlParamValue(
        "id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.id
      ),
      currentEmail: currentUrlParamValue(
        "email",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.email
      ),
      currentNameFirst: currentUrlParamValue(
        "name_first",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.name_first
      ),
      currentNameLast: currentUrlParamValue(
        "name_last",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.name_last
      ),
      currentSystemRoleId: currentUrlParamValue(
        "system_role_id",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.system_role_id
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
      currentId,
      currentEmail,
      currentNameFirst,
      currentNameLast,
      currentSystemRoleId,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentId: prevCurrentId,
      currentEmail: prevCurrentEmail,
      currentNameFirst: prevCurrentNameFirst,
      currentNameLast: prevCurrentNameLast,
      currentSystemRoleId: prevCurrentSystemRoleId,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }
    generateTitle("User Management");
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
      prevCurrentId !== currentId ||
      prevCurrentEmail !== currentEmail ||
      prevCurrentNameFirst !== currentNameFirst ||
      prevCurrentNameLast !== currentNameLast ||
      prevCurrentSystemRoleId !== currentSystemRoleId
    ) {
      // Updates contents
      this.getUsers();

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
   * Populate state.users.
   */
  getUsers = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentId,
      currentEmail,
      currentNameFirst,
      currentNameLast,
      currentSystemRoleId,
    } = this.state;

    this.setState({
      loading: true,
      search: this.getSearchObject(),
    });

    requestUsers({
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      id: currentId,
      email: currentEmail,
      name_first: currentNameFirst,
      name_last: currentNameLast,
      system_role_id: currentSystemRoleId,
    }).then((res) => {
      if (!this.isCancelled) {
        this.firstLoadRequested = true;
        this.setState({
          loading: false,
          users: res.data.data,
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

    history.push(`/app/admin/users/${row.id}`);
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
    this.setState({
      search: {},
    });
    // Run search with empty search object.
    this.handleSearch({
      id: null,
      email: null,
      name_first: null,
      name_last: null,
      system_role_id: null,
    });
  };

  translateSystemRoleId(id) {
    const { classes, systemRoles } = this.props;

    let systemRoleName = lowerCase(get(systemRoles, `${id}.name`, ""));
    let systemRoleMachineName = get(systemRoles, `${id}.machine_name`, "");
    let isAdmin = systemRoleMachineName === "admin";

    let systemRoleJsx = (
      <span className={isAdmin ? classes.adminSystemRole : null}>{systemRoleName}</span>
    );

    return systemRoleJsx;
  }

  formatDate(date) {
    return moment(date).isValid() ? moment.utc(date).format("L") : "";
  }

  render() {
    const { loading, requestMeta, search, currentSortDir, sortField, users, currentPage } =
      this.state;

    const { classes, perPage } = this.props;

    // Prepare the table pagination props.
    let tpCount = requestMeta.total ? requestMeta.total : 0;

    return (
      <React.Fragment>
        {/*
        <div className="no-print">
          <Breadcrumb path="/app/admin/users" root>
            User Management
          </Breadcrumb>
          <br />
          <br />
        </div>
        */}

        <h1>
          User Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/users/new`}
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
                <Hidden mdUp>
                  <TableCell>Name</TableCell>
                </Hidden>

                <Hidden mdDown>
                  <TableCell>
                    <Tooltip title="Sort">
                      <TableSortLabel
                        onClick={() => this.handleSortClick("name_last")}
                        active={sortField === "name_last"}
                        direction={currentSortDir}
                      >
                        <React.Fragment>Last Name</React.Fragment>
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                </Hidden>

                <Hidden mdDown>
                  <TableCell>
                    <Tooltip title="Sort">
                      <TableSortLabel
                        onClick={() => this.handleSortClick("name_first")}
                        active={sortField === "name_first"}
                        direction={currentSortDir}
                      >
                        <React.Fragment>First Name</React.Fragment>
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                </Hidden>

                <Hidden mdDown>
                  <TableCell>
                    <Tooltip title="Sort">
                      <TableSortLabel
                        onClick={() => this.handleSortClick("email")}
                        active={sortField === "email"}
                        direction={currentSortDir}
                      >
                        <React.Fragment>Email</React.Fragment>
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                </Hidden>

                <Hidden mdDown>
                  <TableCell>System Role</TableCell>
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

                <Hidden lgDown>
                  <TableCell align="right">Email Verifiy Date</TableCell>
                </Hidden>

                <Hidden lgDown>
                  <TableCell align="right">
                    <Tooltip title="Sort">
                      <TableSortLabel
                        onClick={() => this.handleSortClick("last_login_at")}
                        active={sortField === "last_login_at"}
                        direction={currentSortDir}
                      >
                        <React.Fragment>Last Login</React.Fragment>
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                </Hidden>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.firstLoadRequested && (
                <React.Fragment>
                  {users.map((u) => {
                    let nameFirst = get(u, "name_first", "");
                    let nameLast = get(u, "name_last", "");
                    return (
                      <TableRow
                        style={{ cursor: "pointer" }}
                        key={u.id}
                        onClick={(e) => this.handleRowClick(e, u)}
                        hover
                      >
                        <Hidden mdUp>
                          <TableCell className={classes.longContentCell}>
                            {nameFirst} {nameLast}
                            <br />
                            <div className={classes.smallSubtext}>
                              <TextOverflow>{u.email}</TextOverflow>
                            </div>
                          </TableCell>
                        </Hidden>

                        <Hidden mdDown>
                          <TableCell>{nameLast}</TableCell>
                        </Hidden>

                        <Hidden mdDown>
                          <TableCell>{nameFirst}</TableCell>
                        </Hidden>

                        <Hidden mdDown>
                          <TableCell className={classes.longContentCell}>
                            <TextOverflow>{u.email}</TextOverflow>
                          </TableCell>
                        </Hidden>

                        <Hidden mdDown>
                          <TableCell>{this.translateSystemRoleId(u.system_role_id)}</TableCell>
                        </Hidden>

                        <TableCell align="right">
                          <Link to={`/app/admin/users/${u.id}`}>{u.id}</Link>
                          <Hidden mdUp>
                            <div>{this.translateSystemRoleId(u.system_role_id)}</div>
                          </Hidden>
                        </TableCell>

                        <Hidden lgDown>
                          <TableCell align="right">
                            {this.formatDate(u.email_verified_at)}
                          </TableCell>
                        </Hidden>

                        <Hidden lgDown>
                          <TableCell align="right">{this.formatDate(u.last_login_at)}</TableCell>
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

const styles = (theme) => ({
  adminSystemRole: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  longContentCell: {
    maxWidth: "200px",
  },
  smallSubtext: {
    fontSize: styleVars.txtFontSizeXs,
  },
});

const mapStateToProps = (state) => {
  return {
    systemRoles: state.app_meta.data.systemRoles,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Users));
