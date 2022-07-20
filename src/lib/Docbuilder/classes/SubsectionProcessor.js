import { cloneDeep, find, has, includes, isArray } from 'lodash';
import AnswerValidator from './AnswerValidator/index';
import answersForSubsection from '../utils/answer/answersForSubsection';
import { statuses } from '../utils/subsection/constants';
import invalidQuestionIds from '../utils/question/invalidQuestionIds';

/**
 * Use to evaluate subsection statuses and related processing.
 *
 * Example usage where `status` will end up populated with a value
 * from `statuses`:
 * ```
 * let sp = new SubsectionProcessor(subsection, answers);
 * let status = sp.calculateStatus();
 * ```
 */
export default class SubsectionProcessor {
  // ----------------
  // INSTANCE METHODS
  // ----------------

  /**
   * Constructor.
   *
   * @param {object} subsection
   *  A docbuilder subsection object with populated `questions` property.
   *
   * @param {array} answers
   *  An array of docbuilder answer objects for the organization. The array
   *  only needs to contain answers that belong to the specified subsection,
   *  but other answers will just be ignored. There must be only one answer
   *  object per question, though.
   *
   */
  constructor(subsection, answers) {
    // Clone of the subsection param we can manipulate as needed
    // without disrupting calling code.
    this._subsection = cloneDeep(subsection);

    // Create an object with clones of all relevant answer objects that were
    // passed into this function via the "answers" parameter.
    //
    // The object will have a key for each question in the subsection
    // (the question ID) and the corresponding value will either be the
    // answer object or `null` if there isn't one for that question.
    this._answersObj = answersForSubsection(subsection, answers, true);
  }

  /**
   * Calculate the status of the subsection.
   *
   * @returns {int}
   *  Returns an integer value that corresponds to a status value in `SubsectionUtils.statuses`.
   */
  calculateStatus() {
    // Subsections without questions are automatically "not applicable."
    if (0 === this._subsection.docbuilder_questions.length) {
      return statuses.NOT_APPLICABLE;
    }

    // --- Pre-processing
    // The answers to questions of certain types can invalidate or negate
    // the need for further processing of the subsection (such as a "subsection
    // exclusion" question). So, we handle them first to ensure the validation
    // and later-stage processing is done with the correct context.
    let preResult = SubsectionProcessor.preProcessSubsection(this._subsection, this._answersObj);

    // If the outcome of that was  "PENDING", we move ahead with processing the rest of
    // the subsection.
    //
    // Otherwise, we need to check if it gave us an array (meaning a validation error occurred).
    // If it's not an array, it must be a subsection status that we can return (anything other
    // than from that method PENDING means we cannot or don't need to proceed with other
    // processing).
    if (preResult !== statuses.PENDING) {
      return isArray(preResult) ? statuses.PENDING : preResult;
    }

    // --- Normal processing
    let normalResult = SubsectionProcessor.normalProcessSubsection(
      this._subsection,
      this._answersObj
    );

    // If the outcome of that was  "PENDING", we move ahead with processing the rest of
    // the subsection. Otherwise, we can return from this method without further processing.
    if (normalResult !== statuses.PENDING) {
      return isArray(normalResult) ? statuses.PENDING : normalResult;
    }

    // --- Post-processing
    // This will perform any remaining processing from a "post" stage question
    // and return the final subsection status.
    return SubsectionProcessor.postProcessSubsection(this._subsection, this._answersObj);
  }

  // --------------
  // STATIC METHODS
  // --------------

  /**
   * Get the appropriate default status for a subsection.
   *
   * The "default" status for a subsection is how we present it when answers
   * have not been parsed for the questions that belong directly to the
   * subsection (questions from other sections/subsections that might impact
   * the final output of the subsection are not counted -- those are the domain
   * of the subsection where they exists).
   *
   * In short, a subsection with no questions is NOT_APPLICABLE. Otherwise,
   * it's PENDING.
   *
   * @param {subsection}
   *  A subsection object with a `docbuilder_questions` property. That property
   *  should be present automatically on most subsection objects returned from
   *  the API. If it's not present, this method will treat it as if it's
   *  present but empty (not what you want).
   *
   * @returns {int}
   *  Returns an integer representing subsection status (per `statuses`).
   */
  static defaultStatusForSubsection(subsection) {
    let qtyQuestions = 0;
    if (subsection.hasOwnProperty('docbuilder_questions')) {
      qtyQuestions = subsection.docbuilder_questions.length;
    }
    if (qtyQuestions < 1) {
      // No questions means there's no status to calculate.
      return statuses.NOT_APPLICABLE;
    }
    // More than 0 questions means the default status is pending.
    return statuses.PENDING;
  }

