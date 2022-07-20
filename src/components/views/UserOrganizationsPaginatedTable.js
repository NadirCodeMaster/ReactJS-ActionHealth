import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { get, isString } from "lodash";
import {
  CircularProgress,
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
import HgPagination from "components/ui/HgPagination";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestUserOrganizations } from "api/requests";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import compareObjectIds from "utils/compareObjectIds";
import generateQsPrefix from "utils/generateQsPrefix";
import orgTypeName from "utils/orgTypeName";
import orgRoleName from "utils/orgRoleName";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import { currentUserShape } from "constants/propTypeShapes";

/**
 * Provides a paginated list of a users' organizations.
 *
 * The individual organization objects should include a `pivot` property
 * with the organization/user relationship data.
 *
 * Intended for displaying the organizations of a single user.
 */
class UserOrganizationsPaginatedTable extends React.Component {
  static propTypes = {
    // Provided by caller
    // ------------------
    // -- prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // -- Whether to render this with links (etc) appropriate
    //    for use in the admin section.
    adminMode: PropTypes.bool,
    // -- Subject user data object.
    subjectUser: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    // -- Optional number of items to show per page.
    perPage: PropTypes.number,
    // -- Optional value that when changed tells
    //    component to reload organizations list.
    listVersion: PropTypes.number,

    // Provided by HOCs.
    // -----------------
    appMeta: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired, // provided by withRouter()
    location: PropTypes.object.isRequired, // provided by withRouter()
  };

