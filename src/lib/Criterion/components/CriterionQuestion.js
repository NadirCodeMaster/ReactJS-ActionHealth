import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { get, has, isEmpty, isNil, sortBy } from "lodash";
import PropTypes from "prop-types";
import {
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Icon,
  Radio,
  RadioGroup,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import DraftEditor from "components/ui/DraftEditor";
import ResponseSkeletonLoader from "./ResponseSkeletonLoader";
import ResponseOptionLabel from "./ResponseOptionLabel";
import { fetchOrganizationResponses, fetchOrganizationResponsesSuccess } from "store/actions";
import { requestCreateResponse } from "api/requests";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import responseStructureForCriterion from "../utils/responseStructureForCriterion";
import criterionResponseFeedback from "../utils/criterionResponseFeedback";
import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

//
// Criterion question form for use in assessments, action plan.
// ------------------------------------------------------------
// This is v2 (November, 2021).
//

export default function CriterionQuestion({
  afterResponseChange,
  criterion,
  currentUser,
  organization,
  parentResponse,
  parentResponseLoaded,
  parentResponseLoading,
  parentSuggestionLabel,
  userCanEditActionPlan,
  userCanEditAssessment,
  userCanViewActionPlan,
  userCanViewAssessment,

  // CI-related props below are only to be provided when using this component
  // within an assessment.
  criterionInstance,
  prevCriterionInstance,
  nextCriterionInstance,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const theme = useTheme();

  const dispatch = useDispatch();

  // Object containing response structures, keyed by ID. As stored in appMeta.
  const allResponseStructures = useSelector((state) => state.app_meta.data.responseStructures);

  // Object from redux that contains organization response data by criterion.
  // We'll monitor this and update the component savedResponse var as needed.
  const orgResponses = useSelector((state) => state.organization_responses.data);

  // The response structure object for the provided criterion.
  const [criterionResponseStructure, setCriterionResponseStructure] = useState(null);

  // Draft response. (was prop in last version)
  const [draftResponseValue, setDraftResponseValue] = useState(null);

  // Saved response vars. (these were props in last version)
  const [savedResponse, setSavedResponse] = useState(null); // we'll populate from Redux via useEffect
  const [savedResponseLoading, setSavedResponseLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Criterion options sorted by weight.
  const [sortedOptions, setSortedOptions] = useState([]);

  // Option feedback displayed for saved response.
  const [feedback, setFeedback] = useState(null);
  // Value we'll use to force DraftEditor to re-render when feedback changes.
  const [feedbackKey, setFeedbackKey] = useState(0);

  // Whether org has a parent org.
  const [hasParent, setHasParent] = useState(false);
  const [hasParentResponse, setHasParentResponse] = useState(false); // @TODO

  // Populate the draft response value if it's empty but we have a saved response.
  useEffect(() => {
    if (isNil(draftResponseValue) && !isEmpty(savedResponse)) {
      let savedRespVal = get(savedResponse, "response_value_id", null);
      if (mounted.current) {
        setDraftResponseValue(savedRespVal.toString());
      }
    }
  }, [savedResponse, draftResponseValue]);

  // Fetch latest org response into redux.
  useEffect(() => {
    if (organization && criterion) {
      if (mounted.current) {
        setSavedResponseLoading(true); // updated later via other useEffect
      }
      dispatch(
        fetchOrganizationResponses({
          organization_id: organization.id,
          criterion_id: criterion.id,
        })
      );
    }
  }, [criterion, dispatch, organization]);

  // Set state vars from redux.
  useEffect(() => {
    if (!orgResponses) {
      return;
    }

    let newHasParentResponse = false; // @TODO
    let newSavedResponse = null;
    let newSavedResponseLoading = false;
    let thisOrgsResponse = get(orgResponses, `${organization.id}.${criterion.id}`, null);

    if (thisOrgsResponse) {
      newSavedResponse = thisOrgsResponse.response;
      newSavedResponseLoading = thisOrgsResponse.loading;
    }

    if (mounted.current) {
      setHasParentResponse(newHasParentResponse);
      setSavedResponse(newSavedResponse);
      setSavedResponseLoading(newSavedResponseLoading);
    }
  }, [criterion, organization, orgResponses]);

  // Set feedback when saved response updates.
  useEffect(() => {
    let newFeedback = null;

    // Try setting feedback based on response value.
    if (savedResponse && has(savedResponse, "response_value_id")) {
      let rvId = get(savedResponse, "response_value_id", null);
      if (!isNil(rvId)) {
        newFeedback = criterionResponseFeedback(criterion, rvId);
      }
    }

    setFeedback(newFeedback);
    setFeedbackKey(+new Date());
  }, [criterion, savedResponse]);

  // Set hasParent.
  useEffect(() => {
    let newHasParent = false;
    if (!isNil(organization.parent_id)) {
      newHasParent = true;
    }
    if (mounted.current) {
      setHasParent(newHasParent);
    }
  }, [organization]);

  // Set-up criterion-dependent state vars.
  useEffect(() => {
    // -- Sort the criterion options.
    let newSortedOptions = [];
    if (!isEmpty(criterion.options)) {
      // Force weight props to integers and sort.
      newSortedOptions = sortBy(criterion.options, (item) => {
        return parseInt(item.weight, 10);
      });
    }
    if (mounted.current) {
      setSortedOptions(newSortedOptions);
    }

    // -- Establish the response structure.
    let newCRS = responseStructureForCriterion(criterion, allResponseStructures);
    if (mounted.current) {
      setCriterionResponseStructure(newCRS);
    }
  }, [criterion, allResponseStructures]);

  // Returns value for <Radio className={}> given the corresponding option.
  const radioClassesForOption = useCallback(
    (option) => {
      let radioClasses = [classes.questionOptionRadio];

      if (
        parentResponse &&
        !isEmpty(parentResponse.response_value_id) &&
        parentResponse.response_value_id.toString() === option.response_value_id.toString()
      ) {
        // Add a special string CSS class if this is
        // the parent selection.
        radioClasses.push("questionDetailParentSelection");
      }
      return radioClasses.join(" ");
    },
    [classes, parentResponse]
  );

  // Handle change of response selection.
  const handleChangeResponse = useCallback(
    (e) => {
      let newResponseVal = e.target.value;
      if (mounted.current) {
        setDraftResponseValue(newResponseVal);
        setSaving(true);
      }

      requestCreateResponse({
        response_value_id: newResponseVal,
        criterion_id: criterion.id,
        organization_id: organization.id,
        user_id: currentUser.data.id,
      })
        .then((res) => {
          // ok
          let newResponse = res.data.data;

          // Use the returned object to populate our savedResponse value.
          if (mounted.current) {
            setSavedResponse(newResponse); // @TODO MAYBE REDUNDANT VIA DISPATCH BELOW
            setSaving(false);
          }

          // Pass the returned response object over to redux to update the store.
          dispatch(fetchOrganizationResponsesSuccess({ data: [newResponse] }));

          if (afterResponseChange) {
            afterResponseChange(true);
          }

          hgToast("Response saved", "success");
        })
        .catch((error) => {
          console.error(`${error.name}: ${error.message}`);
          if (mounted.current) {
            setSaving(false);
          }
          if (afterResponseChange) {
            afterResponseChange(false);
          }
          hgToast(
            "An error occurred saving your changes. Please refresh the page and try again.",
            "error"
          );
        });
    },
    [afterResponseChange, criterion, dispatch, currentUser, organization]
  );

  return (
    <Fragment>
      <div className={classes.description}>
        <DraftEditor readOnly={true} value={criterion.description || ""} />
      </div>
      <Divider />
      <div className={classes.optionsWrapper}>
        {savedResponseLoading ? (
          <Fragment>
            <ResponseSkeletonLoader />
          </Fragment>
        ) : (
          <React.Fragment>
            {!userCanEditAssessment && (
              <Icon
                className={classes.lock}
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                }}
                fontSize="small"
                color="secondary"
              >
                lock
              </Icon>
            )}
            <FormControl component="fieldset" variant="standard">
              <FormLabel className="sr-only" component="legend">
                Answer
              </FormLabel>
              <RadioGroup
                aria-label="Answer"
                name="responseValue"
                value={draftResponseValue}
                onChange={handleChangeResponse}
              >
                {sortedOptions.map((option, index) => {
                  return (
                    <Fragment key={option.response_value_id.toString()}>
                      {option && criterionResponseStructure ? (
                        <Fragment>
                          <FormControlLabel
                            className={`questionDetailOption ${classes.questionOption}`}
                            value={option.response_value_id.toString()}
                            control={
                              <Radio
                                className={radioClassesForOption(option)}
                                color="primary"
                                disabled={!userCanEditAssessment || saving || savedResponseLoading}
                              />
                            }
                            label={
                              <ResponseOptionLabel
                                option={option}
                                responseStructure={criterionResponseStructure}
                                wrapperClassName={null}
                              />
                            }
                          />
                        </Fragment>
                      ) : (
                        <small>loading...</small>
                      )}
                    </Fragment>
                  );
                })}
              </RadioGroup>
            </FormControl>
            {feedback && (
              <React.Fragment>
                <Divider />
                <br />
                <DraftEditor key={feedbackKey} readOnly={true} value={feedback} />
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
      {hasParent && hasParentResponse && (
        <React.Fragment>
          <Divider />
          <div
            style={{
              paddingTop: theme.spacing(3),
              paddingBottom: theme.spacing(3),
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
            }}
          >
            <p>
              <span style={{ color: theme.palette.primary.main }}>*</span> {parentSuggestionLabel}
            </p>
          </div>
        </React.Fragment>
      )}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  parentSelection: {
    color: "#FB4F14",
    fontSize: "20px",
    left: "-11px",
    top: "14px",
    position: "absolute",
  },
  description: {
    color: styleVars.txtColorDefault,
    fontFamily: styleVars.txtFontFamilyDefault,
    fontSize: 18,
    marginBottom: theme.spacing(2),
  },
  optionsWrapper: {
    marginTop: theme.spacing(2),
  },
  questionOption: {
    // @see App.css for related IE hacks applied
    // via .questionDetailOption
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(),
  },
  questionOptionRadio: {
    margin: theme.spacing(-1, 0, 0, 0),
  },
}));

CriterionQuestion.propTypes = {
  afterResponseChange: PropTypes.func,
  criterion: PropTypes.object.isRequired,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  organization: PropTypes.shape(organizationShape).isRequired,

  parentResponse: PropTypes.object,
  parentResponseLoaded: PropTypes.bool,
  parentResponseLoading: PropTypes.bool,
  parentSuggestionLabel: PropTypes.string.isRequired,

  userCanEditActionPlan: PropTypes.bool.isRequired,
  userCanEditAssessment: PropTypes.bool.isRequired,
  userCanViewActionPlan: PropTypes.bool.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired,

  // CI-related props below are only to be provided when using this component
  // within an assessment.
  criterionInstance: PropTypes.object,
  prevCriterionInstance: PropTypes.object,
  nextCriterionInstance: PropTypes.object,
};
