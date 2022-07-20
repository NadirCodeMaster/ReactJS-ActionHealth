import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, isEmpty, isString, isNil } from "lodash";
import {
  Button,
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
import generateTitle from "utils/generateTitle";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import currentUrlParamValue from "utils/currentUrlParamValue";

/**
 * This is a paginated table of tags for use by admins.
 */

class TagsList extends Component {
  static propTypes = {
    getTagsRequest: PropTypes.func.isRequired,
    loadingTags: PropTypes.bool.isRequired,
    tags: PropTypes.array.isRequired,
    requestTagsMeta: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 25,
  };

  constructor(props) {
    super(props);

    this.firstLoadRequested = false;
    this.isCancelled = false;
    this.defaultQsPrefix = "admintags_";

    this.defaultBrowserParamValues = {
      page: 1,
      sort_dir: "asc",
      sort_name: "name_sort",
      include_internal: true,
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
        stateName: "currentIncludeInternal",
        paramName: "include_internal",
        defaultParamValue: this.defaultBrowserParamValues.include_internal,
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
      currentSortName: null,
      currentIncludeInternal: true,
    };
  }

  componentWillUnmount() {
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
  }

  componentDidMount() {
    const { location, qsPrefix } = this.props;
    window.addEventListener("popstate", this.onPopState);
    generateTitle("Tag Management");
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
      currentIncludeInternal: currentUrlParamValue(
        "include_internal",
        _actualQsPrefix,
        location,
        this.defaultBrowserParamValues.include_internal
      ),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { getTagsRequest, history, location, qsPrefix, perPage } = this.props;
    const { qsPrefix: prevQsPrefix } = prevProps;
    const { actualQsPrefix, currentPage, currentSortDir, currentSortName, currentIncludeInternal } =
      this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentSortDir: prevCurrentSortDir,
      currentSortName: prevCurrentSortName,
      currentIncludeInternal: prevCurrentIncludeInternal,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }
    generateTitle("Tag Management");
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
      prevCurrentIncludeInternal !== currentIncludeInternal
    ) {
      // Updates contents
      getTagsRequest({
        page: currentPage,
        per_page: perPage,
        [currentSortName]: currentSortDir,
        include_internal: currentIncludeInternal,
      });

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

  render() {
    const { classes, loadingTags, tags, requestTagsMeta, perPage } = this.props;
    const { currentSortDir, sortField, currentPage } = this.state;

    let tpCount = requestTagsMeta.total ? requestTagsMeta.total : 0;
    let noTags = !loadingTags && isEmpty(tags);

    return (
      <React.Fragment>
        <h1>
          Tag Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/tags/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>

        <Paper>
          {loadingTags && <CircularProgressGlobal />}

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
                      Name
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <React.Fragment>
                {noTags && (
                  <TableRow>
                    <TableCell className={classes.noTagsCell}>No tags found</TableCell>
                  </TableRow>
                )}

                {tags.map((r) => {
                  let isInternal = get(r, "internal", false);

                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link to={`/app/admin/tags/${r.id}`}>{r.name}</Link>
                        {isInternal && <small> (internal)</small>}
                        <br />
                        <code>
                          <small>{r.slug}</small>
                        </code>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            </TableBody>
          </Table>
          <HgPagination
            handlePageChange={this.handlePageChange}
            itemsPerPage={perPage}
            itemsTotal={tpCount}
            currentPage={currentPage}
          />
        </Paper>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  noTagsCell: {
    fontStyle: "italic",
  },
});

const mapStateToProps = (state) => {
  return {
    tagTypes: state.app_meta.data.tagTypes,
  };
};

const mapDispatchToProps = {};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(TagsList));
