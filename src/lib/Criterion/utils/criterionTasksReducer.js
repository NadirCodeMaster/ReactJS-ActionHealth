import { findIndex, remove, includes, isArray } from "lodash";

/**
 * Reducer for CriterionTasks
 *
 * Type "add" will add tasks to the the destination array and update matching
 * tasks that exist there. Type "replace" the destination array entirely in
 * favor of what's been provided. Type "remove" removes specific tasks based
 * on IDs provided. Type "clear" empties the destination array.
 *
 * @param {array} tasks
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"replace"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an array of task objects.
 *  - When `type` is "replace", `payload` should contain an array of task objects.
 *  - When `type` is "remove", `payload` should be an array of task IDs to be removed.
 *  - When `type` is "clear", no payload is needed.
 *
 * @returns {array}
 */
const criterionTasksReducer = (existingTasks, action) => {
  // Start with a copy of existing tasks array. We'll modify and return it.
  let draftTasks = [];
  if (isArray(existingTasks)) {
    draftTasks = [...existingTasks];
  }

  switch (action.type) {
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        // If current task not present, add it. If present, replace it.
        let taskIndex = findIndex(draftTasks, ["id", action.payload[i].id]);
        if (-1 === taskIndex) {
          // not present
          draftTasks.push(action.payload[i]);
        } else {
          draftTasks[taskIndex] = action.payload[i];
        }
      }
      break;
    case "replace":
      draftTasks = action.payload;
      break;
    case "remove":
      remove(draftTasks, function (v) {
        return includes(action.payload, v.id);
      });
      break;
    case "clear":
    default:
      draftTasks = [];
      break;
  }
  return draftTasks;
};

export default criterionTasksReducer;
