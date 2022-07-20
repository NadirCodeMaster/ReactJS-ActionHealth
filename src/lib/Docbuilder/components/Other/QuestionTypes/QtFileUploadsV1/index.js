import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { clone, debounce, get, has, isArray, isEmpty, isEqual, isObject, keys } from "lodash";
import { FormControl, FormGroup } from "@mui/material";
import { makeStyles } from "@mui/styles";
import memoizee from "memoizee";
import {
  docbuilderAnswerByQuestionTypeShapes,
  docbuilderQuestionShape,
  docbuilderSubsectionShape,
  docbuilderVarsShape,
} from "../../../../prop-type-shapes";
import AnswerValidator from "../../../../classes/AnswerValidator/index";
import AnswerStatusIndicator from "../../AnswerStatusIndicator";
import { Markup } from "interweave";
import FileUploadItem from "./FileUploadItem";
import DraftFileUploadItem from "./DraftFileUploadItem";
import { requestCreateFileUpload } from "../../../../requests";
import formatBytes from "utils/formatBytes";
import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

// @TODO Incorporate permissions if/where needed

//
// Form display for questions of type file_uploads_v1.
// -----------------------------------------------------------------------------
// Typically rendered inside ../../Question (which is then rendered
// inside ../../ModalSubsection).
//

