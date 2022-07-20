import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { findKey, forOwn, isArray, isEmpty, isNull } from "lodash";
import { withStyles } from "@mui/styles";
import { Paper, Tab, Tabs } from "@mui/material";
import UserOrgTypeDashboardTab from "components/views/UserOrgTypeDashboardTab.js";
import BlankDashboard from "components/views/BlankDashboard.js";
import PendingUsers from "components/views/PendingOrganizationUsersGlobal";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import UserOrganizationsPending from "components/views/UserOrganizationsPending";
import TabPanel from "components/ui/DashboardTabPanel";
import DynamicContent from "components/ui/DynamicContent";
import { requestUserOrganizations } from "api/requests";
import currentUrlParamValue from "utils/currentUrlParamValue";
import generateQsPrefix from "utils/generateQsPrefix";
import generateTitle from "utils/generateTitle";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import orgTypesByMachineName from "utils/orgTypesByMachineName";
import filterContentMachineNames from "utils/filterContentMachineNames";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import { fetchContents } from "store/actions";
import errorSuffix from "utils/errorSuffix";
import currentUserOrgCount from "utils/currentUserOrgCount";
import currentUserOrgTypeCount from "utils/currentUserOrgTypeCount";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

const componentContentMachineNames = [
  "active_state_dashboard_tip_1_body",
  "active_state_dashboard_tip_2_body",
];

class Dashboard extends Component {
  static propTypes = {
    // Prefix for query string parameters.
    qsPrefix: PropTypes.string,
    contents: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
    history: PropTypes.object,
    location: PropTypes.object,
    organizationTypes: PropTypes.object,
    width: PropTypes.number,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.populateOrgsPending = this.populateOrgsPending.bind(this);

    this.defaultQsPrefix = "userdash_";

    this.orgTypeTabIndexes = {
      school: 0,
      district: 1,
      ost: 2,
      esd: 3,
      cmo: 4,
    };

    this.defaultBrowserParamValues = {
      tab: 0, // stored in state as tabValue, effectiveTabValue
    };

    // Defintions array passed to certain utilities.
    // @see utils/compareStateWithUrlParams()
    // @see utils/populateStateFromUrlParams()
    this.utilDefinitions = [
      {
        stateName: "tabValue",
        paramName: "tab",
        defaultParamValue: this.defaultBrowserParamValues.tab,
        valueType: "num",
      },
    ];

    // Easier look up for org type objects.
    this.orgTypesByMachineName = orgTypesByMachineName(props.organizationTypes);

    this.state = {
      actualQsPrefix: null,
      userHasExactlyOneOrg: null, // null|false|true
      hasOrgType: {
        school: false,
        district: false,
        ost: false,
        esd: false,
        cmo: false,
      },
      // Intended active tab as specified in URL or by user action.
      tabValue: null,
      // Active tab as determined by available data.
      effectiveTabValue: null,
      orgsPending: [], // Orgs where user is awaiting approval.
      orgsPendingLoading: true,
    };
  }

  componentDidMount() {
    const { location, qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);

    // console.log("pages/account/dashboard componentDidMount() | this.props", this.props);

    this.populateHasOrgType();

    this.addContentsToStore();

    let _actualQsPrefix = generateQsPrefix(this.defaultQsPrefix, qsPrefix);
    this.setState({
      actualQsPrefix: _actualQsPrefix,
      tabValue: parseInt(
        currentUrlParamValue("tab", _actualQsPrefix, location, this.defaultBrowserParamValues.tab),
        10
      ),
    });

    this.checkAndHandleIfUserHasExactlyOneOrg();
    this.populateOrgsPending();

    generateTitle("My Dashboard");
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, history, location, qsPrefix } = this.props;
    const { currentUser: prevCurrentUser, qsPrefix: prevQsPrefix } = prevProps;

    const { actualQsPrefix, hasOrgType, tabValue } = this.state;
    const {
      actualQsPrefix: prevActualQsPrefix,
      hasOrgType: prevHasOrgType,
      tabValue: prevTabValue,
    } = prevState;