  /**
   * Apply status-impacting pre-processing and establish subsequent status.
   *
   * **This method may operate directly on the objects it receives.** Because
   * of that, be sure to pass in "working copies" that aren't returned to
   * the application beyond the scope of calling code.
   *
   * @param {object} subsection
   *  A working copy of a subsection object with questions populated. Subject
   *  to modification by this method (in particular, removal of questions no
   *  longer needed based on the result of the "pre" question).
   *
   * @param {object} answersObj
   *  An object keyed by question ID where the corresponding value is a
   *  docbuilder answer object. The object only needs questions/answers
   *  that belong to the subsection being evaluated (though other answers will
   *  just be ignored). There must be only one answer object per question,
   *  though. Subject to modification by this method.
   *
   * @returns {int|array}
   *
   *  **If NO validation errors were found:** This will return an integer representing subsection
   *    status (per `statuses`) based on what we know so far. The returned status will usually be
   *    PENDING, which essentially means this calling code should continue on to "normal" and
   *    "post" processing. Any other int value indicates a definitive determination of the
   *    subsection's current status, so no additional processing of the subsection is needed.
   *
   * **If validation errors WERE found:** This will return an array of the offending question ids.
   *   (there will only ever be one ID in that array because there can only be one pre question).
   *
   * @throws
   */
  static preProcessSubsection(subsection, answersObj) {
    // There can only be zero or one "pre" question, so we'll use
    // find() to locate it.
    let q = find(subsection.docbuilder_questions, function(qObj) {
      return 'pre' === qObj.value.subsectionProcessingStage;
    });

    // If we didn't get anything back we can declare this subsection as
    // "pending" and return to our normal processing flow.
    if (!q) {
      return statuses.PENDING;
    }

    // Otherwise, do whatever preprocessing is needed based on the question
    // we received.

    // Validate the current answer or non-answer. If invalid, we can exit as
    // subsection still pending.
    let answer = has(answersObj, q.id) ? answersObj[q.id] : null;
    let answerValue = null;
    if (answer && answer.hasOwnProperty('value')) {
      answerValue = answer.value;
    }

    let validator = new AnswerValidator(q, answerValue);
    if (!validator.isValid()) {
      // Validation failed, so return the invalid question ID wrapped in an array.
      return [q.id];
    }

    // Handle based on type.
    switch (q.docbuilder_question_type_machine_name) {
      // All "pre" question types must have a case in this switch.
      case 'subsection_exclusion_radios_v1':
        // -----------------------------------------------------------------------
        // If the response is 'exclude', we return the EXCLUDE subsection status.
        // That's all that is needed by the subsection status calculation, so
        // we don't bother modifying the subsection, questions or answers provided
        // to this function.
        if (answerValue && has(answerValue, 'response') && answerValue.response === 'exclude') {
          return statuses.EXCLUDING;
        }
        // Otherwise, we just allow processing to continue by returning
        // the PENDING status.
        return statuses.PENDING;
      // -----------------------------------------------------------------------
      case 'text_checkboxes_with_exclude_v1':
        // -----------------------------------------------------------------------
        // If "exclude" is one of the provided answer values, we can return the
        // EXCLUDING status and ignore everything else. Otherwise, we do a normal
        // validation and return based on that (after switch).
        if (
          answerValue &&
          has(answerValue, 'response') &&
          isArray(answerValue.response) &&
          includes(answerValue.response, 'exclude')
        ) {
          return statuses.EXCLUDING;
        }
        break; // we'll do validation after switch
      // -----------------------------------------------------------------------
      case 'text_radios_with_exclude_v1':
        // -----------------------------------------------------------------------
        // If "exclude" is the provided answer value, we can return the EXCLUDING
        // status and ignore everything else. Otherwise, we do a normal validation
        // and return based on that (after switch).
        if (answerValue && has(answerValue, 'response') && answerValue.response === 'exclude') {
          return statuses.EXCLUDING;
        }
        break; // we'll do validation after switch
      // -----------------------------------------------------------------------
      default:
        throw new Error(
          `Received unexpected question type in preProcessSubsection(): ${q.docbuilder_question_type_machine_name}`
        );
    }

    // Switch cases above that didn't return or throw are validated here. The result of this
    // validation determines the status we'll return.
    let invalid = invalidQuestionIds(subsection.docbuilder_questions, answersObj, 'pre');

    // If there were any validation errors, the status is still PENDING, but we return
    // an array of those items rather than the status.
    if (!isArray(invalid) || invalid.length > 0) {
      return invalid;
    }

    // No validation errors, so just PENDING.
    return statuses.PENDING;
  }

