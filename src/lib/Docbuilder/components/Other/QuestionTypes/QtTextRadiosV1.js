import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { debounce, get, isObject, isString } from "lodash";
import memoizee from "memoizee";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  docbuilderAnswerByQuestionTypeShapes,
  docbuilderQuestionShape,
  docbuilderSubsectionShape,
  docbuilderVarsShape,
} from "../../../prop-type-shapes";
import HgTextField from "components/ui/HgTextField";
import AnswerValidator from "../../../classes/AnswerValidator/index";
import AnswerStatusIndicator from "../AnswerStatusIndicator";
import clsx from "clsx";
import { Markup } from "interweave";
import { debounceRatesForSubmission } from "../../../utils/answer/constants";
import styleVars from "style/_vars.scss";

// @TODO implement deleteAnswer (see file upload question type)

//
// Form display for questions of type text_radios_v1.
// -------------------------------------------------------------------------
// Typically rendered inside ./Question (which is then rendered
// inside ./Subsection).
//

export default function QtTextRadiosV1({
  applyDisplayedAnswerStatus,
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
  const [answerSelection, setAnswerSelection] = useState(null);

  // "Other" text value being displayed (when "other" option is selected).
  const [answerOtherText, setAnswerOtherText] = useState("");

  // Set initial values based on server.
  useEffect(() => {
    let initialSelectionVal = calculateInitialSelectionVal(question, storedAnswer);
    let initialOtherTextVal = calculateInitialOtherTextVal(question, storedAnswer);

    if (mounted.current) {
      setAnswerSelection(initialSelectionVal);
      setAnswerOtherText(initialOtherTextVal);
    }

    // Save initial value to server if from prepopulation.
    //
    // If there was no answer value stored on the server but the initial
    // value calculation resulted in a non-empty value, it indicates the
    // initial value came from prepopulation. To avoid confusing users,
    // we'll save that preopulated value to the server as an answer
    // behind the scenes.
    //
    // This also prevents unwanted selectability of subsection confirmation
    // when that QT is used in the same subsection.
    //
    // Note: Stored answer will be the full answer record object if present
    // (but initialAnswerVal will be string if present).
    //
    // Note: This QT (and all others as of this writing) does not support
    // prepopulating "other" text.
    let storedIsEmpty = true;
    let calculatedIsEmpty = true;

    // Figure out if stored is really empty.
    if (storedAnswer && isObject(storedAnswer)) {
      let saVal = get(storedAnswer, "value.response", null);
      if (saVal && isString(saVal) && saVal.length > 0) {
        // Stored answer exists and is not empty.
        storedIsEmpty = false;
      }
    }

    // Figure out if calculated (initial) is really empty.
    if (initialSelectionVal && isString(initialSelectionVal) && initialSelectionVal.length > 0) {
      // Calculated answer exists and is not empty.
      calculatedIsEmpty = false;
    }

    // If stored is empty but calculated is not, save calculated to server.
    if (storedIsEmpty && !calculatedIsEmpty) {
      // Second param below represents "other" text.
      validateAndSaveToApi(question, initialSelectionVal, "");
    }

    // Disable linting of useEffect() dependencies since we intentionally
    // want to avoid triggering the effect upon change of storedAnswer.
  }, [organizationId, question]); // eslint-disable-line

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
    }, 1000),
    [applyDisplayedAnswerStatus, question]
  );

  // Notify parent components status of _displayed_ answers.
  useEffect(() => {
    debouncedApplyDisplayedAnswerStatus(isValid(question, answerSelection, answerOtherText));
  }, [question, debouncedApplyDisplayedAnswerStatus, answerSelection, answerOtherText]);

  /**
   * Save an answer payload to the server ... with a SHORT debounce.
   *
   * You should probably be calling validateAndSaveToApi() instead of
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
   * Save an answer payload to the server ... with a LONG debounce.
   *
   * You should probably be calling validateAndSaveToApi() instead of
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
  const _saveToApiLongDebounce = useCallback(
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
    }, debounceRatesForSubmission.textFields),
    [onSubmitAnswer, organizationId, subsection, question]
  );

  /**
   * Given displayed answers, this method validates them and saves to API if ok.
   *
   * @param {object} question
   * @param {array} selections
   * @param {string} otherText
   * @param {bool} longDebounce
   *  If true, _saveToApiLongDebounce() is used. Otherwise saving is done via
   * _saveToApi() (which has a shorter debounce rate).
   */
  const validateAndSaveToApi = (question, selections, otherText, longDebounce = false) => {
    // Assemble answer payload and validate.
    let answerPayloadIfValid = assembleAnswerPayload(question, selections, otherText, true);

    // If valid, submit it.
    if (answerPayloadIfValid) {
      if (longDebounce) {
        _saveToApiLongDebounce(answerPayloadIfValid);
        return;
      }
      _saveToApi(answerPayloadIfValid);
    }
  };

  // Handles change to regular and "other" radio buttons.
  const handleOptionChange = (question, newSelection, otherText) => {
    if (mounted.current) {
      setAnswerSelection(newSelection);
      // Save to API if valid.
      validateAndSaveToApi(question, newSelection, otherText, false);
    }
  };

  // Handles change to the "other" text field.
  const handleOtherTextChange = (question, newText, selection) => {
    if (mounted.current) {
      setAnswerOtherText(newText);
      // Save to API if valid.
      validateAndSaveToApi(question, selection, newText, true);
    }
  };

  // This method converts displayed answer values to format required
  // for sending to API as an answer payload.
  //
  // If `validate` parameter is truthy, this method returns false when other
  // parameters are not valid.
  const assembleAnswerPayload = (selection, otherText, validate) => {
    // Use empty text for otherResponse if 'other' isn't selected.
    let adjustedOtherTextVal = "other" === selection ? otherText : "";

    // If validation is requested, check isValid().
    if (validate && !isValid(question, selection, adjustedOtherTextVal)) {
      return false;
    }

    return {
      response: selection,
      otherResponse: adjustedOtherTextVal,
    };
  };

  return (
    <Fragment>
      {question && (
        <div className={classes.wrapper}>
          <FormControl
            disabled={readOnly}
            required={question.required}
            error={!isValid(question, answerSelection, answerOtherText)}
            component="fieldset"
            className={classes.formControl}
            variant="standard"
          >
            <legend className={classes.label} htmlFor={`q${question.id}_ss${subsection.id}`}>
              <Markup content={question.value.label} />
              {question.required && <div className={classes.requiredIndicator}> (required)</div>}
            </legend>

            <RadioGroup
              id={`q${question.id}_ss${subsection.id}`}
              name={`${question.id}_options`}
              aria-label={question.value.label}
              value={answerSelection}
              onChange={(e) => handleOptionChange(question, e.target.value, answerOtherText)}
            >
              {/* Display the non-other option radio buttons. */}
              {question.value.options.map((opt) => (
                <Fragment key={opt.key}>
                  <FormControlLabel
                    label={<Markup content={opt.label} />}
                    value={opt.key}
                    classes={{
                      label: classes.formControlLabelClassLabel,
                      root: classes.formControlLabelClassRoot,
                    }}
                    control={<Radio />}
                  />
                </Fragment>
              ))}
              {/* Display the "other" option radio. */}
              {otherKey(question) && (
                <React.Fragment>
                  <FormControlLabel
                    label={<Markup content={question.value.otherOption.label} />}
                    value={otherKey(question)}
                    control={<Radio />}
                  />
                </React.Fragment>
              )}
            </RadioGroup>

            {/* Display the text input for "other". */}
            {otherKey(question) && (
              <div
                className={clsx(classes.otherTextFieldWrapper, {
                  [classes.otherTextFieldWrapperAvailable]: answerSelection === otherKey(question),
                })}
              >
                <HgTextField
                  label={
                    <Fragment>
                      Your text:
                      {question.required && (
                        <div className={classes.requiredIndicator}> (required)</div>
                      )}
                    </Fragment>
                  }
                  value={answerOtherText}
                  onChange={(e) => handleOtherTextChange(question, e.target.value, answerSelection)}
                  disabled={answerSelection !== otherKey(question)}
                  fullWidth
                  required={answerSelection === otherKey(question)}
                  inputProps={{ maxLength: 255 }}
                />
              </div>
            )}
          </FormControl>

          <div className={classes.statusWrapper}>
            <AnswerStatusIndicator
              changesPresent={hasUnsavedChanges(
                question,
                storedAnswer,
                answerSelection,
                answerOtherText
              )}
              disabled={answerSubmitting}
              invalid={!isValid(question, answerSelection, answerOtherText)}
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
    position: "absolute",
    right: theme.spacing(-1),
    top: theme.spacing(-0.25),
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
    marginBottom: theme.spacing(2.25),
    paddingTop: theme.spacing(1),
  },
  formControlLabelClassRoot: {
    alignItems: "flex-start",
  },
  otherTextFieldWrapper: {
    height: 0,
    opacity: 0,
    transition: "opacity 0.75s",
    "& .MuiInputLabel-asterisk": {
      display: "none",
    },
  },
  otherTextFieldWrapperAvailable: {
    height: "auto",
    opacity: 1,
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

// Get "other" option key, if any, from a question.
const otherKey = memoizee((question) => {
  let k = get(question, "value.otherOption.key", null);
  if (null !== k && isString(k) && k.length > 0) {
    return k;
  }
  return null;
});

const calculateInitialSelectionVal = memoizee((question, storedAnswer) => {
  // Use the storedAnswer if there is one.
  if (
    storedAnswer &&
    storedAnswer.hasOwnProperty("value") &&
    storedAnswer.value.hasOwnProperty("response") &&
    isString(storedAnswer.value.response)
  ) {
    return storedAnswer.value.response;
  }
  // Otherwise, try for a "prepopulate" value from the question.
  else {
    let qValPrepopulate = get(question, "value.prepopulate", null);
    if (qValPrepopulate && isString(qValPrepopulate)) {
      return qValPrepopulate;
    }
  }
  // If nothing else, just an empty string.
  return "";
});

// Check if entered values are valid to submit.
const isValid = memoizee((question, answerSelection, answerOtherText) => {
  // Nest the displayed answer option in a faux-answer object to
  // align with validation method requirements.
  let a = {
    response: answerSelection,
    otherResponse: answerOtherText,
  };
  let validator = new AnswerValidator(question, a);
  return validator.isValid();
});

// Check if the server answer value matches the displayed (form) value.
const hasUnsavedChanges = memoizee((question, storedAnswer, answerSelection, answerOtherText) => {
  let storedOption = "";
  let storedOtherText = "";

  if (storedAnswer) {
    storedOption = get(storedAnswer, "value.response", "");
    storedOtherText = get(storedAnswer, "value.otherResponse", "");
  }

  if (storedOption !== answerSelection) {
    // Stored option doesn't match selected option.
    return true;
  }

  // If here, selected options match, so we need to test if the "other"
  // option is selected, and if it is, if the "other" text matches.
  let _otherKey = otherKey(question);
  if (
    _otherKey &&
    _otherKey === answerSelection &&
    storedOtherText.trim() !== answerOtherText.trim()
  ) {
    // Other option is selected but other text doesn't match.
    return true;
  }

  // Match.
  return false;
});

const calculateInitialOtherTextVal = memoizee((question, storedAnswer) => {
  // Use the storedAnswer if there is one.
  if (
    otherKey(question) &&
    storedAnswer &&
    storedAnswer.hasOwnProperty("value") &&
    storedAnswer.value.hasOwnProperty("otherResponse") &&
    isString(storedAnswer.value.otherResponse)
  ) {
    return storedAnswer.value.otherResponse;
  }
  // If nothing else, just an empty string.
  return "";
});

QtTextRadiosV1.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  organizationId: PropTypes.number.isRequired,
  onSubmitAnswer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  storedAnswer: PropTypes.shape(docbuilderAnswerByQuestionTypeShapes.text_radios_v1),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
};
