import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { debounce, get, isObject, isString } from "lodash";
import { Checkbox, FormControlLabel } from "@mui/material";
import { makeStyles } from "@mui/styles";
import memoizee from "memoizee";
import {
  docbuilderAnswerByQuestionTypeShapes,
  docbuilderQuestionShape,
  docbuilderSubsectionShape,
  docbuilderVarsShape,
} from "../../../prop-type-shapes";
import AnswerValidator from "../../../classes/AnswerValidator/index";
import AnswerStatusIndicator from "../AnswerStatusIndicator";
import { Markup } from "interweave";
import { debounceRatesForSubmission } from "../../../utils/answer/constants";
import styleVars from "style/_vars.scss";

// @TODO implement deleteAnswer (see file upload question type)

//
// Form display for questions of type subsection_confirmation_checkbox_v1.
// -----------------------------------------------------------------------
// Typically rendered inside ./Question (which is then rendered
// inside ./Subsection).
//

export default function QtSubsectionConfirmationCheckboxV1({
  applyDisplayedAnswerStatus,
  displayedAnswerStatuses, // key (q ID) => value (bool representing valid)
  organizationId,
  readOnly, // prevent changes when doc is submitted/locked/closed
  question,
  subsection,
  onSubmitAnswer,
  storedAnswer,
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
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  // The displayed answer.
  const [displayedAnswerVal, setDisplayedAnswerVal] = useState("");

  // Bool representing if any displayed responses to _other_ questions in
  // the same subsection are invalid. Defaults to true to avoid unnecessary
  // momentary error displays.
  const [canConfirm, setCanConfirm] = useState(true);

  // Set-up `mounted` to avoid running code when no longer mounted.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Debounced function called in a useEffect to modify the "checked" state of
  // this question if another answer for this subsection is invalid.
  //
  // NOTE: The eslint line disable is to prevent warning about "useCallback
  //       received a function whose dependencies are unknown" that comes
  //       from using debounce().
  //
  // eslint-disable-next-line
  const uncheckIfOtherQuestionValuesAreInvalid = useCallback(
    debounce((_displayedAnswerStatuses) => {
      let uncheckIt = false;
      for (let i = 0; i < subsection.docbuilder_questions.length; i++) {
        let curLoopQ = subsection.docbuilder_questions[i];

        // Skip the question this component represents.
        if (question.id === curLoopQ.id) {
          continue;
        }

        // Get status of the current loop's question.
        //   Should be boolean, so we'll default to null to test if it's not
        //   there. If it's missing for some reason, we bail because it
        //   means the status hasn't been calculated yet and we therefore
        //   don't have enough info to know what to do with our confirmation
        //   checkbox, so we need to wait.
        //   Note that the missing question status will be added within a render
        //   or two, regardless of whether it was previously answered.
        let curLoopQStatus = get(_displayedAnswerStatuses, curLoopQ.id, null);

        if (null === curLoopQStatus) {
          // bail!
          uncheckIt = false;
          break;
        }

        // Otherwise evaluate based on remaining strict true/false value.
        if (!curLoopQStatus) {
          uncheckIt = true;
          break;
        }
      }

      if (mounted.current) {
        if (uncheckIt) {
          setDisplayedAnswerVal("");
          setCanConfirm(false);
        } else {
          setCanConfirm(true);
        }
      }
    }, 250),
    [question, subsection]
  );

  // Set initial answer value based on server.
  useEffect(() => {
    let initialAnswerVal = calculateInitialAnswerVal(question, storedAnswer);

    if (mounted.current) {
      setDisplayedAnswerVal(initialAnswerVal);
    }

    // Save initial value to server if from prepopulation.
    //
    // If there was no answer value stored on the server but the initial
    // value calculation resulted in a non-empty value, it indicates the
    // initial value came from prepopulation. To avoid confusing users,
    // we'll save that preopulated value to the server as an answer
    // behind the scenes.

    // Note: Stored answer will be the full answer record object if present
    // (but initialAnswerVal will be string if present).
    let storedIsEmpty = true;
    let calculatedIsEmpty = true;

    // Figure out if stored is really empty.
    if (storedAnswer && isObject(storedAnswer)) {
      let saVal = get(storedAnswer, "value.response", null);
      if (saVal === confirmedStr || saVal === unconfirmedStr) {
        // Stored answer exists and is not empty.
        storedIsEmpty = false;
      }
    }

    // Figure out if calculated (initial) is really empty.
    if (initialAnswerVal && isString(initialAnswerVal)) {
      if (initialAnswerVal === confirmedStr || initialAnswerVal === unconfirmedStr) {
        // Calculated answer exists and is not empty.
        calculatedIsEmpty = false;
      }
    }

    // If stored is empty but calculated is not, save calculated to server.
    if (storedIsEmpty && !calculatedIsEmpty) {
      validateAndSaveToApi(initialAnswerVal);
    }

    // Disable linting of useEffect() dependencies since we intentionally
    // want to avoid triggering the effect upon change of storedAnswer
    // or validateAndSaveToApi.
  }, [organizationId, question]); // eslint-disable-line

  // Whenever the status of an answer in this subsection changes, we check
  // if the answers (other than for _this_ question) are valid so we can
  // uncheck this one if needed.
  useEffect(() => {
    uncheckIfOtherQuestionValuesAreInvalid(displayedAnswerStatuses);
  }, [displayedAnswerStatuses, uncheckIfOtherQuestionValuesAreInvalid]);

  // Debounced wrapper for applyDisplayedAnswerStatus prop func.
  //
  // NOTE: The eslint line disable is to prevent warning about "useCallback
  //       received a function whose dependencies are unknown" that comes
  //       from using debounce().
  //
  // eslint-disable-next-line
  const debouncedApplyDisplayedAnswerStatus = useCallback(
    debounce((status) => {
      applyDisplayedAnswerStatus(question.id, status);
    }, 500),
    [applyDisplayedAnswerStatus, question]
  );

  // Notify parent components status of _displayed_ answers.
  useEffect(() => {
    debouncedApplyDisplayedAnswerStatus(isValid(question, displayedAnswerVal));
  }, [question, debouncedApplyDisplayedAnswerStatus, displayedAnswerVal]);

  /**
   * Save an answer payload to the server.
   *
   * You should probably be calling validateAndSaveToApi instead of
   * calling this directly. Payload must be validated and assembled
   * before calling.
   *
   * NOTE: The eslint line disable is to prevent warning about "useCallback
   *       received a function whose dependencies are unknown" that comes
   *       from using debounce().
   *
   * @param {object} answerPayload
   */
  // eslint-disable-next-line
  const _saveToApi = useCallback(
    debounce((answerPayload) => {
      if (mounted.current) {
        setAnswerSubmitting(true);
      }
      onSubmitAnswer(
        organizationId,
        question.id,
        answerPayload,
        subsection.docbuilder_section_id,
        () => {
          if (mounted.current) {
            setAnswerSubmitting(false);
          }
        }
      );
    }, debounceRatesForSubmission.optionFields),
    [onSubmitAnswer, organizationId, subsection, question]
  );

  /**
   * Given displayed answers, this method validates them and saves to API if ok.
   *
   * @param {string} val
   */
  const validateAndSaveToApi = (val) => {
    // Assemble answer payload and validate.
    let answerPayloadIfValid = assembleAnswerPayload(val, true);

    // If valid, submit it.
    if (answerPayloadIfValid) {
      _saveToApi(answerPayloadIfValid);
    }
  };

  // Handles change to checkbox.
  const handleOptionChange = (event) => {
    // Toggle displayed answer option value.
    let newVal = event.target.checked ? confirmedStr : unconfirmedStr;
    if (mounted.current) {
      setDisplayedAnswerVal(newVal);
    }
    validateAndSaveToApi(newVal);
  };

  // This method converts a displayedAnswerVal value to format required
  // for sending to API as an answer payload.
  const assembleAnswerPayload = (val) => {
    return {
      response: val,
    };
  };

  return (
    <Fragment>
      {question && (
        <div className={classes.wrapper}>
          {/* Hidden field for "unconfirmed" option. Renders before checkbox
            so it's the default but overridden when checkbox is checked. */}
          <input type="hidden" name={`${question.id}_selection`} value={unconfirmedStr} />
          {/* The "confirmed" option checkbox. */}
          <FormControlLabel
            classes={{
              label: classes.formControlLabelClassLabel,
              root: classes.formControlLabelClassRoot,
            }}
            label={
              <React.Fragment>
                <Markup content={question.value.label} />
                {question.required && <div className={classes.requiredIndicator}> (required)</div>}
              </React.Fragment>
            }
            control={
              <Checkbox
                checked={confirmedStr === displayedAnswerVal}
                onChange={handleOptionChange}
                name={`${question.id}_selection`}
                value={confirmedStr}
                required={question.required}
                disabled={!canConfirm || readOnly}
              />
            }
          />

          <div className={classes.statusWrapper}>
            <AnswerStatusIndicator
              changesPresent={hasUnsavedChanges(storedAnswer, displayedAnswerVal)}
              invalid={!isValid(question, displayedAnswerVal)}
              disabled={answerSubmitting}
              saveInProgress={answerSubmitting}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginBottom: theme.spacing(6),
    position: "relative",
  },
  statusWrapper: {
    display: "none", // We're not currently showing the status
    position: "absolute",
    right: 0,
    top: theme.spacing(-1),
  },
  label: {
    display: "block",
    fontFamily: styleVars.txtFontFamilyDefault,
    fontSize: styleVars.txtFontSizeDefault,
    fontWeight: styleVars.txtFontWeightNormal,
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(2.25),
  },
  formControlLabelClassLabel: {
    marginBottom: theme.spacing(1.25),
    paddingTop: theme.spacing(1),
  },
  formControlLabelClassRoot: {
    alignItems: "flex-start",
  },
  requiredIndicator: {
    color: styleVars.colorDarkGray,
    display: "none", // hiding for aesthetic reasons [ak 2/3/2022]
    fontFamily: styleVars.txtFontFamilyDefault,
    fontSize: styleVars.txtFontSizeXxs,
    fontWeight: styleVars.txtFontWeightDefaultLight,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    textAlign: "right",
  },
}));

// Values (per question type schema).
const confirmedStr = "confirmed";
const unconfirmedStr = "unconfirmed";

// Check if entered values are valid to submit.
const isValid = memoizee((question, displayedAnswerVal) => {
  // Nest the displayed answer option in a faux-answer object to
  // align with validation method requirements.
  let a = { response: displayedAnswerVal };
  let validator = new AnswerValidator(question, a);
  return validator.isValid();
});

// Check if the server answer value matches the displayed (form) value.
// Note: When storedAnswer is empty, it's considered here equivalent to
// "unconfirmed".
const hasUnsavedChanges = memoizee((storedAnswer, displayedAnswerVal) => {
  let storedOption = "";
  if (
    storedAnswer &&
    storedAnswer.hasOwnProperty("value") &&
    storedAnswer.value.hasOwnProperty("response") &&
    isString(storedAnswer.value.response)
  ) {
    storedOption = storedAnswer.value.response;
  }

  // If stored value isn't our confirmed string, set the
  // var that represents it to the unconfirmed string for
  // our purposes of comparing values.
  if (storedOption !== confirmedStr) {
    storedOption = unconfirmedStr;
  }

  // Do same w/displayed option var.
  if (displayedAnswerVal !== confirmedStr) {
    displayedAnswerVal = unconfirmedStr;
  }

  return storedOption !== displayedAnswerVal;
});

const calculateInitialAnswerVal = memoizee((question, storedAnswer) => {
  // Use the storedAnswer if there is one.
  if (
    storedAnswer &&
    storedAnswer.hasOwnProperty("value") &&
    storedAnswer.value.hasOwnProperty("response") &&
    isString(storedAnswer.value.response) &&
    storedAnswer.value.response.length > 0
  ) {
    return storedAnswer.value.response;
  }
  // Otherwise, try for a "prepopulate" value from the question.
  else {
    if (
      question.value.hasOwnProperty("prepopulate") &&
      isString(question.value.prepopulate) &&
      question.value.prepopulate.length > 0
    ) {
      return question.value.prepopulate;
    }
  }
  // If nothing else, return unconfirmed.
  // Note: Because of the nature of this question type, we'll consider
  // an empty value the same as "unconfirmed."
  return unconfirmedStr;
});

QtSubsectionConfirmationCheckboxV1.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  displayedAnswerStatuses: PropTypes.object.isRequired,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  organizationId: PropTypes.number.isRequired,
  onSubmitAnswer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  storedAnswer: PropTypes.shape(
    docbuilderAnswerByQuestionTypeShapes.subsection_confirmation_checkbox_v1
  ),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
};
