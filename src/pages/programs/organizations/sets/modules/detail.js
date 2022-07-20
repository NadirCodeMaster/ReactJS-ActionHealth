import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { get, find, isNil, sampleSize, uniqWith, isEqual } from "lodash";
import {
  CircularProgress,
  Divider,
  Grid,
  Hidden,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import PageNotFound from "components/views/PageNotFound";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import filterCriterionInstancesByModule from "utils/filterCriterionInstancesByModule";
import { requestSetResponses, requestModuleResources } from "api/requests";
import generateTitle from "utils/generateTitle";
import getResourceImage from "utils/getResourceImage";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const MAX_RESOURCE_DISPLAY = 5;

class Module extends Component {
  static propTypes = {
    moduleId: PropTypes.number.isRequired,
    organization: PropTypes.shape(organizationShape).isRequired,
    orgProgData: PropTypes.object.isRequired,
    orgSetsData: PropTypes.array.isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    // Used to refresh the org{Whatev}Data objects
    // managed in ProgramOrganizationRouting.
    refreshOrgStats: PropTypes.func,
    // Whether responses have changed since last stat refresh.
    responsesHaveChanged: PropTypes.bool,
    responseStructures: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      resourcesLoading: false,
      resourcesError: false,
      resources: [],
      responsesLoading: false,
      responsesError: false,
      responses: null,
      accessChecked: false,
      userCanView: false,
      sortParams: {
        asc: true,
        column: "weight",
      },
    };
  }

  componentDidUpdate(prevProps) {
    const { currentUser, organization, orgSetsData, set, moduleId } = this.props;
    const {
      currentUser: prevCurrentUser,
      moduleId: prevModuleId,
      organization: prevOrganization,
      orgSetsData: prevOrgSetsData,
      set: prevSet,
    } = prevProps;

    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      this.checkAccess();
    }

    if (orgSetsData !== prevOrgSetsData || set !== prevSet || moduleId !== prevModuleId) {
      this.definePageTitle();
    }
  }

  componentDidMount() {
    const { refreshOrgStats, responsesHaveChanged } = this.props;

    this.checkAccess();

    if (responsesHaveChanged) {
      refreshOrgStats();
    }

    this.getResponses();
    this.getResources();
  }

  checkAccess() {
    const { currentUser, organization } = this.props;

    let allow = userCan(currentUser, organization, "view_assessment");
    this.setState({
      accessChecked: true,
      userCanView: allow,
    });
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  definePageTitle() {
    const { orgSetsData, set, moduleId } = this.props;

    if (!orgSetsData || !set || !moduleId) {
      return;
    }

    let mod;

    let orgSet = find(orgSetsData, (s) => {
      return Number(s.id) === Number(set.id);
    });
    if (!isNil(orgSet)) {
      mod = find(orgSet.modules, (m) => {
        return Number(m.id) === Number(moduleId);
      });
      if (mod) {
        generateTitle(mod.name);
      }
    }
  }

  onCiClick = (ci) => {
    const { history, organization, program, set } = this.props;
    history.push(
      `/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/questions/${ci.id}`
    );
  };

  /**
   * Retrieve the organization responses for this module, add to state.
   */
  getResponses = () => {
    const { organization, moduleId, set } = this.props;

    this.setState({ responsesLoading: true });
    requestSetResponses(set.id, {
      module_id: moduleId,
      organization_id: organization.id,
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            responsesLoading: false,
            responses: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            responsesLoading: false,
            responsesError: false,
            responses: [],
          });
          console.error("An error occurred retrieving responses.");
        }
      });
  };

  /**
   * Retrieve the criteria resources for this module, add to state.
   */
  getResources = () => {
    const { moduleId } = this.props;

    this.setState({ resourcesLoading: true });

    requestModuleResources(moduleId, {})
      .then((res) => {
        if (!this.isCancelled) {
          let distinctResources = uniqWith(res.data.data, isEqual);
          this.setState({
            resourcesLoading: false,
            resources: sampleSize(distinctResources, MAX_RESOURCE_DISPLAY),
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            resourcesLoading: false,
            resourcesError: false,
            resources: [],
          });
          console.error("An error occurred retrieving resources.");
        }
      });
  };

  /**
   * Gets label from response structure (IE 'Partially in place')
   * @param {object} ci (criterion instance)
   **/
  statusDisplay = (ci) => {
    const { responseStructures } = this.props;
    if (this.state.responsesError) {
      return "!";
    }
    if (this.state.responsesLoading) {
      return "loading...";
    }
    let thisResp = find(this.state.responses, (resp) => {
      return ci.criterion_id === resp.criterion_id;
    });
    if (!thisResp) {
      return "Unanswered";
    } else {
      let responseStructureId = get(thisResp.response_value, "response_structure_id", "");
      let responseStructureValues = responseStructures[responseStructureId].response_value;

      return find(responseStructureValues, (rsv) => {
        return Number(rsv.id) === Number(thisResp.response_value.id);
      }).label;
    }
  };

  handleChange = (e, sort) => {
    e.preventDefault();
    this.setState((prevState) => ({
      sortParams: {
        column: sort,
        asc: !prevState.sortParams.asc,
      },
    }));
  };

  render() {
    const { classes, moduleId, organization, orgSetsData, program, set, theme } = this.props;
    const { accessChecked, responsesError, userCanView, sortParams, resourcesLoading, resources } =
      this.state;

    if (!accessChecked) {
      return <CircularProgressGlobal />;
    } else {
      if (!userCanView) {
        return <PageNotFound />;
      }
    }

    // Get the org-configured set object from orgSetsData obj.
    let orgSet = find(orgSetsData, (s) => {
      return Number(s.id) === Number(set.id);
    });
    // Get the module object from the orgSetsData obj.
    let mod = null;
    if (!isNil(orgSet.modules)) {
      mod = find(orgSet.modules, (m) => {
        return Number(m.id) === Number(moduleId);
      });
    } else {
      return (
        <React.Fragment>Unable to locate this module for this set and organization.</React.Fragment>
      );
    }
    // Extract the module's CIs.
    let moduleCriterionInstances = filterCriterionInstancesByModule(
      orgSet.criterion_instances,
      mod,
      sortParams
    );

    // Note: Confirmed that these CIs are sorted by weight. Jan 16, 2019

    if (responsesError) {
      return (
        <React.Fragment>An error occurred while preparing output for this page.</React.Fragment>
      );
    }

    let sortCol = sortParams.column;
    let sortDir = sortParams.asc ? "asc" : "desc";

    let moduleResourcesPath = `/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/modules/${mod.id}/resources`;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb root path={`/app/programs/${program.id}/organizations/${organization.id}`}>
            {organization.name}
          </Breadcrumb>
          <Breadcrumb
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}`}
          >
            {set.name}
          </Breadcrumb>
          <Breadcrumb
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/modules/${mod.id}`}
          >
            {mod.name}
          </Breadcrumb>
        </Breadcrumbs>

        <h1>{mod.name}</h1>
        <p>
          Topic in <em>{set.name}</em> for <em>{organization.name}</em>.
        </p>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} md={9}>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2}>
                      <TableSortLabel
                        active={sortCol === "weight"}
                        direction={sortDir}
                        onClick={(e) => {
                          this.handleChange(e, "weight");
                        }}
                      >
                        Question
                      </TableSortLabel>
                    </TableCell>
                    <Hidden smDown>
                      <TableCell>
                        <TableSortLabel
                          active={sortCol === "status"}
                          direction={sortDir}
                          onClick={(e) => {
                            this.handleChange(e, "status");
                          }}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                    </Hidden>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moduleCriterionInstances.map((ci, idx) => {
                    let highlightCell = idx % 2 !== 0;
                    return (
                      <TableRow
                        key={`module_ci_${idx}`}
                        hover
                        onClick={() => this.onCiClick(ci)}
                        className={highlightCell ? classes.highlightedCell : ""}
                      >
                        <TableCell>
                          <Typography
                            noWrap
                            color="inherit"
                            className={classes.criterionInstanceHandle}
                          >
                            {ci.handle}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {ci.criterion.name}
                          <Hidden smUp>
                            <div style={{ opacity: "0.8", textAlign: "right" }}>
                              <small>
                                <em>Status: {this.statusDisplay(ci)}</em>
                              </small>
                            </div>
                          </Hidden>
                        </TableCell>
                        <Hidden smDown>
                          <TableCell>{this.statusDisplay(ci)}</TableCell>
                        </Hidden>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper>
              <div style={{ padding: styleVars.paperPadding }}>
                <h3>Recommended Resources</h3>
                {resourcesLoading ? (
                  <div
                    style={{
                      paddingBottom: theme.spacing(2),
                      paddingTop: theme.spacing(4),
                      textAlign: "center",
                    }}
                  >
                    <CircularProgress size="1em" />
                  </div>
                ) : (
                  <React.Fragment>
                    {resources && resources.length > 0 ? (
                      <React.Fragment>
                        {resources.map((resource) => {
                          let resourceImage = getResourceImage(resource.content_type);
                          return (
                            <React.Fragment key={resource.id}>
                              <div className={classes.resourceContainer}>
                                {resourceImage && (
                                  <div className={classes.resourceImageWrapper}>
                                    <img
                                      src={resourceImage}
                                      className={classes.resourceImage}
                                      alt=""
                                    />
                                  </div>
                                )}
                                <div className={classes.resourceName}>
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    {resource.name}
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        <p className={classes.modResourcesBottom}>
                          <Link to={moduleResourcesPath}>
                            All <em>{mod.name}</em> resources{" "}
                            <KeyboardArrowRight style={styleVars.iconInTextStyles} />
                          </Link>
                        </p>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <p style={{ padding: styleVars.paperPadding }}>
                          There are currently no <em>{mod.name}</em> resources available.
                        </p>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </div>

              <Divider className={classes.paperDivider} />

              <div style={{ padding: styleVars.paperPadding }}>
                <p>
                  For more resources:
                  <br />
                  <a
                    href="https://www.healthiergeneration.org/resources"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Resource Hub
                  </a>
                </p>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  highlightedCell: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  criterionInstanceHandle: {
    color: "#E13F00",
    fontWeight: styleVars.txtFontWeightDefaultBold,
    paddingLeft: theme.spacing(2),
    whiteSpace: "nowrap",
  },
  paperDivider: {
    width: "100%",
  },
  sortArrow: {
    color: "rgba(0, 0, 0, 0.54)",
    paddingTop: "5px",
  },
  resourceImageWrapper: {
    flex: `0 0 ${theme.spacing(6)}`,
  },
  resourceImage: { width: "85%" },
  resourceName: {
    flex: "0 1 auto",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  resourceContainer: {
    display: "flex",
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  modResourcesBottom: {
    marginTop: "1em",
  },
});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      responseStructures: app_meta.data.responseStructures,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(Module));
