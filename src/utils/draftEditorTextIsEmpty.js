import { isEmpty, isObject, isString } from 'lodash';

/**
 * Check if a value intended as rich text has no actual.
 *
 * The DraftEditor uses JSON to store rich text, and deleting
 * all of the actual characters from an entry doesn't result
 * in the value becoming null. Instead, it keeps the JSON
 * structure but has no actual text.
 *
 * @param {string|Object|null} v
 * @returns {boolean}
 */
export default function draftEditorTextIsEmpty(v) {
  // Value isn't even close to being populated.
  if (null === v || isEmpty(v)) {
    return true;
  }

  // Check if value is a string so we can try converting
  // to JSON to read it.
  if (isString(v)) {
    try {
      v = JSON.parse(v);
    } catch (e) {
      // Unable to parse as JSON, so we'll consider it empty.
      return true;
    }
  }

  // v should now be an object.
  if (!isObject(v)) {
    return true; // something other than an object, so consider it empty.
  }

  // Check for the Draft-specific structures and values that would
  // indicate it being populated.
  if (!v.hasOwnProperty('blocks')) {
    return true; // no blocks, not rich text.
  }
  if (v.blocks.length === 1) {
    if (!v.blocks[0].hasOwnProperty('text')) {
      // First block doesn't have text property, so it's empty.
      return true;
    } else if (isEmpty(v.blocks[0].text)) {
      // First block has text property, but it's empty.
      return true;
    }
  }

  // If we're here, we've ruled out the known scenarios for empty content
  // so we'll return true to indicate the value isn't empty.
  return false;
}
