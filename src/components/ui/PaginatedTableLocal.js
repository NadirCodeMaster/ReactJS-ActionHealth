import React from "react";
import PropTypes from "prop-types";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
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
import { get, orderBy } from "lodash";

/**
 * Provides a paginated table display of a complete data collection.
 *
 * You must provide the _complete collection_ via the prop prop. Pagination and
 * sorting are handled within this component based on the provided data.
 * (i.e., don't provide data that's already paginated).
 */

// @TODO ADD CODE FOR MAINTAINING PAGINATION and SORTING META WHEN NAVIGATING
//        TO DETAIL PAGES.

const styles = (theme) => ({});

class PaginatedTableLocal extends React.Component {
  static propTypes = {
    // Props provided by caller.
    // -------------------------
    // -- array of col objects defining the x axis
    columns: PropTypes.array.isRequired,
    // -- array of the data objects to use in table
    data: PropTypes.array.isRequired,
    // -- caller function that will be sent the page num when user navigates
    //    the pagination provided in this component. The caller func should
    //    modify the caller's current page state, then passed back
    //    to this component via the meta.current_page prop.
    goToPage: PropTypes.func.isRequired,
    // -- Whether the data collection is loading.
    loading: PropTypes.bool,
    // -- Pagination meta object, ex: {current_page, per_page, total}.
    //    Note that current_page is zero-based, and total refers to items in
    //    collection (not number of pages).
    meta: PropTypes.object.isRequired,
    // -- caller function that will be sent sorting params when user clicks
    //    a column to sort by. The caller func should modify the caller's
    //    current sort meta state, then pass it back to this component via
    //    the sortMeta prop. (actual sorting is done here; the calling code just
    //    needs to modify the sortMeta prop it provides)
    onSort: PropTypes.func,
    // -- @TODO
    sortMeta: PropTypes.object,

    // Props provided by withResizeDetector.
    // -------------------------------------
    height: PropTypes.number,
    width: PropTypes.number,

    // Props provided by state.
    // -------------------------
    // ...
  };

  constructor(props) {
    super(props);

    // When the component is rendered with a width larger than this
    // px value, columns provided with hide_small will not be shown.
    this.maxSmall = 800;
  }

  handlePageChange = (page) => {
    this.props.goToPage(page);
  };

  render() {
    const {
      // Primary props...
      columns,
      data,
      loading,
      meta,
      // Sorting...
      onSort,
      sortMeta,
      // IX and style...
      classes,
      onRowClick,
      rowClickable,
      width,
    } = this.props;

    const orderedData = get(sortMeta, "field")
      ? orderBy(data, sortMeta.field, sortMeta.order)
      : data;
    const { current_page, per_page, total } = meta;

    return (
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, idx) => {
                let colDisplay = "table-cell";
                if (column.hide_small && width <= this.maxSmall) {
                  colDisplay = "none";
                }
                return (
                  <TableCell
                    key={`th_${idx}`}
                    style={{ display: colDisplay }}
                    align={column.align || "inherit"}
                  >
                    {column.sortable ? (
                      <Tooltip title="Sort">
                        <TableSortLabel
                          onClick={() => (onSort ? onSort(column.sortable) : {})}
                          active={sortMeta.field === column.sortable}
                          direction={sortMeta.order}
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
          {!loading ? (
            <React.Fragment>
              <TableBody>
                {orderedData
                  .slice(current_page * per_page, current_page * per_page + per_page)
                  .map((row) => {
                    let isRowClickable = true;
                    if (rowClickable) {
                      isRowClickable = rowClickable(row);
                    }
                    let hover = !!onRowClick && isRowClickable;

                    return (
                      <TableRow
                        key={`row_${row.id}`}
                        hover={hover}
                        onClick={onRowClick && isRowClickable ? onRowClick.bind(null, row) : null}
                      >
                        {columns.map((column, idx) => {
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
            </React.Fragment>
          ) : (
            <TableBody>
              <TableRow hover>
                <TableCell colSpan={columns.length}>
                  <div className={classes.loadingWrapper}>
                    <CircularProgress color="primary" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
        {!loading && (
          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={per_page}
            itemsTotal={total}
            currentPage={current_page + 1}
          />
        )}
      </Paper>
    );
  }
}

export default withResizeDetector(withStyles(styles, { withTheme: true })(PaginatedTableLocal));
