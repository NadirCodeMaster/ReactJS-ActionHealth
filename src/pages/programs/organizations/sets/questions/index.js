import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { withResizeDetector } from "react-resize-detector/build/withPolyfill";
import PropTypes from "prop-types";
import moment from "moment";
import { each, find, get, isEmpty, isNil, isString, sortBy, trim, toString } from "lodash";
import { withStyles } from "@mui/styles";
import PageNotFound from "components/views/PageNotFound";
import QuestionDetail from "./components/detail.js";
import {
  requestCreatePlanItem,
  requestOrganizationPlanItems,
  requestCreateResponse,
  requestCriterionResources,
  requestOrganizationResponses,
  requestCriterionUserFunctions,
} from "api/requests";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import extractSetFromOrgSetsData from "utils/orgSetsData/extractSetFrom";
import errorSuffix from "utils/errorSuffix";
import compareObjectIds from "utils/compareObjectIds";
import userCan from "utils/userCan";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

/**
 * QuestionController component for API calls and state handling for detail page
 */
class QuestionController extends Component {
  static propTypes = {
    criterionInstanceId: PropTypes.number.isRequired,
    orgProgData: PropTypes.object.isRequired,
    orgSetsData: PropTypes.array.isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    // Method to call when a response is added/updated so
    // components that need the latest info know to ask for it.
    declareResponsesHaveChanged: PropTypes.func,
    appMeta: PropTypes.object,
    currentUser: PropTypes.shape(currentUserShape),
    history: PropTypes.object, // Via withRouter
    location: PropTypes.object, // Via withRouter
    height: PropTypes.number, // Via withResizeDetector
    width: PropTypes.number, // Via withResizeDetector
  };

  constructor(props) {
    super(props);

    // When the component is rendered with a width smaller than this
    // px value, we'll adjust certain styles.
    this.maxSmall = 800;

    this.isCancelled = false;

    this.state = {
      addingPlanItem: false,
      criterionInstance: null,
      parentSuggestionLabel: "",
      planItemLoading: false,
      planItem: null,
      responseStructure: null,
      userCanEditActionPlan: false,
      userCanViewActionPlan: false,
      populatedCriterionInstances: false,
      prevCriterionInstance: null, // prev question (if any)
      nextCriterionInstance: null, // next question (if any)
      savedResponseLoaded: false,
      savedResponseLoading: false,
      savedResponseError: false,
      savedResponse: null,
      draftResponseValue: null,
      saving: false,
      savingError: false,
      accessChecked: false,
      parentResponse: null,
      parentResponseLoaded: false,
      parentResponseLoading: false,
      resources: null,
      resourcesLoading: false,
      resourcesLoaded: false,
      userFunctions: null,
      userFunctionsLoading: false,
      userFunctionsLoaded: false,
      userCanEdit: false,
      userCanView: false,
      loadingUser: false,
      statusName: "",
      statusDate: null,
      statusUpdatedByStr: "",
    };
  }

  componentDidMount() {
    const { currentUser, organization, criterionInstanceId, orgSetsData } = this.props;

    // Determine current user access.
    let canEdit = userCan(currentUser, organization, "edit_assessment");
    let canView = canEdit ? true : false;
    if (!canView) {
      canView = userCan(currentUser, organization, "view_assessment");
    }
    if (!this.isCancelled) {
      this.setState({
        accessChecked: true,
        userCanEdit: canEdit,
        userCanView: canView,
      });
    }

    if (orgSetsData && criterionInstanceId) {
      this.populateRelatedStateValues();
    }
    this.populateParentSuggestionLabel();

    // Populate prev, next and current criterionInstances
    // in component state.
    this.populateCriterionInstances();

    // Scroll to top on mount.
    // EX 1: navigation between routes like `/questions/1` to `questions/2`
    //       when clicking `Save and Next`
    // EX 2: navigation to the question detail page from  set detail page
    //       (`app/programs/1/organizations/1/sets/1`)
    window.scrollTo(0, 0);
  }

