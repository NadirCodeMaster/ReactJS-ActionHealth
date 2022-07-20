import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import PropTypes from "prop-types";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import CriterionResources from "components/views/CriterionResources";
import CriterionForm from "./CriterionForm";
import CriterionSavedResponse from "./CriterionSavedResponse";
import CriterionExperts from "./CriterionExperts";
import HgSkeleton from "components/ui/HgSkeleton";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

/**
 * Question detail component for response selection
 */
class Question extends Component {
  static propTypes = {
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    addingPlanItem: PropTypes.bool,
    criterionInstance: PropTypes.object,
    parentSuggestionLabel: PropTypes.string,
    planItemLoading: PropTypes.bool,
    planItem: PropTypes.object,
    responseStructure: PropTypes.object,
    userCanEditActionPlan: PropTypes.bool,
    userCanViewActionPlan: PropTypes.bool,
    populatedCriterionInstances: PropTypes.bool,
    prevCriterionInstance: PropTypes.object,
    nextCriterionInstance: PropTypes.object,
    savedResponseLoaded: PropTypes.bool,
    savedResponseLoading: PropTypes.bool,
    savedResponseError: PropTypes.bool,
    savedResponse: PropTypes.object,
    draftResponseValue: PropTypes.string,
    saving: PropTypes.bool,
    savingError: PropTypes.bool,
    accessChecked: PropTypes.bool,
    parentResponse: PropTypes.object,
    parentResponseLoaded: PropTypes.bool,
    parentResponseLoading: PropTypes.bool,
    resources: PropTypes.array,
    resourcesLoading: PropTypes.bool,
    resourcesLoaded: PropTypes.bool,
    userFunctions: PropTypes.array,
    userFunctionsLoading: PropTypes.bool,
    userFunctionsLoaded: PropTypes.bool,
    userCanEdit: PropTypes.bool,
    userCanView: PropTypes.bool,
    loadingUser: PropTypes.bool,
    statusName: PropTypes.string,
    statusDate: PropTypes.string,
    statusUpdatedByStr: PropTypes.string,
    appMeta: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
    history: PropTypes.object,
    location: PropTypes.object,
    height: PropTypes.number,
    width: PropTypes.number,
  };

  constructor(props) {
    super(props);

    // When the component is rendered with a width smaller than this
    // px value, we'll adjust certain styles.
    this.maxSmall = 800;

    this.isCancelled = false;

    this.state = {};
  }

