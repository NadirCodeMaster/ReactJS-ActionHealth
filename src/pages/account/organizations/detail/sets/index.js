import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import AssessmentBoxPremium from "components/views/AssessmentBoxPremium";
import AssessmentBoxUnderstated from "components/views/AssessmentBoxUnderstated";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import ResponseActionBox from "components/views/ResponseActionBox";
import AssessmentInfoOverviewBox from "components/views/AssessmentInfoOverviewBox";
import generateTitle from "utils/generateTitle";
import { fetchContents } from "store/actions";
import filterContentMachineNames from "utils/filterContentMachineNames";
import { get, isEmpty } from "lodash";
import compareCurrentUserObjectIds from "utils/compareCurrentUserObjectIds";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape, organizationWithAvailableSetsShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

const componentContentMachineNames = ["assessments_tip_1_body", "assessments_tip_2_body"];

const premiumSetMachineName = "thriving_schools";

/**
 * Display information about sets available to an organization.
 */
class OrganizationSets extends Component {
  static propTypes = {
    organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
    // progressDataUpdated: Arbitrary changing value (typically
    //  a timestamp) to force re-rendering in components that might
    //  otherwise ignore to changes to progress data that's deeply
    //  nested in organization prop.
    progressDataUpdated: PropTypes.number,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);
    this.isCancelled = false;
    this.state = {
      userCanViewAssessment: false,
      userCanEditAssessment: false,
    };
  }

  componentDidMount() {
    const { organization } = this.props;
    this.checkAccess();
    this.addContentsToStore();
    generateTitle(`${organization.name}  Assessments`);
  }

  componentDidUpdate(prevProps, prevState) {
    const { currentUser, organization } = this.props;
    const { currentUser: prevCurrentUser, organization: prevOrganization } = prevProps;

    if (
      !compareCurrentUserObjectIds(currentUser, prevCurrentUser) ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      this.checkAccess();
      generateTitle(`${organization.name}  Assessments`);
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  /**
   * Perform org access checks required by this component.
   */
  checkAccess() {
    const { currentUser, organization } = this.props;

    let userCanViewAssessment = userCan(currentUser, organization, "view_assessment");
    let userCanEditAssessment = userCan(currentUser, organization, "edit_assessment");

    if (!this.isCancelled) {
      this.setState({
        userCanViewAssessment,
        userCanEditAssessment,
      });
    }
  }

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

  render() {
    const { classes, organization, width } = this.props;
    const { userCanViewAssessment } = this.state;

    if (!organization) {
      return <CircularProgressGlobal />;
    }

    if (!userCanViewAssessment) {
      return <PageNotFound />;
    }

    let hasSets = organization.available_sets && organization.available_sets.length > 0;
    let sets = hasSets ? organization.available_sets : [];

    let sizeStr = width > maxSmWidth ? "lg" : "sm";

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/account" root>
            Account
          </Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${organization.id}`}>
            {organization.name}
          </Breadcrumb>
          <Breadcrumb path={`/app/account/organizations/${organization.id}/sets`}>
            Assessments
          </Breadcrumb>
        </Breadcrumbs>

        <h1>Assessments</h1>

        <Grid container spacing={Number(styleVars.gridSpacing)} className={classes.upperArea}>
          <Grid item xs={12} sm={6}>
            <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
              <ResponseActionBox
                premiumSetMachineName={premiumSetMachineName}
                organization={organization}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper style={{ padding: styleVars.paperPadding, height: "100%" }}>
              <AssessmentInfoOverviewBox organization={organization} />
            </Paper>
          </Grid>
        </Grid>

        <h2>Available Assessments</h2>

        {!hasSets ? (
          <p>
            <em>No assessments are currently available for this organization.</em>
          </p>
        ) : (
          <div className={classes.setContainer}>
            {sets.map((_set, idx) => {
              let programMachineName = get(_set, "program.machine_name", "");

              if (idx === 0 && programMachineName === premiumSetMachineName) {
                return (
                  <div
                    key={`assessmentBoxPremium_${idx}`}
                    className={clsx(classes.setPrimary, sizeStr)}
                  >
                    <AssessmentBoxPremium
                      assessment={_set}
                      userCanViewSet={userCanViewAssessment}
                      orgId={organization.id}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={`assessmentBoxUndestated_${idx}`}
                  className={clsx(classes.setSecondary, sizeStr)}
                >
                  <AssessmentBoxUnderstated
                    assessment={_set}
                    userCanViewSet={userCanViewAssessment}
                    orgId={organization.id}
                  />
                </div>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  setContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  setPrimary: {
    flex: "100%",
    marginBottom: theme.spacing(),
  },
  setSecondary: {
    "&.lg": {
      width: "49.6%",
      display: "flex",
    },
    "&.sm": {
      width: "100%",
    },
    marginBottom: theme.spacing(),
  },
  upperArea: {
    marginBottom: theme.spacing(3),
  },
  setHeader: {
    fontWeight: "normal",
    padding: styleVars.paperPadding,
    margin: 0,
  },
  setDescription: {
    backgroundColor: "#F9FAFB", // @TODO Centralize/standardize this value (from mock)
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    borderTop: `2px solid ${styleVars.colorLightGray}`,
    padding: styleVars.paperPadding,
  },
  setFooter: {
    padding: styleVars.paperPadding,
  },
  setProgressLabel: {
    color: styleVars.colorSecondary,
    fontSize: "10px", // @TODO Define a stndardized value that's this small.
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    textTransform: "uppercase",
  },
  actionPlanBoxBody: {
    marginTop: theme.spacing(),
  },
  actionPlanBoxLink: {
    marginTop: theme.spacing(),
  },
});

const maxSmWidth = 550;

const mapStateToProps = (state) => {
  return {
    contents: state.contents,
    currentUser: state.auth.currentUser,
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
)(withResizeDetector(withStyles(styles, { withTheme: true })(OrganizationSets)));
