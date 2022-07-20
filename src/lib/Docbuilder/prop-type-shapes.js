import PropTypes from 'prop-types';

/**
 * Custom PropType shape definitions.
 *
 * Example usage:
 * ```
 * MyComponent.propTypes = {
 *   organization: PropTypes.shape(organizationShape).isRequired
 * };
 * ```
 */

/**
 * Docbuilder question object.
 */
export const docbuilderQuestionShape = {
  id: PropTypes.number.isRequired,
  docbuilder_subsection_id: PropTypes.number.isRequired,
  docbuilder_question_type_id: PropTypes.number.isRequired,
  required: PropTypes.bool.isRequired,
  weight: PropTypes.number.isRequired,
  value: PropTypes.object.isRequired
};

/**
 * Docbuilder question type object.
 */
export const docbuilderQuestionTypeShape = {
  id: PropTypes.number.isRequired,
  machine_name: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  question_schema_uri: PropTypes.string.isRequired,
  answer_schema_uri: PropTypes.string.isRequired
};

/**
 * Docbuilder answer shape applicable to answers of any question type.
 *
 * @see docbuilderAnswerByQuestionTypeShapes
 */
export const docbuilderAnswerCommonShape = {
  id: PropTypes.number.isRequired,
  organization_id: PropTypes.number.isRequired,
  docbuilder_question_id: PropTypes.number.isRequired,
  updated_by_user_id: PropTypes.number,
  // Generic value below is overridden in docbuilderAnswerByQuestionTypeShapes.
  value: PropTypes.object.isRequired
};

/**
 * Docbuilder answer shapes keyed by machine_name of question type.
 *
 * @see docbuilderAnswerCommonShape
 */
export const docbuilderAnswerByQuestionTypeShapes = {
  text_manual_short_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired
    })
  },
  text_manual_long_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired
    })
  },
  text_checkboxes_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.array.isRequired,
      otherResponse: PropTypes.string.isRequired
    })
  },
  text_checkboxes_with_exclude_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.array.isRequired,
      otherResponse: PropTypes.string.isRequired
    })
  },
  text_radios_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired,
      otherResponse: PropTypes.string.isRequired
    })
  },
  text_radios_with_exclude_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired,
      otherResponse: PropTypes.string.isRequired
    })
  },
  subsection_confirmation_checkbox_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired
    })
  },
  subsection_exclusion_radios_v1: {
    ...docbuilderAnswerCommonShape,
    value: PropTypes.shape({
      response: PropTypes.string.isRequired
    })
  },
  file_uploads_v1: {
    ...docbuilderAnswerCommonShape
    // @TODO
  }
};

/**
 * Docbuilder object.
 * In most cases, you should use docbuilderWithSectionsShape instead of this.
 * Refer to the API as to which is appropriate for your usage.
 */
export const docbuilderShape = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  machine_name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired
};

/**
 * Docbuilder object with sections property.
 * Matches the API implementation used at most endpoints, which
 * will a `sections` property that is an array (even if empty).
 */
export const docbuilderWithSectionsShape = {
  ...docbuilderShape,
  docbuilder_sections: PropTypes.array.isRequired
};

/**
 * Docbuilder section object.
 * In most cases, you should use docbuilderSectionWithSubectionsShape instead
 * of this. Refer to the API as to which is appropriate for your usage.
 */
export const docbuilderSectionShape = {
  id: PropTypes.number.isRequired,
  machine_name: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  docbuilder_id: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired,
  builder_headline: PropTypes.string.isRequired,
  doc_headline: PropTypes.string.isRequired,
  is_numbered: PropTypes.bool.isRequired,
  is_meta: PropTypes.bool.isRequired
};

/**
 * Docbuilder section with subsections object.
 * Matches the API implementation used at most endpoints, which
 * will include a `subsections` property that is an array (even if empty).
 */
export const docbuilderSectionWithSubsectionsShape = {
  ...docbuilderSectionShape,
  docbuilder_subsections: PropTypes.array.isRequired
};

/**
 * Docbuilder subsection object.
 * In most cases, you should use docbuilderSubsectionWithQuestionsShape instead
 * of this. Refer to the API as to which is appropriate for your usage.
 */
export const docbuilderSubsectionShape = {
  id: PropTypes.number.isRequired,
  machine_name: PropTypes.string.isRequired,
  docbuilder_section_id: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired,
  required: PropTypes.bool.isRequired,
  exclude_from_builder: PropTypes.bool.isRequired,
  builder_headline: PropTypes.string.isRequired,
  builder_primary_text: PropTypes.string.isRequired,
  builder_secondary_text: PropTypes.string.isRequired,
  doc_text: PropTypes.string.isRequired
};

/**
 * Docbuilder subsection object with `_render` property.
 * These are used in preview mode and are returned from certain API calls.
 * Just a base subsection object that also includes a `_render` property
 * populated with HTML (string).
 */
export const docbuilderSubsectionWithRenderShape = {
  ...docbuilderSubsectionShape,
  _render: PropTypes.string.isRequired
};

/**
 * Docbuilder subsection with questions object.
 * Matches the API implementation used at most endpoints, which
 * will include a `questions` property that is an array (even if empty).
 */
export const docbuilderSubsectionWithQuestionsShape = {
  ...docbuilderSubsectionShape,
  docbuilder_questions: PropTypes.array.isRequired
};

/**
 * Docbuilder vars object for an org in a docbuilder.
 * Corresponds to the payloads returned from requestDocbuilderVarsForOrg()
 */
export const docbuilderVarsShape = {
  meta: PropTypes.object.isRequired,
  system: PropTypes.object.isRequired
};
