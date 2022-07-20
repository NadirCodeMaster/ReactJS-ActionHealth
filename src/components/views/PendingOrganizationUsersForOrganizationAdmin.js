import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { each, forEach, get, find, isNil, isString, values } from "lodash";
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
import HgPagination from "components/ui/HgPagination";
import TableSearchBar from "components/ui/TableSearchBar";
import HgSkeleton from "components/ui/HgSkeleton";
import moment from "moment";
import { requestResendInvitation, requestUsersInvitesPending } from "api/requests";
import { Link } from "react-router-dom";
import generateQsPrefix from "utils/generateQsPrefix";
import errorSuffix from "utils/errorSuffix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Provides a paginated table of pending invites for all organizations
 *
 * This is an admin-only display.
 */

class PendingOrganizationUsersGlobal extends Component {
  static propTypes = {
    // -- Provided by caller.
    // prefix for query string parameters.
    qsPrefix: PropTypes.string,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "pendinv_";
    this.defaultSearchExpanded = false;

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort_dir: "asc",
      sort_name: "invitee_sort",
      invitee: "",
      inviter: "",
      invite_date: "",
      organization: "",
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
        stateName: "currentInvitee",
        paramName: "invitee",
        defaultParamValue: this.defaultBrowserParamValues.invitee,
        valueType: "str",
      },
      {
        stateName: "currentInviter",
        paramName: "inviter",
        defaultParamValue: this.defaultBrowserParamValues.inviter,
        valueType: "str",
      },
      {
        stateName: "currentInviteDate",
        paramName: "invite_date",
        defaultParamValue: this.defaultBrowserParamValues.invite_date,
        valueType: "str",
      },
      {
        stateName: "currentOrganization",
        paramName: "organization",
        defaultParamValue: this.defaultBrowserParamValues.organization,
        valueType: "str",
      },
    ];

    // Initial state setup before browser params, etc.
    this.state = {
      currentPage: null,
      currentSortDir: "asc",
      currentSortName: null,
      currentInvitee: null,
      currentInviter: null,
      currentInviteDate: null,
      currentOrganization: null,
      search: {},
      recordsLoading: false,
      records: null,
      pageTotal: 0,
    };

    this.searchFields = this.getSearchFields();
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
      currentInvitee: currentUrlParamValue(
        "invitee",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.invitee
      ),
      currentInviter: currentUrlParamValue(
        "inviter",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.inviter
      ),
      currentInviteDate: currentUrlParamValue(
        "invite_date",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.invite_date
      ),
      currentOrganization: currentUrlParamValue(
        "organization",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.organization
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
      currentInvitee,
      currentInviter,
      currentInviteDate,
      currentOrganization,
      search,
    } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentInvitee: prevCurrentInvitee,
      currentInviter: prevCurrentInviter,
      currentInviteDate: prevCurrentInviteDate,
      currentOrganization: prevCurrentOrganization,
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
      prevCurrentInvitee !== currentInvitee ||
      prevCurrentInviter !== currentInviter ||
      prevCurrentInviteDate !== currentInviteDate ||
      prevCurrentOrganization !== currentOrganization
    ) {
      // Updates contents
      this.getRecords();

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
   * Gets search fields for search bar functionality
   * @returns {array}
   */
  getSearchFields = () => {
    return [
      {
        label: "Invitee",
        name: "invitee",
        type: "text",
      },
      {
        label: "Inviter",
        name: "inviter",
        type: "text",
      },
      {
        label: "Organization",
        name: "organization",
        type: "text",
      },
      {
        label: "Invite Date",
        name: "invite_date",
        type: "date",
        width: "175px",
      },
    ];
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

  // Used with TableSearchBar
  // This is run whenever a search field changes.
  handleSearchChange = (search) => this.setState({ search });

  // Used with TableSearchBar
  // This method is passed the search object by TableSearchBar. We
  // add those values into apiRequestParams, which makes them available
  // for the next API request for results. That API request is then
  // triggered automatically via componentDidUpdate().
  handleSearch = (search) => {
    if (search.invite_date && moment.isMoment(search.invite_date)) {
      search.invite_date = moment(search.invite_date).format("YYYY-MM-DD");
    }

    let newCurrentParams = { currentPage: 1 };

    forEach(this.utilDefinitions, (ud) => {
      let searchValue = search[ud.paramName];
      let searchKey = ud.stateName;
      newCurrentParams[searchKey] = searchValue;
    });

    this.setState(newCurrentParams);
  };

  // Used with TableSearchBar
  // This is run by TableSearchBar when user clicks the "clear" button.
  handleSearchClear = () => {
    // Clear state search prop
    this.setState({ search: {} });
    // Run search with empty search object.
    this.handleSearch({
      invitee: null,
      inviter: null,
      organization: null,
      invite_date: null,
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
   * Populate state.records.
   */
  getRecords = () => {
    const { perPage } = this.props;
    const {
      currentPage,
      currentSortDir,
      currentSortName,
      currentInvitee,
      currentInviter,
      currentInviteDate,
      currentOrganization,
    } = this.state;

    this.firstLoadRequested = true;

    this.setState({
      recordsLoading: true,
      search: this.getSearchObject(),
    });

    requestUsersInvitesPending({
      page: currentPage,
      per_page: perPage,
      [currentSortName]: currentSortDir,
      invitee: currentInvitee,
      inviter: currentInviter,
      invite_date: currentInviteDate,
      organization: currentOrganization,
    }).then((res) => {
      if (!this.isCancelled) {
        this.setState({
          recordsLoading: false,
          records: res.data.data,
          requestMeta: res.data.meta,
        });
      }
    });
  };

  // Called when user requests a specific result page via
  // table pagination.
  //
  // We put incorporate that into the api request params
  // state obj, which then triggers a request for the next
  // page of API results.
  handlePageChange = (page) => {
    const { apiRequestParams } = this.state;

    if (apiRequestParams.page !== page) {
      this.updateApiRequestParams({ page });
    }
  };

  // Update comp. state URL parameters that inform displayed
  // results.
  //
  // Provide an object with each property/value pair to
  // be replaced in the state.
  updateApiRequestParams = (newValues) => {
    const { apiRequestParams } = this.state;
    this.setState({
      apiRequestParams: {
        ...apiRequestParams,
        ...newValues,
      },
    });
  };

  handleResendInvite = (organizationId, inviteeEmail, e) => {
    e.preventDefault();

    if (!this.isCancelled) {
      this.setState({ submitting: true });
    }

    requestResendInvitation({
      email: inviteeEmail,
      organization_id: organizationId,
    })
      .then((res) => {
        // SUCCESS
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              submitting: false,
            });
          }
          hgToast("Invite sent!");
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            submitting: false,
          });
          hgToast(`An error occurred inviting ${inviteeEmail}. ` + errorSuffix(error), "error");
        }
      });
  };

  render() {
    const { classes, perPage } = this.props;
    const { pageTotal, recordsLoading, records, search, currentSortDir, sortField, currentPage } =
      this.state;

    let loading = !records || recordsLoading;

    // Number of cols per row.
    let cols = 4;
    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
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
                {sizeStr === "lg" ? (
                  <React.Fragment>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("invitee")}
                          active={sortField === "invitee"}
                          direction={currentSortDir}
                        >
                          Invitee
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("inviter")}
                          active={sortField === "inviter"}
                          direction={currentSortDir}
                        >
                          Inviter
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("organization")}
                          active={sortField === "organization"}
                          direction={currentSortDir}
                        >
                          Organization
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("invite_date")}
                          active={sortField === "invite_date"}
                          direction={currentSortDir}
                        >
                          Invitation date
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("invitee")}
                          active={sortField === "invitee"}
                          direction={currentSortDir}
                        >
                          Invitee
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => this.handleSortClick("invite_date")}
                          active={sortField === "invite_date"}
                          direction={currentSortDir}
                        >
                          Invitation date
                        </TableSortLabel>
                      </Tooltip>
                    </TableCell>
                  </React.Fragment>
                )}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={cols} style={{ textAlign: "center" }}>
                    <HgSkeleton variant="text" />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <React.Fragment>
                {records.length < 1 && <caption>No pending requests found.</caption>}

                {records.length > 0 && (
                  <React.Fragment>
                    <TableBody>
                      {values(records).map((record, idx) => {
                        return (
                          <TableRow key={`pending_record_${idx}`}>
                            {sizeStr === "lg" ? (
                              <React.Fragment>
                                <TableCell>
                                  <div>{record.invitee}</div>
                                  <div
                                    className={classes.resendInviteLink}
                                    onClick={(e) =>
                                      this.handleResendInvite(
                                        record.organization_id,
                                        record.invitee,
                                        e
                                      )
                                    }
                                  >
                                    Resend Invite
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Link to={`/app/admin/users/${record.user_id}`}>
                                    {record.inviter}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <Link
                                    to={`/app/admin/organizations/${record.organization_id}/team`}
                                  >
                                    {record.organization}
                                  </Link>
                                </TableCell>
                                <TableCell>{moment.utc(record.invite_date).format("LL")}</TableCell>
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                <TableCell>
                                  <div>{record.invitee}</div>
                                  <div>
                                    <div className={classes.invitedByText}>Invited by:</div>
                                    <Link to={`/app/admin/users/${record.user_id}`}>
                                      {record.inviter}
                                    </Link>
                                  </div>
                                  <div>
                                    <Link
                                      to={`/app/admin/organizations/${record.organization_id}/team`}
                                    >
                                      {record.organization}
                                    </Link>
                                  </div>
                                  <div
                                    className={classes.resendInviteLink}
                                    onClick={(e) =>
                                      this.handleResendInvite(
                                        record.organization_id,
                                        record.invitee,
                                        e
                                      )
                                    }
                                  >
                                    Resend Invite
                                  </div>
                                </TableCell>
                                <TableCell>{moment.utc(record.invite_date).format("LL")}</TableCell>
                              </React.Fragment>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </Table>
        </Paper>
        <HgPagination
          handlePageChange={this.handlePageChange}
          itemsPerPage={Number(perPage)}
          itemsTotal={Number(pageTotal)}
          currentPage={Number(currentPage)}
        />
      </React.Fragment>
    );
  }
}
const width = 600; // @TODO SET VIA USEMEDIAQUERY

const maxSmWidth = 699;
const styles = (theme) => ({
  invitedByText: {
    fontStyle: "italic",
    marginRight: theme.spacing(0.5),
    display: "inline-block",
  },
  resendInviteLink: {
    color: styleVars.colorPrimaryExtraContrast,
    cursor: "pointer",
  },
});
const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
  // )(withResizeDetector(withStyles(styles, { withTheme: true })(PendingOrganizationUsersGlobal)));
)(withStyles(styles, { withTheme: true })(PendingOrganizationUsersGlobal));
