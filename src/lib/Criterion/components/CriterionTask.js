import React, { forwardRef, Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import memoizee from "memoizee";
import { get, has, isNil, isString } from "lodash";
import { Checkbox, InputAdornment, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HgTextField from "components/ui/HgTextField";
import { Draggable } from "react-beautiful-dnd";
import clsx from "clsx";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import styleVars from "style/_vars.scss";

const CriterionTask = forwardRef(
  (
    {
      toggleTaskComplete,
      deleteTask,
      draggable,
      isTop,
      removeNewTask,
      task,
      tasksLoading,
      tasksSaving,
      saveTask,
      userCanEditCriterionTasks,

      // Props starting with "dnd" are intended for use in the Draggable wrapper.
      // (but they are only relevant if includeDraggableWrapper=true)
      includeDndWrapper,
      dndDisableInteractiveElementBlocking,
      dndDraggableId,
      dndIndex,
      dndIsDragDisabled,
    },
    textInputRef
  ) => {
    // Set-up `mounted` to avoid running code when no longer mounted.
    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    const classes = useStyles();

    // Will house props for the draggable wrapper (if all requirements are met).
    const [draggableWrapperProps, setDraggableWrapperProps] = useState({});

    const [showingDragHandle, setShowingDragHandle] = useState(false);

    const [hasError, setHasError] = useState(false);
    const [showError, setShowError] = useState(false);
    const [draftTask, setDraftTask] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Updates to apply when provided task object changes.
    useEffect(() => {
      let newIsChecked = !isNil(get(task, "completed_by", null));
      setDraftTask(task);
      setIsChecked(newIsChecked);
    }, [task]);

    // State handling for mouse entering component for class changes
    const mouseHoverEnter = useCallback(() => {
      if (userCanEditCriterionTasks) {
        setIsHighlighted(true);
      }
    }, [userCanEditCriterionTasks]);

    // Save our draft task.
    const saveThisTask = useCallback(() => {
      // Don't save empty tasks
      if (!isString(draftTask.name) || draftTask.name.length < 1) {
        return;
      }
      // Otherwise, save it. (the save method will handle PUT vs POST)
      saveTask(draftTask);
    }, [draftTask, saveTask]);

    // Delete task from the system
    const deleteThisTask = useCallback(() => {
      if (isNil(task.id)) {
        removeNewTask();
      } else if (!tasksLoading && !tasksSaving) {
        deleteTask(task);
      }
    }, [deleteTask, removeNewTask, tasksSaving, task, tasksLoading]);

    // State handling for mouse leaving component for class changes
    const mouseHoverLeave = useCallback(() => {
      if (userCanEditCriterionTasks) {
        setIsHighlighted(false);
      }
    }, [userCanEditCriterionTasks]);

    // Call completeTask endpoint and set focus and checked state values
    const handleChangeCheckbox = useCallback(
      ({ target }) => {
        if (userCanEditCriterionTasks && !isNil(draftTask.id)) {
          let markAsComplete = !isChecked;

          // Call endpoint to set task to complete
          toggleTaskComplete(draftTask, markAsComplete);

          // Blur the task textfield on checkbox change
          if (textInputRef && has(textInputRef, "current")) {
            textInputRef.current.blur();
          }

          // setState for focused and checked values
          setIsChecked(markAsComplete);
          setIsFocused(false);
        }
      },
      [textInputRef, toggleTaskComplete, draftTask, userCanEditCriterionTasks, isChecked]
    );

    // Actions to take on HgTextField blur
    const handleBlur = useCallback(
      (e) => {
        e.preventDefault();
        setIsFocused(false);
        if (!tasksLoading) {
          saveThisTask();
        }
      },
      [tasksLoading, saveThisTask]
    );

    // Save if keypress is enter button
    const handleKeyPress = useCallback(
      (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (!tasksLoading) {
            saveThisTask();
          }
        }
      },
      [tasksLoading, saveThisTask]
    );

    // Set state for draftTask on HgTextField change
    const handleChangeName = useCallback(
      ({ target }) => {
        setDraftTask({
          ...draftTask,
          name: target.value,
        });
      },
      [draftTask]
    );

    // Hack to have the cursor be at the end when the user focuses the textbox
    const handleFocus = (e) => {
      let tempValue = e.target.value;
      e.target.value = "";
      e.target.value = tempValue;
    };

    // Declare error status and/or whether item should display as having an error.
    useEffect(() => {
      let newHasError = false;
      let newShowError = false;

      if (!isString(draftTask.name) || draftTask.name.length < 1 || draftTask.name.length > 255) {
        newHasError = true;

        // Existing tasks should *show* an error if in an invalid state, but
        // new tasks get a pass to avoid showing an error state before user
        // gets a chance to populate.
        newShowError = !isNil(draftTask.id);
      }
      setHasError(newHasError);
      setShowError(newShowError);
    }, [draftTask]);

    // Prepare props to be passed to <DraggableWrapperForCriterionTask>.
    useEffect(() => {
      let dwp = {};

      if (includeDndWrapper) {
        dwp.wrap = true;
        dwp.disableInteractiveElementBlocking = dndDisableInteractiveElementBlocking ? true : false;
        dwp.draggableId =
          isString(dndDraggableId) && dndDraggableId.length > 0 ? dndDraggableId : null;
        dwp.index = Number(dndIndex);
        dwp.isDragDisabled = dndIsDragDisabled ? true : false;
      }
      setDraggableWrapperProps(dwp);
    }, [
      includeDndWrapper,
      dndDisableInteractiveElementBlocking,
      dndDraggableId,
      dndIndex,
      dndIsDragDisabled,
    ]);

    // Set newShowingDragHandle.
    useEffect(() => {
      let newShowingDragHandle =
        !hasError && draggableWrapperProps.wrap && !draggableWrapperProps.isDragDisabled;
      setShowingDragHandle(newShowingDragHandle);
    }, [draggableWrapperProps, hasError]);

    // DISPLAY ===========
    return (
      <DraggableWrapperForCriterionTask {...draggableWrapperProps}>
        <div onMouseEnter={mouseHoverEnter} onMouseLeave={mouseHoverLeave}>
          <HgTextField
            className={clsx(
              classes.draggableTextField,
              cssClassFor("highlighted", isHighlighted),
              cssClassFor("checked", isChecked),
              cssClassFor("focused", isFocused),
              cssClassFor("top", isTop),
              { [classes.textFieldShowingError]: showError }
            )}
            inputRef={textInputRef}
            error={hasError}
            required
            value={draftTask.name || ""}
            name="name"
            id={`task_name_${draftTask.id}`}
            onChange={handleChangeName}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            disabled={!userCanEditCriterionTasks}
            multiline={true}
            inputProps={{ maxLength: 255 }}
            InputProps={{
              className: clsx(classes.input, classes.underline, cssClassFor("checked", isChecked)),
              startAdornment: (
                <InputAdornment className={classes.inputAdormentStart} position="start">
                  <Checkbox
                    classes={{ root: classes.itemCheckboxRoot }}
                    className={clsx(
                      classes.itemCheckbox,
                      cssClassFor("checked", isChecked),
                      cssClassFor("editable", userCanEditCriterionTasks)
                    )}
                    checked={isChecked}
                    onChange={handleChangeCheckbox}
                    value="done"
                    disabled={!userCanEditCriterionTasks || hasError || isNil(task.id)}
                    disableRipple={true}
                    tabIndex={-1}
                  />
                </InputAdornment>
              ),
              endAdornment: (
                <Fragment>
                  <InputAdornment
                    onClick={deleteThisTask}
                    className={clsx(
                      classes.inputAdormentEnd,
                      cssClassFor("highlighted", isHighlighted),
                      cssClassFor("editable", userCanEditCriterionTasks)
                    )}
                    position="end"
                  >
                    <DeleteIcon className={classes.itemDeleteIcon} color="primary" />
                  </InputAdornment>
                  <InputAdornment
                    className={clsx(
                      classes.inputAdormentEnd,
                      cssClassFor("editable", userCanEditCriterionTasks)
                    )}
                    position="end"
                  >
                    <DragHandleIcon
                      className={clsx(classes.itemDragHandleIcon, {
                        [classes.itemDragHandleIconDisabled]: !showingDragHandle,
                      })}
                      color="secondary"
                    />
                  </InputAdornment>
                </Fragment>
              ),
            }}
          />
        </div>
      </DraggableWrapperForCriterionTask>
    );
  }
);

const useStyles = makeStyles((theme) => ({
  draggableTextField: {
    width: "100%",
    "& .MuiInput-input": {
      background: "transparent",
    },
    "&.focused": {
      // ...
    },
    "&.checked": {
      textDecoration: "line-through",
      color: styleVars.colorSecondary,
    },
    "&.active": {
      // ...
    },
    "&.inactive": {
      // ...
    },
    "&.top": {
      borderTop: `2px solid ${styleVars.colorLightGray}`,
    },
    "& .MuiInputBase-root": {
      "& .MuiInput-input": {
        paddingLeft: "0px",
      },
      "& .MuiInputBase-input": {
        cursor: "default",
      },
    },
  },
  textFieldShowingError: {
    "&::before": {
      alignItems: "center",
      color: styleVars.colorStatusError,
      content: "'!'",
      display: "inline-flex",
      fontSize: styleVars.txtFontSizeSm,
      fontWeight: styleVars.txtFontWeightDefaultBold,
      height: "100%",
      justifyContent: "center",
      position: "absolute",
      width: theme.spacing(),
    },
  },
  input: {
    "&.checked": {
      color: styleVars.colorSecondary,
    },
    minHeight: "35px",
  },
  inputAdormentStart: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  inputAdormentEnd: {
    margin: theme.spacing(0, 1, 0, 1),
    "&.inactive": {
      visibility: "hidden",
    },
    "&.disabled": {
      display: "none",
    },
  },
  itemCheckboxRoot: {
    paddingRight: theme.spacing(0),
    marginRight: theme.spacing(1),
  },
  itemCheckbox: {
    "&.checked": {
      color: styleVars.colorSecondary,
    },
    "&.unchecked": {
      "&.disabled": {
        color: styleVars.colorSecondary,
        cursor: "default",
      },
      color: styleVars.colorPrimary,
    },
  },
  itemDeleteIcon: {
    cursor: "pointer",
  },
  itemDragHandleIcon: {
    cursor: "grab",
    opacity: 1.0,
  },
  itemDragHandleIconDisabled: {
    cursor: "auto",
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: "300ms",
  },
  underline: {
    "&::before": {
      borderBottom: `2px solid ${styleVars.colorLightGray}!important`,
    },
  },
}));

// Dynamic styling for Draggables.
const getItemStyle = (theme, isDragging, disabled, draggableStyle) => ({
  userSelect: "none",
  backgroundColor: isDragging ? styleVars.colorOffWhite : styleVars.colorWhite,
  border: isDragging ? `1px solid ${styleVars.colorPrimary}` : "none",
  boxShadow: isDragging ? `0 0 8px rgba(0,0,0,0.25) ` : "none",
  overflow: "hidden",
  ...draggableStyle,
});

// Utility to simplify getting classnames at runtime.
const cssClassFor = memoizee((identifier, value) => {
  switch (identifier) {
    case "checked":
      return value ? "checked" : "unchecked";
    case "focused":
      return value ? "focused" : "unfocused";
    case "highlighted":
      return value ? "active" : "inactive";
    case "editable":
      return value ? "enabled" : "disabled";
    case "top":
      return value ? "top" : "notTop";
    default:
      return null;
  }
});

//
// Used in CriterionTask to allow conditionally rendering it within <Draggable>
//
const DraggableWrapperForCriterionTask = ({
  children,
  disableInteractiveElementBlocking,
  draggableId,
  index,
  isDragDisabled,
  wrap,
}) => {
  const theme = useTheme();

  if (!wrap) {
    return children;
  }

  return (
    <Draggable
      draggableId={draggableId}
      index={index}
      isDragDisabled={isDragDisabled}
      disableInteractiveElementBlocking={disableInteractiveElementBlocking || false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(theme, snapshot.isDragging, false, provided.draggableProps.style)}
          tabIndex={-1}
        >
          {children}
        </div>
      )}
    </Draggable>
  );
};

CriterionTask.propTypes = {
  deleteTask: PropTypes.func.isRequired,

  // Props starting with "dnd" are intended for use in the Draggable wrapper.
  // They will only utilized if includeDndWrapper=true.
  //
  // Note that none of these are declared as required because of that.
  dndDisableInteractiveElementBlocking: PropTypes.bool,
  dndDraggableId: PropTypes.string,
  dndIndex: PropTypes.number,
  dndIsDragDisabled: PropTypes.bool,

  includeDndWrapper: PropTypes.bool,
  isTop: PropTypes.bool.isRequired,
  tasksLoading: PropTypes.bool.isRequired,
  removeNewTask: PropTypes.func.isRequired,
  saveTask: PropTypes.func.isRequired,
  tasksSaving: PropTypes.bool.isRequired,
  task: PropTypes.object.isRequired, // pass partially-instantiated (no ID) for new
  toggleTaskComplete: PropTypes.func.isRequired,
  userCanEditCriterionTasks: PropTypes.bool.isRequired,
};

export default CriterionTask;