  static defaultProps = {
    adminMode: false,
    perPage: 50,
    listVersion: 0,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.defaultQsPrefix = "uopt_";

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_order: "asc",
      sort_field: "name",
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
        stateName: "currentSortField",
        paramName: "sort_field",
        defaultParamValue: this.defaultBrowserParamValues.sort_field,
        valueType: "str",
      },
      {
        stateName: "currentSortOrder",
        paramName: "sort_order",
        defaultParamValue: this.defaultBrowserParamValues.sort_order,
        valueType: "str",
      },
    ];

    this.state = {
      actualQsPrefix: null,
      subjectUserOrganizations: [],
      subjectUserOrganizationsLoading: true,
      subjectUserOrganizationsTotal: 0,
      currentPage: null,
      currentSortField: null,
      currentSortOrder: null,
    };
  }

  componentDidMount() {
    const { qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);

    this.setState({
      actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { listVersion, location, history, qsPrefix, subjectUser } = this.props;
    const {
      listVersion: prevListVersion,
      qsPrefix: prevQsPrefix,
      subjectUser: prevSubjectUser,
    } = prevProps;
    const { actualQsPrefix, currentPage, currentSortField, currentSortOrder } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortField: prevCurrentSortField,
      currentSortOrder: prevCurrentSortOrder,
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

    // Watch for changes that require initial loading of and
    // updates to the org result values in state.
    if (
      listVersion !== prevListVersion ||
      currentPage !== prevCurrentPage ||
      currentSortOrder !== prevCurrentSortOrder ||
      currentSortField !== prevCurrentSortField ||
      !compareObjectIds(subjectUser, prevSubjectUser)
    ) {
      this.populateSubjectUserOrgs();

      // If state and URL conflict, update URL to reflect state.
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
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Get name of sort parameter for API based on sort field.
   */
  apiSortParameterName = () => {
    const { currentSortField } = this.state;
    let res = "";
    switch (currentSortField) {
      case "name":
      default:
        // Name is the is the only supported value right now,
        // so we let the switch fall through to default case.
        res = "name_sort";
        break;
    }
    return res;
  };

  /**
   * Load up the subject user organizations and add them to component state.
   */
  populateSubjectUserOrgs = () => {
    const { perPage, subjectUser } = this.props;
    const { currentPage, currentSortField, currentSortOrder } = this.state;

    this.setState({ subjectUserOrganizationsLoading: true });

    let apiSortParam = this.apiSortParameterName(currentSortField);

    requestUserOrganizations(subjectUser.id, {
      per_page: perPage,
      page: currentPage,
      [apiSortParam]: currentSortOrder,
      access_approved: 1,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            subjectUserOrganizationsLoading: false,
            subjectUserOrganizationsTotal: res.data.meta.total,
            subjectUserOrganizations: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ subjectUserOrganizationsLoading: false });
        }
      });
  };

  /**
   * Handle request to change sort.
   *
   * @param {string} New field to sort by (used for currentSortField)
   * @param {string} Old sort order (will be toggled and applied to currentSortOrder)
   */
  handleOnSort = (newSortField, oldSortOrder) => {
    let newSortOrder = oldSortOrder === "asc" ? "asc" : "desc";
    this.setState({
      currentSortField: newSortField,
      currentSortOrder: newSortOrder,
    });
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
   * Handle page change request.
   */
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  /**
   * Handle column sorting click.
   */
  handleChangeSort = (e) => {
    const { currentSort } = this.state;
    let newCurrentSort = "asc"; // default
    if (isString(currentSort) && "asc" === currentSort.toLowerCase()) {
      newCurrentSort = "desc";
    }
    this.setState({ currentSort: newCurrentSort });
  };

  /**
   * Get string output for state_id property of an org object.
   *
   * @param orgObject
   * @return string
   */
  orgStateString = (orgObject) => {
    let stateAbbr = get(orgObject, "state_id", "");
    return isString(stateAbbr) ? stateAbbr.toUpperCase() : "";
  };

  render() {
    const { adminMode, appMeta, perPage, width } = this.props;
    const {
      currentPage,
      currentSortField,
      currentSortOrder,
      subjectUserOrganizations,
      subjectUserOrganizationsLoading,
      subjectUserOrganizationsTotal,
    } = this.state;

    let renderOrgUserOrgDetailLink;
    if (adminMode) {
      renderOrgUserOrgDetailLink = (org) => (
        <div>
          <div>
            <Link to={`/app/admin/users/${org.pivot.user_id}/organizations/${org.id}`}>
              {org.name}
            </Link>
          </div>
          <div>
            <small>
              {org.city}
              {org.state_id && <React.Fragment>, {this.orgStateString(org)}</React.Fragment>}
            </small>
          </div>
        </div>
      );
    } else {
      renderOrgUserOrgDetailLink = (org) => (
        <div>
          <div>
            <Link to={`/app/account/organizations/${org.id}`}>{org.name}</Link>
          </div>
          <div>
            <small>
              {org.city}
              {org.state_id && <React.Fragment>, {this.orgStateString(org)}</React.Fragment>}
            </small>
          </div>
        </div>
      );
    }

    const tableCols = [
      {
        label: "Organization",
        sortable: "name",
        render: renderOrgUserOrgDetailLink,
      },
      {
        label: "Parent",
        render: (v) => {
          if (v.parent_organization) {
            return v.parent_organization.name;
          } else {
            return "--";
          }
        },
      },
      {
        hide_small: true,
        label: "Role",
        render: (v) => {
          return orgRoleName(v.pivot, appMeta.data.organizationRoles, "n/a");
        },
      },
      {
        hide_small: true,
        label: "Type",
        render: (v) => {
          return orgTypeName(v, appMeta.data.organizationTypes, "n/a");
        },
      },
    ];

    return (
      <React.Fragment>
        {subjectUserOrganizationsLoading && (
          <React.Fragment>
            <CircularProgressGlobal />
          </React.Fragment>
        )}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                {tableCols.map((column, idx) => {
                  let colDisplay = "table-cell";
                  if (column.hide_small && width <= this.maxSmall) {
                    colDisplay = "none";
                  }

                  let colActive = currentSortField && currentSortField === column.sortable;
                  let colDirection = currentSortOrder ? currentSortOrder : "asc";

                  return (
                    <TableCell
                      key={`th_${idx}`}
                      style={{ display: colDisplay }}
                      align={column.align || "inherit"}
                    >
                      {column.sortable ? (
                        <Tooltip title="Sort">
                          <TableSortLabel
                            onClick={() => this.handleOnSort(column.sortable, currentSortOrder)}
                            active={colActive}
                            direction={colDirection}
                          >
                            <React.Fragment>{column.label}</React.Fragment>
                          </TableSortLabel>
                        </Tooltip>
                      ) : (
                        <React.Fragment>{column.label}</React.Fragment>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>

            <TableBody>
              {0 === subjectUserOrganizations.length && subjectUserOrganizationsLoading && (
                <TableRow key={`row_0`}>
                  <TableCell colSpan={tableCols.length}>
                    <CircularProgress size="1em" />
                  </TableCell>
                </TableRow>
              )}

              {0 === subjectUserOrganizations.length && !subjectUserOrganizationsLoading && (
                <TableRow>
                  <TableCell>No organizations found</TableCell>
                </TableRow>
              )}

              {subjectUserOrganizations.map((row) => {
                return (
                  <TableRow key={`row_${row.id}`}>
                    {tableCols.map((column, idx) => {
                      let colDisplay = "table-cell";
                      if (column.hide_small && width <= this.maxSmall) {
                        colDisplay = "none";
                      }
                      const columnRender = column.render(row);
                      const cellInner = !React.isValidElement(columnRender) ? (
                        <div>{columnRender}</div>
                      ) : (
                        columnRender
                      );
                      return (
                        <TableCell
                          key={`td_${idx}`}
                          align={column.align || "inherit"}
                          style={{
                            ...(column.center && {
                              textAlign: "center",
                            }),
                            display: colDisplay,
                          }}
                        >
                          {cellInner}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={perPage}
            itemsTotal={subjectUserOrganizationsTotal}
            currentPage={currentPage}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => {
  return {
    appMeta: state.app_meta,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(UserOrganizationsPaginatedTable));
