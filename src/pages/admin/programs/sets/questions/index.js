import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Button,
  Hidden,
  Icon,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import filterCriterionInstancesBySetAndGroupByModule from "utils/filterCriterionInstancesBySetAndGroupByModule.js";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Switch from "components/ui/SwitchWrapper";
import generateTitle from "utils/generateTitle";
import compareObjectIds from "utils/compareObjectIds";
import generateQsPrefix from "utils/generateQsPrefix";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import { requestSetCriterionInstances } from "api/requests";

const styles = (theme) => ({});

class SetCriterionInstances extends Component {
  static propTypes = {
    // Provided by caller
    // ------------------
    currentUser: PropTypes.object,
    // setId: PropTypes.number.isRequired,
    set: PropTypes.object.isRequired,
    setCriterionInstances: PropTypes.array.isRequired,
    program: PropTypes.object.isRequired,
    // -- prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // -- Optional number of items to show per page.
    perPage: PropTypes.number,
  };

  static defaultProps = {
    perPage: 100,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
    this.defaultQsPrefix = "questions_";

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      group_by_module: 1,
    };

    this.utilDefinitions = [
      {
        stateName: "currentPage",
        paramName: "page",
        defaultParamValue: this.defaultBrowserParamValues.page,
        valueType: "num",
      },
      {
        stateName: "currentGroupByModule",
        paramName: "group_by_module",
        defaultParamValue: this.defaultBrowserParamValues.group_by_module,
        valueType: "num",
      },
    ];

