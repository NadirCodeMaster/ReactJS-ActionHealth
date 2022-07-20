export const nullBucket = Object.freeze({
  id: '_null_',
  name: 'To work on',
  description:
    "Items to do eventually, but not current priority. Drag priority items to the appropriate category's column."
});

// Item name to use when no Criterion is set.
export const defaultPlanItemName = 'Untitled';

// Item name when otherwise unavailable.
// This should be used when access is restricted or item is based on a Criterion that
// doesn't exist or is not visible to user. (edge case).
export const unavailableName = 'Unavailable';
