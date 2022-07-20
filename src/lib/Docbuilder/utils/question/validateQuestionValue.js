import {
  // file_uploads_v1, @TODO
  text_manual_short_v1,
  text_manual_long_v1,
  text_checkboxes_v1,
  text_checkboxes_with_exclude_v1,
  text_radios_v1,
  text_radios_with_exclude_v1,
  subsection_confirmation_checkbox_v1,
  subsection_exclusion_radios_v1
} from '../../schemas/questionValues';

/**
 * Calls schema validator based on value passed to it
 * and returns errors
 *
 * @param {number} type
 * @param {string} value
 * @returns {array} errors
 */
export default function validateQuestionValue(typeId, value) {
  let valueAsObject;
  try {
    valueAsObject = JSON.parse(value);
  } catch (e) {
    return [{ message: 'Invalid Object Structure' }];
  }

  // @TODO Refactor so typeId isn't needed
  switch (typeId) {
    case 1:
      return text_manual_short_v1.validate(valueAsObject);
    case 2:
      return text_manual_long_v1.validate(valueAsObject);
    case 4:
      return text_checkboxes_with_exclude_v1.validate(valueAsObject);
    case 6:
      return text_radios_with_exclude_v1.validate(valueAsObject);
    case 7:
      return subsection_confirmation_checkbox_v1.validate(valueAsObject);
    case 8:
      return subsection_exclusion_radios_v1.validate(valueAsObject);
    case 9:
      return file_uploads_v1.validate(valueAsObject);
    case 10:
      return text_checkboxes_v1.validate(valueAsObject);
    case 11:
      return text_radios_v1.validate(valueAsObject);

    default:
      throw new Error('Invalid type received by validateQuestionValue()');
  }
}
