import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

export default function DraftFileUploadItem({
  allowedFileTypesStr,
  disabled,
  inputChangeHandler,
  questionId,
  text,
  uploading,
}) {
  return (
    <Fragment>
      {uploading ? (
        <Fragment>Saving... {/* @TODO replace w/spinner */}</Fragment>
      ) : (
        <Fragment>
          <input
            accept={allowedFileTypesStr}
            id={`draft-file-for-question-${questionId}`}
            type="file"
            disabled={disabled}
            hidden
            onChange={(e) => inputChangeHandler(e)}
          />
          <div>
            <label htmlFor={`draft-file-for-question-${questionId}`}>
              <Button
                size="small"
                component="span"
                variant="contained"
                color="secondary"
                disabled={disabled}
              >
                {text ? <Fragment>{text}</Fragment> : <Fragment>Upload file</Fragment>}
              </Button>
              <div style={{ marginTop: "0.25em" }}>
                <small>
                  <em>{allowedFileTypesStr}</em>
                </small>
              </div>
            </label>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
}

DraftFileUploadItem.propTypes = {
  allowedFileTypesStr: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  inputChangeHandler: PropTypes.func.isRequired,
  questionId: PropTypes.number.isRequired,
  text: PropTypes.string,
  uploading: PropTypes.bool,
};