export default function QtFileUploadsV1({
  applyDisplayedAnswerStatus,
  organizationId,
  readOnly, // prevent changes when doc is submitted/locked/closed
  question,
  deleteAnswer,
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

  // Local copy of the stored answer response where we make changes
  // before saving them to the server.
  //
  // Unlike storedAnswer, this is the response property itself
  // (storedAnswer from server contains a response property that
  //  is equivalent).
  //
  // Note: We don't add the draft item to this object until
  // the file has been uploaded and has an ID we can use
  // as the key.
  const [displayedAnswerResp, setDisplayedAnswerResp] = useState({});

  // Whether to show the draft.
  // There can only ever be one draft/unsaved file.
  const [showDraftItem, setShowDraftItem] = useState(false);

  // Whether the draft file itself is actively being uploaded.
  const [draftFileUploading, setDraftFileUploading] = useState(false);

  // Text of upload button.
  const [uploadButtonText, setUploadButtonText] = useState("Upload file");

  // Stores a string with file type extensions question allows.
  const [allowedFileTypesStr, setAllowedFileTypesStr] = useState("");

  // Help text about number of files that may be uploaded.
  const [quantityHelpText, setQuantityHelpText] = useState("");

  // Set allowedFileTypesStr based on question.
  useEffect(() => {
    let newAllowedFileTypesStr = "";
    if (isArray(question.value.allowedFileTypes)) {
      let useSingular = question.value.allowedFileTypes.length === 1;
      let label = useSingular ? "Allowed format:" : "Allowed formats:";
      newAllowedFileTypesStr = `${label} ${question.value.allowedFileTypes.join(", ")}`;
    }
    setAllowedFileTypesStr(newAllowedFileTypesStr);
  }, [question]);

  // Whether to show draft item.
  useEffect(() => {
    let newShowDraftItem = false;
    let saVal = get(storedAnswer, "value.response", null);

    // If stored answer is empty or has less items than the
    // max we show draft item.
    if (!saVal) {
      newShowDraftItem = true;
    } else {
      let fileIds = keys(saVal);
      if (fileIds.length < question.value.maxFiles) {
        newShowDraftItem = true;
      }
    }
    setShowDraftItem(newShowDraftItem);
  }, [question, storedAnswer]);

  // Initial population and ongoing updates to displayedAnswerResp based on stored answer.
  useEffect(() => {
    let iv = calculateInitialVal(question, storedAnswer);

    // Ensure resulting object values are sorted.
    // The sorting is just based on numeric primary keys (since we don't have ready access
    // to dates here), but that will almost always be equivalent. Even if not equivalent,
    // it'll be consistent. Strategy below from https://stackoverflow.com/a/31102605
    let newDisplayedAnswerResp = Object.keys(iv)
      .sort()
      .reduce((obj, key) => {
        obj[key] = iv[key];
        return obj;
      }, {});
    setDisplayedAnswerResp(newDisplayedAnswerResp);

    // Disable linting of useEffect() dependencies since we intentionally
    // want to avoid triggering the effect upon change of storedAnswer
    // (otherwise it makes text editing wonky).
  }, [question /*, storedAnswer */]); // eslint-disable-line

  // Adjust upload button, quantity help text as needed.
  useEffect(() => {
    let fileIds = keys(displayedAnswerResp);
    setUploadButtonText(
      generateUploadButtonText(question.value.minFiles, question.value.maxFiles, fileIds.length)
    );
    setQuantityHelpText(
      generateQuantityHelpText(
        question.required,
        question.value.minFiles,
        question.value.maxFiles,
        fileIds.length
      )
    );
  }, [question, displayedAnswerResp]);

  /**
   * Save an answer payload to the server
   *
   * You should probably be calling validateAndSaveToApi instead of
   * calling this directly. Payload must be validated before calling.
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
    }, 1000),
    [onSubmitAnswer, organizationId, subsection, question]
  );

  /**
   * Saves displayed answer to API.
   *
   * This method validates, and if valid, packages and saves
   * the displayedAnswersResp value to API.
   *
   * @param {object} displayedAnswer
   */
  const validateAndSaveToApi = useCallback(
    (displayedAnswerResp) => {
      // Validate if not empty.
      let darIsEmpty = isObject(displayedAnswerResp) && isEmpty(displayedAnswerResp);
      if (!darIsEmpty && !isValid(question, displayedAnswerResp)) {
        return;
      }

      // If no files are in displayedAnswerResp, use null
      // so the API doesn't reject it. (API treats that as
      // clearing an answer; sending an empty _object_ on
      // a required question would be treated as an invalid
      // answer and therefore rejected).
      let toSave = null;

      if (!darIsEmpty) {
        if (!isEmpty(displayedAnswerResp)) {
          toSave = { response: clone(displayedAnswerResp) };
        }
      }

      if (!toSave) {
        if (mounted.current) {
          setAnswerSubmitting(true);
          deleteAnswer(organizationId, question.id, () => {
            setAnswerSubmitting(false);
          });
        }
      } else {
        // If valid, submit it.
        if (mounted.current) {
          _saveToApi(toSave);
        }
      }
    },
    [question, organizationId, deleteAnswer, _saveToApi]
  );

  // Add a file item to the displayed answer, save to server.
  const addItem = useCallback(
    (fileId, name) => {
      let newDisplayedAnswerResp = {
        ...displayedAnswerResp,
        [fileId]: {
          name: name,
        },
      };
      setDisplayedAnswerResp(newDisplayedAnswerResp);
      validateAndSaveToApi(newDisplayedAnswerResp);
    },
    [displayedAnswerResp, validateAndSaveToApi]
  );

  // Remove a file item from the answer.
  //
  // API is responsible for deleting orphaned files,
  // so all we do is adjust the displayed answer value
  // and save it.
  const removeItem = useCallback(
    (fileId) => {
      let newDisplayedAnswerResp = { ...displayedAnswerResp };
      if (has(newDisplayedAnswerResp, fileId)) {
        delete newDisplayedAnswerResp[fileId];
      }
      setDisplayedAnswerResp(newDisplayedAnswerResp);
      validateAndSaveToApi(newDisplayedAnswerResp);
    },
    [displayedAnswerResp, validateAndSaveToApi]
  );

  // Upload a new file to server, handle result.
  const uploadFile = useCallback(
    (fileData) => {
      setDraftFileUploading(true);

      let requestMeta = {
        organization_id: organizationId,
        docbuilder_question_id: question.id,
        file_types: question.value.allowedFileTypes,
      };

      requestCreateFileUpload(fileData, requestMeta).then((res) => {
        if (mounted.current) {
          // Create succeeded
          if (201 === res.status) {
            let newFileId = get(res, "data.data.id", null);
            let newFileName = get(res, "data.data.upload_name", "");
            if (null !== newFileId) {
              // Add to answer.
              addItem(newFileId, newFileName);
            }
          }
          // Create failed due to file type
          else if (422 === res.status) {
            hgToast("Sorry, that file type isn't accepted", "error", { autoClose: false });
          }
          // Create failed for some other reason
          else {
            hgToast(
              "An unknown error occurred uploading the file. Please try again or get in touch with our support team.",
              "error",
              { autoClose: false }
            );
            // (message: "An unknown error occurred uploading the file")
          }
          setDraftFileUploading(false);
        }
      });
    },
    [addItem, organizationId, question]
  );

  const handleDraftFileInputChange = useCallback(
    (e) => {
      let fileData = get(e.target, "files[0]", "");
      let fileSize = get(fileData, "size", "");

      // Ensure file is less than max size.
      if (fileSize && fileSize > process.env.REACT_APP_MAX_UPLOAD_BYTES_ACTUAL) {
        let fileLimitGuidance = formatBytes(process.env.REACT_APP_MAX_UPLOAD_BYTES_GUIDANCE, 2);
        let msg = `File is too large. It must be smaller than ${fileLimitGuidance}. (was ${formatBytes(
          fileSize,
          2
        )})`;
        hgToast(msg, "error", { autoClose: false });
        return;
      }

      // If size is okay, continue with uploading.
      uploadFile(fileData, question);
    },
    [question, uploadFile]
  );

  const handleFileNameChange = useCallback(
    (e, fileId) => {
      if (mounted.current) {
        let newDisplayedAnswerResp = { ...displayedAnswerResp };
        newDisplayedAnswerResp[fileId].name = e.target.value;
        setDisplayedAnswerResp(newDisplayedAnswerResp);
        validateAndSaveToApi(newDisplayedAnswerResp);
      }
    },
    [displayedAnswerResp, validateAndSaveToApi]
  );

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
    let ok = true;
    let darIsEmpty = isObject(displayedAnswerResp) && isEmpty(displayedAnswerResp);
    if (!darIsEmpty && !isValid(question, displayedAnswerResp)) {
      ok = false;
    }
    debouncedApplyDisplayedAnswerStatus(ok);
  }, [question, debouncedApplyDisplayedAnswerStatus, displayedAnswerResp]);

  return (
    <Fragment>
      {question && (
        <div className={classes.wrapper}>
          <FormControl
            required={question.required}
            component="fieldset"
            className={classes.formControl}
            variant="standard"
          >
            <legend className={classes.label} htmlFor={`q${question.id}_ss${subsection.id}`}>
              <Markup content={question.value.label} />
              {question.required && <div className={classes.requiredIndicator}> (required)</div>}
            </legend>

            <FormGroup>
              {Object.keys(displayedAnswerResp).map((k, i) => (
                <div className={classes.fileUploadItemWrapper} key={k}>
                  <FileUploadItem
                    itemNumber={i + 1}
                    fileId={parseInt(k, 10)}
                    fileUrl={generateFileUrl(k)}
                    disabled={readOnly}
                    name={displayedAnswerResp[k].name}
                    nameChangeHandler={handleFileNameChange}
                    removeItemFn={removeItem}
                  />
                </div>
              ))}

              {Object.keys(displayedAnswerResp).length > 0 && <Fragment>{/* <br /> */}</Fragment>}

              {quantityHelpText && (
                <span className={classes.quantityHelpText}>{quantityHelpText}</span>
              )}

              {showDraftItem && (
                <div className={classes.draftFileUploadItemWrapper}>
                  <DraftFileUploadItem
                    allowedFileTypesStr={allowedFileTypesStr}
                    disabled={draftFileUploading || readOnly}
                    inputChangeHandler={handleDraftFileInputChange}
                    questionId={question.id}
                    text={uploadButtonText}
                    uploading={draftFileUploading}
                  />
                </div>
              )}
            </FormGroup>
          </FormControl>

          <div className={classes.statusWrapper}>
            <AnswerStatusIndicator
              changesPresent={hasUnsavedChanges(storedAnswer, displayedAnswerResp)}
              disabled={answerSubmitting}
              invalid={!isValid(question, displayedAnswerResp)}
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
    marginRight: theme.spacing(1.75),
  },
  formControlLabelClassLabel: {
    marginBottom: theme.spacing(1.25),
    paddingTop: theme.spacing(1),
  },
  formControlLabelClassRoot: {
    alignItems: "flex-start",
  },
  draftFileUploadItemWrapper: {
    marginBottom: theme.spacing(),
  },
  fileUploadItemWrapper: {
    marginBottom: theme.spacing(0.75),
    marginTop: theme.spacing(0.75),
  },
  quantityHelpText: {
    fontSize: styleVars.txtFontSizeXs,
    fontStyle: "italic",
    marginBottom: theme.spacing(),
  },
  requiredIndicator: {
    color: styleVars.colorDarkGray,
    display: "none", // hiding for aesthetic reasons [ak 2/3/2022]
    fontFamily: styleVars.txtFontFamilyInputs,
    fontSize: styleVars.txtFontSizeXxs,
    fontWeight: styleVars.txtFontWeightDefaultLight,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    textAlign: "right",
  },
}));

