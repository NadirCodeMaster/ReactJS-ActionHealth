import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { find, isNil, uniqWith, isEqual } from "lodash";
import { CircularProgress, Divider, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import { requestModuleResources } from "api/requests";
import generateTitle from "utils/generateTitle";
import getResourceImage from "utils/getResourceImage";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class ModuleResources extends Component {
  static propTypes = {
    moduleId: PropTypes.number.isRequired,
    organization: PropTypes.shape(organizationShape).isRequired,
    orgSetsData: PropTypes.array.isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      resourcesLoading: false,
      resourcesError: false,
      resources: [],
      accessChecked: false,
      userCanView: false,
      sortParams: {
        asc: true,
        column: "weight",
      },
    };
  }

  componentDidMount() {
    this.checkAccess();
    this.populateResources();
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

    // Recheck perms if org or user changes.
    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      this.checkAccess();
    }

    if (moduleId !== prevModuleId) {
      this.populateResources();
    }

    if (orgSetsData !== prevOrgSetsData || set !== prevSet || moduleId !== prevModuleId) {
      this.definePageTitle();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  checkAccess() {
    const { currentUser, organization } = this.props;
    let allow = userCan(currentUser, organization, "view_assessment");
    this.setState({
      accessChecked: true,
      userCanView: allow,
    });
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

  /**
   * Retrieve the criteria resources for this module, add to state.
   */
  populateResources = () => {
    const { moduleId } = this.props;

    this.setState({ resourcesLoading: true });

    requestModuleResources(moduleId, {})
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            resourcesLoading: false,
            resources: uniqWith(res.data.data, isEqual),
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

  render() {
    const { classes, moduleId, organization, orgSetsData, program, set } = this.props;
    const { accessChecked, userCanView, resourcesLoading, resources } = this.state;

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
          <Breadcrumb
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/modules/${mod.id}/resources`}
          >
            Resources
          </Breadcrumb>
        </Breadcrumbs>

        <h1>{mod.name} Resources</h1>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={9}>
            <Paper>
              <div style={{ padding: styleVars.paperPadding }}>
                {resourcesLoading ? (
                  <CircularProgress />
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
                                  <p>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {resource.name}
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    ) : (
                      <p style={{ padding: styleVars.paperPadding }}>
                        There are currently no <em>{mod.name}</em> resources available.
                      </p>
                    )}
                  </React.Fragment>
                )}
              </div>
              <Divider className={classes.paperDivider} />
              <p style={{ padding: styleVars.paperPadding }}>
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
  resourceContainer: {
    display: "flex",
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  resourceImageWrapper: {
    flex: `0 0 ${theme.spacing(8)}`,
    display: "inline-flex",
    alignSelf: "center",
  },
  resourceImage: { width: "80%" },
  resourceName: {
    display: "inline-flex",
    alignSelf: "center",
    flex: "0 1 auto",
    textAlign: "left",
  },
});

export default compose(
  connect(
    ({ auth }) => ({
      currentUser: auth.currentUser,
    }),
    {}
  ),
  withStyles(styles, { withTheme: true })
)(ModuleResources);
