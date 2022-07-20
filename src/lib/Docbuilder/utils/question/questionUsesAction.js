import memoizee from "memoizee";
import { get, includes } from "lodash";

/**
 * Check if a question uses an action.
 *
 * This is determined by evaluating the `actionInputs` property
 * of the question value. As of this writing, that means the question
 * value itself must include that property with the one valid value
 * declared for it in its question type schema.
 *
 * Future adjustments may allow for the value to be read directly
 * from the question type schema, but not yet.
 *
 * @param {Object} questionValue
 * @param {string} actionInputIdentifier
 *  This should be an actionInput schema ID string. Use the `actions` constant
 *  to access these without dealing with the entire ID string (it's a URI).
 * @returns {bool}
 */
export default memoizee((questionValue, actionInputIdentifier) => {
  // Get the actionsList property from the question. It should be a pipe-delimited
  // string of action input schema ID's.
  let qActionsStr = get(questionValue, "actionsList", null);
  if (null === qActionsStr) {
    return false;
  }

  // Split the question's actionsList string into an array.
  let qActions = qActionsStr.split("|");
  return includes(qActions, actionInputIdentifier);
});
