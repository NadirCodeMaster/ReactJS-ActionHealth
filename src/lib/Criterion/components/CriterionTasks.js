import React, { Fragment, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { usePrevious } from "state-hooks";
import PropTypes from "prop-types";
import memoizee from "memoizee";
import { isArray, isNil, filter, find, map } from "lodash";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import CriterionTask from "./CriterionTask";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import repositionArrayItem from "utils/repositionArrayItem";
import criterionTasksReducer from "../utils/criterionTasksReducer";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import userCan from "utils/userCan";
import clsx from "clsx";
import {
  requestOrganizationCriterionTasks,
  requestCreateCriterionTask,
  requestCompleteCriterionTask,
  requestDeleteCriterionTask,
  requestUpdateCriterionTask,
  requestUpdateCriterionTasks,
} from "api/requests";

export default function CriterionTasks({ criterionId, currentUser, organization }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();

  const newTaskTextInputRef = useRef();
  const addTaskButtonRef = useRef();

  const [tasks, dispatchTasksReducer] = useReducer(criterionTasksReducer, []);
  const [newTask, setNewTask] = useState(null); // null or task object
  const prevNewTask = usePrevious(newTask);

  // Whether tasks can be dragged around for reordering.
  const [dragEnabled, setDragEnabled] = useState(false);

  // Whether "add task" button responds to clicks.
  // Note that this is different from what we use for the `disabled` prop. We only
  // declare it `disabled` if the user lacks permission to create tasks. This value
  // refers to whether we'll _honor_ a click. The reason for differentiating is
  // that we need to control focus via a ref, which is applied immediately, whereas
  // updating a state var that would otherwise control the `disabled` value happens
  // after a re-render. In that situation, the focus never gets applied because
  // the DOM still sees the button as `disabled` at that instant.
  const [honorAddTaskClicks, setHonorAddTaskClicks] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userCanEditCriterionTasks, setUserCanEditCriterionTasks] = useState(false);
  const [userCanViewCriterionTasks, setUserCanViewCriterionTasks] = useState(false);

  // Set perms.
  useEffect(() => {
    let newUserCanEditCriterionTasks = userCan(currentUser, organization, "edit_criterion_tasks");
    let newUserCanViewCriterionTasks = userCan(currentUser, organization, "view_criterion_tasks");
    if (mounted.current) {
      setUserCanEditCriterionTasks(newUserCanEditCriterionTasks);
      setUserCanViewCriterionTasks(newUserCanViewCriterionTasks);
    }
  }, [currentUser, organization]);

  // Load all tasks for this criterion into component state.
  const loadTasks = useCallback(
    (criterionId, organizationId, callback = null) => {
      if (mounted.current) {
        setLoading(true);
      }
      requestOrganizationCriterionTasks(organizationId, { criterion_id: criterionId })
        .then((res) => {
          if (mounted.current) {
            setLoading(false);
            dispatchTasksReducer({
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
            dispatchTasksReducer({ type: "clear" });
          }
          console.error(`An error occurred retrieving tasks. ${error.name}: ${error.description}`);
          if (callback) {
            callback(false);
          }
        });
    },
    [dispatchTasksReducer]
  );

  // Initial load of tasks.
  useEffect(() => {
    if (userCanViewCriterionTasks && mounted.current) {
      loadTasks(criterionId, organization.id);
    }
  }, [criterionId, organization, loadTasks, userCanViewCriterionTasks]);

  // Delete a criterion task.
  const deleteTask = (taskObj, callback = null) => {
    if (mounted.current) {
      setSaving(true);
    }
    let criterionId = taskObj.criterion_id;
    let organizationId = taskObj.organization_id;
    requestDeleteCriterionTask(taskObj.id)
      .then((res) => {
        if (mounted.current) {
          setSaving(false);
          loadTasks(criterionId, organizationId);
        }
        if (callback) {
          callback(true);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setSaving(false);
        }
        console.error(`An error occurred deleting a task. ${err.name}: ${err.description}`);
        if (callback) {
          callback(false);
        }
      });
  };

  // Save changes to multiple tasks.
  const saveTasks = useCallback((criterionId, criterionTasks, callback = null) => {
    if (mounted.current) {
      setSaving(true);
    }

    // Remove any without an ID.
    let safeTasks = filter(criterionTasks, (t) => {
      return !isNil(t.id);
    });

    requestUpdateCriterionTasks(criterionId, safeTasks)
      .then((res) => {
        if (mounted.current) {
          setSaving(false);
        }
        if (callback) {
          callback(true);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setSaving(false);
        }
        console.error("An error occurred updating tasks");
        if (callback) {
          callback(false);
        }
      });
  }, []);

  // Handler for DragDropContext onDragEnd.
  const onDragEnd = useCallback(
    (result) => {
      // dropped outside the list
      if (!result.destination) {
        return;
      }
      const reorderedTasks = repositionArrayItem(
        tasks,
        result.source.index,
        result.destination.index
      );
      // Modify the weight of each item to reflect change.
      let newReorderedTasks = map(reorderedTasks, (task, index) => {
        task.weight = (index + 1) * 10;
        return task;
      });

      if (mounted.current) {
        // Send the re-ordered tasks to the reducer.
        // (so the change is immediately reflected in UI)
        dispatchTasksReducer({ type: "replace", payload: newReorderedTasks });
        // Save changes.
        saveTasks(criterionId, newReorderedTasks);
      }
    },
    [criterionId, dispatchTasksReducer, saveTasks, tasks]
  );

  // Focuses the new text input field if present.
  const focusNewTextInput = useCallback(() => {
    if (newTaskTextInputRef && newTaskTextInputRef.current) {
      newTaskTextInputRef.current.focus();
    }
  }, [newTaskTextInputRef]);

  // Focus new task upon creation.
  useEffect(() => {
    if (!prevNewTask && newTask && mounted.current) {
      focusNewTextInput();
    }
  }, [focusNewTextInput, newTask, prevNewTask]);

  // Declare a new, unsaved empty task.
  const initializeNewTask = useCallback(() => {
    if (!honorAddTaskClicks) {
      return null;
    }

    if (isNil(newTask) && mounted.current) {
      let newNewTask = {
        id: null,
        criterion_id: criterionId,
        organization_id: organization.id,
        weight: generateNewHeaviestWeight(tasks),
        _tempId: Date.now(),
      };
      setNewTask(newNewTask);
    }
  }, [criterionId, honorAddTaskClicks, newTask, organization, tasks]);

  // If enter button, add task
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        initializeNewTask();
      }
    },
    [initializeNewTask]
  );

  // Create a new task record.
  const _saveNewTask = useCallback(
    (task, callback = null) => {
      if (mounted.current) {
        setSaving(true);
      }
      requestCreateCriterionTask(task)
        .then((res) => {
          // Save successful. Add server-returned version of the task
          // to our list and nullify the newTask.
          if (mounted.current) {
            dispatchTasksReducer({ type: "add", payload: [res.data.data] });
            setNewTask(null);
            setSaving(false);
            addTaskButtonRef.current.focus();
          }
          if (callback) {
            callback(true);
          }
        })
        .catch((err) => {
          if (mounted.current) {
            setSaving(false);
          }
          console.error("An error occurred saving new task");
          if (callback) {
            callback(false);
          }
        });
    },
    [addTaskButtonRef, dispatchTasksReducer]
  );

  // Save updates to existing task record.
  const _saveExistingTask = useCallback(
    (task, callback = null) => {
      if (mounted.current) {
        setSaving(true);

        // Since this is an update, apply the changes to our
        // tasks array immediately rather than waiting for a
        // response from server.
        dispatchTasksReducer({
          type: "add",
          payload: [task],
        });
      }

      requestUpdateCriterionTask(task)
        .then((res) => {
          if (mounted.current) {
            setSaving(false);
          }
          if (callback) {
            callback(true);
          }
        })
        .catch((err) => {
          console.error("An error occurred updating a task");
          if (mounted.current) {
            setSaving(false);
          }
          if (callback) {
            callback(false);
          }
        });
    },
    [dispatchTasksReducer]
  );

  // Save new or existing single task.
  const saveTask = useCallback(
    (task, callback = null) => {
      // NEW tasks.
      if (isNil(task.id)) {
        _saveNewTask(task, callback);
      }
      // EXISTING tasks.
      else {
        _saveExistingTask(task, callback);
      }
    },
    [_saveExistingTask, _saveNewTask]
  );

  // Remove the new draft task, if any.
  const removeNewTask = useCallback(() => {
    if (mounted.current) {
      setNewTask(null);
    }
  }, []);

  // Toggle completion status of a CriterionTask. was "completeTask"
  const toggleTaskComplete = useCallback(
    (task, isComplete, callback = null) => {
      if (mounted.current) {
        setSaving(true);
      }
      requestCompleteCriterionTask(task, isComplete)
        .then((res) => {
          if (mounted.current) {
            setSaving(false);
            loadTasks(criterionId, organization.id);
          }
          if (callback) {
            callback(true);
          }
        })
        .catch((err) => {
          console.error("An error occurred toggling a task completion status");
          if (callback) {
            callback(false);
          }
        });
    },
    [criterionId, loadTasks, organization]
  );

  // Generate a task.weight value heavier than the others.
  const generateNewHeaviestWeight = (tasks) => {
    let oldHeaviest = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (!isNil(tasks[i].weight) && tasks[i].weight > oldHeaviest) {
        oldHeaviest = Number(tasks[i].weight);
      }
    }
    return oldHeaviest + 10;
  };

  // Set dragEnabled.
  useEffect(() => {
    let newVal =
      !loading && !saving && userCanEditCriterionTasks && !newUnsavedTaskIsPresent(tasks);
    if (mounted.current) {
      setDragEnabled(newVal);
    }
  }, [tasks, loading, saving, userCanEditCriterionTasks]);

  // Set honorAddTaskClicks.
  useEffect(() => {
    let newVal = !loading && !saving && userCanEditCriterionTasks && isNil(newTask);
    if (mounted.current) {
      setHonorAddTaskClicks(newVal);
    }
  }, [newTask, loading, saving, userCanEditCriterionTasks]);

  // DISPLAY =============================
  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {tasks.length > 0 && (
                <Fragment>
                  {tasks.map((task, index) => (
                    <Fragment key={task.id}>
                      <CriterionTask
                        deleteTask={deleteTask}
                        dndDisableInteractiveElementBlocking={false}
                        dndDraggableId={`draggable_task_${task.id}`}
                        dndIndex={index}
                        dndIsDragDisabled={!dragEnabled}
                        includeDndWrapper={true}
                        isTop={tasks[0] === task}
                        removeNewTask={removeNewTask}
                        saveTask={saveTask}
                        task={task}
                        tasksLoading={loading}
                        tasksSaving={saving}
                        toggleTaskComplete={toggleTaskComplete}
                        userCanEditCriterionTasks={userCanEditCriterionTasks}
                      />
                    </Fragment>
                  ))}
                </Fragment>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {!isNil(newTask) && (
        <CriterionTask
          ref={newTaskTextInputRef}
          deleteTask={deleteTask}
          isTop={false}
          saveTask={saveTask}
          task={newTask}
          tasksLoading={loading}
          tasksSaving={saving}
          toggleTaskComplete={toggleTaskComplete}
          userCanEditCriterionTasks={userCanEditCriterionTasks}
          removeNewTask={removeNewTask}
        />
      )}

      <div className="no-print">
        <div className={classes.actions}>
          <Button
            ref={addTaskButtonRef}
            className={clsx(classes.addTaskButton, {
              [classes.addTaskButtonIgnored]: !honorAddTaskClicks,
            })}
            color="primary"
            disabled={!userCanEditCriterionTasks}
            onClick={initializeNewTask}
            onKeyPress={handleKeyPress}
            variant="text"
            startIcon={<AddCircleIcon />}
            tabIndex={0}
          >
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
}

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "#ECF8EC" : "#FFF",
});

const useStyles = makeStyles((theme) => ({
  addCircleIcon: {
    margin: theme.spacing(0, 0.5, 0, 0),
    position: "relative",
    top: theme.spacing(0.5),
  },
  addTaskButton: {
    marginLeft: 0,
    opacity: 1.0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    transitionProperty: "opacity",
    transitionDuration: "300ms",
  },
  addTaskButtonIgnored: {
    cursor: "not-allowed",
    opacity: 0.5,
  },
}));

// Check if our draft tasks include new, unsaved item.
// Returns that unsaved item or false if none.
const newUnsavedTaskIsPresent = memoizee((tasks) => {
  if (isArray(tasks)) {
    let newItem = find(tasks, function (item) {
      if (isNil(item.id)) {
        return item;
      }
    });
    return newItem ? newItem : false;
  }
  return false;
});

CriterionTasks.propTypes = {
  criterionId: PropTypes.number.isRequired,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  organization: PropTypes.shape(organizationShape).isRequired, // @TODO add w/pivot
};