/**
 * Generate URL for an uploaded file.
 * @param {integer} fileId
 * @returns {string}
 */
const generateFileUrl = (fileId) => {
  return `${process.env.REACT_APP_API_URL}/builder-uploads/${parseInt(fileId, 10)}`;
};

/**
 * Generate text for file upload button.
 * @param {integer} min Minimum number of files required
 * @param {integer} max Minimum number of files required
 * @param {integer} cur Current number of files
 * @returns {string} Text output (no HTML or JSX)
 */
const generateUploadButtonText = memoizee((min, max, cur) => {
  // eslint-disable-next-line
  let _min = min ? parseInt(min, 10) : 0;
  let _max = max ? parseInt(max, 10) : 0;
  let _cur = cur ? parseInt(cur, 10) : 0;
  // eslint-disable-next-line
  let remaining = _max - _cur;

  if (0 === _cur) {
    return "Upload file";
  }
  return "Upload another";
});

/**
 * Generate helper text regarding number of files.
 * @param {bool} required Whether question is required
 * @param {integer} min Minimum number of files required
 * @param {integer} max Minimum number of files required
 * @param {integer} cur Current number of files
 * @returns {string} Text output (no HTML or JSX)
 */
const generateQuantityHelpText = memoizee((required, min, max, cur) => {
  let _min = min ? parseInt(min, 10) : 0;
  let _max = max ? parseInt(max, 10) : 0;
  let _cur = cur ? parseInt(cur, 10) : 0;
  let remaining = _max - _cur;

  let minIsSingular = _min === 1;
  let maxIsSingular = _max === 1;
  let remainingIsSingular = remaining === 1;

  // -- Max reached
  if (!remaining) {
    return `You've uploaded the maximum of ${_max} ${maxIsSingular ? "file" : "files"}.`;
  }

  // -- Field is required, min not met
  if (required && _cur < _min) {
    if (_min === _max) {
      return `Upload ${_min} ${minIsSingular ? "file" : "files"} (${_min - _cur} to go).`;
    }
    return `Upload at least ${_min} ${minIsSingular ? "file" : "files"} (${_min - _cur} to go).`;
  }

  // -- Field not required, nothing uploaded yet.
  if (!required && !_cur) {
    return `You may upload up a maximum of ${_max} ${maxIsSingular ? "file" : "files"}.`;
  }

  // -- Remaining scenarios.
  return `You may upload ${remaining} more ${
    remainingIsSingular ? "file" : "files"
  } (maximum of ${_max}).`;
});

