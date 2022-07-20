import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import { Link } from "react-router-dom";
import { withStyles } from "@mui/styles";
import { cloneDeep, findIndex, isEmpty, isNil, toLower } from "lodash";
import HgPagination from "components/ui/HgPagination";
import HgSkeleton from "components/ui/HgSkeleton";
import AssessmentsList from "components/views/AssessmentsList";
import { requestUserOrganizations } from "api/requests";
import applyPusherUserOrgSetProgressData from "utils/applyPusherUserOrgSetProgressData";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareStateWithUrlParams from "utils/compareStateWithUrlParams";
import populateStateFromUrlParams from "utils/populateStateFromUrlParams";
import populateUrlParamsFromState from "utils/populateUrlParamsFromState";
import errorSuffix from "utils/errorSuffix";
import orgCityAndState from "utils/orgCityAndState";
// import setAwardApplicationUrl from 'utils/setAwardApplicationUrl';
import generateQsPrefix from "utils/generateQsPrefix";
import userCan from "utils/userCan";
import clsx from "clsx";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import getPusherInstance from "api/getPusherInstance";
import { currentUserShape } from "constants/propTypeShapes";
import appleBooksLogo from "images/apple_books.svg";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Provides a paginated display of organizations of a type for a user.
 *
 * Organizations are requested from the API. Note that the endpoint used must
 * continue to be one that includes the necessary `pivot` property on each
 * record that contains the user/org pivot data. (not all org endpoints
 * do that)
 */
