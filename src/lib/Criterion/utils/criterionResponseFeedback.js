import { find, get, isArray, isNil, isObject, isString, has, trim } from 'lodash';
import memoizee from 'memoizee';

/**
 * Get the feedback associated with a Criterion for a given response value ID.
 *
 * @param {object} criterion Must include populated options property.
 * @param {number|string} response
 * @returns {object|null} Feedback value as JSON object (for Draft.js editor) or null.
 */
export default memoizee((criterion, rvId) => {
  if (isNil(rvId) || !has(criterion, 'options')) {
    return null;
  }
  let _opts = isArray(criterion.options) ? criterion.options : [];
  let _rvId = parseInt(rvId, 10);

  let opt = find(_opts, o => {
    return _rvId === parseInt(o.response_value_id, 10);
  });

  let feedback = get(opt, 'feedback', null);

  if (feedback) {
    // If feedback is a string, it's probably JSON as text that needs
    // to be converted to a JSON object.
    if (isString(feedback)) {
      try {
        feedback = JSON.parse(feedback);
      } catch (e) {
        console.error(`Failed converting option feedback string to JSON. ${e.name}: ${e.message}`);
      }
    }

    if (!isObject(feedback)) {
      return null;
    }

    // Feedback should now be JSON, but may not have any actual text.
    // Test for presence of plain-text equivalent to determine if it's effectively
    // empty or not. If there's no actual text, we want to return null so calling
    // code knows there's nothing to render.
    let fStr = trim(get(feedback, 'blocks[0].text', ''));
    if (fStr.length > 0) {
      return feedback;
    }
  }

  return null;
});
