import { get, keys, uniq } from 'lodash';
import defaultContent from './content/__default__';
import Submittable from '../MetaHandlers/Submittable';

/**
 * Facilitates dynamic UI content for Docbuilder.
 *
 * Example usage:
 * ```
 * // Initialize first.
 * let uic = new UIContent(docbuilder);
 *
 * // ... request content for one slot.
 * uic.contentFor("final_content_secondary", "nyx").then(v => {
 *   console.log(v);
 *   // => "<p>String with <strong>HTML</strong> but no JSX</p>"
 * });
 *
 * // ... request content for multiple slots.
 * uic.contentFor(["someslot", "someotherslot"], "nnx").then(v => {
 *  console.log(v);
 *  // => { "someslot": "<p>Stuff stuff stuff</p>",
 *  //      "someotherslot": "<p>Other other other</p>" }
 * });
 * ```
 *
 * @see https://app.gitbook.com/o/-MHv4uz-GMrpAd4x7tRz/s/-MHv4z6tEuRl9lAiab0P/products/programs2-overview/docbuilder/ui-customizations
 */
export default class UIContent {
  static stateKeyLength = 3;

  // State key character to use prior to a value being determined.
  static tbdValue = '-';

  // State key that is entirely TBD.
  static tbdStateKey = UIContent.tbdValue.repeat(3);

  // Values for character 1 of a stateKey.
  // -- Represents whether the docbuilder itself (not a doc) is "submittable".
  static submittableValues = {
    NO: 'n',
    YES_IMMEDIATE: 'i',
    YES_WITH_GRACE_PERIOD: 'g'
  };

  // Values for character 2 of a stateKey.
  // -- Represents whether the active org has met all requirements for a doc
  //    to be considered complete.
  static requirementsMetValues = {
    NO: 'n',
    YES: 'y'
  };

  // Values for character three of a stateKey.
  static submittableStatusValues = {
    NOT_APPLICABLE: 'x',
    NOT_SUBMITTED: 'n',
    SUBMITTED_AND_PENDING: 'p',
    SUBMITTED_AND_LOCKED: 'l'
  };

  #docbuilder;
  #overrides;

  // ----------------
  // INSTANCE METHODS
  // ----------------

  /**
   * Constructor.
   *
   * @param {object} docbuilder
   */
  constructor(docbuilder) {
    this.#docbuilder = docbuilder;
    this.#overrides = null;
  }