class UserOrgTypeDashboardTab extends React.Component {
  static propTypes = {
    // Provided by caller
    // ------------------
    // Prefix for query string parameters.
    qsPrefix: PropTypes.string,
    // Subject user data object.
    subjectUser: PropTypes.object.isRequired,
    // Organization type object.
    orgType: PropTypes.object.isRequired,
    // Optional number of items to show per page.
    perPage: PropTypes.number,
    classes: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  static defaultProps = {
    perPage: 6,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.defaultQsPrefix = "uotdt_";

    this.defaultBrowserParamValues = {
      page: 1, // API also uses 1 as first page
      sort: "asc",
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
    ];

    this.state = {
      actualQsPrefix: null,
      currentPage: null,
      orgs: [],
      orgsLoading: true,
      orgsTotal: 0, // number of orgs of type user has
    };
  }

  componentDidMount() {
    const { currentUser, qsPrefix } = this.props;

    window.addEventListener("popstate", this.onPopState);

    this.bindPusherEvents(currentUser.data.id);

    this.setState({
      actualQsPrefix: generateQsPrefix(this.defaultQsPrefix, qsPrefix),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, location, history, orgType, qsPrefix, subjectUser } = this.props;
    const {
      currentUser: prevCurrentUser,
      orgType: prevOrgType,
      qsPrefix: prevQsPrefix,
      subjectUser: prevSubjectUser,
    } = prevProps;
    const { actualQsPrefix, currentPage } = this.state;
    const { actualQsPrefix: prevActualQsPrefix, currentPage: prevCurrentPage } = prevState;

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

    // Changes that require updating pusher bindings.
    if (!compareCurrentUserObjectIds(currentUser, prevCurrentUser)) {
      // Unbind for prev user.
      this.unbindPusherEvents(prevCurrentUser.data.id);

      // Bind for current user.
      this.bindPusherEvents(currentUser.data.id);
    }

    // Watch for changes that require updating the org result
    // values in state.
    if (
      (prevOrgType && orgType.id !== prevOrgType.id) ||
      (prevSubjectUser && subjectUser.id !== prevSubjectUser.id) ||
      prevCurrentPage !== currentPage
    ) {
      // Update the org results array.
      this.populateOrgs();

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

  componentWillUnmount() {
    const { currentUser } = this.props;
    this.isCancelled = true;
    window.removeEventListener("popstate", this.onPopState);
    this.unbindPusherEvents(currentUser.data.id);
  }

  /**
   * Bind to Pusher events that impact this component.
   * @see this.unbindPusherEvents()
   *
   * @param {Number} userId
   *  Note: This can only be the current user Id (users
   *  cannot subscribe to other user channels).
   */
  bindPusherEvents = (userId) => {
    let pusherInstance = getPusherInstance();

    if (!isNil(pusherInstance)) {
      let userChannelName = `private-users.${userId}.organizations`;

      // We may already be subscribed to the required channel,
      // so we'll try to retrieve it.
      let userChannel = pusherInstance.channel(userChannelName);

      // If not already subscribed, subscribe.
      if (!userChannel) {
        try {
          userChannel = pusherInstance.subscribe(userChannelName);
        } catch (e) {
          console.error(e);
        }
      }
      if (userChannel) {
        userChannel.bind("user-org-set-progress", this.applyUpdatedProgressData);
      }
    }
  };

  /**
   * Unbind from Pusher events that impact this component.
   * @see this.bindPusherEvents()
   *
   * @param {Number} userId
   *  User ID used in channel name.
   */
  unbindPusherEvents = (userId) => {
    let pusherInstance = getPusherInstance();
    if (!isNil(pusherInstance)) {
      let userChannelName = `private-users.${userId}.organizations`;
      let userChannel = pusherInstance.channel(userChannelName);
      if (userChannel) {
        userChannel.unbind("user-org-set-progress", this.applyUpdatedProgressData);
      }
    }
  };

  /**
   * Modify an org.available_sets.set.percentComplete property
   *
   * If a change comes in from Pusher.
   */
  applyUpdatedProgressData = (pusherData) => {
    const { orgs } = this.state;

    // Locate the organization in component state.
    if (orgs && pusherData) {
      let matchingOrg;
      let matchingOrgIndex = findIndex(orgs, ["id", pusherData.organization_id]);

      if (matchingOrgIndex >= 0) {
        matchingOrg = orgs[matchingOrgIndex];
      }

      if (matchingOrg) {
        let updatedOrg = applyPusherUserOrgSetProgressData(matchingOrg, pusherData);

        // Create a clone of orgs that we'll repopulate state with.
        let orgsClone = cloneDeep(orgs);

        // Replace the matchingOrg entry with the updated object.
        orgsClone[matchingOrgIndex] = updatedOrg;

        if (!this.isCancelled) {
          this.setState({
            orgs: orgsClone,
          });
        }
      }
    }
  };

  /**
   * Populate state.orgs.
   */
  populateOrgs = () => {
    const { subjectUser, orgType, perPage } = this.props;
    const { currentPage } = this.state;

    this.setState({
      orgsLoading: true,
    });

    requestUserOrganizations(subjectUser.id, {
      organization_type_id: orgType.id,
      page: currentPage,
      per_page: perPage,
      access_approved: 1,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            orgsLoading: false,
            orgs: res.data.data,
            orgsTotal: res.data.meta.total,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          this.setState({
            orgsLoading: false,
            orgs: [],
            orgsTotal: 0,
          });
          hgToast(
            "An error occurred while retrieving your organizations. " + errorSuffix(error),
            "error"
          );
        }
      });
  };

  /**
   * Check if a user can VIEW sets for a given org.
   * @returns {boolean}
   */
  canViewSetsFor = (org) => {
    const { currentUser } = this.props;

    return userCan(currentUser, org, "view_assessment");
  };

  /**
   * Check if a user can EDIT sets for a given org.
   * @returns {boolean}
   */
  canEditSetsFor = (org) => {
    const { currentUser } = this.props;

    return userCan(currentUser, org, "edit_assessment");
  };

  /**
   * Get JSX for name of an organization.
   */
  renderOrgName = (classes, sizeStr, orgObj) => {
    let userCanView = this.canViewSetsFor(orgObj);

    return (
      <React.Fragment>
        <div className={classes.orgName}>
          <Link to={`/app/account/organizations/${orgObj.id}`}>{orgObj.name}</Link>
          <div className={classes.orgAddress}>{orgCityAndState(orgObj)}</div>
        </div>
        {userCanView && (
          <div className={classes.orgActionPlanLinkWrapper}>
            <Link
              to={`/app/account/organizations/${orgObj.id}/plan`}
              className={classes.orgActionPlanLink}
            >
              <AssignmentTurnedInIcon color="primary" className={classes.orgActionPlanLinkIcon} />
              <span className={classes.orgActionPlanLinkText}>Go to Action Plan</span>
            </Link>
          </div>
        )}
      </React.Fragment>
    );
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
   * Output if user has no orgs of type.
   */
  renderNoOrgs = (classes, orgType) => {
    return (
      <div clsx={classes.noDataDiv}>
        You are not yet associated with any {toLower(orgType.name_plural)}.{" "}
        <Link to={`/app/account/organizations/join/${orgType.machine_name}`}>Join one here.</Link>
      </div>
    );
  };

  /**
   * Handle page change request.
   */
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { classes, orgType, perPage, width } = this.props;
    const { currentPage, orgs, orgsLoading, orgsTotal } = this.state;

    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    // Use alternate orgtype name if regular is too long to render reasonably.
    let orgTypeNameForColHeader = orgType.name;
    if (orgTypeNameForColHeader.length > 12) {
      orgTypeNameForColHeader = "Name";
    }

    return (
      <React.Fragment>
        {/*
          This situation will not happen unless the calling code changes
          This is because we should not render this component at all
          unless we know there are organizations for the specified orgType.
          We are keeping this here to preserve functionality if we decide to
          one day modify the calling code.
        */}
        {!orgsLoading && !orgsTotal && (
          <React.Fragment>{this.renderNoOrgs(classes, orgType)}</React.Fragment>
        )}
        {(orgsLoading || orgsTotal) && (
          <React.Fragment>
            <div
              className={clsx(
                classes.outerTableBody,
                sizeStr,
                orgsLoading ? classes.outerTableBodyLoading : ""
              )}
            >
              {orgs.map((org, orgIdx) => (
                <div className={clsx(classes.outerTableBodyRow, sizeStr)} key={`org${orgIdx}`}>
                  <div className={clsx(classes.outerCol1, classes.fauxTd, sizeStr)}>
                    {this.renderOrgName(classes, sizeStr, org)}
                  </div>
                  <div className={clsx(classes.outerCol2, classes.innerTable, sizeStr)}>
                    {org.available_sets.length > 0 && (
                      <AssessmentsList
                        image={appleBooksLogo}
                        orgId={org.id}
                        assessments={org.available_sets}
                        userCanViewSets={this.canViewSetsFor(org)}
                      />
                    )}
                  </div>
                </div>
              ))}
              {isEmpty(orgs) && orgsLoading && (
                <React.Fragment>
                  <div className={clsx(classes.outerTableBodyRow, sizeStr)}>
                    <div className={clsx(classes.outerCol1, classes.fauxTd, sizeStr)}>
                      <HgSkeleton variant="text" width={`50%`} />
                      <HgSkeleton variant="text" width={`50%`} />
                      <HgSkeleton variant="text" width={`50%`} />
                    </div>
                    <div className={clsx(classes.outerCol2, classes.innerTable, sizeStr)}>
                      <div className={clsx(classes.innerTableRow, sizeStr)}>
                        <div className={clsx(classes.innerCol1, classes.fauxTd, sizeStr)}>
                          <HgSkeleton variant="text" />
                        </div>
                        <div className={clsx(classes.innerCol2, classes.fauxTd, sizeStr)}>
                          <HgSkeleton variant="text" />
                        </div>
                        <div className={clsx(classes.innerCol3, classes.fauxTd, sizeStr)}>
                          <HgSkeleton variant="text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              )}
            </div>
            <div>
              <HgPagination
                handlePageChange={this.handlePageChange}
                itemsPerPage={perPage}
                itemsTotal={orgsTotal}
                currentPage={currentPage}
              />
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const maxSmWidth = 799;

const styles = (theme) => ({
  rowItem: {},
  notApplicable: {
    fontStyle: "italic",
  },
  outerTableBody: {},
  outerTableBodyLoading: {
    opacity: "0.5",
  },
  outerTableHeaderRow: {
    display: "none",
    "&.lg": {
      display: "flex",
      padding: theme.spacing(0, 0, 0, 2),
    },
  },
  outerTableBodyRow: {
    marginBottom: theme.spacing(2),
    "&.lg": {
      display: "flex",
      marginBottom: theme.spacing(),
      padding: theme.spacing(2),
    },
  },
  innerTableHeaderRow: { "&.lg": { alignItems: "flex-end", display: "flex" } },
  innerTableRow: {
    paddingBottom: theme.spacing(1.5),
    "&.lg": {
      display: "flex",
      paddingBottom: theme.spacing(2),
      "&._notlast": {
        borderBottom: `2px solid ${styleVars.colorLightGray}`,
        marginBottom: theme.spacing(2),
      },
    },
  },
  outerCol1: {
    "&.lg": { flex: "0 0 auto", width: "20%" },
  },
  outerCol2: {
    // aka innerTable
    marginTop: theme.spacing(2),
    "&.lg": {
      flex: "0 0 auto",
      marginTop: 0,
      width: "80%",
    },
  },
  innerCol1: { "&.lg": { width: "40%" } },
  innerCol2: { "&.lg": { width: "48%" } },
  innerCol3: { "&.lg": { width: "12%" } },
  fauxTh: {
    fontFamily: styleVars.txtFontFamilyTableHead,
    fontSize: styleVars.txtFontSizeTableHead,
    fontWeight: styleVars.txtFontWeightTableHead,
    lineHeight: styleVars.txtLineHeightTableHead,
    textAlign: "left",
    textTransform: "uppercase",
    width: "100%",
    "&.lg": {
      alignItems: "center",
      flex: "0 0 auto",
      padding: theme.spacing(1, 1, 0.5),
    },
  },
  fauxTd: {
    padding: theme.spacing(0.0125),
    "&.lg": {
      flex: "0 0 auto",
      padding: theme.spacing(),
    },
  },
  noDataDiv: {
    fontStyle: "italic",
    paddingTop: "10px",
  },
  outerTableHeader: {
    "&.sm": {
      // we'll use this element as a spacer at small sizes
      height: theme.spacing(2),
    },
  },
  orgName: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    fontSize: 15,
    letterSpacing: "-0.5px",
    marginBottom: theme.spacing(2),
  },
  orgAddress: {
    fontSize: 12,
    marginTop: theme.spacing(0.5),
  },
  orgActionPlanLinkWrapper: {},
  orgActionPlanLink: {
    display: "flex",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  orgActionPlanLinkIcon: {
    marginRight: theme.spacing(0.5),
  },
  orgActionPlanLinkText: {
    fontSize: 13,
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
)(withResizeDetector(withStyles(styles, { withTheme: true })(UserOrgTypeDashboardTab)));
