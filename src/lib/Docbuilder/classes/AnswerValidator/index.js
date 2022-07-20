import { get, has, includes, isArray, isNil, isPlainObject, isString, keys } from 'lodash';
import isNumeric from 'utils/isNumeric';

/**
 * Validate the answer to a question.
 *
 * Example usage:
 * ```
 * let av = new AnswerValidator(question, answer.value);
 * let valid = av.isValid();
 * ```
 */
export default class AnswerValidator {
  // ----------------
  // INSTANCE METHODS
  // ----------------

  /**
   * Constructor.
   *
   * @param {object} question The question record object
   * @param {object} answerValue Answer record "value" object
   */
  constructor(question, answerValue) {
    this.question = question;
    this.answerValue = answerValue;
  }

  /**
   * Calculate the validity of the docbuilder answer.
   *
   * Determinations made here are based on what can be known solely from the
   * question/answer pair. This means, for example, that the validity returned
   * here for a "subsection confirmation" question is based on the syntax and
   * presence of a response; it will not account for whether _other_ questions
   * in the subsection have been satisfactorily answered.
   *
   * @returns {bool}
   *
   * @throws
   */
  isValid() {
    // Pass-through to the method matching the question type.
    let qType = this.question.docbuilder_question_type_machine_name;
    return AnswerValidator[qType](this.question, this.answerValue);
  }

  // --------------
  // STATIC METHODS
  // --------------

  /**
   * Validate subsection_confirmation_checkbox_v1.
   *
   * @returns {bool}
   */
  static subsection_confirmation_checkbox_v1(question, answerValue) {
    // If there's a response, that response needs to be valid.
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      // response must be a string to be valid.
      if (!isString(answerValue.response)) {
        return false;
      }

      // If response is a non-empty string, check that it's one of
      // the allowed options. (we'll let empty strings fall through to the
      // question.required check at end of function).
      if (answerValue.response.length > 0) {
        let valid = ['confirmed', 'unconfirmed'];
        if (!includes(valid, answerValue.response)) {
          // non-empty string that is not an allowed value is invalid.
          return false;
        } else {
          // Response is one of the valid options. If question is required,
          // the response must also be "confirmed" for us to return a "ready"
          // status. (if not required, we allow "unconfirmed").
          if (question.required) {
            return 'confirmed' === answerValue.response;
          }
          // Was a valid response and question is not required.
          return true;
        }
      }
    }