  componentDidMount() {
    // Scroll to top on mount.
    // EX 1: navigation between routes like `/questions/1` to `questions/2`
    //       when clicking `Save and Next`
    // EX 2: navigation to the question detail page from  set detail page
    //       (`app/programs/1/organizations/1/sets/1`)
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    const { criterionInstanceId } = this.props;
    const { criterionInstanceId: prevCriterionInstanceId } = prevProps;

    if (criterionInstanceId !== prevCriterionInstanceId) {
      // Scroll to top on mount.
      // EX 1: navigation between routes like `/questions/1` to `questions/2`
      //       when clicking `Save and Next`
      // EX 2: navigation to the question detail page from  set detail page
      //       (`app/programs/1/organizations/1/sets/1`)
      window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * @returns {object}
   */
  responseSkeletonScreen = () => {
    const { classes } = this.props;
    const skeletonResponseKeys = [0, 1, 2, 3];

    return (
      <React.Fragment>
        {skeletonResponseKeys.map((srk) => {
          return (
            <div className={classes.responseSkeletonContainer} key={srk}>
              <HgSkeleton variant="text" width={"15%"} />
              <HgSkeleton variant="text" />
              <HgSkeleton variant="text" />
              <HgSkeleton variant="text" />
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  /**
   * @returns {object} jsx for styling around criterion instance handle
   */
  handleBoxStyle = () => {
    const { theme, width } = this.props;
    let isSmallScreen = width <= this.maxSmall;

    return {
      backgroundColor: theme.palette.assessment.questionHandle,
      color: theme.palette.primary.contrastText,
      marginBottom: isSmallScreen ? theme.spacing(2) : 0,
      marginRight: isSmallScreen ? 0 : theme.spacing(2),
      padding: theme.spacing(2),
      textAlign: "center",
      whiteSpace: "nowrap",
    };
  };

  /**
   * @returns {object} jsx for styling header
   */
  headerStyle = () => {
    const { theme, width } = this.props;
    let isSmallScreen = width <= this.maxSmall;

    return {
      display: isSmallScreen ? "block" : "flex",
      alignItems: "center",
      fontSize: isSmallScreen ? 24 : theme.typography.h1.fontSize,
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(),
    };
  };

  render() {
    const {
      classes,
      organization,
      program,
      set,
      theme,
      criterionInstance,
      draftResponseValue,
      prevCriterionInstance,
      parentSuggestionLabel,
      planItemLoading,
      resources,
      resourcesLoaded,
      userFunctions,
      userFunctionsLoaded,
      savedResponse,
      savedResponseLoaded,
      savedResponseLoading,
      saving,
      userCanEdit,
      hasHandle,
      sortedOptions,
      parentResponseVal,
      responseStructureValues,
      feedback,
      hasParent,
      hasParentResponse,
      nextLabel,
      prevLabel,
      statusName,
      statusDate,
      statusUpdatedByStr,
      handleChangeResponse,
      handlePrevClick,
      handleNextClick,
      handleSaveClick,
      addToActionPlan,
      planItem,
      userCanEditActionPlan,
      userCanViewActionPlan,
    } = this.props;

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
            path={`/app/programs/${program.id}/organizations/${organization.id}/sets/${set.id}/questions/${criterionInstance.id}`}
          >
            {hasHandle && <React.Fragment>{criterionInstance.handle}</React.Fragment>}
            {!hasHandle && <React.Fragment>{criterionInstance.id}</React.Fragment>}
          </Breadcrumb>
        </Breadcrumbs>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <h1>
              <div style={this.headerStyle()}>
                <div style={this.handleBoxStyle()}>{criterionInstance.handle}</div>
                <div>{criterionInstance.criterion.name}</div>
              </div>
            </h1>
          </Grid>
          <Grid item xs={12} md={8}>
            <CriterionForm
              organization={organization}
              theme={theme}
              criterionInstance={criterionInstance}
              draftResponseValue={draftResponseValue}
              prevCriterionInstance={prevCriterionInstance}
              parentSuggestionLabel={parentSuggestionLabel}
              planItemLoading={planItemLoading}
              savedResponseLoaded={savedResponseLoaded}
              savedResponseLoading={savedResponseLoading}
              saving={saving}
              userCanEdit={userCanEdit}
              sortedOptions={sortedOptions}
              parentResponseVal={parentResponseVal}
              responseStructureValues={responseStructureValues}
              feedback={feedback}
              hasParent={hasParent}
              hasParentResponse={hasParentResponse}
              nextLabel={nextLabel}
              prevLabel={prevLabel}
              handleChangeResponse={handleChangeResponse}
              handlePrevClick={handlePrevClick}
              handleNextClick={handleNextClick}
              handleSaveClick={handleSaveClick}
              addToActionPlan={addToActionPlan}
              planItem={planItem}
              userCanEditActionPlan={userCanEditActionPlan}
              userCanViewActionPlan={userCanViewActionPlan}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper className={classes.rightGridPaper}>
              <CriterionSavedResponse
                savedResponseLoading={savedResponseLoading}
                savedResponse={savedResponse}
                statusName={statusName}
                statusDate={statusDate}
                statusUpdatedByStr={statusUpdatedByStr}
                addToActionPlan={addToActionPlan}
                organization={organization}
                criterionInstance={criterionInstance}
                planItem={planItem}
                planItemLoading={planItemLoading}
                userCanEditActionPlan={userCanEditActionPlan}
                userCanViewActionPlan={userCanViewActionPlan}
              />
            </Paper>
            {userFunctionsLoaded && userFunctions && userFunctions.length > 0 && (
              <Paper className={classes.rightGridPaper}>
                <CriterionExperts
                  criterionInstance={criterionInstance}
                  userFunctions={userFunctions}
                />
              </Paper>
            )}
            {resourcesLoaded && resources && resources.length > 0 && (
              <Paper className={classes.rightGridPaper}>
                <h3>Related resources</h3>
                <CriterionResources
                  criterionId={criterionInstance.criterion_id}
                  callerResources={resources}
                />
              </Paper>
            )}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  responseSkeletonContainer: {
    margin: theme.spacing(0, 0, 3, 0),
  },
  rightGridPaper: {
    marginBottom: theme.spacing(),
    padding: styleVars.paperPadding,
  },
});

export default compose(
  withRouter,
  withResizeDetector,
  connect(
    ({ app_meta, auth }) => ({
      appMeta: app_meta,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(Question));
