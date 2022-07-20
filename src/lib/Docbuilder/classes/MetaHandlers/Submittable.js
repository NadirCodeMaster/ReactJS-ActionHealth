import { get, isEmpty, has } from 'lodash';
import moment from 'moment';

/**
 * Helper class for the "submittable" meta handler.
 */
export default class Submittable {
  static submittableStatuses = {
    UNKNOWN: 0, // use prior to evaluating an actual value
    NOT_APPLICABLE: 10, // docbuilder is not a submittable docbuilder
    NOT_SUBMITTED: 20, // doc is not submitted
    SUBMITTED_AND_PENDING: 30, // doc is submitted but not yet locked
    SUBMITTED_AND_LOCKED: 40 // doc is submitted and locked
  };

  /**
   * Determine if a docbuilder is submittable.
   *
   * @param {object} docbuilder
   * @returns {bool}
   */
  static isSubmittable(docbuilder) {
    return Boolean(docbuilder.submittable);
  }

  /**
   * Determine if a docbuilder is submittable _and_ has a grace period.
   *
   * @param {object} docbuilder
   * @returns {bool}
   */
  static isSubmittableWithGracePeriod(docbuilder) {
    if (Submittable.isSubmittable(docbuilder)) {
      let sla = parseInt(docbuilder.submittable_lock_after, 10);
      return sla > 0;
    }
    return false;
  }

  /**
   * Determine if a docbuilder is submittable and has _no_ grace period.
   *
   * @param {object} docbuilder
   * @returns {bool}
   */
  static isSubmittableWithoutGracePeriod(docbuilder) {
    if (Submittable.isSubmittable(docbuilder)) {
      let sla = parseInt(docbuilder.submittable_lock_after, 10);
      return sla === 0;
    }
    return false;
  }

  /**
   * Calculate value for submittable status based on submittable meta data.
   *
   * This takes data returned from the API's meta handler status endpoint
   * and returns the appropriate status value. If the docbuilder and/or
   * meta params are null, the status is automatically considerd "unkonwn".
   *
   * @param {object|null} docbuilder
   * @param {object|null} meta
   *  Submittable meta object as returned from the API _beneath_ the
   *  key "submittable".
   * @param {string|undefined} now
   *  Optional parameter that will be passed to moment() to represent
   *  the current datetime. Used in comparing lock dates relative to
   *  runtime. Primarily here for unit testing.
   * @returns {integer}
   *  Returns a value from Submittable.submittableStatuses.
   */
  static calculateSubmittableStatus(docbuilder, meta, now) {
    let res = Submittable.submittableStatuses.UNKNOWN;

    // Ensure we have a populated docbuilder object.
    if (docbuilder && !isEmpty(docbuilder) && has(docbuilder, 'submittable')) {
      // If not submittable, status must be NOT_APPLICABLE
      if (!Submittable.isSubmittable(docbuilder)) {
        res = Submittable.submittableStatuses.NOT_APPLICABLE;
      } else {
        // Otherwise, we need to check the meta object.
        // Note: Submittable without a grace period (i.e., submittable_lock_after is "0") go
        // directly from NOT_SUBMITTED to SUBMITTED_AND_LOCKED. They are never to have a pending
        // status.
        if (!isEmpty(meta)) {
          // Check if locked...
          let lockAt = get(meta, 'lock_at', null);
          if (isEmpty(lockAt)) {
            // No lock_at means it hasn't been submitted.
            res = Submittable.submittableStatuses.NOT_SUBMITTED;
          } else {
            // There's a lock_at value, so the status is either
            // pending or locked.
            // -- If no grace period, we automatically declare it locked here.
            if (Submittable.isSubmittableWithoutGracePeriod(docbuilder)) {
              res = Submittable.submittableStatuses.SUBMITTED_AND_LOCKED;
            }
            // -- Otherwise, check if the submitted docbuilder is pending or
            // locked by comparing the lock_at datetime to right now.
            else {
              res = Submittable.submittableStatuses.SUBMITTED_AND_PENDING;
              if (moment(now).isAfter(lockAt)) {
                // Lock date is in the past, so it's locked
                res = Submittable.submittableStatuses.SUBMITTED_AND_LOCKED;
              }
            }
          }
        }
        // If there was no meta, we'll fallback to UNKNOWN set above.
      }
    }
    return res;
  }
}