  /**
   * Perform status-impacting normal-stage-processing and establish subsequent status.
   *
   * @param {object} subsection [see preProcessSubsection]
   *
   * @param {object} answersObj [see preProcessSubsection]
   *
   * @returns {int|array}
   *
   *  **If NO validation errors were found:** This will return an integer representing subsection
   *    status (per `statuses`) based on what we know so far. The returned status will usually be
   *    PENDING, which essentially means this method didn't conclusively determine the subsection
   *    status and so it should continue on to post processing. Any other int means the status
   *    is known and no further processing is needed.
   *
   * **If validation errors WERE found:** This will return an array of the offending question ids.
   *   (there will only ever be one ID in that array because there can only be one pre question).
   *
   * @throw
   */
  static normalProcessSubsection(subsection, answersObj) {
    // Validate 'normal' stage answers.
    // Note that it's possible for an answer to be valid even if null (though
    // not often).
    let invalid = invalidQuestionIds(subsection.docbuilder_questions, answersObj, 'normal');

    // If there were any validation errors, we return them.
    if (isArray(invalid) && invalid.length > 0) {
      return invalid;
    }

    // Otherwise, just return PENDING.
    return statuses.PENDING;
  }

  /**
   * Perform status-impacting post-processing and establish subsequent status.
   *
   * **This method operates directly on the objects it receives.** Because
   * of that, be sure to pass in "working copies" that aren't returned to
   * the application beyond the scope of calling code.
   *
   * This is the final step in establishing the status of a subsection,
   * and the value it returns is the final determination. So, all pre and normal
   * stage questions must be successfully validated prior calling; if any are
   * deemed invalid, this function should not be called (the status is already
   * known to be PENDING at that point).
   *
   * In addition, all "pre" and "normal" processing should have taken place and
   * made any necessary changes to the parameters this method receives.
   *
   * @param {object} subsection [see preProcessSubsection]
   *
   * @param {object} answersObj [see preProcessSubsection]
   *
   * @returns {int}
   *  Returns an integer representing subsection status (per `SubsectionUtils.statuses`).
   *  The returned status will be PENDING if requirements for the subsection
   *  haven't been met, READY if they are (but the subsection isn't being
   *  excluded) or EXCLUDING, if this method established that the subsection
   *  should be excluded (as of this writing there is no question type that
   *  would result in that happening via post-processing).
   *
   * @throws
   */
  static postProcessSubsection(subsection, answersObj) {
    // There can only be zero or one "post" question, so we'll use
    // find() to locate it.
    // let q = find(subsection.docbuilder_questions, 'post');

    let q = find(subsection.docbuilder_questions, function(qObj) {
      return 'post' === qObj.value.subsectionProcessingStage;
    });

    // If we didn't get anything back, we can return to our normal
    // processing flow, which for post-processing means we're done
    // and the subsection is READY.
    if (!q) {
      return statuses.READY;
    }

    // Otherwise, do whatever postprocessing is needed based on the question
    // we received.

    // Validate the current answer or non-answer. If invalid, we can exit as
    // subsection still pending.
    let answer = has(answersObj, q.id) ? answersObj[q.id] : null;
    let aVal = null;
    if (answer && answer.hasOwnProperty('value')) {
      aVal = answer.value;
    }

    let validator = new AnswerValidator(q, aVal);

    if (!validator.isValid()) {
      // Validation failed, so no additional processing is required to determine
      // that the status will be PENDING.
      return statuses.PENDING;
    }

    // Handle based on type.
    switch (q.docbuilder_question_type_machine_name) {
      // All "post" question types must have a case in this switch.
      case 'subsection_confirmation_checkbox_v1':
        // -----------------------------------------------------------------------
        // If the response is 'confirmed', we return the READY subsection status.
        // All questions with requirements will have been validated before
        // reaching this point, so it's safe to declare we're good.
        let aValResponse = aVal ? aVal.response : null;

        if ('confirmed' === aValResponse) {
          return statuses.READY;
        }
        // Otherwise, we declare the subsection as PENDING.
        return statuses.PENDING;
      // -----------------------------------------------------------------------
      default:
        throw new Error(
          `Received unexpected question type in postProcessSubsection(): ${q.docbuilder_question_type_machine_name}`
        );
    }
  }
}