// Check if entered values are valid to submit.
const isValid = memoizee((question, displayedAnswerResp) => {
  // Nest the answer values in a faux-answer object to
  // align with validation method requirements.
  let a = {
    response: displayedAnswerResp,
  };

  let validator = new AnswerValidator(question, a);
  return validator.isValid();
});

// Check if the server answer value matches the displayed (form) value.
const hasUnsavedChanges = (storedAnswer, displayedAnswerResp) => {
  let _s = get(storedAnswer, "value.response", null);
  let _d = displayedAnswerResp;

  // If both are empty-like, no changes to report.
  if (isEmpty(_s) && isEmpty(_d)) {
    return false;
  }
  // If they have the same stuff, no changes to report.
  if (isEqual(_s, _d)) {
    return false;
  }
  // If here, they are not the same.
  return true;
};

// Calculate and return initial value for displayedAnswerResp.
const calculateInitialVal = (question, storedAnswer) => {
  // Use the storedAnswer if there is one.
  if (
    storedAnswer &&
    has(storedAnswer, "value.response") &&
    isObject(storedAnswer.value.response)
  ) {
    return storedAnswer.value.response;
  }
  return {};
};

QtFileUploadsV1.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape),
  organizationId: PropTypes.number.isRequired,
  onSubmitAnswer: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  deleteAnswer: PropTypes.func.isRequired,
  storedAnswer: PropTypes.shape(docbuilderAnswerByQuestionTypeShapes.file_uploads_v1),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
};
