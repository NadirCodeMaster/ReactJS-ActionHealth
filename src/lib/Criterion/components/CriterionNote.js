import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import memoizee from "memoizee";
import { isNil, isString, get, has } from "lodash";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import DraftEditor from "components/ui/DraftEditor";
import EditIcon from "@mui/icons-material/CreateOutlined";
import ConfirmButton from "components/ui/ConfirmButton";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import moment from "moment";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

//
// Displays and allows editing of existing CriterionNote.
// ------------------------------------------------------
//

export default function CriterionNote({
  allowedHtml,
  currentUser,
  deleteNote,
  note,
  notesLoading,
  notesSaving,
  saveNote,
  sizeStr,
  userCanEditCriterionNotes,
  userCanViewCriterionNotes,
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
  const [editMode, setEditMode] = useState(false);
  const [draftNote, setDraftNote] = useState(null);

  // This is to give us a more reliable user object to refer to
  // as the "creator". The endpoint for saving a new note doesn't
  // include the hydrated `creator` prop that a normal GET request
  // does, but we can account for most use cases by just confirming
  // the created_by ID matches the current user ID.
  const [calculatedCreator, setCalculatedCreator] = useState(null);

  // Like calculatedCreator, but for updates.
  const [calculatedUpdater, setCalculatedUpdater] = useState(null);

  // Calculate calculatedCreator.
  useEffect(() => {
    let newCalculatedCreator = null;
    if (has(note, "creator") && !isNil(note.creator)) {
      newCalculatedCreator = note.creator;
    } else if (note.created_by === currentUser.data.id) {
      newCalculatedCreator = currentUser.data;
    }
    if (mounted.current) {
      setCalculatedCreator(newCalculatedCreator);
    }
  }, [currentUser, note]);

  // Calculate calculatedUpdater.
  useEffect(() => {
    let newCalculatedUpdater = null;
    if (has(note, "updater") && !isNil(note.updater)) {
      newCalculatedUpdater = note.updater;
    } else if (note.updated_by === currentUser.data.id) {
      newCalculatedUpdater = currentUser.data;
    }
    if (mounted.current) {
      setCalculatedUpdater(newCalculatedUpdater);
    }
  }, [currentUser, note]);

  // Updates to apply when provided note object prop changes.
  useEffect(() => {
    // @TODO Check if we need to do anything to prevent clobbering current
    // user's content during pusher update, if necessary.
    if (mounted.current) {
      setDraftNote(note);
    }
  }, [note]);

  // Respond to user clicking "edit".
  const handleEditClick = useCallback(() => {
    // If previously in editMode return draftNote value to original note prop.
    if (editMode) {
      if (mounted.current) {
        setDraftNote(note);
        setEditMode(false);
      }
    } else {
      // Otherwise, just enable editMode.
      if (mounted.current) {
        setEditMode(true);
      }
    }
  }, [editMode, note]);

  // Respond to user clicking "save" (or "update").
  const handleSaveClick = useCallback(() => {
    saveNote(draftNote, (ok) => {
      if (ok) {
        hgToast("Changes saved");
        if (mounted.current) {
          setEditMode(false);
        }
      } else {
        hgToast(
          "An error occurred saving your changes. Try reloading this page or contact Healthier Generation for assistance.",
          "error"
        );
      }
    });
  }, [draftNote, saveNote]);

  // Respond to user clicking "delete".
  const handleDeleteClick = useCallback(() => {
    deleteNote(draftNote, (ok) => {
      if (ok) {
        hgToast("Note deleted");
      } else {
        hgToast(
          "An error occurred deleting the note. Try reloading this page or contact Healthier Generation for assistance.",
          "error"
        );
      }
    });
  }, [deleteNote, draftNote]);

  // Update draftNote as user changes its content.
  const handleContentChange = useCallback(
    (content) => {
      if (mounted.current) {
        setDraftNote({ ...draftNote, content });
      }
    },
    [draftNote]
  );

  // DISPLAY ============================================
  return (
    <Fragment>
      {userCanViewCriterionNotes && (
        <div className={classes.noteContainer}>
          {/* LEFT COL */}
          <div className={clsx(classes.noteLeftColumn, sizeStr)}>
            <div className={classes.noteNameAbbreviation}>{abbreviateName(calculatedCreator)}</div>
          </div>

          {/* RIGHT COL */}
          <div className={clsx(classes.noteRightColumn, sizeStr)}>
            {/* RIGHT COL: HEADER */}
            <div className={classes.noteHeaderContainer}>
              {/* NOTE META */}
              <div className={classes.noteMetaContainer}>
                {/* CREATOR NAME */}
                {!isNil(calculatedCreator) && (
                  <div className={classes.noteCreatedBy}>
                    {calculatedCreator.name_first} {calculatedCreator.name_last}
                  </div>
                )}
                {/* CREATION DATE */}
                <div className={classes.noteCreatedAt}>{formatDate(note.created_at)}</div>
              </div>

              {/* EDIT BUTTON */}
              {userCanEditCriterionNotes && (
                <div className="no-print">
                  <div className={classes.noteEditContainer} onClick={handleEditClick}>
                    {editMode && <React.Fragment>Cancel</React.Fragment>}
                    {!editMode && (
                      <Fragment>
                        Edit <EditIcon className={classes.noteEditIcon} color="primary" />
                      </Fragment>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COL: BODY */}
            <div className={classes.noteMainContainer}>
              {/* NOTE DISPLAY (READ-ONLY) */}
              {!editMode && (
                <Fragment>
                  <DraftEditor keyProp={note.id} value={note.content} readOnly={true} />
                </Fragment>
              )}

              {/* NOTE DISPLAY (EDITABLE) */}
              {editMode && draftNote && (
                <div className={clsx(classes.noteEditableContainer)}>
                  <DraftEditor
                    keyProp={note.id}
                    value={draftNote.content}
                    onChange={handleContentChange}
                    customToolbarHtml={allowedHtml}
                  />
                  <div className={clsx(classes.noteButtonsContainer, sizeStr)}>
                    <ConfirmButton
                      className={clsx(classes.noteDeleteButton, sizeStr)}
                      color="secondary"
                      onConfirm={handleDeleteClick}
                      title="Are you sure you want to delete this note?"
                      variant="contained"
                      type="submit"
                    >
                      Delete Note
                    </ConfirmButton>
                    <Button
                      className={clsx(classes.noteSaveButton, sizeStr)}
                      color="primary"
                      onClick={handleSaveClick}
                      variant="contained"
                      type="submit"
                    >
                      Update Note
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {note && note.updated_at && (
              <div className={classes.noteUpdatedAt}>
                {updatedStr(note.updated_at, calculatedUpdater)}
              </div>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  noteContainer: {
    margin: theme.spacing(0, 0, 2, 0),
    padding: theme.spacing(0, 0, 2, 0),
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    display: "flex",
    justifyContent: "space-between",
  },
  noteLeftColumn: {
    "&.sm": {
      display: "none",
    },
    "&.lg": {
      width: "7%",
    },
  },
  noteRightColumn: {
    "&.sm": {
      width: "100%",
    },
    "&.lg": {
      width: "92%",
    },
  },
  noteHeaderContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: theme.spacing(0, 0, 1, 0),
  },
  noteCreatedBy: {
    fontWeight: styleVars.txtFontWeightDefaultBold,
  },
  noteCreatedAt: {
    fontWeight: "lighter",
    fontSize: styleVars.txtFontSizeXs,
  },
  noteEditContainer: {
    cursor: "pointer",
    color: styleVars.colorPrimary,
    height: theme.spacing(2),
    display: "flex",
    alignItems: "center",
  },
  noteEditIcon: {
    margin: theme.spacing(0, 0, 0, 0.5),
  },
  noteButtonsContainer: {
    "&.lg": {
      display: "flex",
      justifyContent: "flex-end",
      margin: theme.spacing(1, 0, 0, 0),
    },
  },
  noteSaveButton: {
    "&.sm": {
      margin: theme.spacing(1, 0, 0, 0),
      width: "100%",
    },
  },
  noteDeleteButton: {
    "&.sm": {
      margin: theme.spacing(1, 0, 0, 0),
      width: "100%",
    },
    "&.lg": {
      margin: theme.spacing(0, 1, 0, 0),
    },
  },
  noteUpdatedAt: {
    margin: theme.spacing(1, 0, 0, 0),
    fontWeight: "lighter",
    fontSize: styleVars.txtFontSizeXs,
  },
  noteNameAbbreviation: {
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    lineHeight: "20px",
    zIndex: "-1",
    background: styleVars.colorPrimary,
    fontSize: styleVars.txtFontSizeXs,
    color: "#FFFFFF",
    textAlign: "center",
  },
  noteEditableContainer: {},
}));

// Get formatted datetime for a timestamp.
const formatDate = memoizee((timestamp) => {
  return moment.utc(timestamp).local().format("MMMM Do YYYY, h:mm a");
});

// Get abbreviated version of user's name.
const abbreviateName = memoizee((creatorObj) => {
  let res = "";
  if (creatorObj && has(creatorObj, "name_first") && has(creatorObj, "name_last")) {
    let fi = creatorObj.name_first.length > 0 ? creatorObj.name_first.charAt(0) : "";
    let li = creatorObj.name_last.length > 0 ? creatorObj.name_last.charAt(0) : "";
    let combined = `${fi}${li}`;
    if (combined.length > 0) {
      res = combined;
    } else {
      res = "n/a";
    }
  }
  return res.toUpperCase();
});

// Get formatted string with "updated at/by" information for a note.
const updatedStr = memoizee((updatedAt, updaterObj) => {
  let res = "";

  // The minimum we need generate some text is the updated_at value.
  // Ideally we'll also have an "updater" object, but that's not always
  // available (depending on source of the note object, or whether we
  // were able to "calculate" it, thus updaterObj being a different param).
  // So we make best use of whatever is available.
  if (isString(updatedAt) && updatedAt.length > 0) {
    let nameStr = "";
    let dateStr = formatDate(updatedAt);

    // Try filling in the name string.
    if (!isNil(updaterObj)) {
      let fname = get(updaterObj, "name_first", "");
      let lname = get(updaterObj, "name_last", "");
      if (fname.length > 0 || lname.length > 0) {
        nameStr = ` by ${fname} ${fname} `;
      }
    }
    // Then assemble the final output.
    res = `Updated ${nameStr} ${dateStr}`;
  }
  return res;
});

CriterionNote.propTypes = {
  allowedHtml: PropTypes.object.isRequired,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  deleteNote: PropTypes.func.isRequired,
  note: PropTypes.object.isRequired, // pass partially-instantiated (no ID) for new
  notesLoading: PropTypes.bool.isRequired,
  notesSaving: PropTypes.bool.isRequired,
  saveNote: PropTypes.func.isRequired,
  sizeStr: PropTypes.string, // 'sm'|'lg'
  userCanEditCriterionNotes: PropTypes.bool.isRequired,
};
