import React, { Fragment, useCallback, useEffect, useReducer, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import CriterionNote from "./CriterionNote";
import DraftEditor from "components/ui/DraftEditor";
import criterionNotesReducer from "../utils/criterionNotesReducer";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import hgToast from "utils/hgToast";
import userCan from "utils/userCan";
import clsx from "clsx";
import isJsonTextEmpty from "utils/isJsonTextEmpty";
import {
  requestOrganizationCriterionNotes,
  requestCreateCriterionNote,
  requestDeleteCriterionNote,
  requestUpdateCriterionNote,
} from "api/requests";

export default function CriterionNotes({ criterionId, currentUser, organization }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const allowedHtml = useSelector(
    (state) => state.app_meta.data.allowedHtml.criterion_notes.content
  );

  const { width, ref: resizeDetectorRef } = useResizeDetector();
  const [sizeStr, setSizeStr] = useState("sm"); // 'sm'|'lg'

  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState(null); // null or note object
  const [notes, dispatchNotesReducer] = useReducer(criterionNotesReducer, []);
  const [savingExisting, setSavingExisting] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const [userCanEditCriterionNotes, setUserCanEditCriterionNotes] = useState(false);
  const [userCanViewCriterionNotes, setUserCanViewCriterionNotes] = useState(false);

  // Set perms.
  useEffect(() => {
    let newUserCanEditCriterionNotes = userCan(currentUser, organization, "edit_criterion_notes");
    let newUserCanViewCriterionNotes = userCan(currentUser, organization, "view_criterion_notes");
    if (mounted.current) {
      setUserCanEditCriterionNotes(newUserCanEditCriterionNotes);
      setUserCanViewCriterionNotes(newUserCanViewCriterionNotes);
    }
  }, [currentUser, organization]);

  // Set size.
  useEffect(() => {
    let newSizeStr = width > maxSmWidth ? "lg" : "sm";
    if (mounted.current) {
      setSizeStr(newSizeStr);
    }
  }, [width]);

  // Load all notes for this criterion into component state.
  const loadNotes = useCallback(
    (criterionId, organizationId, callback = null) => {
      if (mounted.current) {
        setLoading(true);
      }
      requestOrganizationCriterionNotes(organizationId, { criterion_id: criterionId })
        .then((res) => {
          if (mounted.current) {
            setLoading(false);
            dispatchNotesReducer({
              type: "replace",
              payload: res.data.data,
            });
          }
          if (callback) {
            callback(true);
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setLoading(false);
            dispatchNotesReducer({ type: "clear" });
          }
          console.error(`An error occurred retrieving notes. ${error.name}: ${error.description}`);
          if (callback) {
            callback(false);
          }
        });
    },
    [dispatchNotesReducer]
  );

  // Initial load of notes.
  useEffect(() => {
    if (userCanViewCriterionNotes && mounted.current) {
      loadNotes(criterionId, organization.id);
    }
  }, [criterionId, organization, loadNotes, userCanViewCriterionNotes]);

  // Delete a criterion note.
  const deleteNote = (noteObj, callback = null) => {
    if (mounted.current) {
      setSavingExisting(true);
    }
    let criterionId = noteObj.criterion_id;
    let organizationId = noteObj.organization_id;
    requestDeleteCriterionNote(noteObj.id)
      .then((res) => {
        if (mounted.current) {
          setSavingExisting(false);
          loadNotes(criterionId, organizationId);
        }
        if (callback) {
          callback(true);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setSavingExisting(false);
        }
        console.error(`An error occurred deleting a note. ${err.name}: ${err.description}`);
        if (callback) {
          callback(false);
        }
      });
  };

  const generateEmptyNote = useCallback(() => {
    return {
      id: null,
      created_by: currentUser.data.id,
      criterion_id: criterionId,
      content: {},
      organization_id: organization.id,
      _tempId: Date.now(),
    };
  }, [criterionId, currentUser, organization]);

  // Declare a new, unsaved empty note.
  useEffect(() => {
    if (mounted.current) {
      setNewNote(generateEmptyNote());
    }
  }, [criterionId, generateEmptyNote, organization]);

  // Save the new note record.
  const saveNewNote = useCallback(() => {
    if (mounted.current) {
      setSavingNew(true);
    }
    requestCreateCriterionNote(newNote)
      .then((res) => {
        // Save successful. Add server-returned version of the note
        // to our list and nullify the newNote.
        if (mounted.current) {
          dispatchNotesReducer({ type: "add", payload: [res.data.data] });
          setNewNote(generateEmptyNote());
          setSavingNew(false);
        }
        hgToast("Note saved");
      })
      .catch((err) => {
        if (mounted.current) {
          setSavingNew(false);
        }
        console.error("An error occurred saving new note");
        hgToast(
          "An error occurred saving your note. Try reloading this page or contact Healthier Generation for assistance.",
          "error"
        );
      });
  }, [dispatchNotesReducer, generateEmptyNote, newNote]);

  // Save existing single note.
  const saveNote = useCallback((note, callback = null) => {
    if (mounted.current) {
      setSavingExisting(true);
      // Since this is an update, apply the changes to our
      // notes array immediately rather than waiting for a
      // response from server.
      dispatchNotesReducer({
        type: "add",
        payload: [note],
      });
    }

    requestUpdateCriterionNote(note)
      .then((res) => {
        if (mounted.current) {
          // Update the note again so it includes the update info
          // info the server will include.
          dispatchNotesReducer({
            type: "add",
            payload: [res.data.data],
          });
          setSavingExisting(false);
        }
        if (callback) {
          callback(true);
        }
      })
      .catch((err) => {
        console.error("An error occurred updating a note");
        if (mounted.current) {
          setSavingExisting(false);
        }
        if (callback) {
          callback(false);
        }
      });
  }, []);

  // Push draft editor content to new note.
  const handleNewNoteContentChange = useCallback(
    (content) => {
      if (mounted.current) {
        setNewNote({ ...newNote, content });
      }
    },
    [newNote]
  );

  // DISPLAY =============================
  return (
    <Fragment>
      {userCanViewCriterionNotes && (
        <div ref={resizeDetectorRef}>
          {notes.map((note) => (
            <Fragment key={`cnote_${note.id}`}>
              <CriterionNote
                allowedHtml={allowedHtml}
                currentUser={currentUser}
                note={note}
                deleteNote={deleteNote}
                notesLoading={loading}
                notesSaving={savingExisting}
                saveNote={saveNote}
                sizeStr={sizeStr}
                userCanEditCriterionNotes={userCanEditCriterionNotes}
                userCanViewCriterionNotes={userCanViewCriterionNotes}
              />
            </Fragment>
          ))}

          {/* Note that !savingNew below is necessary to avoid the DraftEditor
          retaining content from the _old_ newNote after it has been saved,
          despite newNote being reset at that time.
          By including the !savingNew condition, the editor is unmounted
          momentarily during save, then re-mounted with the correct value
          (i.e., the new, empty newNote.
          */}
          {userCanEditCriterionNotes && newNote && !savingNew && (
            <div className="no-print">
              <DraftEditor
                keyProp={`newNote`}
                onChange={handleNewNoteContentChange}
                value={newNote.content}
                customToolbarHtml={allowedHtml}
              />
              <div className={classes.saveNoteButtonContainer}>
                <Button
                  className={clsx(classes.saveNoteButton, sizeStr)}
                  color="primary"
                  onClick={saveNewNote}
                  variant="contained"
                  type="submit"
                  disabled={isJsonTextEmpty(newNote.content)}
                >
                  Save New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
}

const maxSmWidth = 499;
const useStyles = makeStyles((theme) => ({
  saveNoteButton: {
    "&.sm": {
      width: "100%",
    },
  },
  saveNoteButtonContainer: {
    margin: theme.spacing(1, 0, 0, 0),
    display: "flex",
    justifyContent: "flex-end",
  },
  skeletonContainer: {
    display: "flex",
    justifyContent: "space-between",
    margin: theme.spacing(0, 0, 2, 0),
  },
  skeletonItemLeft: {
    width: "8%",
  },
  skeletonItemRight: {
    width: "92%",
  },
}));

CriterionNotes.propTypes = {
  criterionId: PropTypes.number.isRequired,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  organization: PropTypes.shape(organizationShape).isRequired, // @TODO add w/pivot
};
