import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { requestOrganizationReportSummary } from "api/requests";
import { get } from "lodash";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import HgSkeleton from "components/ui/HgSkeleton";
import { Link } from "react-router-dom";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import ProgressBar from "components/ui/ProgressBar";
import PropTypes from "prop-types";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationWithAvailableSetsShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class OrganizationReport extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
    // progressDataUpdated: Arbitrary changing value (typically a timestamp)
    //  to force re-rendering in components that might otherwise ignore to
    //  changes to progress data that's deeply nested in organization prop.
    progressDataUpdated: PropTypes.number,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      report: null,
      reportLoading: false,
      userCanEditAssessment: false,
      userCanViewAssessment: false,
    };
  }

  componentDidMount() {
    this.initComponent();
  }

  componentDidUpdate(prevProps) {
    const { currentUser, organization } = this.props;
    const { currentUser: prevCurrentUser, organization: prevOrganization } = prevProps;

    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      this.initComponent();
    }
  }

  /**
   * Perform normal setup steps for this component.
   *
   * @param {Object} org
   */
  initComponent() {
    // To load the report as fast as possible, we'll start
    // retrieving the report data before we even check access.
    // (a user without access shouldn't be served this
    // component anyway)
    this.getOrgReportData();
    this.checkAccess();
  }

  /**
   * Perform org access checks required by this component.
   *
   * @param {Object} org Organization object to check for.
   */
  checkAccess() {
    const { currentUser, organization } = this.props;

    let userCanEditAssessment = userCan(currentUser, organization, "edit_assessment");
    let userCanViewAssessment = userCan(currentUser, organization, "view_assessment");

    if (!this.isCancelled) {
      this.setState({
        userCanEditAssessment,
        userCanViewAssessment,
      });
    }
  }

  /**
   * Get report data to be shown by this component.
   *
   * @param {Object} org
   */
  getOrgReportData = () => {
    const { organization } = this.props;

    this.setState({ reportLoading: true });

    requestOrganizationReportSummary(organization.id)
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            reportLoading: false,
            reportError: false,
            report: res.data,
          });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          // ERROR
          this.setState({
            reportLoading: false,
            reportError: true,
            report: null,
          });
        }
      });
  };

  render() {
    const { classes, theme, organization } = this.props;
    const { reportLoading, report, userCanEditAssessment, userCanViewAssessment } = this.state;

    if (!userCanViewAssessment) {
      return null;
    }

    let orgId = organization.id;
    let orgTypeName = get(organization, "organization_type.name", "organization").toLowerCase();

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${orgId}`}>{organization.name}</Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${orgId}/report`}>Report</Breadcrumb>
        </Breadcrumbs>

        <h1>Report for {organization.name}</h1>

        <Grid container spacing={Number(styleVars.gridSpacing)} className={classes.ctaArea}>
          <Grid item xs={12} sm={6}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {reportLoading && (
                <React.Fragment>
                  <div className={classes.ctaSkeletonTop}>
                    <HgSkeleton variant="text" height={40} width={"50%"} />
                  </div>
                  <div>
                    <HgSkeleton variant="text" width={"100%"} />
                    <HgSkeleton variant="text" width={"100%"} />
                  </div>
                </React.Fragment>
              )}
              {report && (
                <React.Fragment>
                  <h2>
                    {report.assessments_started} of {report.assessments} assessments
                  </h2>
                  <div className={classes.reportSummaryItem}>
                    started by your {orgTypeName}
                    <br />
                    <Link to={`/app/account/organizations/${orgId}/sets`}>Go to Assessments</Link>
                  </div>
                </React.Fragment>
              )}
            </Paper>
          </Grid>

          {/* @TODO ENABLE FOR ACTION PLAN, ADJUSTING LINKS, GRID COLS ETC
          <Grid item xs={12} sm={4}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {reportLoading && <CircularProgress size="1em" />}
              {report && (
                <React.Fragment>
                  <h2>
                    {report.plan_items} items
                  </h2>
                  <div className={classes.reportSummaryItem}>
                    added to your school's Action Plan
                    <br />
                    <a
                      href={`https://www.healthiergeneration.org/take-action/schools/action-plan`}
                    >
                      Go to Action Plan
                    </a>
                  </div>
                </React.Fragment>
              )}
            </Paper>
          </Grid>
          */}

          {/* @TODO ENABLE FOR ACTION PLAN, ADJUSTING LINKS, GRID COLS ETC
          <Grid item xs={12} sm={4}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              {reportLoading && <CircularProgress size="1em" />}
              {report && (
                <React.Fragment>
                  <h2>
                    {report.plan_items} of {report.plan_item_tasks} tasks
                    completed
                  </h2>
                  <div className={classes.reportSummaryItem}>
                    in your school's Action Plan
                    <br />
                    <a
                      href={`https://www.healthiergeneration.org/take-action/schools/action-plan`}
                    >
                      Go to Action Plan
                    </a>
                  </div>
                </React.Fragment>
              )}
            </Paper>
          </Grid>
          */}
        </Grid>

        <React.Fragment>
          {organization.available_sets.map((set) => {
            return (
              <div key={set.id} className={classes.row}>
                <div className={classes.reportProgressBar}>
                  <div className={classes.setName}>
                    <Link
                      className={classes.setNameLink}
                      to={`/app/programs/${set.program_id}/organizations/${orgId}/sets/${set.id}/report`}
                    >
                      View {set.name} Report
                    </Link>
                  </div>
                  <ProgressBar
                    value={set.percentComplete * 100}
                    minHeight={theme.spacing(4)}
                    minHeightForEmpty={theme.spacing(4)}
                    linkIfZero={userCanEditAssessment}
                    linkIfZeroText="Start this Assessment"
                    linkIfZeroTo={`/app/programs/${set.program_id}/organizations/${orgId}/sets/${set.id}`}
                  />
                </div>
              </div>
            );
          })}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  ctaArea: {
    marginBottom: theme.spacing(4),
  },
  ctaSkeletonTop: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  row: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  setName: {
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    marginBottom: theme.spacing(0.25),
  },
  reportSummaryItem: {
    marginBottom: "1em",
    marginTop: ".8em",
  },
  reportProgressBar: {
    width: "100%",
    marginTop: theme.spacing(),
  },
});

const mapStateToProps = (state) => ({
  currentUser: state.auth.currentUser,
});

export default compose(
  withRouter,
  connect(mapStateToProps)
)(withStyles(styles, { withTheme: true })(OrganizationReport));