    // Re-generate the actualQsPrefix if the qsPrefix prop changes.
    if (qsPrefix !== prevQsPrefix) {
      this.setState({
        actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
      });
    }

    // Populate values impacted by URL parameters in state once
    // actualQsPrefix is set (and adjust if it ever it changes).
    if (prevActualQsPrefix !== actualQsPrefix) {
      this.callPopulateStateFromUrlParams();
    }

    // Watch for changes that require updating user org data in state.
    if (!compareCurrentUserObjectIds(currentUser, prevCurrentUser)) {
      this.populateOrgsPending();
    }

    // Watch for changes that require updating hasOrgType.
    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      (prevCurrentUser &&
        currentUser.data.organization_counts !== prevCurrentUser.data.organization_counts)
    ) {
      this.populateHasOrgType();
      this.checkAndHandleIfUserHasExactlyOneOrg();
    }

    // Watch for changes that require updating URL based on state.
    if (tabValue !== prevTabValue) {
      populateUrlParamsFromState(
        this.state,
        location,
        history,
        this.utilDefinitions,
        actualQsPrefix
      );
    }

    // Watch for changes that would impact the effectiveTabValue.
    if (tabValue !== prevTabValue || hasOrgType !== prevHasOrgType) {
      this.setState({
        effectiveTabValue: this.calculateEffectiveTabValue(),
      });
    }
    generateTitle("My Dashboard");
  }

  componentWillUnmount() {
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
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

  // Add contents for this route to store unless
  // they have already been loaded into redux
  addContentsToStore = () => {
    const { addToContents, contents } = this.props;

    let paramMachineNames = filterContentMachineNames(contents, componentContentMachineNames);

    // Fetch content only if its not already in redux
    if (!isEmpty(paramMachineNames)) {
      addToContents(paramMachineNames);
    }
  };

  /**
   * JSX output for list of orgs where users is awaiting approval.
   */
  renderOrgsPending = () => {
    const { orgsPending } = this.state;

    if (!isArray(orgsPending) || 0 === orgsPending.length) {
      return null;
    }

    return (
      <React.Fragment>
        <Paper style={{ padding: styleVars.paperPadding }}>
          <UserOrganizationsPending
            orgs={orgsPending}
            afterRemoveRequest={this.populateOrgsPending}
            includeAlert={true}
          />
        </Paper>
        <br />
      </React.Fragment>
    );
  };

  /**
   * Output for header CTAs area of page.
   */
  renderHeaderCtasSection = (sizeStr) => {
    const { classes } = this.props;

    return (
      <div className={clsx(classes.headerTextContainer, sizeStr)}>
        <Paper className={clsx(classes.headerTextContentLeft, sizeStr)}>
          <h3>Build a healthier organization with our 6 Step Process</h3>
          <div className={classes.headerTextDescription}>
            <DynamicContent machineName={"active_state_dashboard_tip_1_body"} />
          </div>
          <div className={classes.headerTextLinkWrapper}>
            <a
              href="https://www.healthiergeneration.org/our-work/six-step-process"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about the 6 Step Process
            </a>
          </div>
        </Paper>
        <Paper className={clsx(classes.headerTextContentRight, sizeStr)}>
          <h3>Caring for the Education Community During COVID-19</h3>
          <div className={classes.headerTextDescription}>
            <DynamicContent machineName={"active_state_dashboard_tip_2_body"} />
          </div>
          <div className={classes.headerTextLinkWrapper}>
            <Link to={`/app/resources`}>Resource Library</Link>
          </div>
        </Paper>
      </div>
    );
  };

  /**
   * Render org tabs section of page.
   */
  renderOrgTabsSection = () => {
    const { classes, currentUser } = this.props;
    const { effectiveTabValue, hasOrgType } = this.state;

    return (
      <Paper>
        <div className={classes.tabRoot}>
          <div className={classes.orgHeaderContainer}>
            <h2 className={classes.headerText}>My Organizations</h2>
            <div className={classes.joinOrgLinkWrapper}>
              <Link className={classes.joinOrgLink} to={`/app/account/organizations/join`}>
                <div className={classes.joinOrgLinkIconWrapper}>
                  <AddCircleOutline className={classes.joinOrgLinkIcon} color="primary" />
                </div>
                <div className={classes.joinOrgLinkText}>Join another Organization</div>
              </Link>
            </div>
          </div>

          {!isNull(effectiveTabValue) && (
            <React.Fragment>
              <div className={classes.tabBar}>
                <Tabs
                  value={effectiveTabValue}
                  onChange={this.handleTabChange}
                  aria-label="dashboard tab bar"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    {...this.tabProps(
                      this.orgTypeTabIndexes.school,
                      this.orgTypesByMachineName.school.name_plural,
                      hasOrgType.school
                    )}
                  />
                  <Tab
                    {...this.tabProps(
                      this.orgTypeTabIndexes.district,
                      this.orgTypesByMachineName.district.name_plural,
                      hasOrgType.district
                    )}
                  />
                  <Tab
                    {...this.tabProps(
                      this.orgTypeTabIndexes.ost,
                      this.orgTypesByMachineName.ost.name_plural,
                      hasOrgType.ost
                    )}
                  />
                  <Tab
                    {...this.tabProps(
                      this.orgTypeTabIndexes.esd,
                      this.orgTypesByMachineName.esd.name_plural,
                      hasOrgType.esd
                    )}
                  />
                  <Tab
                    {...this.tabProps(
                      this.orgTypeTabIndexes.cmo,
                      this.orgTypesByMachineName.cmo.name_plural,
                      hasOrgType.cmo
                    )}
                  />
                </Tabs>
              </div>
              {!currentUser.isAdmin && <PendingUsers nonAdmin={true} />}
              <TabPanel value={effectiveTabValue} index={this.orgTypeTabIndexes.school}>
                {hasOrgType.school && (
                  <React.Fragment>
                    <UserOrgTypeDashboardTab
                      orgType={this.orgTypesByMachineName.school}
                      subjectUser={currentUser.data}
                      qsPrefix={`${this.orgTypesByMachineName.school.machine_name}_tab_`}
                    />
                  </React.Fragment>
                )}
              </TabPanel>

              <TabPanel value={effectiveTabValue} index={this.orgTypeTabIndexes.district}>
                {hasOrgType.district && (
                  <React.Fragment>
                    <UserOrgTypeDashboardTab
                      orgType={this.orgTypesByMachineName.district}
                      subjectUser={currentUser.data}
                      qsPrefix={`${this.orgTypesByMachineName.district.machine_name}_tab_`}
                    />
                  </React.Fragment>
                )}
              </TabPanel>
              <TabPanel value={effectiveTabValue} index={this.orgTypeTabIndexes.ost}>
                {hasOrgType.ost && (
                  <React.Fragment>
                    <UserOrgTypeDashboardTab
                      orgType={this.orgTypesByMachineName.ost}
                      subjectUser={currentUser.data}
                      qsPrefix={`${this.orgTypesByMachineName.ost.machine_name}_tab_`}
                    />
                  </React.Fragment>
                )}
              </TabPanel>
              <TabPanel value={effectiveTabValue} index={this.orgTypeTabIndexes.esd}>
                {hasOrgType.esd && (
                  <React.Fragment>
                    <UserOrgTypeDashboardTab
                      orgType={this.orgTypesByMachineName.esd}
                      subjectUser={currentUser.data}
                      qsPrefix={`${this.orgTypesByMachineName.esd.machine_name}_tab_`}
                    />
                  </React.Fragment>
                )}
              </TabPanel>
              <TabPanel value={effectiveTabValue} index={this.orgTypeTabIndexes.cmo}>
                {hasOrgType.cmo && (
                  <React.Fragment>
                    <UserOrgTypeDashboardTab
                      orgType={this.orgTypesByMachineName.cmo}
                      subjectUser={currentUser.data}
                      qsPrefix={`${this.orgTypesByMachineName.cmo.machine_name}_tab_`}
                    />
                  </React.Fragment>
                )}
              </TabPanel>
            </React.Fragment>
          )}
        </div>
      </Paper>
    );
  };

  /**
   * Set vars and redirect based on number of orgs user has.
   *
   * If user has exactly one non-pending org association, we need to redirect
   * them to the overview page for that one org. We also reflect this in the
   * state var `userHasExactlyOneOrg`:
   *
   *  - `null`: We haven't evaluated number of orgs for the user
   *  - `false`: User does NOT have exactly one org
   *  - `true`: User DOES have exactly one org
   */
  checkAndHandleIfUserHasExactlyOneOrg = () => {
    const { currentUser, history } = this.props;

    let orgCount = 0;

    forOwn(currentUser.data.organization_counts, function (v, k) {
      orgCount += v;
    });

    if (1 !== orgCount) {
      this.setState({ userHasExactlyOneOrg: false });
    } else {
      // Fetch the org and redirect to it.
      requestUserOrganizations(currentUser.data.id, {
        access_approved: 1,
        per_page: 1,
      })
        .then((res) => {
          if (!this.isCancelled) {
            this.setState({ userHasExactlyOneOrg: true });
            history.push(`/app/account/organizations/${res.data.data[0].id}/overview`);
          }
        })
        .catch((error) => {
          if (!this.isCancelled) {
            console.error("An error occurred in checkAndHandleIfUserHasExactlyOneOrg()");
          }
        });
    }
  };

  /**
   * Populate state.orgsPending
   */
  populateOrgsPending = () => {
    const { currentUser } = this.props;

    this.setState({
      orgsPendingLoading: true,
    });

    requestUserOrganizations(currentUser.data.id, {
      access_approved: 0,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            orgsPendingLoading: false,
            orgsPending: res.data.data,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({
            orgsPendingLoading: false,
            orgsPending: [],
          });
        }
        hgToast("An error occurred while executing your search. " + errorSuffix(error), "error");
      });
    return [];
  };

  /**
   * Generate props for use on an organization <Tab>.
   */
  tabProps = (index, label, userHasOrgType) => {
    let res = {
      id: `full-width-tab-${index}`,
      label: label,
    };

    if (!userHasOrgType) {
      res.style = {
        display: "none",
      };
      res.disabled = true;
    }
    return res;
  };

  /**
   * Populate state.hasOrgType object.
   */
  populateHasOrgType = () => {
    const { currentUser, organizationTypes } = this.props;
    let newHasOrgType = {
      school: !!currentUserOrgTypeCount("school", currentUser.data, organizationTypes),
      district: !!currentUserOrgTypeCount("district", currentUser.data, organizationTypes),
      ost: !!currentUserOrgTypeCount("ost", currentUser.data, organizationTypes),
      esd: !!currentUserOrgTypeCount("esd", currentUser.data, organizationTypes),
      cmo: !!currentUserOrgTypeCount("cmo", currentUser.data, organizationTypes),
    };
    if (!this.isCancelled) {
      this.setState({
        hasOrgType: newHasOrgType,
      });
    }
  };

  /**
   * Establish the effective tab value.
   *
   * Value may differ from this.state.tabValue if an invalid value
   * has been provided in the URL.
   *
   * @returns {integer|null}
   *  Returns a numeric tab value if component is ready, otherwise null.
   */
  calculateEffectiveTabValue = () => {
    const { hasOrgType, tabValue } = this.state;

    let res = null;

    // Get the org type machine name indicated by current tabValue, if any.
    if (!isNull(tabValue)) {
      let typeMachineNameForTabValue = findKey(this.orgTypeTabIndexes, (v) => {
        return v === tabValue;
      });
      // If they have that type, we'll allow it.
      if (hasOrgType[typeMachineNameForTabValue]) {
        res = tabValue;
      }
    }

    // Otherwise, determine based on priority of org types user has.
    if (isNull(res)) {
      if (hasOrgType.school) {
        res = this.orgTypeTabIndexes.school;
      } else if (hasOrgType.district) {
        res = this.orgTypeTabIndexes.district;
      } else if (hasOrgType.ost) {
        res = this.orgTypeTabIndexes.ost;
      } else if (hasOrgType.esd) {
        res = this.orgTypeTabIndexes.esd;
      } else if (hasOrgType.cmo) {
        res = this.orgTypeTabIndexes.cmo;
      }
    }
    return res;
  };

  /**
   * Handle user-initiated tab change.
   */
  handleTabChange = (event, newValue) => {
    this.setState({ tabValue: newValue });
  };

  render() {
    const { currentUser, width } = this.props;
    const { userHasExactlyOneOrg } = this.state;

    // Show loader if user is loading, or we haven't yet determined if they have
    // exactly one org.
    if (currentUser.loading || false !== userHasExactlyOneOrg) {
      return <CircularProgressGlobal />;
    }

    let noOrganizations = !currentUserOrgCount(currentUser.data);

    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
        <h1>My Dashboard</h1>

        {this.renderOrgsPending()}

        {noOrganizations && <BlankDashboard />}

        {!noOrganizations && (
          <React.Fragment>
            {this.renderHeaderCtasSection(sizeStr)}
            {this.renderOrgTabsSection()}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const maxSmWidth = 799;

const styles = (theme) => ({
  tabRoot: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    margin: theme.spacing(2),
  },
  tabBar: {
    width: "100%",
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    marginBottom: theme.spacing(2),
  },
  orgHeaderContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      flexWrap: "nowrap",
      justifyContent: "space-between",
    },
  },
  headerText: {
    flex: "1 1 auto",
    [theme.breakpoints.up("sm")]: {
      margin: 0,
    },
  },
  joinOrgLinkWrapper: {
    display: "inline-flex",
    fontSize: 12,
    flex: `0 1 ${theme.spacing(28)}`,
    margin: 0,
    [theme.breakpoints.up("sm")]: {
      fontSize: 14,
    },
  },
  joinOrgLink: {
    alignItems: "center",
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: 0,
    marginTop: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      justifyContent: "flex-end",
    },
  },
  joinOrgLinkIconWrapper: {
    display: "inline-flex",
    flex: `0 1 ${theme.spacing(2)}`,
  },
  joinOrgLinkIcon: {
    height: "12px",
    width: "auto",
    [theme.breakpoints.up("sm")]: {
      height: "14px",
    },
  },
  joinOrgLinkText: {
    flex: `0 1 auto`,
    lineHeight: 1.2,
  },
  headerTextContainer: {
    marginBottom: theme.spacing(),
    "&.lg": {
      display: "flex",
      justifyContent: "space-between",
    },
  },
  headerTextContentLeft: {
    padding: styleVars.paperPadding,
    "&.lg": {
      width: "50%",
      marginRight: "3px",
    },
  },
  headerTextContentRight: {
    padding: styleVars.paperPadding,
    "&.lg": {
      width: "50%",
      marginLeft: "3px",
    },
    "&.sm": {
      marginTop: theme.spacing(),
    },
  },
  headerTextLinkWrapper: {},
  headerTextLink: {},
  headerTextDescription: {
    marginBottom: styleVars.txtMarginBottomP,
  },
});

const mapStateToProps = (state) => {
  return {
    contents: state.contents,
    currentUser: state.auth.currentUser,
    organizationTypes: state.app_meta.data.organizationTypes,
  };
};

const mapDispatchToProps = (dispatch) => ({
  addToContents: (machineNames) => {
    dispatch(
      fetchContents({
        machine_name: machineNames,
      })
    );
  },
});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withResizeDetector(withStyles(styles, { withTheme: true })(Dashboard)));