    this.state = {
      set: null,
      currentGroupByModule: 1,
      setModules: [],
      setCriterionInstancesGroupedByModule: [],
    };
  }

  componentDidMount() {
    const { refreshSetCriterionInstances, set, setCriterionInstancesHaveChanged } = this.props;
    if (setCriterionInstancesHaveChanged) {
      refreshSetCriterionInstances();
    }
    this.populateGroupedByModule();
    window.addEventListener("popstate", this.onPopState);
    generateTitle(`Assessment ${set.id} Questions`);
  }

  componentDidUpdate(prevProps, prevState) {
    const { location, history, qsPrefix, subjectUser, set, setCriterionInstances } = this.props;
    const {
      qsPrefix: prevQsPrefix,
      subjectUser: prevSubjectUser,
      setCriterionInstances: prevSetCriterionInstances,
    } = prevProps;
    const { actualQsPrefix, currentPage, currentGroupByModule } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      currentPage: prevCurrentPage,
      currentGroupByModule: prevCurrentGroupByModule,
    } = prevState;

    // If CIs have changed, rebuild the grouped-by-module array.
    if (setCriterionInstances !== prevSetCriterionInstances) {
      this.populateGroupedByModule();
    }

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
      Number(currentGroupByModule) !== Number(prevCurrentGroupByModule) ||
      currentPage !== prevCurrentPage ||
      !compareObjectIds(subjectUser, prevSubjectUser)
    ) {
      this.populateSetCriterionInstances();

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
    generateTitle(`Assessment ${set.id} Questions`);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.onPopState);
    this.isCancelled = true;
  }

  handleRowClick = (row) => {
    const { program, set } = this.props;
    this.props.history.push(`/app/admin/programs/${program.id}/sets/${set.id}/questions/${row}`);
  };

  handleChangeGroupByModule = (event) => {
    let val = event.target.checked ? 1 : 0;
    this.setState({ currentGroupByModule: val });
  };

  populateGroupedByModule = () => {
    const { setModules, setCriterionInstances, set } = this.props;

    // @TODO Don't need to filter by set, just group by module.
    let setCriterionInstancesGroupedByModule = filterCriterionInstancesBySetAndGroupByModule(
      setCriterionInstances,
      setModules,
      set.id
    );
    this.setState({
      setCriterionInstancesGroupedByModule: setCriterionInstancesGroupedByModule,
    });
  };

  /**
   * Populate set criterion instances
   */
  populateSetCriterionInstances = () => {
    const { perPage, setId } = this.props;

    this.setState({ setModulesLoading: true });

    requestSetCriterionInstances(setId, {
      per_page: perPage,
    })
      .then((res) => {
        if (!this.isCancelled) {
          let updatedStateVals = {
            setCriterionInstancesLoading: false,
            setCriterionInstancesTotal: res.data.meta.total,
            setCriterionInstances: res.data.data,
          };
          this.setState(updatedStateVals);
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ setCriterionInstancesLoading: false });
        }
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
    const { program, set, setCriterionInstances } = this.props;
    const { currentGroupByModule, setCriterionInstancesGroupedByModule } = this.state;

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
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/questions`}>
            Questions
          </Breadcrumb>
        </Breadcrumbs>

        <h1>
          Question Management
          <Button
            color="primary"
            component={Link}
            size="small"
            style={{ marginLeft: "4px", minWidth: "auto" }}
            to={`/app/admin/programs/${program.id}/sets/${set.id}/questions/new`}
          >
            <Icon color="primary" style={{ marginRight: "4px" }}>
              add_circle
            </Icon>
            Add
          </Button>
        </h1>
        <p>
          For <Link to={`/app/admin/programs/${program.id}/sets/${set.id}`}>{set.name}</Link>
        </p>

        <Switch
          name={"group_by_module"}
          label={"Group by module"}
          value={"group_by_module"}
          checked={1 === currentGroupByModule}
          handleChange={this.handleChangeGroupByModule}
        />

        {/* RENDER GROUPED BY MODULE */}
        {1 === currentGroupByModule && (
          <React.Fragment>
            {setCriterionInstancesGroupedByModule.map((mRow, moduleIdx) => (
              <React.Fragment key={moduleIdx}>
                <h3>
                  {mRow.module && mRow.module.name}
                  {!mRow.module && <em>No module</em>}
                </h3>
                <Paper>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">Handle</TableCell>
                        <TableCell>Criterion</TableCell>
                        <Hidden smDown>
                          <TableCell align="right">Sort Weight</TableCell>
                        </Hidden>
                        <Hidden smDown>
                          <TableCell align="right">ID</TableCell>
                        </Hidden>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mRow.criterionInstances.map((row, idx) => (
                        <TableRow key={row.id} onClick={() => this.handleRowClick(row.id)} hover>
                          <TableCell align="right">
                            <Typography noWrap>{row.handle}</Typography>
                          </TableCell>
                          <TableCell>
                            {row.criterion.name} (#
                            {row.criterion_id})
                          </TableCell>
                          <Hidden smDown>
                            <TableCell align="right">{row.weight}</TableCell>
                          </Hidden>
                          <Hidden smDown>
                            <TableCell align="right">{row.id}</TableCell>
                          </Hidden>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
                <br />
              </React.Fragment>
            ))}
          </React.Fragment>
        )}

        {/* RENDER _NOT_ GROUPED BY MODULE */}
        {1 !== currentGroupByModule && (
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="right">Handle</TableCell>
                  <TableCell>Criterion</TableCell>
                  <Hidden smDown>
                    <TableCell align="right">Sort Weight</TableCell>
                  </Hidden>
                  <Hidden smDown>
                    <TableCell align="right">ID</TableCell>
                  </Hidden>
                </TableRow>
              </TableHead>
              <TableBody>
                {setCriterionInstances.map((row, idx) => (
                  <TableRow key={row.id} onClick={() => this.handleRowClick(row.id)} hover>
                    <TableCell align="right">{row.handle}</TableCell>
                    <TableCell>
                      {row.criterion.name} (#
                      {row.criterion_id})
                    </TableCell>
                    <Hidden smDown>
                      <TableCell align="right">{row.weight}</TableCell>
                    </Hidden>
                    <Hidden smDown>
                      <TableCell align="right">{row.id}</TableCell>
                    </Hidden>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(SetCriterionInstances));
