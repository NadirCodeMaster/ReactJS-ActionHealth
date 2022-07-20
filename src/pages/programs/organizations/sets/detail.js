import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { find, filter, get, isEmpty, isNil } from "lodash";
import { Paper, Grid } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import PageNotFound from "components/views/PageNotFound";
import AssessmentTopicsTable from "components/views/AssessmentTopicsTable";
import AssessmentActionBox from "components/views/AssessmentActionBox";
import OtherStepsBox from "components/views/OtherStepsBox";
import AssessmentWorksheetBox from "components/views/AssessmentWorksheetBox";
import { requestSetResponses } from "api/requests";
import generateTitle from "utils/generateTitle";
import programBranding from "utils/programBranding";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const premiumSetMachineName = "thriving_schools";

/**
 * Assessment "dashboard" page for a given organization.
 *
 * Assessments are Set records.
 */
class Set extends Component {
  static propTypes = {
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
    appMeta: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      userCanView: false,
      userCanInvite: false,
      userCanEdit: false,
      responsesLoading: false,
      responsesError: false,
      responses: [],
    };
  }

  /**
   * Setup user permissions for organization.
   */
  checkPerms(org) {
    const { currentUser } = this.props;

    let allowView = userCan(currentUser, org, "view_assessment");
    let allowInvite = userCan(currentUser, org, "invite_team_member");
    let allowEdit = userCan(currentUser, org, "edit_assessment");

    this.setState({
      userCanView: allowView,
      userCanInvite: allowInvite,
      userCanEdit: allowEdit,
    });
  }

  componentDidMount() {
    const { organization, refreshOrgStats, responsesHaveChanged, set } = this.props;

    this.checkPerms(organization);

    if (set) {
      generateTitle(set.name);
    }

    if (responsesHaveChanged) {
      refreshOrgStats();
    }

    this.populateResponses();
  }

  componentDidUpdate(prevProps) {
    const { currentUser, organization, refreshOrgStats, responsesHaveChanged, set } = this.props;
    const {
      currentUser: prevCurrentUser,
      organization: prevOrganization,
      responsesHaveChanged: prevResponsesHaveChanged,
      set: prevSet,
    } = prevProps;

    // Recheck perms if org or user changes.
    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      this.checkPerms(organization);
    }

    if (set !== prevSet || !compareObjectIds(organization, prevOrganization)) {
      this.populateResponses();
      generateTitle(set.name);
    }

    // Refresh stats if requested.
    if (responsesHaveChanged && responsesHaveChanged !== prevResponsesHaveChanged) {
      refreshOrgStats();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Finds orgSet correlated to set.id
   * @returns {object} orgSet
   */
  findThisOrgSet = () => {
    const { orgSetsData, set } = this.props;
    return find(orgSetsData, (s) => {
      return Number(s.id) === Number(set.id);
    });
  };

  /**
   * Retrieve the organization responses for set, add to state.
   */
  populateResponses = () => {
    const { organization, set } = this.props;

    this.setState({ responsesLoading: true });
    requestSetResponses(set.id, {
      organization_id: organization.id,
      per_page: 1000,
    })
      .then((res) => {
        if (!this.isCancelled) {
          this.setState({
            responsesLoading: false,
            responsesError: false,
            responses: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            responsesLoading: false,
            responsesError: true,
            responses: [],
          });
          console.error("An error occurred retrieving responses.");
        }
      });
  };

  /**
   * Gets program specific branding based on machine name
   * @returns {Object|Null} JSX content or Null value
   */
  programBrandingOutput = () => {
    const { program, theme } = this.props;

    let programBrandingStyle = {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-start",
      marginBottom: theme.spacing(1.5),
    };

    return programBranding(program.machine_name, programBrandingStyle);
  };

  getSetSummaryLink = (ci) => {
    const { program, organization } = this.props;

    let firstCriterionId = get(ci, "id", null);
    let programId = get(program, "id", "");
    let organizationId = get(organization, "id", "");
    let setId = get(ci, "set_id", "");
    return `/app/programs/${programId}/organizations/${organizationId}/sets/${setId}/questions/${firstCriterionId}`;
  };

  render() {
    const { appMeta, currentUser, classes, organization, orgProgData, program, set } = this.props;
    const { responsesLoading, responsesError, responses, userCanView, userCanInvite } = this.state;

    if (!currentUser || !organization || !program) {
      return null;
    }
    if (!userCanView) {
      return <PageNotFound />;
    }

    let orgSet = this.findThisOrgSet();
    let modLength = orgSet.modules.length;

    let firstCriterionInstance = get(orgSet, "criterion_instances[0]", {});
    let setSummaryLink = "";
    if (!isEmpty(firstCriterionInstance)) {
      setSummaryLink = this.getSetSummaryLink(firstCriterionInstance);
    }

    // If there's nothing in orgSetsData, the org
    // probably isn't of the correct type for the
    // assessment or there are no published questions
    // that are applicable to them (such as may occur
    // if their grade level doesn't align).
    // (edge case)
    if (isNil(orgSet) || !orgSet.criterion_instances || isEmpty(orgSet.criterion_instances)) {
      return (
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <p>Sorry, we're not able to display assessment information for {organization.name}.</p>
            <p>
              Please contact{" "}
              <a href="mailto:help@healthiergeneration.org">help@healthiergeneration.org</a> for
              assistance.
            </p>
          </Grid>
        </Grid>
      );
    } else if (isNil(orgSet.modules)) {
      orgSet.modules = [];
    }

    // Extract set-specific values from PO data.
    let setPossibleResp = 0;
    let setActualResp = 0;

    if (!isNil(orgProgData.program.sets[set.id])) {
      // Get the set object from orgProgData that has stat data.
      let setForStats = orgProgData.program.sets[set.id];

      // Modules obj that will be keyed by module ID.
      setPossibleResp = setForStats.possibleResponses;
      setActualResp = setForStats.actualResponses;
    }

    let orgTypesData = appMeta.data.organizationTypes;
    let organizationType = orgTypesData[organization.organization_type_id];

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
        </Breadcrumbs>

        <h1>{set.name}</h1>
        {this.programBrandingOutput()}

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
              <AssessmentActionBox
                organization={organization}
                organizationType={organizationType}
                premiumSetMachineName={premiumSetMachineName}
                program={program}
                setActualResponses={setActualResp}
                setObj={set}
                setPossibleResponses={setPossibleResp}
                setSummaryLink={setSummaryLink}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* Sidebar links  */}
            <Paper
              style={{
                paddingTop: styleVars.paperPadding,
                paddingBottom: styleVars.paperPadding,
                height: "100%",
              }}
            >
              <OtherStepsBox
                assessment={set}
                userCanInvite={userCanInvite}
                organization={organization}
                orgTypesData={orgTypesData}
              />
            </Paper>
          </Grid>

          {!isEmpty(set.worksheet_url) && (
            <Grid item xs={12}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <AssessmentWorksheetBox worksheetUrl={set.worksheet_url} />
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <h3>Assessment Questions grouped by Topic</h3>
              {orgSet.modules.map((mod, index) => {
                let criterionInstances = get(orgSet, "criterion_instances", []);
                let isLast = modLength === index + 1;
                let filteredCI = filter(criterionInstances, {
                  module_id: mod.id,
                });

                return (
                  <div
                    key={`topicTableWrapper_${index}`}
                    className={!isLast ? classes.assessmentTopicsTableWrapper : null}
                  >
                    <AssessmentTopicsTable
                      set={set}
                      mod={mod}
                      criterionInstances={filteredCI}
                      orgProgData={orgProgData}
                      responsesLoading={responsesLoading}
                      responsesError={responsesError}
                      responses={responses}
                      orgId={organization.id}
                      progId={program.id}
                    />
                  </div>
                );
              })}
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  noCriterion: {
    margin: theme.spacing(2),
  },
  noCriterionText: {
    fontStyle: "italic",
  },
  expansionHead: {
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
  },
  expansionTopicContainer: {
    flexGrow: 0.2,
  },
  expansionTopic: {
    marginLeft: theme.spacing(2),
    color: "#707070",
    fontSize: 10,
    textTransform: "uppercase",
  },
  expansionExpandAll: {
    color: "#E13F00",
    display: "flex",
    alignItems: "center",
    fontSize: 10,
    marginRight: theme.spacing(2),
    textTransform: "uppercase",
    cursor: "pointer",
  },
  accordion: {
    marginBottom: "1em",
  },
  expansionSummary: {
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
  },
  summaryDescription: {
    maxWidth: "600px",
    padding: styleVars.paperPadding,
  },
  centerIcon: {
    verticalAlign: "middle",
    fontSize: "1em",
    height: "1em",
    color: styleVars.colorPrimaryWithMoreContrast,
    paddingRight: ".1em",
    width: "auto",
  },
  summaryName: {
    alignItems: "center",
    display: "flex",
    width: "45%",
    marginRight: "1em",
    textOverflow: "ellipsis",
  },
  moduleName: {
    fontSize: "14px",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    margin: 0,
  },
  accordionDetails: {
    padding: 0,
  },
  accordionDetailsContent: {
    width: "100%",
  },
  tableHeadLeft: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(4),
    color: "#707070",
    fontSize: 10,
  },
  tableHeadRight: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.25),
    paddingRight: theme.spacing(4),
    color: "#707070",
    fontSize: 10,
  },
  tableHeadRow: {
    background: "#F3F5F7",
  },
  criterionInstanceHandle: {
    color: "#E13F00",
    fontWeight: styleVars.txtFontWeightDefaultBold,
    paddingLeft: theme.spacing(4),
    whiteSpace: "nowrap",
  },
  criterionInstanceStatusLabel: {
    paddingRight: theme.spacing(4),
  },
  statusContainer: {
    width: "44%",
    display: "flex",
    justifyContent: "center",
  },
  statusInner: {
    width: "100%",
    alignSelf: "center",
  },
  assessmentTopicsTableWrapper: {
    marginBottom: theme.spacing(),
  },
});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      appMeta: app_meta,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(Set));
