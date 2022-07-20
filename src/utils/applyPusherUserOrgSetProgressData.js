import { findIndex, has, isArray } from 'lodash';

/**
 * Apply updated progress data from Pusher to an org object.
 *
 * This will modify the percentComplete property of
 * available_sets.set[] based on a data payload from Pusher.
 * The payload shall be provided as the pusherData argument.
 * This payload is delivered via:
 *
 * - Channel: "private-users.${userId}.organizations"
 * - Event: "user-org-set-progress"
 *
 * **This method does not adjust any other properties.** For
 * example, it does not update the last response information,
 * who made the most recent update, etc.
 *
 * The pusherData argument object must be structured as:
 *
 * ```
 * {
 *   organization_id: {int},
 *   percentage_complete: {float},
 *   response: { name_first: {string}, name_last: {string}, updated_at: {string} },
 *   set_id: {int}
 * }
 * ```
 *
 * @param {object} org
 * @param {object} pusherData
 * @return {object}
 *  Returns the org object with or without changes, depending on how
 *  its data compared that in pusherData. For example, if org isn't
 *  the same as the org specified in the pusherData, it doesn't change.
 */
export default function applyPusherUserOrgSetProgressData(org, pusherData) {
  if (
    org &&
    pusherData &&
    has(org, 'available_sets') &&
    isArray(org.available_sets) &&
    has(pusherData, 'organization_id') &&
    has(pusherData, 'set_id') &&
    has(pusherData, 'percentage_complete') &&
    has(pusherData, 'response') &&
    pusherData.organization_id === org.id
  ) {
    let availableSetIndex = findIndex(org.available_sets, [
      'id',
      pusherData.set_id
    ]);

    if (availableSetIndex >= 0) {
      let oldPercentComplete =
        org.available_sets[availableSetIndex].percentComplete;
      let newPercentComplete = pusherData.percentage_complete;

      if (oldPercentComplete !== newPercentComplete) {
        org.available_sets[
          availableSetIndex
        ].percentComplete = newPercentComplete;
      }
    }
  }
  return org;
}
