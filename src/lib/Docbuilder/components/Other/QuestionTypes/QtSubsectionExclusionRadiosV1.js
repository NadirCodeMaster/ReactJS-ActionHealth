import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { debounce, get, isObject, isString } from "lodash";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
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
// Form display for questions of type subsection_exclusion_radios_v1.
// ------------------------------------------------------------------
// Typically rendered inside ./Question (which is then rendered
// inside ./Subsection).
//

export default function QtSubsectionExclusionRadiosV1({
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

  // The selected answer value being displayed.
  const [displayedAnswerVal, setDisplayedAnswerVal] = useState("");

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
    //
    // This also prevents unwanted selectability of subsection confirmation
    // when that QT is used in the same subsection.
    //
    // Note: Stored answer will be the full answer record object if present
    // (but initialAnswerVal will be string if present).
    let storedIsEmpty = true;
    let calculatedIsEmpty = true;

    // Figure out if stored is really empty.
    if (storedAnswer && isObject(storedAnswer)) {
      let saVal = get(storedAnswer, "value.response", null);
      if (saVal === includeStr || saVal === excludeStr) {
        // Stored answer exists and is not empty.
        storedIsEmpty = false;
      }
    }

    // Figure out if calculated (initial) is really empty.
    if (initialAnswerVal && isString(initialAnswerVal)) {
      if (initialAnswerVal === includeStr || initialAnswerVal === excludeStr) {
        // Calculated answer exists and is not empty.
        calculatedIsEmpty = false;
      }
    }

    // If stored is empty but calculated is not, save calculated to server.
    if (storedIsEmpty && !calculatedIsEmpty) {
      validateAndSaveToApi(initialAnswerVal);
    }

    // Disable linting of useEffect() dependencies since we intentionally
    // want to avoid triggering the effect upon change of storedAnswer.
  }, [organizationId, question]); // eslint-disable-line

  // Debounced wrapper for applyDisplayedAnswerStatus prop func.
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
   * Given displayed answer, this method validates and saves to API if ok.
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

  // Handles change to selection.
  const handleOptionChange = (newVal) => {
    if (mounted.current) {
      setDisplayedAnswerVal(newVal);
      validateAndSaveToApi(newVal);
    }
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
          <FormControl
            disabled={readOnly}
            required={question.required}
            error={!isValid(question, displayedAnswerVal)}
            component="fieldset"
            className={classes.formControl}
            variant="standard"
          >
            <legend className={classes.label} htmlFor={`q${question.id}_ss${subsection.id}`}>
              <Markup content={question.value.label} />
              {question.required && <div className={classes.requiredIndicator}> (required)</div>}
            </legend>

            <RadioGroup
              name={`${question.id}_options`}
              aria-label={question.value.label}
              value={displayedAnswerVal}
              onChange={(e) => handleOptionChange(e.target.value)}
            >
              {/* Display the options. */}
              <FormControlLabel
                label={<Markup content={question.value.options.include} />}
                value={includeStr}
                classes={{
                  label: classes.formControlLabelClassLabel,
                  root: classes.formControlLabelClassRoot,
                }}
                control={<Radio />}
              />
              <FormControlLabel
                label={<Markup content={question.value.options.exclude} />}
                value={excludeStr}
                classes={{
                  label: classes.formControlLabelClassLabel,
                  root: classes.formControlLabelClassRoot,
                }}
                control={<Radio />}
              />
            </RadioGroup>
          </FormControl>

          <div className={classes.statusWrapper}>
            <AnswerStatusIndicator
              changesPresent={hasUnsavedChanges(question, storedAnswer, displayedAnswerVal)}
              disabled={answerSubmitting}
              invalid={!isValid(question, displayedAnswerVal)}
              onClick={() => {
                validateAndSaveToApi(displayedAnswerVal);
              }}
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
const includeStr = "include";
const excludeStr = "exclude";

const calculateInitialAnswerVal = memoizee((question, storedAnswer) => {
  let res;

  // Look for a stored value.
  if (storedAnswer) {
    res = get(storedAnswer, "value.response", "");
    if (res && isString(res) && res.length > 0) {
      return res;
    }
  }

  // Otherwise, try for a "prepopulate" value from the question.
  if (question) {
    res = get(question, "value.prepopulate", "");
    if (res && isString(res) && res.length > 0) {
      return res;
    }
  }

  // If nothing else, just an empty string.
  return "";
});

// Check if entered values are valid to submit.
const isValid = memoizee((question, displayedAnswerVal) => {
  // Nest the displayed answer option in a faux-answer object to
  // align with validation method requirements.
  let a = { response: displayedAnswerVal };
  let validator = new AnswerValidator(question, a);
  return validator.isValid();
});

// Check if the server answer value matches the displayed (form) value.
const hasUnsavedChanges = memoizee((question, storedAnswer, displayedAnswerVal) => {
  let storedOption = "";

  if (storedAnswer) {
    storedOption = get(storedAnswer, "value.response", "");
  }
  return storedOption !== displayedAnswerVal;
});

QtSubsectionExclusionRadiosV1.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  organizationId: PropTypes.number.isRequired,
  onSubmitAnswer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  storedAnswer: PropTypes.shape(
    docbuilderAnswerByQuestionTypeShapes.subsection_exclusion_radios_v1
  ),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
};
