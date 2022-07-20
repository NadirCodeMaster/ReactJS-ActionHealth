import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Icon,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import orgTypeName from "utils/orgTypeName";
import compareObjectIds from "utils/compareObjectIds";
import generateQsPrefix from "utils/generateQsPrefix";
import generateTitle from "utils/generateTitle";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import { requestProgramSets } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

// NOTE: The admin functionality does not currently manage
// or utilize the redux store of sets. @TODO

class ProgramSets extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    program: PropTypes.object.isRequired,
    programs: PropTypes.object.isRequired,
    programSets: PropTypes.array.isRequired,
    refreshProgramSets: PropTypes.func.isRequired,
    programSetsHaveChanged: PropTypes.bool,
    // Prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // Optional number of items to show per page.
    perPage: PropTypes.number,
    organizationTypes: PropTypes.object,
  };

  static defaultProps = {
    perPage: 50,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.defaultQsPrefix = "progsets_";

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
      sets: [],
      setsLoading: false,
      setsTotal: 0,
      currentPage: null,
      currentSortField: null,
      currentSortOrder: null,
    };
  }

  componentDidMount() {
    const { programSetsHaveChanged, refreshProgramSets, qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);
    generateTitle("Assessment Management");
    this.setState({
      actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
    });
    if (programSetsHaveChanged) {
      refreshProgramSets();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { location, history, qsPrefix, subjectUser } = this.props;
    const { qsPrefix: prevQsPrefix, subjectUser: prevSubjectUser } = prevProps;
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
    generateTitle("Assessment Management");
    // Begin populating the rest of state once actualQsPrefix is set
    // (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    // Watch for changes that require initial loading of and
    // updates to the org result values in state.
    if (
      currentPage !== prevCurrentPage ||
      currentSortOrder !== prevCurrentSortOrder ||
      currentSortField !== prevCurrentSortField ||
      !compareObjectIds(subjectUser, prevSubjectUser)
    ) {
      this.populateSets();

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
    window.removeEventListener("popstate", this.onPopState);
    this.isCancelled = true;
  }

  populateSets = () => {
    const { program, perPage } = this.props;
    const { currentPage, currentSortField, currentSortOrder } = this.state;

    this.setState({ setsLoading: true });

    let apiSortParam = this.apiSortParameterName(currentSortField);

    requestProgramSets(program.id, {
      per_page: perPage,
      page: currentPage,
      [apiSortParam]: currentSortOrder,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            setsLoading: false,
            setsTotal: res.data.meta.total,
            sets: res.data.data,
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
   * Get name of sort parameter for API based on sort field.
   */
  apiSortParameterName = () => {
    const { currentSortField } = this.state;
    let res = "";
    switch (currentSortField) {
      case "id":
        res = "id_sort";
        break;
      case "version":
        res = "version_sort";
        break;
      case "name":
      default:
        // Name is the is the only supported value right now,
        // so we let the switch fall through to default case.
        res = "name_sort";
        break;
    }
    return res;
  };

  handleRowClick = (row, e) => {
    e.stopPropagation();

    const { history, program } = this.props;
    if (program) {
      history.push(`/app/admin/programs/${program.id}/sets/${row.id}`);
    }
  };

  handleChangePage = (page) => {
    // Increment by one because Pagination is zero-based.
    this.setState({ currentPage: page });
  };

  /**
   * Handle request to change sort.
   *
   * @param {string} New field to sort by (used for currentSortField)
   * @param {string} Old sort order (will be toggled and applied to currentSortOrder)
   */
  handleOnSort = (newSortField, oldSortOrder) => {
    let newSortOrder = oldSortOrder === "asc" ? "desc" : "asc";
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

  render() {
    const { organizationTypes, program, width } = this.props;
    const { currentSortField, currentSortOrder, sets, setsLoading } = this.state;

    const tableCols = [
      {
        label: "Name",
        sortable: "name", // make this column sortable using value of {object}.name
        render: (v) => v.name,
      },
      {
        label: "Version",
        sortable: "version", // make this column sortable using value of {object}.name
        render: (v) => v.version,
      },
      {
        label: "ID",
        sortable: "id", // make this column sortable using value of {object}.id
        render: (v) => v.id,
      },
      {
        hide_small: true,
        label: "Public",
        render: (v) => (v.public ? "Yes" : "No"),
      },
      {
        hide_small: true,
        label: "Restricted",
        render: (v) => (v.restricted ? "Yes" : "No"),
      },
      {
        hide_small: true,
        label: "Organization Type",
        render: (v) => {
          return orgTypeName(v, organizationTypes, "n/a");
        },
      },
    ];

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/programs" root>
            Program Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}`}>{program.name}</Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets`}>Assessments</Breadcrumb>
        </Breadcrumbs>

        <h1>
          Assessment Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/programs/${program.id}/sets/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>
        <p>For {program.name}</p>

        {setsLoading && (
          <React.Fragment>
            <CircularProgressGlobal />
          </React.Fragment>
        )}

        {!setsLoading && !sets.length && (
          <p>
            <em>
              This program doesn't have any assessments yet.{" "}
              <Link to={`/app/admin/programs/${program.id}/sets/new`}>Add one here</Link>.
            </em>
          </p>
        )}

        {sets.length > 0 && (
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
                {0 === sets.length && sets && (
                  <TableRow key={`row_0`}>
                    <TableCell colSpan={tableCols.length}>
                      <CircularProgress size="1em" />
                    </TableCell>
                  </TableRow>
                )}

                {0 === sets.length && !sets && (
                  <TableRow key={`row_0`}>
                    <TableCell colSpan={tableCols.length}>
                      <em>No sets found.</em>
                    </TableCell>
                  </TableRow>
                )}

                {sets.map((row) => {
                  return (
                    <TableRow
                      key={`row_${row.id}`}
                      hover={true}
                      onClick={(e) => this.handleRowClick(row, e)}
                    >
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
          </Paper>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({});

const mapStateToProps = (state) => ({
  organizationTypes: state.app_meta.data.organizationTypes,
});

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ProgramSets));