  /**
   * Get minimal/initial value for a docbuilder.
   *
   * Returns a stateKey value with what can be known
   * from just the docbuilder property (how/whether it's
   * submittable). The other properties are returned as tbd.
   *
   * @returns {string}
   */
  generateInitialStateKey() {
    let s = UIContent.calculateSubmittableValue(this.#docbuilder);
    return `${s}${UIContent.tbdValue.repeat(2)}`;
  }

  /**
   * Get content for multiple UI content slots.
   *
   * Like contentForSlot() (which it uses behind the scenes),
   * but takes an array of slot names and returns an object
   * structured as `{ slot: content, ... }`.
   *
   * @param {array} slots
   *  Array of slots to retrieve content for.
   * @param {string} stateKey
   *  A three-character state key with no wildcards.
   * @returns {object}
   *  Returned object is keyed by the requested slots. Keys for
   *  non-existent or otherwise invalid slots that were requested
   *  will be included.
   */
  async contentForSlots(slots, stateKey) {
    let contentPromises = [];

    for (let i = 0; i < slots.length; i++) {
      contentPromises.push(this.contentForSlot(slots[i], stateKey));
    }
    return Promise.allSettled(contentPromises).then(completedPromises => {
      let res = {};
      // allSettled() maintains order of items it received, so we
      // match them to `slots` based on the iterator position.
      for (let i = 0; i < completedPromises.length; i++) {
        let cur = completedPromises[i];
        // If item was successful, we assign the value.
        if ('fulfilled' === cur.status) {
          res[slots[i]] = cur.value;
          continue;
        }
        // If not, we assign empty string.
        res[slots[i]] = '';
      }
      return res;
    });
  }

  /**
   * Get content for a UI content slot.
   *
   * @param {string} slot
   *  Must be a `snake_case` string representing the desired UI
   *  content slot.
   * @param {string} stateKey
   *  A three-character state key with no wildcards.
   * @returns {string}
   *  Returned string may contain HTML is the slot allows for
   *  it. Empty string if no match is found based on the docbuilder
   *  and provided parameters.
   */
  async contentForSlot(slot, stateKey) {
    // If we haven't yet loaded the overrides, do it here.
    if (null === this.#overrides) {
      let m = this.#docbuilder.machine_name;
      try {
        let overridesModule = await import(`./content/${m}`);
        this.#overrides = overridesModule.default;
      } catch (e) {
        console.error(`Unable to locate docbuilder content file for ${m}. Error: ${e.message}`);
        this.#overrides = {};
        return '';
      }
    }

    // Get slot content objects for default and overrides.
    let def = get(defaultContent, slot, {});
    let ovr = get(this.#overrides, slot, {});

    // Calculate and return content.
    return UIContent._calculateContent(stateKey, def, ovr);
  }

  // --------------
  // STATIC METHODS

  /**
   * Get the correct `UIContent.submittableValues` character for a docbuilder object.
   *
   * Given a docbuilder, this will return the character to use in position one of
   * a UIContent "stateKey".
   *
   * @param {object} d
   * @returns {string} A value from UIContent.submittableValues.
   */
  static calculateSubmittableValue(d) {
    // If submittable, determine type of submittable based on whether the
    // doc there's a delay in locking.
    if (Submittable.isSubmittable(d)) {
      if (Submittable.isSubmittableWithGracePeriod(d)) {
        return UIContent.submittableValues.YES_WITH_GRACE_PERIOD;
      }
      return UIContent.submittableValues.YES_IMMEDIATE;
    }
    // Not submittable.
    return UIContent.submittableValues.NO;
  }

  /*
   * Calculate submittable status stateKey value based on a submittableStatus value.
   *
   * @param {integer} submittableStatus
   *  A value from Submittable.submittableStatuses.
   * @returns {string}
   *  Returns a value from UIContent.submittableStatusValues.
   */
  static submittableStatusValueFromSubmittableStatus(submittableStatus) {
    switch (submittableStatus) {
      case Submittable.submittableStatuses.NOT_APPLICABLE:
        return UIContent.submittableStatusValues.NOT_APPLICABLE;
      case Submittable.submittableStatuses.NOT_SUBMITTED:
        return UIContent.submittableStatusValues.NOT_SUBMITTED;
      case Submittable.submittableStatuses.SUBMITTED_AND_PENDING:
        return UIContent.submittableStatusValues.SUBMITTED_AND_PENDING;
      case Submittable.submittableStatuses.SUBMITTED_AND_LOCKED:
        return UIContent.submittableStatusValues.SUBMITTED_AND_LOCKED;
      case Submittable.submittableStatuses.UNKNOWN:
      default:
        return UIContent.tbdValue;
    }
  }

  /**
   * Calculate value for submittable status based on submittable meta data.
   *
   * @param {object|null} docbuilder
   * @param {object|null} meta
   *  Submittable meta object as returned from the API _beneath_ the
   *  key "submittable".
   * @param {string|null} now
   *  Optional parameter that will be passed to moment() to represent
   *  the current datetime. Used in comparing lock dates relative to
   *  runtime. Primarily here for unit testing.
   * @returns {string}
   *  Returns a single character from UIContent.submittableStatusValues, unless
   *  docbuilder is empty, in which case it'll be UIContent.tbdValue.
   */
  static submittableStatusValueFromMeta(docbuilder, meta, now = null) {
    let s = Submittable.calculateSubmittableStatus(docbuilder, meta, now);
    return UIContent.submittableStatusValueFromSubmittableStatus(s);
  }

  /**
   * Get an updated state key reflecting change to requirements being met.
   *
   * @param {string} oldStateKey
   * @param {string} requirementsMetValue See UIContent.requirementsMetValues
   * @returns {string}
   */
  static revisedStateKeyForRequirementsMet(oldStateKey, requirementsMetValue) {
    return `${oldStateKey.charAt(0)}${requirementsMetValue}${oldStateKey.charAt(2)}`;
  }

  /**
   * Get an updated state key reflecting change to submittable status.
   *
   * @param {string} oldStateKey
   * @param {string} submittableStatusValue See
   * @returns {string}
   */
  static revisedStateKeyForSubmittableStatus(oldStateKey, submittableStatusValues) {
    return `${oldStateKey.charAt(0)}${oldStateKey.charAt(1)}${submittableStatusValues}`;
  }

  // --------------

  /**
   * Calculate slot content based on determinate stateKey and content data.
   *
   * @param {string} stateKey Must be determinate (no wildcards).
   * @param {object} defaultsForSlot
   * @param {object} specificsForSlot
   * @returns {string}
   */
  static _calculateContent(stateKey, defaultsForSlot, specificsForSlot) {
    // Look for db-specific match with wildcard(s) present.
    // (a wildcard match in docbuilder-specific content is still higher
    //  priority than anything in the defaults).
    let specificMatchKey = UIContent._bestStateKey(stateKey, keys(specificsForSlot));
    if (specificMatchKey) {
      // If we found one, return that content.
      return specificsForSlot[specificMatchKey];
    }

    // If nothing there, we search the defaults.
    let defaultMatchKey = UIContent._bestStateKey(stateKey, keys(defaultsForSlot));
    if (defaultMatchKey) {
      // If we found one, return that content.
      return defaultsForSlot[defaultMatchKey];
    }

    // No maches, so empty string.
    return '';
  }

  /**
   * Find the best match in an array of keys for a given key.
   *
   * @param {string} stateKey Subject key. Must be determinate (no wildcards).
   * @param {array} candidateKeys Array of keys to select from.
   * @returns {string|null}
   *  Returns the best candidate key or null if none.
   */
  static _bestStateKey(subjectKey, candidateKeys) {
    let uCandidateKeys = uniq(candidateKeys);
    let shortList = [];

    // Compile an array of matches.
    for (let i = 0; i < uCandidateKeys.length; i++) {
      let c = uCandidateKeys[i];
      let keep = true;
      // Loop through, compare stateKey characters.
      for (let i2 = 0; i2 < subjectKey.length; i2++) {
        let curSubj = subjectKey[i2];
        let curCand = c[i2];
        // If candidate's current character isn't a wildcard or exact
        // match, we can rule the candidate out.
        if ('*' !== curCand && curSubj !== curCand) {
          keep = false;
          break; // break from nested loop to begin next candidate
        }
      }
      if (keep) {
        shortList.push(uCandidateKeys[i]);
      }
    }

    // Evaluate shortListed items.
    // Short list will only contain valid matches, so we evaluate
    // each to determine the most appropriate based on number and
    // position of wildcards.
    if (shortList.length > 0) {
      let priorities = []; // [ { k: stateKey, p: priority }, ... ]
      for (let i = 0; i < shortList.length; i++) {
        priorities.push({
          k: shortList[i],
          p: UIContent._stateKeyPriority(shortList[i])
        });
      }
      // Sort by priority and return the key with highest value.
      priorities.sort((a, b) => {
        return a.p - b.p;
      });

      return priorities[priorities.length - 1].k;
    }

    return null;
  }

  /**
   * Calculate a priority value for a stateKey.
   *
   * This returns a numeric value to use when comparing indeterminate
   * stateKeys.
   *
   * - Number of wildcards is biggest factor in calculation. When
   *   comparing values returned from this method, stateKeys with
   *   more wildcards will always be of _lower_ value than a stateKey
   *   with less.
   *
   * - Position of any present wildcards is secondary factor. Fixed
   *   values in later positions increase calculated priority compared
   *   to those in earlier positions. (ex: `g*l` is higher priority
   *   than `gy*`).
   *
   * @param {string} stateKey Valid, three-character stateKey.
   * @returns {integer}
   */
  static _stateKeyPriority(stateKey) {
    let s = stateKey
      .trim()
      .substring(0, UIContent.stateKeyLength)
      .toLowerCase();
    let priority = 29; // use 29 here so minimum returned value is 0
    for (let i = 0; i < s.length; i++) {
      let multiplier = i + 2;
      if ('*' === s[i]) {
        // Current position is wildcard.
        priority = priority - multiplier * multiplier;
      } else {
        // Current position is non-wildcard.
        priority = priority + multiplier * 1000;
      }
    }
    return priority;
  }
}
