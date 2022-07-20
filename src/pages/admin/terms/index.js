import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { filter } from "lodash";
import {
  Button,
  CircularProgress,
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
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmButton from "components/ui/ConfirmButton";
import generateQsPrefix from "utils/generateQsPrefix";
import errorSuffix from "utils/errorSuffix";
import { requestTerms, requestDeleteTerm } from "api/requests";
import generateTitle from "utils/generateTitle";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import compareObjectIds from "utils/compareObjectIds";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

class Terms extends Component {
  static propTypes = {
    // prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // Optional number of items to show per page.
    perPage: PropTypes.number,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  static defaultProps = {
    perPage: 50,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.defaultQsPrefix = "admterms_";

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
      terms: [],
      termsLoading: true,
      termsTotal: 0,
      currentPage: null,
      currentSortField: null,
      currentSortOrder: null,
    };
  }

  componentDidMount() {
    const { qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);
    generateTitle("Term Management");
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
    generateTitle("Term Management");
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
      this.populateTerms();

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
   * Get name of sort parameter for API based on sort field.
   */
  apiSortParameterName = () => {
    const { currentSortField } = this.state;
    let res = "";
    switch (currentSortField) {
      case "id":
        res = "id_sort";
        break;
      case "name":
      default:
        res = "name_sort";
        break;
    }
    return res;
  };

  /**
   * Load up the subject user organizations and add them to component state.
   */
  populateTerms = () => {
    const { perPage } = this.props;
    const { currentPage, currentSortField, currentSortOrder } = this.state;

    this.setState({ termsLoading: true });

    let apiSortParam = this.apiSortParameterName(currentSortField);

    requestTerms({
      per_page: perPage,
      page: currentPage,
      [apiSortParam]: currentSortOrder,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            termsLoading: false,
            termsTotal: res.data.meta.total,
            terms: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ termsLoading: false });
        }
      });
  };

  handleRowClick = (row) => {
    const { history } = this.props;
    history.push(`/app/admin/terms/${row.id}`);
  };

  // We pass this to PaginatedTableLocal, which uses it to pass back the `page`
  // number when a user navigates the table. We update our local state
  // with the new value and pass it back to PaginatedTableLocal. When PaginatedTableLocal
  // receives it from us, that's when the page actually changes.
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleOnSort = (newSortField, oldSortOrder) => {
    let newSortOrder = oldSortOrder === "asc" ? "desc" : "asc";
    this.setState({
      currentSortField: newSortField,
      currentSortOrder: newSortOrder,
    });
  };

  callPopulateStateFromUrlParams = () => {
    const { location } = this.props;
    const { actualQsPrefix } = this.state;

    populateStateFromUrlParams(this, location, this.utilDefinitions, actualQsPrefix);
  };

  /**
   * Handle onpopstate
   */
  onPopState = (e) => {
    this.callPopulateStateFromUrlParams();
  };

  /**
   * Delete a Term
   */
  deleteTerm = (termId) => {
    const { draftTerms } = this.state;

    this.setState({ termsDeleting: true });

    requestDeleteTerm(termId)
      .then((res) => {
        // SUCCESS
        hgToast("Deleted term");
        if (!this.isCancelled) {
          // New array of terms omitting the removed item.
          let newDraftTerms = filter(draftTerms, (term) => {
            return term.id !== termId;
          });
          this.setState({
            draftTerms: newDraftTerms,
            termsDeleting: false,
          });
          this.populateTerms();
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred deleting term. " + errorSuffix(), "error");
        if (!this.isCancelled) {
          this.setState({ termsDeleting: false });
        }
      });
  };

  render() {
    const { classes, width, perPage } = this.props;
    const { terms, currentPage, termsLoading, currentSortField, currentSortOrder, termsTotal } =
      this.state;

    const tableCols = [
      {
        label: "Name",
        sortable: "name", // make this column sortable using value of {object}.name
        render: (v) => <Link to={`/app/admin/terms/${v.id}`}>{v.name}</Link>,
      },
      {
        hide_small: true,
        label: "ID",
        sortable: "id", // make this column sortable using value of {object}.id
        render: (v) => v.id,
      },
      {
        hide_small: false,
        label: "Remove",
        render: (v) => (
          <ConfirmButton
            className={classes.removeTermButton}
            size="small"
            color="primary"
            onConfirm={() => this.deleteTerm(v.id)}
            title="Are you sure you want to remove this Term?"
            aria-label="Remove"
            variant="text"
            disabled={false}
          >
            <ClearIcon fontSize="small" />
          </ConfirmButton>
        ),
      },
    ];

    if (!terms) {
      return null;
    }

    return (
      <React.Fragment>
        <h1>
          Term Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/terms/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>

        {termsLoading && (
          <React.Fragment>
            <CircularProgressGlobal />
          </React.Fragment>
        )}

        {!termsLoading && !terms.length && (
          <p>
            <em>
              No terms to display. <Link to={`/app/admin/terms/new`}>Add one here</Link>.
            </em>
          </p>
        )}

        {terms.length > 0 && (
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
                {0 === terms.length && terms && (
                  <TableRow key={`row_0`}>
                    <TableCell colSpan={tableCols.length}>
                      <CircularProgress size="1em" />
                    </TableCell>
                  </TableRow>
                )}

                {0 === terms.length && !terms && (
                  <TableRow key={`row_0`}>
                    <TableCell colSpan={tableCols.length}>
                      <em>No terms found.</em>
                    </TableCell>
                  </TableRow>
                )}

                {terms.map((row) => {
                  return (
                    <TableRow key={`row_${row.id}`} hover={true}>
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
        <HgPagination
          handlePageChange={this.handlePageChange}
          itemsPerPage={perPage}
          itemsTotal={termsTotal}
          currentPage={currentPage}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  removeTermButton: {
    float: "right",
    minWidth: "unset",
    zIndex: "99999",
  },
});

const mapStateToProps = (state) => {
  return {
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(Terms));
