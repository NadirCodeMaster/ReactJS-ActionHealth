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
import compareObjectIds from "utils/compareObjectIds";
import generateQsPrefix from "utils/generateQsPrefix";
import generateTitle from "utils/generateTitle";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import { requestSetModules } from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

class SetModules extends Component {
  static defaultProps = {
    perPage: 1000,
  };

  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape),
    set: PropTypes.object.isRequired,
    program: PropTypes.object.isRequired,
    // Prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // Optional number of items to show per page.
    perPage: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.defaultQsPrefix = "setmods_";

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
      setModules: [],
      setModulesLoading: true,
      setModulesTotal: 0,
      currentPage: null,
      currentSortField: null,
      currentSortOrder: null,
    };
  }

  componentDidMount() {
    const { set, qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);
    generateTitle(`Assessment ${set.id} Topics`);
    this.setState({
      actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
    });
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

    // Begin populating the rest of state once actualQsPrefix is set
    // (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    // Watch for changes that require initial loading of and
    // updates to the org result values in state.
    if (
      // setModules !== prevSetModules ||
      currentPage !== prevCurrentPage ||
      currentSortOrder !== prevCurrentSortOrder ||
      currentSortField !== prevCurrentSortField ||
      !compareObjectIds(subjectUser, prevSubjectUser)
    ) {
      this.populateSetModules();

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

  /**
   * Load up the subject user organizations and add them to component state.
   */
  populateSetModules = () => {
    const { perPage, setId } = this.props;
    const { currentPage, currentSortField, currentSortOrder } = this.state;

    this.setState({ setModulesLoading: true });

    let apiSortParam = this.apiSortParameterName(currentSortField);

    requestSetModules(setId, {
      per_page: perPage,
      page: currentPage,
      [apiSortParam]: currentSortOrder,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            setModulesLoading: false,
            setModulesTotal: res.data.meta.total,
            setModules: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ setModulesLoading: false });
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
      case "weight":
        res = "weight_sort";
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

  handleRowClick = (row) => {
    const { program, set } = this.props;
    this.props.history.push(`/app/admin/programs/${program.id}/sets/${set.id}/modules/${row.id}`);
  };

  // We pass this to PaginatedTableLocal, which uses it to pass back the `page`
  // number when a user navigates the table. We update our local state
  // with the new value and pass it back to PaginatedTableLocal. When PaginatedTableLocal
  // receives it from us, that's when the page actually changes.
  handleChangePage = (page) => {
    // Increment by one because Pagination is zero-based.
    this.setState({ currentPage: page + 1 });
  };

  // We pass this to PaginatedTableLocal, which calls it with `sort` when
  // a user requests a column sort. We update our local sortMeta state object
  // based on that and it's fed back to PaginatedTableLocal where the new
  // sorting is applied.
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
    const { program, set, width } = this.props;
    const { setModules, currentSortField, currentSortOrder, setModulesLoading } = this.state;

    const tableCols = [
      {
        label: "Name",
        sortable: "name", // make this column sortable using value of {object}.name
        render: (v) => v.name,
      },
      {
        label: "ID",
        sortable: "id", // make this column sortable using value of {object}.id
        render: (v) => v.id,
      },
      {
        hide_small: true,
        label: "Internal",
        render: (v) => (v.internal ? "Yes" : "No"),
      },
      {
        hide_small: true,
        label: "Sort Weight",
        sortable: "weight", // make this column sortable using value of {object}.name
        render: (v) => v.weight,
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
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}`}>
            {set.name}
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/modules`}>
            Modules
          </Breadcrumb>
        </Breadcrumbs>

        <h1>
          Topic Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/programs/${program.id}/sets/${set.id}/modules/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>
        <p>For {set.name}</p>

        {setModulesLoading && (
          <React.Fragment>
            <CircularProgressGlobal />
          </React.Fragment>
        )}

        {!setModulesLoading && !setModules.length && (
          <p>
            <em>
              This assessment doesn't have any topics yet.{" "}
              <Link to={`/app/admin/programs/${program.id}/sets/${set.id}/modules/new`}>
                Add one here
              </Link>
              .
            </em>
          </p>
        )}

        {setModules.length > 0 && (
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
                {0 === setModules.length && setModules && (
                  <TableRow key={`row_0`}>
                    <TableCell colSpan={tableCols.length}>
                      <CircularProgress size="1em" />
                    </TableCell>
                  </TableRow>
                )}

                {0 === setModules.length && !setModules && <caption>No sets found.</caption>}

                {setModules.map((row) => {
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(SetModules));
