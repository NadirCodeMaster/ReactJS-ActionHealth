import { findIndex, remove, includes, isArray } from "lodash";

/**
 * Reducer for `items`
 *
 * Type "add" will add items to the the destination array and update matching
 * items that exist there. Type "replace" the destination array entirely in
 * favor of what's been provided. Type "remove" removes specific items based
 * on IDs provided. Type "clear" empties the destination array.
 *
 * @param {array} items
 * @param {object} action
 *  Must contain two properties: `type` ("add"|"replace"|"remove"|"clear") and `payload`.
 *  - When `type` is "add", `payload` should contain an array of plan item objects.
 *  - When `type` is "replace", `payload` should contain an array of plan item objects.
 *  - When `type` is "remove", `payload` should be an array of item IDs to be removed.
 *  - When `type` is "clear", no payload is needed.
 *
 * @returns {array}
 */
const itemsReducer = (existingItems, action) => {
  // Start with a copy of existing items array. We'll modify and return it.
  let draftItems = [];
  if (isArray(existingItems)) {
    draftItems = [...existingItems];
  }

  switch (action.type) {
    case "add":
      for (let i = 0; i < action.payload.length; i++) {
        // If current item not present, add it. If present, replace it.
        let itemIndex = findIndex(draftItems, ["id", action.payload[i].id]);
        if (-1 === itemIndex) {
          // not present
          draftItems.push(action.payload[i]);
        } else {
          draftItems[itemIndex] = action.payload[i];
        }
      }
      break;
    case "replace":
      draftItems = action.payload;
      break;
    case "remove":
      remove(draftItems, function (item) {
        return includes(action.payload, item.id);
      });
      break;
    case "clear":
    default:
      draftItems = [];
      break;
  }
  return draftItems;
};

export default itemsReducer;
