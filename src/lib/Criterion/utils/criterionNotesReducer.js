import { findIndex, remove, includes, isArray } from "lodash";

/**
 * Reducer for CriterionNotes
 *
 * Type "add" will add notes to the the destination array and update matching
 * notes that exist there. Type "replace" the destination array entirely in
 * favor of what's been provided. Type "remove" removes specific notes based
 * on IDs provided. Type "clear" empties the destination array.
 *
 * @param {array} notes
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"replace"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an array of note objects.
 *  - When `type` is "replace", `payload` should contain an array of note objects.
 *  - When `type` is "remove", `payload` should be an array of note IDs to be removed.
 *  - When `type` is "clear", no payload is needed.
 *
 * @returns {array}
 */
const criterionNotesReducer = (existingNotes, action) => {
  // Start with a copy of existing notes array. We'll modify and return it.
  let draftNotes = [];
  if (isArray(existingNotes)) {
    draftNotes = [...existingNotes];
  }

  switch (action.type) {
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        // If current note not present, add it. If present, replace it.
        let noteIndex = findIndex(draftNotes, ["id", action.payload[i].id]);
        if (-1 === noteIndex) {
          // not present
          draftNotes.push(action.payload[i]);
        } else {
          draftNotes[noteIndex] = action.payload[i];
        }
      }
      break;
    case "replace":
      draftNotes = action.payload;
      break;
    case "remove":
      remove(draftNotes, function (v) {
        return includes(action.payload, v.id);
      });
      break;
    case "clear":
    default:
      draftNotes = [];
      break;
  }
  return draftNotes;
};

export default criterionNotesReducer;
