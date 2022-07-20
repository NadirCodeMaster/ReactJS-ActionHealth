// Status of a question based on the user-provided answers.
// Note that this applies strictly to question/answer values, _not_ the
// state of the UI (as would be the case for determining whether an answer
// had been "saved", etc).
export const answerStatuses = Object.freeze({
  // An answer is "pending" if its question is required but not yet
  // answered (or not yet answered satisfactorily).
  PENDING: 10,

  // An answer is "ready" if its question is either not required or
  // is required and has been answered satisfactorily.
  READY: 20
});

// Debounce rates used for submitting different types of answers.
export const debounceRatesForSubmission = Object.freeze({
  // Use for checkboxes, radios.
  optionFields: 500,

  // Use for text entry.
  textFields: 100
});
