import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { debounce, get, isString } from "lodash";
import memoizee from "memoizee";
import { Input } from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
  docbuilderAnswerByQuestionTypeShapes,
  docbuilderQuestionShape,
  docbuilderSubsectionShape,
  docbuilderVarsShape,
} from "../../../prop-type-shapes";
import AnswerValidator from "../../../classes/AnswerValidator/index";
import AnswerStatusIndicator from "../AnswerStatusIndicator";
import { Markup } from "interweave";
// import Handlebars from 'handlebars';
import Handlebars from "handlebars/dist/handlebars";
import { debounceRatesForSubmission } from "../../../utils/answer/constants";
import styleVars from "style/_vars.scss";

// @TODO implement deleteAnswer (see file upload question type)

//
// Form display for questions of type text_manual_long_v1.
// --------------------------------------------------------------------
// Typically rendered inside ./Question (which is then rendered
// inside ./Subsection).
//

export default function QtTextManualLongV1({
  applyDisplayedAnswerStatus,
  docbuilderVars,
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

  // Displayed answer.
  const [displayedAnswerVal, setDisplayedAnswerVal] = useState("");

  // Set initial answer value based on server.
  useEffect(() => {
    let initialAnswerVal = calculateInitialAnswerVal(question, storedAnswer, docbuilderVars);

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
    let storedIsEmpty = !storedAnswer || (isString(storedAnswer) && storedAnswer.length < 1);
    let calculatedIsEmpty =
      !initialAnswerVal || (isString(initialAnswerVal) && initialAnswerVal.length < 1);
    if (storedIsEmpty && !calculatedIsEmpty) {
      validateAndSaveToApi(initialAnswerVal);
    }

    // Disable linting of useEffect() dependencies since we intentionally
    // want to avoid triggering the effect upon change of storedAnswer,
    // docbuilderVars or validateAndSaveToApi.
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
    }, debounceRatesForSubmission.textFields),
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

  const handleChangeOfTextField = (newVal) => {
    if (mounted.current) {
      setDisplayedAnswerVal(newVal);
      validateAndSaveToApi(newVal);
    }
  };

  // This method converts displayed answer values to format required
  // for sending to API as an answer payload.
  //
  // If `validate` parameter is truthy, this method returns false when other
  // parameters are not valid.
  const assembleAnswerPayload = (val, validate) => {
    // If validation is requested, check isValid().
    if (validate && !isValid(question, val)) {
      return false;
    }
    return {
      response: val,
    };
  };

  return (
    <Fragment>
      {question && (
        <div className={classes.wrapper}>
          {/*
          ======================================================================
          FYI: We're using lower-level and native elements here to work
          around constraints of MUI. For example, MUI only allows single-line
          labels. Accessibility details that associate fields with their
          labels must still be maintained.
          ======================================================================
          */}

          <div className={classes.labelAndInput}>
            <label className={classes.label} htmlFor={`q${question.id}_ss${subsection.id}`}>
              <Markup content={question.value.label} />
            </label>
            <Input
              disabled={readOnly}
              className={classes.input}
              id={`q${question.id}_ss${subsection.id}`}
              value={displayedAnswerVal}
              onChange={(e) => handleChangeOfTextField(e.target.value)}
              multiline
              rows={5}
              fullWidth
              required={question.required}
              variant="standard"
              error={!isValid(question, displayedAnswerVal)}
            />
            {question.required && <div className={classes.requiredIndicator}>required</div>}
          </div>

          <div className={classes.statusWrapper}>
            <AnswerStatusIndicator
              changesPresent={hasUnsavedChanges(storedAnswer, displayedAnswerVal)}
              disabled={answerSubmitting}
              invalid={!isValid(question, displayedAnswerVal)}
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
  labelAndInput: {
    width: "100%",
  },
  input: {
    width: "100%",
  },
  label: {
    display: "block",
    fontFamily: styleVars.txtFontFamilyDefault,
    fontSize: styleVars.txtFontSizeDefault,
    fontWeight: styleVars.txtFontWeightNormal,
    marginRight: theme.spacing(2.25),
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

// Check if displayed answer is valid to submit.
const isValid = memoizee((question, displayedAnswerVal) => {
  // Nest the displayed answer option in a faux-answer object to
  // align with validation method requirements.
  let a = { response: displayedAnswerVal };
  let validator = new AnswerValidator(question, a);
  let res = validator.isValid();
  return res;
});

// Check if the server answer value matches the displayed (form) value.
const hasUnsavedChanges = memoizee((storedAnswer, displayedAnswerVal) => {
  let match = false;
  let storedAnswerStr = "";
  if (
    storedAnswer &&
    storedAnswer.hasOwnProperty("value") &&
    storedAnswer.value.hasOwnProperty("response") &&
    typeof storedAnswer.value.response === "string"
  ) {
    storedAnswerStr = storedAnswer.value.response.trim();
  }

  if (
    0 === storedAnswerStr.length &&
    (!displayedAnswerVal || "" === displayedAnswerVal || "" === displayedAnswerVal.trim())
  ) {
    // No stored value, no entered value.
    match = true;
  } else if (displayedAnswerVal && displayedAnswerVal.trim() === storedAnswerStr) {
    // Stored value matches entered value.
    match = true;
  }
  return !match;
});

const calculateInitialAnswerVal = memoizee((question, storedAnswer, docbuilderVars) => {
  let res;

  // Look for a stored value.
  if (storedAnswer) {
    res = get(storedAnswer, "value.response", "");
    if (res && isString(res) && res.length > 0) {
      return res;
    }
  }

  // Otherwise, try for a "prepopulate" value from the question.
  else {
    res = get(question, "value.prepopulate", "");
    if (res && isString(res) && res.length > 0) {
      // If not empty, pass it through the template parser.
      let tpl = Handlebars.compile(res);
      res = tpl(docbuilderVars);
      return res;
    }
  }

  // If nothing else, just an empty string.
  return "";
});

QtTextManualLongV1.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  organizationId: PropTypes.number.isRequired,
  onSubmitAnswer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  storedAnswer: PropTypes.shape(docbuilderAnswerByQuestionTypeShapes.text_manual_long_v1),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
};