  componentDidUpdate(prevProps, prevState) {
    const { criterionInstanceId, organization, orgSetsData } = this.props;
    const {
      orgSetsData: prevOrgSetsData,
      criterionInstanceId: prevCriterionInstanceId,
      organization: prevOrganization,
    } = prevProps;
    const {
      criterionInstance,
      populatedCriterionInstances,
      savedResponseLoaded,
      savedResponseLoading,
      savedResponseError,
    } = this.state;
    const { criterionInstance: prevCriterionInstance } = prevState;

    // Populate savedResponse in component state when we
    // first detect the CI has been populated.
    if (
      !savedResponseLoaded &&
      !savedResponseLoading &&
      !savedResponseError &&
      populatedCriterionInstances &&
      criterionInstance
    ) {
      this.getSavedResponse();
      this.getParentResponse();
    }

    // If orgSetsData prop changes, we need to repop the
    // current, prev, next CIs
    if (orgSetsData !== prevOrgSetsData) {
      this.populateCriterionInstances();
    }

    // If CI or org changes, repopulate related state values.
    if (
      criterionInstanceId !== prevCriterionInstanceId ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      if (orgSetsData && criterionInstanceId) {
        this.populateRelatedStateValues();
      }
    }

    if (criterionInstanceId !== prevCriterionInstanceId) {
      // Scroll to top on mount.
      // EX 1: navigation between routes like `/questions/1` to `questions/2`
      //       when clicking `Save and Next`
      // EX 2: navigation to the question detail page from  set detail page
      //       (`app/programs/1/organizations/1/sets/1`)
      window.scrollTo(0, 0);
    }

    if (
      criterionInstance !== prevCriterionInstance ||
      !compareObjectIds(organization, prevOrganization)
    ) {
      if (criterionInstance && organization) {
        this.populatePlanItem(organization, criterionInstance.criterion_id);
        this.populateParentSuggestionLabel();
      }
    }

    if (criterionInstance && criterionInstance.criterion) {
      generateTitle(criterionInstance.criterion.name);
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Set various values in this.state based on provided props.
   *
   * Includes access checks that aren't already covered by
   * calling code.
   */
  populateRelatedStateValues() {
    const { appMeta, currentUser, criterionInstanceId, organization, orgSetsData, set } =
      this.props;

    // Access checks.
    // ----
    // @TODO The individual option_x files should consolidate
    // their access checks into this file (or rely on checks that
    // have already been done by code calling this component).
    // ----
    let userCanViewActionPlan = userCan(currentUser, organization, "view_action_plan");
    let userCanEditActionPlan = userCan(currentUser, organization, "edit_action_plan");

    let setData = extractSetFromOrgSetsData(orgSetsData, set.id);

    let criterionInstance = find(setData.criterion_instances, (ci) => {
      return Number(ci.id) === Number(criterionInstanceId);
    });

    let responseStructureId = get(criterionInstance.criterion, "response_structure_id", "");

    let responseStructure = get(appMeta.data.responseStructures, responseStructureId, "");

    this.setState({
      criterionInstance: criterionInstance,
      responseStructure: responseStructure,
      userCanViewActionPlan,
      userCanEditActionPlan,
    });
  }

  /**
   * Set the parentSuggestionLabel state value based on organization prop.
   *
   * This is one of the few spots we'll hard-code orgtype-specific values.
   */
  populateParentSuggestionLabel() {
    const { appMeta, organization } = this.props;
    const { parentSuggestionLabel } = this.state;

    try {
      let orgType = appMeta.data.organizationTypes[organization.organization_type_id];
      let msg = "";
      switch (orgType.machine_name) {
        case "school":
          msg = "District response";
          break;
        default:
          msg = "Overseeing organization response";
      }
      if (parentSuggestionLabel !== msg) {
        // Only set it if it changed.
        this.setState({ parentSuggestionLabel: msg });
      }
    } catch (e) {
      console.error("Failed to set parent org suggestion label.", e);
    }
  }

  /**
   * Add criterion to org's action plan.
   */
  addToActionPlan = (organization, criterionId, shouldSave) => {
    this.setState({ addingPlanItem: true });

    let newItem = {
      organization_id: organization.id,
      criterion_id: criterionId,
    };
    requestCreatePlanItem(newItem)
      .then((res) => {
        if (201 === res.status || 200 === res.status) {
          if (!this.isCancelled) {
            this.setState({ addingPlanItem: false });
            hgToast("Added to Action Plan");
            this.populatePlanItem(organization, criterionId);

            if (shouldSave) {
              this.saveResponse(null);
            }
          }
        }
      })
      .catch((err) => {
        if (!this.isCancelled) {
          this.setState({ addingPlanItem: false });
          hgToast("An error occurred adding this to Action Plan. " + errorSuffix(err), "error");
        }
      });
  };

  /**
   * Populate the action plan item for question this.state.
   *
   * @param {Object} organization
   * @param {Number} criterionId
   */
  populatePlanItem(organization, criterionId) {
    this.setState({ planItemLoading: true });

    requestOrganizationPlanItems(organization.id, {
      criterion_id: criterionId,
    })
      .then((res) => {
        let planItem = null;

        if (200 === res.status) {
          if (res.data && res.data.data && res.data.data.length > 0) {
            planItem = res.data.data[0];
          }
        }
        if (!this.isCancelled) {
          this.setState({
            planItemLoading: false,
            planItem: planItem,
          });
        }
      })
      .catch((err) => {
        console.error("Unable to retrieve plan item results.");
        if (!this.isCancelled) {
          this.setState({
            planItemLoading: false,
            planItem: null,
          });
        }
      });
  }

  /**
   * Sets the current, prev and next CIs in component state.
   */
  populateCriterionInstances = () => {
    const { criterionInstanceId, orgSetsData, set } = this.props;

    // Populate prev, next and current criterionInstances via
    // orgSetsData (which has org-applicable CIs in the set
    // objects). We can only do this if orgSetsData is populated,
    // so confirm that before proceeding.
    let hydratedSet = null;
    let currentCi = null;
    let prevCi = null;
    let prevIndex = null;
    let nextCi = null;
    let nextIndex = null;

    if (isNil(orgSetsData) || isEmpty(orgSetsData)) {
      return;
    }

    hydratedSet = find(orgSetsData, (s) => {
      return Number(s.id) === Number(set.id);
    });

    if (isNil(hydratedSet) || isEmpty(hydratedSet)) {
      return;
    }

    currentCi = find(hydratedSet.criterion_instances, (ci) => {
      return Number(ci.id) === Number(criterionInstanceId);
    });

    each(hydratedSet.criterion_instances, (ci, index) => {
      // If current iteration is current CI, return the previous.
      if (Number(ci.id) === Number(criterionInstanceId)) {
        prevIndex = index - 1;
        if (!isNil(hydratedSet.criterion_instances[prevIndex])) {
          prevCi = hydratedSet.criterion_instances[prevIndex];
        }
      }
    });

    each(hydratedSet.criterion_instances, (ci, index) => {
      // If current iteration is current CI, return the next.
      if (Number(ci.id) === Number(criterionInstanceId)) {
        nextIndex = index + 1;
        if (!isNil(hydratedSet.criterion_instances[nextIndex])) {
          nextCi = hydratedSet.criterion_instances[nextIndex];
        }
      }
    });

    if (!this.isCancelled) {
      this.setState({
        criterionInstance: currentCi,
        prevCriterionInstance: prevCi ? prevCi : null,
        nextCriterionInstance: nextCi ? nextCi : null,
        populatedCriterionInstances: true,
      });
    }

    this.loadResources(currentCi);
    this.loadUserFunctions(currentCi);
  };

  // Retrieve the parent response value (if any).
  getParentResponse = () => {
    const { organization } = this.props;
    const { criterionInstance } = this.state;
    if (isNil(organization.parent_id) || isNil(criterionInstance)) {
      return;
    }
    if (!this.isCancelled) {
      this.setState({ parentResponseLoading: true });
    }

    requestOrganizationResponses(organization.parent_id, {
      criterion_id: criterionInstance.criterion_id,
      per_page: 1,
    })
      .then((res) => {
        let resp = find(res.data.data, (r) => {
          return Number(r.criterion_id) === Number(criterionInstance.criterion_id);
        });
        if (!this.isCancelled) {
          this.setState({
            parentResponseLoaded: true,
            parentResponseLoading: false,
            parentResponse: isNil(resp) ? null : resp,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            parentResponseLoading: false,
            parentResponseError: true,
            parentResponse: null,
          });
          console.error("An error occurred retrieving parent response.");
        }
      });
  };

  // Retrieve the saved response value (if any).
  //
  // Also overwrites draftResponseValue.
  getSavedResponse = () => {
    const { organization } = this.props;
    const { criterionInstance } = this.state;
    if (isNil(criterionInstance)) {
      return;
    }
    if (!this.isCancelled) {
      this.setState({ savedResponseLoading: true });
    }

    requestOrganizationResponses(organization.id, {
      criterion_id: criterionInstance.criterion_id,
      per_page: 1,
    })
      .then((res) => {
        let resp = find(res.data.data, (r) => {
          return Number(r.criterion_id) === Number(criterionInstance.criterion_id);
        });

        let savedResponse = null;
        let draftResponseValue = null;
        let statusName = "Unanswered";
        let statusDate = null;
        let statusUpdatedByStr = null;

        if (resp && resp.hasOwnProperty("response_value_id")) {
          savedResponse = resp;
          draftResponseValue = toString(resp.response_value_id);
        }

        if (!isNil(savedResponse) && !isNil(savedResponse.response_value_id)) {
          statusName = savedResponse.response_value.label;
          statusDate = moment.utc(savedResponse.created_at).format("M/D/YY");
          let statusUpdatedByObj = get(savedResponse, "user", null);
          if (statusUpdatedByObj && !isEmpty(statusUpdatedByObj)) {
            statusUpdatedByStr =
              get(statusUpdatedByObj, "name_first", "") +
              " " +
              get(statusUpdatedByObj, "name_last", "");
          }
        }

        if (!this.isCancelled) {
          this.setState({
            savedResponseLoaded: true,
            savedResponseLoading: false,
            savedResponseError: false,
            savedResponse,
            draftResponseValue,
            statusName,
            statusDate,
            statusUpdatedByStr,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            savedResponseLoading: false,
            savedResponseError: true,
            savedResponse: null,
            draftResponseValue: null,
          });
          console.error("An error occurred retrieving saved response.");
        }
      });
  };

  /**
   * @param {object} event object for changing radio button
   */
  handleChangeResponse = (event) => {
    const { userCanEdit } = this.state;
    if (userCanEdit && !this.isCancelled) {
      this.setState({ draftResponseValue: event.target.value });
    }
  };

  /**
   * @returns {string} url for set detail page
   */
  setUrl = () => {
    const { program, set, organization } = this.props;
    return "/app/programs/" + program.id + "/organizations/" + organization.id + "/sets/" + set.id;
  };

  handlePrevClick = () => {
    this.saveAndPrev();
  };

  handleNextClick = () => {
    this.saveAndNext();
  };

  handleSaveClick = () => {
    this.saveResponse(null);
  };

  saveAndNext = () => {
    const { history, program, set, organization } = this.props;
    const { nextCriterionInstance, userCanEdit } = this.state;

    let redirectUrl = null;
    if (nextCriterionInstance) {
      redirectUrl =
        "/app/programs/" +
        program.id +
        "/organizations/" +
        organization.id +
        "/sets/" +
        set.id +
        "/questions/" +
        nextCriterionInstance.id;
    } else {
      redirectUrl = this.setUrl();
    }

    if (userCanEdit) {
      this.saveResponse(redirectUrl);
    } else {
      history.push(redirectUrl);
    }
  };

  saveAndPrev = () => {
    const { history, program, set, organization } = this.props;
    const { prevCriterionInstance, userCanEdit } = this.state;

    let redirectUrl = null;
    if (prevCriterionInstance) {
      redirectUrl =
        "/app/programs/" +
        program.id +
        "/organizations/" +
        organization.id +
        "/sets/" +
        set.id +
        "/questions/" +
        prevCriterionInstance.id;
    }

    if (userCanEdit) {
      this.saveResponse(redirectUrl);
    } else {
      history.push(redirectUrl);
    }
  };

  saveResponse = (redirectUrl) => {
    const { currentUser, declareResponsesHaveChanged, history, organization, set } = this.props;
    const { criterionInstance, draftResponseValue, savedResponse, saving } = this.state;

    // prevent saving if already in progress
    if (saving) {
      return;
    }

    // Don't submit a new response if draft value is same as saved.
    let savedResponseValue = isNil(savedResponse) ? null : savedResponse.value;
    if (draftResponseValue === savedResponseValue) {
      if (!isNil(redirectUrl)) {
        history.push(redirectUrl);
      }
      return;
    }

    if (!this.isCancelled) {
      this.setState({ saving: true });
    }

    let moduleId = isNil(criterionInstance.module_id) ? null : criterionInstance.module_id;

    requestCreateResponse({
      response_value_id: draftResponseValue,
      criterion_id: criterionInstance.criterion_id,
      organization_id: organization.id,
      user_id: currentUser.data.id,
      active_program_id: set.program_id,
      active_set_id: set.id,
      active_module_id: moduleId,
    }).then((res) => {
      if (res.status !== 201) {
        console.error("An error occurred saving response.");
        hgToast("An error occurred saving response", "error");
        if (!this.isCancelled) {
          this.setState({
            saving: false,
            savingError: true,
          });
        }
        return;
      }

      // Show confirmation...
      hgToast("Response saved");

      // Note that we're done saving...
      if (!this.isCancelled) {
        this.setState({
          saving: false,
          savingError: true,
        });
      }

      // Tell other components we changed responses for the org...
      declareResponsesHaveChanged();

      // Go elsewhere if requested...
      if (!isNil(redirectUrl)) {
        history.push(redirectUrl);
      } else {
        // If not redirecting, reload the savedResponse;
        this.getSavedResponse();
      }
    });
  };

  /**
   * Populate state.resources array based on criterion.
   */
  loadResources = (criterionInstance) => {
    if (!criterionInstance || isNil(criterionInstance.criterion_id)) {
      return;
    }

    this.setState({ resourcesLoading: true });

    requestCriterionResources(criterionInstance.criterion_id, {})
      .then((res) => {
        // SUCCESS
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              resourcesLoading: false,
              resourcesLoaded: true,
              resources: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving resource records");
        if (!this.isCancelled) {
          this.setState({
            resourcesLoading: false,
            resourcesLoaded: true,
            resources: [],
          });
        }
      });
  };

  /**
   * Populate state.userFunctions array based on criterion.
   */
  loadUserFunctions = (criterionInstance) => {
    if (!criterionInstance || isNil(criterionInstance.criterion_id)) {
      return;
    }

    this.setState({ userFunctionsLoading: true });

    requestCriterionUserFunctions(criterionInstance.criterion_id, {})
      .then((res) => {
        // SUCCESS
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              userFunctionsLoading: false,
              userFunctionsLoaded: true,
              userFunctions: res.data.data,
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving userFunction records");
        if (!this.isCancelled) {
          this.setState({
            userFunctionsLoading: false,
            userFunctionsLoaded: true,
            userFunctions: [],
          });
        }
      });
  };

  /**
   * @returns {object} parsed response stucture value based on id
   */
  responseStructureValues = () => {
    const { appMeta } = this.props;
    const { criterionInstance } = this.state;

    let responseStructures, responseStructureValues;
    let responseValueId = get(criterionInstance, "criterion.response_structure_id", "");

    if (responseValueId) {
      responseStructures = get(appMeta.data, "responseStructures", "");
      responseStructureValues = get(responseStructures[responseValueId], "response_value", "");
    }

    return responseStructureValues;
  };

  /**
   * @returns {string} next label for SaveNavigation component
   */
  nextLabel = () => {
    const { criterionInstance, nextCriterionInstance, userCanEdit } = this.state;

    let nextLabel = "Next";
    if (userCanEdit) {
      nextLabel = "Save & done!";
      if (nextCriterionInstance) {
        nextLabel = "Save & next";
        if (nextCriterionInstance.module_id !== criterionInstance.module_id) {
          nextLabel = "Save & next topic";
        }
      }
    }

    return nextLabel;
  };

  /**
   * @returns {string} prev label for SaveNavigation component
   */
  prevLabel = () => {
    const { criterionInstance, prevCriterionInstance, userCanEdit } = this.state;

    let prevLabel = "Previous";
    if (userCanEdit) {
      prevLabel = "Save & previous";
      if (
        prevCriterionInstance &&
        prevCriterionInstance.module_id !== criterionInstance.module_id
      ) {
        prevLabel = "Save & previous topic";
      }
    }

    return prevLabel;
  };

  /**
   * @returns {array} options sorted by weight
   */
  sortedOptions = () => {
    const { criterionInstance } = this.state;
    // Prepare array of options sorted by weight.
    let sortedOptions = criterionInstance.criterion.options;

    // Force weight props to integers and sort.
    sortedOptions = sortBy(sortedOptions, (item) => {
      return parseInt(item.weight, 10);
    });

    return sortedOptions;
  };

  /**
   * @returns {number || null} id of parent response if it exists
   */
  parentResponseVal = () => {
    const { parentResponse } = this.state;

    if (!isNil(parentResponse)) {
      return parentResponse.response_value_id;
    }

    return null;
  };

  /**
   * @returns {string} feedback, parsed from DraftEditor structure
   */
  feedbackValue = () => {
    const { criterionInstance, draftResponseValue } = this.state;
    let feedback;

    if (draftResponseValue) {
      let draftResponseOption = find(criterionInstance.criterion.options, (co) => {
        return Number(co.response_value_id) === Number(draftResponseValue);
      });
      let feedbackValue = get(draftResponseOption, "feedback", null);

      // If feedback is a string, it's probably JSON as text that needs
      // to be converted to a JSON object.
      if (isString(feedbackValue)) {
        try {
          feedbackValue = JSON.parse(feedbackValue);
        } catch (e) {
          console.error(`Tried converting string feedbackValue to JSON but failed: ${e.message}`);
        }
      }

      let initialFeedbackText = get(feedbackValue, "blocks[0].text", null);
      let trimmedInitialFeedbackText = trim(initialFeedbackText);
      if (
        feedbackValue &&
        feedbackValue.blocks.length > 0 &&
        !isEmpty(trimmedInitialFeedbackText)
      ) {
        feedback = feedbackValue;
      }
    }

    return feedback;
  };

  render() {
    const { organization, program, set } = this.props;
    const {
      accessChecked,
      criterionInstance,
      draftResponseValue,
      prevCriterionInstance,
      nextCriterionInstance,
      parentResponse,
      parentSuggestionLabel,
      planItemLoading,
      resources,
      resourcesLoaded,
      userFunctions,
      userFunctionsLoaded,
      userCanViewActionPlan,
      userCanEditActionPlan,
      planItem,
      savedResponse,
      savedResponseLoaded,
      savedResponseLoading,
      saving,
      userCanEdit,
      userCanView,
      statusName,
      statusDate,
      statusUpdatedByStr,
    } = this.state;

    if (!accessChecked) {
      return <CircularProgressGlobal />;
    }

    if (!userCanView) {
      return <PageNotFound />;
    }

    if (isNil(criterionInstance)) {
      return <CircularProgressGlobal />;
    }

    return (
      <QuestionDetail
        organization={organization}
        program={program}
        set={set}
        accessChecked={accessChecked}
        criterionInstance={criterionInstance}
        draftResponseValue={draftResponseValue}
        prevCriterionInstance={prevCriterionInstance}
        nextCriterionInstance={nextCriterionInstance}
        parentResponse={parentResponse}
        parentSuggestionLabel={parentSuggestionLabel}
        planItemLoading={planItemLoading}
        resources={resources}
        resourcesLoaded={resourcesLoaded}
        userFunctions={userFunctions}
        userFunctionsLoaded={userFunctionsLoaded}
        savedResponse={savedResponse}
        savedResponseLoaded={savedResponseLoaded}
        savedResponseLoading={savedResponseLoading}
        saving={saving}
        userCanEdit={userCanEdit}
        userCanView={userCanView}
        userCanViewActionPlan={userCanViewActionPlan}
        userCanEditActionPlan={userCanEditActionPlan}
        hasHandle={criterionInstance.handle.length > 0}
        sortedOptions={this.sortedOptions()}
        parentResponseVal={this.parentResponseVal()}
        responseStructureValues={this.responseStructureValues()}
        feedback={this.feedbackValue()}
        hasParent={!isNil(organization.parent_id)}
        hasParentResponse={!isNil(parentResponse)}
        nextLabel={this.nextLabel()}
        prevLabel={this.prevLabel()}
        statusName={statusName}
        statusDate={statusDate}
        statusUpdatedByStr={statusUpdatedByStr}
        handleChangeResponse={this.handleChangeResponse}
        handlePrevClick={this.handlePrevClick}
        handleNextClick={this.handleNextClick}
        handleSaveClick={this.handleSaveClick}
        addToActionPlan={this.addToActionPlan}
        planItem={planItem}
      />
    );
  }
}

const styles = (theme) => ({});

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
)(withStyles(styles, { withTheme: true })(QuestionController));
