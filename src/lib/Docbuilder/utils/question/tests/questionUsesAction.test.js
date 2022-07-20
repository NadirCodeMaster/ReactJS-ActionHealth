import questionUsesAction from '../questionUsesAction';
import { actions } from '../constants';

const qValueObjWithSubsectionExclusion = {
  $schema:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/questionTypes/text/checkboxes/question.v1.json',
  label: 'What if we told you that plan_item is 11111?',
  variableName: 'omg_its_plan_item_11111',
  options: [
    {
      key: 'nice',
      label: 'Nice',
      content: 'I would be pleased'
    },
    {
      key: 'no_dice',
      label: 'No dice',
      content: 'Not pleased'
    }
  ],
  otherOption: {
    key: 'another_other',
    label: 'Other'
  },
  associatedEntity: {
    entityType: 'plan_item',
    entityId: 11111
  },
  prepopulate: [],
  replacementFormat: 'list',
  subsectionProcessingStage: 'normal',
  actionsList:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/actionInputs/textReplacement.v1.json'
};

const qValueObjWithNoActionsList = {
  $schema:
    'https://api.healthiergeneration.org/schemas/document-builders/schemas/questionTypes/text/checkboxes/question.v1.json',
  label: 'What if we told you that plan_item is 11111?',
  variableName: 'omg_its_plan_item_11111',
  options: [
    {
      key: 'nice',
      label: 'Nice',
      content: 'I would be pleased'
    },
    {
      key: 'no_dice',
      label: 'No dice',
      content: 'Not pleased'
    }
  ],
  otherOption: {
    key: 'another_other',
    label: 'Other'
  },
  associatedEntity: {
    entityType: 'plan_item',
    entityId: 11111
  },
  prepopulate: [],
  replacementFormat: 'list',
  subsectionProcessingStage: 'normal'
};

test('Correctly-structured question value returns true for action it has', () => {
  let res = questionUsesAction(qValueObjWithSubsectionExclusion, actions.text_replacement_v1);
  expect(res).toBe(true);
});

test('Correctly-structured question value returns false for action it does NOT have', () => {
  let qv = qValueObjWithSubsectionExclusion;
  let res = questionUsesAction(qv, actions.subsection_confirmation_v1);
  expect(res).toBe(false);
});

test('Correctly-structured question value returns false for empty action', () => {
  let res = questionUsesAction(qValueObjWithSubsectionExclusion, '');
  expect(res).toBe(false);
});

test('Question value without actionsList always returns false', () => {
  let res;
  let qv = qValueObjWithNoActionsList;

  res = questionUsesAction(qv, '');
  expect(res).toBe(false);

  res = questionUsesAction(qv, actions.subsection_confirmation_v1);
  expect(res).toBe(false);

  res = questionUsesAction(qv, actions.subsection_exclusion_v1);
  expect(res).toBe(false);
});
