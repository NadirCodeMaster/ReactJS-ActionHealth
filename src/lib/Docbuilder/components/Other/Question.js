import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { get, has } from 'lodash';
import QtFileUploadsV1 from './QuestionTypes/QtFileUploadsV1';
import QtTextManualShortV1 from './QuestionTypes/QtTextManualShortV1';
import QtTextManualLongV1 from './QuestionTypes/QtTextManualLongV1';
import QtTextCheckboxesV1 from './QuestionTypes/QtTextCheckboxesV1';
import QtTextCheckboxesWithExcludeV1 from './QuestionTypes/QtTextCheckboxesWithExcludeV1';
import QtTextRadiosV1 from './QuestionTypes/QtTextRadiosV1';
import QtTextRadiosWithExcludeV1 from './QuestionTypes/QtTextRadiosWithExcludeV1';
import QtSubsectionConfirmationCheckboxV1 from './QuestionTypes/QtSubsectionConfirmationCheckboxV1';
import QtSubsectionExclusionRadiosV1 from './QuestionTypes/QtSubsectionExclusionRadiosV1';
import {
  docbuilderAnswerCommonShape,
  docbuilderQuestionShape,
  docbuilderSubsectionShape,
  docbuilderVarsShape
} from '../../prop-type-shapes';
import { actions } from '../../utils/question/constants';
import questionUsesAction from '../../utils/question/questionUsesAction';
import { statuses } from '../../utils/subsection/constants';

//
// Form display for questions.
// ---------------------------
// Typically rendered inside ./Subsection. This is essentially a
// wrapper for questions that will pull in the appropriate question type
// component.
//

export default function Question({
  applyDisplayedAnswerStatus,
  displayedAnswerStatuses,
  docbuilderVars,
  organizationId,
  readOnly, // prevent changes when doc is submitted/locked/closed
  deleteAnswer,
  storedAnswer,
  question,
  submitAnswer,
  subsection,
  subsectionStatus
}) {
  const questionTypes = useSelector(state => state.app_meta.data.docbuilderQuestionTypes);

  return (
    <Fragment>
      {question && (
        <Fragment>
          {qtComponent(
            applyDisplayedAnswerStatus,
            displayedAnswerStatuses,
            docbuilderVars,
            organizationId,
            question,
            questionTypes,
            readOnly,
            deleteAnswer,
            storedAnswer,
            subsection,
            subsectionStatus,
            submitAnswer
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

const qtComponent = (
  applyDisplayedAnswerStatus,
  displayedAnswerStatuses,
  docbuilderVars,
  organizationId,
  question,
  questionTypes,
  readOnly,
  deleteAnswer,
  storedAnswer,
  subsection,
  subsectionStatus,
  onSubmitAnswer
) => {
  if (!question) {
    return null;
  }

  if (!has(questionTypes, question.docbuilder_question_type_id)) {
    // Don't have that question type ID.
    console.warn('qtComponent: Missing question type ID: ', question.docbuilder_question_type_id);
    return null;
  }

  let qt = get(questionTypes, question.docbuilder_question_type_id, null);
  if (!qt) {
    return null;
  }

  if (!has(qtComponents, qt.machine_name)) {
    // Don't have a component for that question type.
    console.warn('qtComponent: Missing question type component: ', qt.machine_name);
    return null;
  }

  let QtComponent = qtComponents[qt.machine_name];

  // Hide current question when:
  //
  // - subsectionStatus is EXCLUDING _and_
  // - the current question is not of a type that can cause exclusion
  let usesExclude = questionUsesAction(question.value, actions.subsection_exclusion_v1);
  if (!usesExclude && subsectionStatus === statuses.EXCLUDING) {
    return null;
  }

  return (
    <QtComponent
      applyDisplayedAnswerStatus={applyDisplayedAnswerStatus}
      displayedAnswerStatuses={displayedAnswerStatuses}
      docbuilderVars={docbuilderVars}
      organizationId={organizationId}
      storedAnswer={storedAnswer}
      question={question}
      readOnly={readOnly}
      deleteAnswer={deleteAnswer}
      subsection={subsection}
      onSubmitAnswer={onSubmitAnswer}
    />
  );
};

// Map of question type machine names to corresponding React components.
const qtComponents = {
  text_manual_short_v1: QtTextManualShortV1,
  text_manual_long_v1: QtTextManualLongV1,
  text_checkboxes_v1: QtTextCheckboxesV1,
  text_checkboxes_with_exclude_v1: QtTextCheckboxesWithExcludeV1,
  text_radios_v1: QtTextRadiosV1,
  text_radios_with_exclude_v1: QtTextRadiosWithExcludeV1,
  subsection_confirmation_checkbox_v1: QtSubsectionConfirmationCheckboxV1,
  subsection_exclusion_radios_v1: QtSubsectionExclusionRadiosV1,
  file_uploads_v1: QtFileUploadsV1
};

Question.propTypes = {
  applyDisplayedAnswerStatus: PropTypes.func.isRequired,
  displayedAnswerStatuses: PropTypes.object.isRequired,
  organizationId: PropTypes.number.isRequired,
  readOnly: PropTypes.bool,
  deleteAnswer: PropTypes.func.isRequired,
  storedAnswer: PropTypes.shape(docbuilderAnswerCommonShape),
  question: PropTypes.shape(docbuilderQuestionShape).isRequired,
  submitAnswer: PropTypes.func.isRequired,
  subsection: PropTypes.shape(docbuilderSubsectionShape).isRequired,
  subsectionStatus: PropTypes.number,
  docbuilderVars: PropTypes.shape(docbuilderVarsShape).isRequired
};