    // Response is either nil or an empty string. Only valid if
    // question is not required.
    return !question.required;
  }

  /**
   * Validate subsection_exclusion_radios_v1.
   *
   * @returns {bool}
   */
  static subsection_exclusion_radios_v1(question, answerValue) {
    // If there's a response, that response needs to be valid.
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      // response must be a string to be valid.
      if (!isString(answerValue.response)) {
        return false;
      }

      // If response is a non-empty string, check that it's one of
      // the allowed options. (we'll let empty strings fall through to the
      // question.required check at end of function).
      if (answerValue.response.length > 0) {
        // Validity can be determined by whether response is one of the
        // valid options.
        let valid = ['include', 'exclude'];
        return includes(valid, answerValue.response);
      }
    }

    // No answer, so validity is determined by whether question is required.
    return !question.required;
  }

  /**
   * Validate text_checkboxes_v1.
   *
   * @returns {bool}
   */
  static text_checkboxes_v1(question, answerValue) {
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      let avr = answerValue.response;

      if (!isArray(avr)) {
        // not an array, not valid.
        return false;
      }

      // If there are values present, we'll need to check that they are valid
      // and if "other" is correctly handled.
      let otherOptionKey = get(question, 'value.otherOption.key', null);

      if (avr.length > 0) {
        let validStandardOptions = question.value.options.map(opt => {
          return opt.key;
        });
        let i = 0;

        while (i < avr.length) {
          if (
            !includes(validStandardOptions, avr[i]) &&
            (!otherOptionKey || avr[i] !== otherOptionKey)
          ) {
            // Current option is neither a standard nor "other" option, so
            // validation fails.
            return false;
          }
          i++;
        }

        // Check on content of "other" if needed.
        if (otherOptionKey && includes(avr, otherOptionKey)) {
          // "other" key is present and answer value has it. So check the corresponding text entry.
          let hasValidOtherText = false;
          if (has(answerValue, 'otherResponse') && isString(answerValue.otherResponse)) {
            hasValidOtherText = answerValue.otherResponse.trim().length > 0;
          }
          // From here we can return based on whether other text was suitably populated.
          return hasValidOtherText;
        } else {
          // The "other" option not selected (and perhaps not present). Safe to return as valid.
          return true;
        }
      }
    }

    // If here, the answer is either empty or an empty array. If the question
    // isn't required, we can return true.
    return !question.required;
  }

  /**
   * Validate text_checkboxes_with_exclude_v1.
   *
   * @returns {bool}
   */
  static text_checkboxes_with_exclude_v1(question, answerValue) {
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      let avr = answerValue.response;

      if (!isArray(avr)) {
        // not an array, not valid.
        return false;
      }

      // If there are values present, we'll need to check that they are valid
      // and if "other" is correctly handled.
      let otherOptionKey = get(question, 'value.otherOption.key', null);

      if (avr.length > 0) {
        let validStandardOptions = question.value.options.map(opt => {
          return opt.key;
        });
        let i = 0;

        while (i < avr.length) {
          if (
            !includes(validStandardOptions, avr[i]) &&
            (!otherOptionKey || avr[i] !== otherOptionKey)
          ) {
            // Current option is neither a standard nor "other" option, so
            // validation fails.
            return false;
          }
          i++;
        }

        // Check on content of "other" if needed.
        if (otherOptionKey && includes(avr, otherOptionKey)) {
          // "other" key is present and answer value has it. ,So check the corresponding text entry.
          let hasValidOtherText = false;
          if (has(answerValue, 'otherResponse') && isString(answerValue.otherResponse)) {
            hasValidOtherText = answerValue.otherResponse.trim().length > 0;
          }
          // From here we can return based on whether other text was suitably populated.
          return hasValidOtherText;
        } else {
          // The "other" option not selected (and perhaps not present). Safe to return as valid.
          return true;
        }
      }
    }

    // If here, the answer is either empty or an empty array. If the question
    // isn't required, we can return true.
    return !question.required;
  }

  /**
   * Validate text_manual_long_v1.
   *
   * @returns {bool}
   */
  static text_manual_long_v1(question, answerValue) {
    // If there's a response, that response needs to be valid.
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      // response must be a string to be valid.
      if (!isString(answerValue.response)) {
        return false;
      }

      // As long as the response is a string, the only other consideration is
      // whether it's empty and if that's allowed based on question.required.
      if (answerValue.response.length === 0 && question.required) {
        // Answer is required by empty.
        return false;
      }
      // Otherwise, it's valid.
      return true;
    }

    // No answer, so validity is determined by whether question is required.
    return !question.required;
  }

  /**
   * Validate text_manual_short_v1.
   *
   * @returns {bool}
   */
  static text_manual_short_v1(question, answerValue) {
    // If there's a response, that response needs to be valid.
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      // response must be a string to be valid.
      if (!isString(answerValue.response)) {
        return false;
      }

      // As long as the response is a string, the only other consideration is
      // whether it's empty and if that's allowed based on question.required.
      if (answerValue.response.length === 0 && question.required) {
        // Answer is required by empty.
        return false;
      }
      // Otherwise, it's valid.
      return true;
    }

    // No answer, so validity is determined by whether question is required.
    return !question.required;
  }

  /**
   * Validate text_radios_v1.
   *
   * @returns {bool}
   */
  static text_radios_v1(question, answerValue) {
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      if (!isString(answerValue.response)) {
        // not empty, but not a string... not valid.
        return false;
      }

      // There's a value, so we'll need to check if it's valid
      // and if it's the "other" option.
      let otherOptionKey = get(question, 'value.otherOption.key', null);
      let avr = answerValue.response.trim();

      if (avr.length > 0) {
        // Validate non-empty string here.
        // (empty string will fall through to end of function)
        let validOptions = question.value.options.map(opt => {
          return opt.key;
        });
        if (includes(validOptions, avr)) {
          return true; // response is a normal, valid option
        } else if (otherOptionKey && otherOptionKey === avr) {
          // response is the "other" key, so we need to check the other content.
          if (has(answerValue, 'otherResponse') && isString(answerValue.otherResponse)) {
            let otherResponseValue = answerValue.otherResponse.trim();
            if (otherResponseValue.length > 0) {
              return true; // other value not empty, so it's good.
            }
          }
          return false; // "other" content is missing or invalid
        } else {
          // response isn't one from the question.
          return false;
        }
      }
    }

    // If here, answer is empty so we can return based on whether question
    // is required.
    return !question.required;
  }

  /**
   * Validate text_radios_with_exclude_v1.
   *
   * @returns {bool}
   */
  static text_radios_with_exclude_v1(question, answerValue) {
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      if (!isString(answerValue.response)) {
        // not empty, but not a string... not valid.
        return false;
      }

      // There's a value, so we'll need to check if it's valid
      // and if it's the "other" option.
      let otherOptionKey = get(question, 'value.otherOption.key', null);
      let avr = answerValue.response.trim();

      if (avr.length > 0) {
        // Validate non-empty string here.
        // (empty string will fall through to end of function)
        let validOptions = question.value.options.map(opt => {
          return opt.key;
        });
        if (includes(validOptions, avr)) {
          return true; // response is a normal, valid option
        } else if (otherOptionKey && otherOptionKey === avr) {
          // response is the "other" key, so we need to check the other content.
          if (has(answerValue, 'otherResponse') && isString(answerValue.otherResponse)) {
            let otherResponseValue = answerValue.otherResponse.trim();
            if (otherResponseValue.length > 0) {
              return true; // other value not empty, so it's good.
            }
          }
          return false; // "other" content is missing or invalid
        } else {
          // response isn't one from the question.
          return false;
        }
      }
    }

    // If here, answer is empty so we can return based on whether question
    // is required.
    return !question.required;
  }

  /**
   * Validate file_uploads_v1.
   *
   * @returns {bool}
   */
  static file_uploads_v1(question, answerValue) {
    if (answerValue && has(answerValue, 'response') && !isNil(answerValue.response)) {
      let avr = answerValue.response;
      // Rule out non-object responses. (nil responses will have skipped
      // this section and resturned based on whether question was required)
      if (!isPlainObject(avr)) {
        return false;
      }

      let avrKeys = keys(avr);
      let minFiles = get(question, 'value.minFiles', 0);
      let maxFiles = get(question, 'value.maxFiles', 0);

      // If required but no items, it's a fail.
      // (we're not going to accept a min of zero)
      if (question.required && avrKeys.length < 1) {
        return false;
      }

      // If there are some items but less than the minimum, it's a fail
      // (even if question is not required)
      if (avrKeys.length > 0 && avrKeys.length < minFiles) {
        return false;
      }

      // If there are more items than allowed, it's a fail.
      if (avrKeys.length > maxFiles) {
        return false;
      }

      // Validate each key and value.
      for (let i = 0; i < avrKeys.length; i++) {
        // Each response property key should be a numeric string.
        if (!isNumeric(avrKeys[i])) {
          return false;
        }
        // Check if name is valid.
        if (
          !has(avr[avrKeys[i]], 'name') ||
          !isString(avr[avrKeys[i]].name) ||
          avr[avrKeys[i]].name.length < 1 ||
          avr[avrKeys[i]].name.length > 255
        ) {
          return false;
        }
      }

      // If here, no validation failures occurred.
      return true;
    }

    // If here, answer is empty so we can return based on whether question
    // is required.
    return !question.required;
  }
}
