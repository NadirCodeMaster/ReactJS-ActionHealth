// Provides simplified access to question type schema ids.
//
// Each key is a snake_case (with version) representation of
// the actionInput's name. The corresponding value is the schema
// identifier.
//
// @TODO Refactor to decouple from other code, such as ../../schemas/questionValues.js.
export const actions = Object.freeze({
  entity_association_v1:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/actionInputs/entityAssociation.v1.json',
  subsection_confirmation_v1:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/actionInputs/subsectionConfirmation.v1.json',
  subsection_exclusion_v1:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/actionInputs/subsectionExclusion.v1.json',
  text_replacement_v1:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/actionInputs/textReplacement.v1.json'
});
