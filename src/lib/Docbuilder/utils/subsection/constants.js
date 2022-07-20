// The subsection processing stages a question may belong to.
export const stages = ['pre', 'normal', 'post'];

// Available statuses for subsections based on an organization's answers.
export const statuses = Object.freeze({
  // Status: *PENDING*
  // One or more required subsection questions has not been
  // answered or has another problem.
  PENDING: 10,

  // Status: *READY*
  // All questions in the subsection have been answered
  // satisfactorily and there's nothing indicating the
  // subsection should be excluded.
  READY: 20,

  // Status: *EXCLUDING*
  // The subsection is being excluded because the
  // response to a subsection exclusion question indicates
  // it should be. Other questions may or may not be
  // answered, valid.
  EXCLUDING: 30,

  // Status: *NOT_APPLICABLE*
  // Subsection has no questions of its own.
  NOT_APPLICABLE: 40,

  // Additional properties for each.
  properties: {
    10: {
      machine_name: 'pending',
      name: 'Pending'
    },
    20: {
      machine_name: 'ready',
      name: 'Ready'
    },
    30: {
      machine_name: 'excluding',
      name: 'Excluding'
    },
    40: {
      machine_name: 'not_applicable',
      name: 'Not applicable'
    }
  }
});

export const errorInUnsavedAnswersMessage =
  'An invalid change is present and cannot be saved. Please review and adjust.';
