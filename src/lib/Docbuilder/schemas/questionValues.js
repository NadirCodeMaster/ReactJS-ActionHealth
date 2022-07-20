import Schema from 'validate';

// @TODO Update based on latest schemas (noted jan 19, 2022)

/**
 * Schemas for Docbuilder question values.
 *
 * These are used to validate docbuilder question value objects and
 * to look-up properties of question types. Since schemas are obstensibly
 * unchanging, they are manually declared here (rather than read in
 * dynamically). If they, ahem, _were_ to ever change, you'd want to
 * ensure the updates are reflected here.
 *
 * Initially developed for Docbuilder admin tools and not yet fully
 * vetted or utilized (as of January 2022).
 */

// -------------
// ACTION INPUTS
// -------------

// @TODO
// const actionInputs = {
//   subsectionExclusion: new Schema({
//     inclusionStatusV1: {
//       type: String,
//       enum: ["include", "exclude"]
//     }
//   }),
//   // ...
// };

// --------------
// QUESTION PARTS
// Note: Best practice for arrays of objects is to nest object schema in array.
// --------------

const questionParts = {
  // @TODO
  // actionsListV1: newSchema({
  //   type: String
  // }),

  // @TODO Suffix with "V1"
  optionsKeyLabelContent: new Schema({
    key: {
      type: String,
      match: /^[a-z](_?[a-z])*$/,
      required: true
    },
    label: {
      type: String,
      length: { min: 1 },
      required: true
    },
    content: {
      type: String,
      length: { min: 1 },
      required: true
    }
  }),
  // @TODO Suffix with "V1"
  optionsKeyLabelContent: new Schema({
    key: {
      type: String,
      match: /^[a-z](_?[a-z])*$/,
      required: true
    },
    label: {
      type: String,
      length: { min: 1 },
      required: true
    },
    content: {
      type: String,
      length: { min: 1 },
      required: true
    }
  }),
  // @TODO Suffix with "V1"
  otherOptionKeyLabel: new Schema({
    key: {
      type: String,
      match: /^[a-z](_?[a-z])*$/,
      required: true
    },
    label: {
      type: String,
      length: { min: 1 },
      required: true
    }
  }),
  // @TODO Suffix with "V1"
  optionIncludeExclude: new Schema({
    include: {
      type: String,
      required: true
    },
    exclude: {
      type: String,
      required: true
    }
  })
};

// ---------------
// QUESTION VALUES
// ---------------

export const text_manual_short_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  prepopulate: {
    type: String,
    required: false
  },
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(normal)$/
  }
});

export const text_manual_long_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  prepopulate: {
    type: String,
    required: false
  },
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(normal)$/
  }
});

export const text_checkboxes_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  options: [questionParts.optionsKeyLabelContent],
  prepopulate: {
    type: Array,
    required: false
  },
  otherOption: questionParts.otherOptionKeyLabel,
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(normal)$/
  }
});

export const text_checkboxes_with_exclude_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  options: [questionParts.optionsKeyLabelContent],
  prepopulate: {
    type: Array,
    required: false
  },
  otherOption: questionParts.otherOptionKeyLabel,
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(pre)$/
  }
});

export const text_radios_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  options: [questionParts.optionsKeyLabelContent],
  prepopulate: {
    type: Array,
    required: false
  },
  otherOption: questionParts.otherOptionKeyLabel,
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(normal)$/
  }
});

export const text_radios_with_exclude_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  variableName: {
    type: String,
    required: true,
    match: /^[a-z](_?[a-z])*$/
  },
  options: [questionParts.optionsKeyLabelContent],
  prepopulate: {
    type: Array,
    required: false
  },
  otherOption: questionParts.otherOptionKeyLabel,
  replacementFormat: {
    type: String,
    required: true,
    match: /^[a-z]+$/
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(pre)$/
  }
});

export const subsection_confirmation_checkbox_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  prepopulate: {
    type: String,
    required: false
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(post)$/
  }
});

export const subsection_exclusion_radios_v1 = new Schema({
  label: {
    type: String,
    required: true,
    length: { min: 1 }
  },
  options: questionParts.optionIncludeExclude,
  prepopulate: {
    type: String,
    required: false
  },
  subsectionProcessingStage: {
    type: String,
    required: true,
    match: /^(pre)$/
  }
});

export const text_file_uploads_v1 = new Schema({
  // @TODO
});
