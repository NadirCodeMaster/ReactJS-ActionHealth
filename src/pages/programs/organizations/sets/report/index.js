import React, { Component } from "react";
import clsx from "clsx";
import { compose } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, isEmpty, isNil } from "lodash";
import { Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { withStyles } from "@mui/styles";
import ProgressBar from "components/ui/ProgressBar";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import PageNotFound from "components/views/PageNotFound";
import { requestOrganizationSetReport } from "api/requests";
import generateTitle from "utils/generateTitle";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

// Note: We don't currently use live updates (Pusher) in
// this component.

class SetReport extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationShape).isRequired,
    orgProgData: PropTypes.object.isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape),
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      report: null,
      reportLoading: false,
      reportError: false,
      accessChecked: false,
      userCanViewAssessment: false,
      userCanViewActionPlan: false,
    };
  }

  componentDidMount() {
    let stateAccessVars = this.checkAccess();
    this.setState(stateAccessVars);
    this.populateReport(!stateAccessVars.userCanViewAssessment);
    generateTitle("Reporting");
  }

  componentDidUpdate(prevProps) {
    const { currentUser, organization, set } = this.props;
    const {
      currentUser: prevCurrentUser,
      organization: prevOrganization,
      set: prevSet,
    } = prevProps;

    // If applicable props change, recheck access and repopulate report.
    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization) ||
      !compareObjectIds(set, prevSet)
    ) {
      let stateAccessVars = this.checkAccess();
      this.setState(stateAccessVars);
      this.populateReport(!stateAccessVars.userCanViewAssessment);
    }

    generateTitle("Reporting");
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  getReportDownloadUrl = (format) => {
    const { organization, program, set } = this.props;

    let oId = organization ? organization.id : null;
    let pId = program ? program.id : null;
    let sId = set ? set.id : null;

    if (oId && pId && sId) {
      return `/app/programs/${pId}/organizations/${oId}/sets/${sId}/report/download/${format}`;
    }
    return null;
  };

  /**
   * Run access checks. Does _not_ appply them to state.
   *
   * Returns object with updated state vars to be applied via
   * setState. Calling code must apply them.
   *
   * @returns {object}
   */
  checkAccess = () => {
    const { currentUser, organization } = this.props;

    let userCanEditAssessment = userCan(currentUser, organization, "edit_assessment");
    let userCanViewAssessment = userCan(currentUser, organization, "view_assessment");
    let userCanViewActionPlan = userCan(currentUser, organization, "view_action_plan");

    return {
      accessChecked: true,
      userCanEditAssessment,
      userCanViewAssessment,
      userCanViewActionPlan,
    };
  };

  /**
   * Populate state.report.
   *
   * You must check access before calling this.
   *
   * @param {boolean} clear
   *  If false, the report-related state vars are simply unset
   *  to be empty values.
   */
  populateReport = (clear = false) => {
    const { organization, set } = this.props;

    if (clear) {
      this.setState({
        reportLoading: false,
        reportError: false,
        report: null,
      });
    } else {
      this.setState({
        reportLoading: true,
        reportError: false,
        report: null,
      });

      requestOrganizationSetReport(organization.id, set.id)
        .then((res) => {
          if (!this.isCancelled) {
            this.setState({
              reportLoading: false,
              reportError: false,
              report: this.groupByModule(res.data.data),
            });
          }
          // @TODO catch errors
        })
        .catch((error) => {
          if (!this.isCancelled) {
            this.setState({
              responsesLoading: false,
              reportError: true,
              report: null,
            });
            console.error("An error occurred retrieving report.");
          }
        });
    }
  };

  /**
   * Group report records by module.
   *
   * @param {array} reportData
   * @return {array}
   *  Returns array of objects. Each object contains two properties: `module`
   *  (a module object or null) and `criterionInstances` (array of CIs that
   *  belong to that module). API result are already sorted so no additional
   *  sorting is appied here.
   */
  groupByModule = (reportData) => {
    let grouped = [];
    let prevModuleId = undefined;
    let i;

    for (i = 0; i < reportData.length; i++) {
      var ci = reportData[i];
      var ciModuleId = !isNil(ci.module_id) ? ci.module_id : null;
      var ciModule = !isNil(ci.module) ? ci.module : null;
      // If this is the first pass or the previous CI module was different,
      // add a new element to results.
      if (grouped.length === 0 || prevModuleId !== ciModuleId) {
        grouped.push({
          module: ciModule,
          criterionInstances: [ci],
        });
        // Otherwise, we append the CI to the most recent object.
      } else {
        grouped[grouped.length - 1].criterionInstances.push(ci);
      }
      prevModuleId = ciModuleId;
    }
    return grouped;
  };

  handlePrintClick = (e) => {
    e.preventDefault();
    window.print();
  };

  /**
   * Get path to a question detail page for the current organization.
   *
   * @param {object} criterionInstance
   * @returns {string|null}
   *  Returns path string if user can view assessment. Otherwise, null.
   */
  questionDetailPath = (criterionInstance) => {
    const { program, organization } = this.props;
    const { userCanViewAssessment } = this.state;

    if (!isEmpty(criterionInstance)) {
      let programId = get(program, "id", null);
      let organizationId = get(organization, "id", null);
      let criterionInstanceId = get(criterionInstance, "id", null);
      let setId = get(criterionInstance, "set_id", null);
      if (userCanViewAssessment && programId && organizationId && criterionInstanceId && setId) {
        return `/app/programs/${programId}/organizations/${organizationId}/sets/${setId}/questions/${criterionInstanceId}`;
      }
    }
    return null;
  };

  /**
   * Get path to an action item page for the current organization.
   *
   * @param {object} planItem
   * @returns {string|null}
   *  Returns path string if user can view plan and planItem is
   *  a populated object. Otherwise, null.
   */
  planItemDetailPath = (planItem) => {
    const { organization } = this.props;
    const { userCanViewActionPlan } = this.state;

    if (!isEmpty(planItem)) {
      let organizationId = get(organization, "id", null);
      let planItemId = get(planItem, "id", null);
      if (userCanViewActionPlan && organizationId && planItemId) {
        return `/app/account/organizations/${organizationId}/plan/items/${planItemId}`;
      }
    }
    return null;
  };

  render() {
    const { classes, organization, orgProgData, program, set } = this.props;
    const {
      accessChecked,
      report,
      reportError,
      reportLoading,
      userCanViewAssessment,
      userCanEditAssessment,
    } = this.state;

    if (!accessChecked || reportLoading) {
      return <CircularProgressGlobal />;
    } else if (isNil(report) || (accessChecked && !userCanViewAssessment)) {
      return <PageNotFound />;
    } else if (reportError) {
      return (
        <p>
          <em>An error occured retrieving the report.</em>
        </p>
      );
    }

    // Extract set/module-specific values from PO data.
    let moduleStatusData = {};

    if (!isNil(orgProgData.program.sets[set.id])) {
      // Get the set object from orgProgData that has stat data.
      let setForStats = orgProgData.program.sets[set.id];
      // Modules obj that will be keyed by module ID.
      moduleStatusData = !isNil(setForStats.modules) ? setForStats.modules : {};
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
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/report`}
          >
            Report
          </Breadcrumb>
        </Breadcrumbs>

        {/* PAGE TITLE ETC */}
        <h1>Reporting</h1>
        <p>
          {set.name} report for {organization.name}.
        </p>

        <div className="no-print">
          <Grid
            container
            spacing={Number(styleVars.gridSpacing)}
            className="print-without-grid-container-layout"
          >
            {/* DOWNLOAD LINK BLOCK */}
            <Grid item xs={12} sm={8}>
              <Paper className={clsx(classes.paper, classes.paperWithoutTable)}>
                <p>
                  Download or print this report:{" "}
                  <Link to={this.getReportDownloadUrl("xls")}>XLS</Link>
                  {" | "}
                  <Link to={this.getReportDownloadUrl("csv")}>CSV</Link>
                  {" | "}
                  <a href="#print" onClick={this.handlePrintClick}>
                    Print
                  </a>
                </p>
              </Paper>
            </Grid>
          </Grid>
        </div>

        <br className="only-print" />

        {/* LOOP OVER MODULES */}
        {report.map((modGroup, modGroupIdx) => {
          let progressBarValue = 0;
          let modId = get(modGroup, "module.id", null);
          if (modId && !isNil(moduleStatusData[modId])) {
            progressBarValue =
              (moduleStatusData[modId].actualResponses /
                moduleStatusData[modId].possibleResponses) *
              100;
          }
          let progressBarLink;
          if (!isEmpty(modGroup.criterionInstances)) {
            let firstCriterionId = get(modGroup.criterionInstances[0], "id", null);
            let programId = get(program, "id", "");
            let organizationId = get(organization, "id", "");
            let setId = get(modGroup, "module.set_id", "");
            progressBarLink = `/app/programs/${programId}/organizations/${organizationId}/sets/${setId}/questions/${firstCriterionId}`;
          }

          return (
            <React.Fragment key={`rprt_mod_group_${modGroupIdx}`}>
              <div className={clsx(classes.moduleSection, "print-without-page-break-inside")}>
                {modGroup.module && (
                  <React.Fragment>
                    {/* MODULE HEADER */}
                    <h3>{modGroup.module.name}</h3>
                    {/* MODULE STATUS */}
                    <div className="no-print">
                      <div style={{ marginBottom: ".2em" }}>
                        <ProgressBar
                          linkIfZero={userCanEditAssessment}
                          linkIfZeroText="Start this Topic"
                          linkIfZeroTo={progressBarLink}
                          value={progressBarValue}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                )}

                {/* MODULE QUESTIONS: When there are none */}
                {(isNil(modGroup.criterionInstances) || modGroup.criterionInstances.length < 1) && (
                  <Paper className={clsx(classes.paper, classes.paperWithoutTable)}>
                    <p>
                      <em>No applicable questions found in this topic.</em>
                    </p>
                  </Paper>
                )}

                {/* MODULE QUESTIONS: When there are some */}
                {!isNil(modGroup.criterionInstances) && (
                  <Paper className={classes.paper}>
                    <Table className={clsx(classes.reportModuleTable)}>
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={2}>Question</TableCell>
                          <TableCell className={classes.tdStatus} style={{ width: "110px" }}>
                            Status
                          </TableCell>
                          <TableCell>Action Item</TableCell>
                          <TableCell>Column</TableCell>
                          {/* @TODO
                            <TableCell>Tasks in Progress</TableCell>
                            <TableCell>Tasks Completed</TableCell>
                          */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {modGroup.criterionInstances.map((ci, ciIdx) => {
                          let planItem = get(ci, "plan_item", null);
                          let actionItemString = planItem ? "Yes" : "No";
                          let bucketName = "-";
                          if (planItem) {
                            bucketName = get(ci, "plan_item.bucket.name", null);
                            if (!bucketName) {
                              bucketName = "To work on";
                            }
                          }

                          let ciHref = this.questionDetailPath(ci);
                          let piHref = this.planItemDetailPath(planItem);

                          return (
                            <TableRow key={`rprt_mod_group_ci_${ciIdx}`}>
                              <TableCell className={classes.tdHandle}>
                                <div className={classes.typeHandle}>
                                  {ciHref ? (
                                    <Link to={ciHref} className={classes.linkAsNotALink}>
                                      {ci.handle}
                                    </Link>
                                  ) : (
                                    <React.Fragment>{ci.handle}</React.Fragment>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={classes.tdName}>
                                <div className={classes.typeName}>
                                  {ciHref ? (
                                    <Link to={ciHref} className={classes.linkAsNotALink}>
                                      {ci.criterion.name}
                                    </Link>
                                  ) : (
                                    <React.Fragment>{ci.criterion.name}</React.Fragment>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className={classes.tdStatus}>
                                {ci.most_recent_response.length === 0 && (
                                  <div className={classes.typeCell}>Unanswered</div>
                                )}
                                {ci.most_recent_response.length === 1 && (
                                  <div className={classes.typeCell}>
                                    {ci.most_recent_response[0].response_value.label}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className={classes.typeCell}>
                                  {piHref ? (
                                    <Link to={piHref} className={classes.linkAsNotALink}>
                                      {actionItemString}
                                    </Link>
                                  ) : (
                                    <React.Fragment>{actionItemString}</React.Fragment>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={classes.typeCell}>{bucketName}</div>
                              </TableCell>
                              {/* @TODO
                              <TableCell>
                                <div className={classes.typeCell}>
                                  {tasksInProgress}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={classes.typeCell}>
                                  {tasksCompleted}
                                </div>
                              </TableCell>
                              */}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </div>
              <br className="only-print" />
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  linkAsNotALink: {
    color: styleVars.txtColorDefault,
    textDecoration: "none",
    "&:link": { color: styleVars.txtColor },
    "&:visited": { color: styleVars.txtColor },
    "&:hover": { color: styleVars.txtColor },
    "&:active": { color: styleVars.txtColor },
    "&:focus": { color: styleVars.txtColor },
  },
  paper: {
    width: "100%",
  },
  paperWithoutTable: {
    padding: theme.spacing(2),
  },
  reportModuleTable: {
    width: "100%",
  },
  moduleSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  statusIndicator: {
    marginBottom: theme.spacing(),
  },
  tdHandle: {
    paddingRight: "2px",
    width: "70px",
  },
  tdName: {},
  tdStatus: {
    paddingRight: "2px",
    width: "110px",
    [theme.breakpoints.up("sm")]: {
      width: "180px",
    },
  },
  typeHandle: {
    fontSize: theme.typography.fontSize - 4,
    whiteSpace: "nowrap",
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.fontSize,
    },
  },
  typeName: {
    fontSize: theme.typography.fontSize - 2,
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.fontSize,
    },
  },
  typeCell: {
    fontSize: theme.typography.fontSize - 4,
    [theme.breakpoints.up("sm")]: {
      fontSize: theme.typography.fontSize,
    },
  },
});

export default compose(
  withRouter,
  connect(
    ({ auth }) => ({
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(SetReport));
