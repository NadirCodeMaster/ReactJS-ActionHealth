import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { isNil, find, get } from "lodash";
import moment from "moment";

/**
 * Assessment action box (CTA)
 */
export default function AssessmentActionBox({
  organization,
  organizationType,
  premiumSetMachineName,
  program,
  setActualResponses,
  setObj,
  setPossibleResponses,
  //@TODO: Possibly move setSummaryLink calc into this file, and include logic to link
  // to first APPLICABLE question, instead of just the first question (ie [0])
  setSummaryLink,
}) {
  const classes = useStyles();
  const setIsPremium = premiumSetMachineName === program.machine_name;
  const percentComplete = _percentComplete(organization, setObj);
  const updatedBy = _updatedBy(organization, setObj);

  const contentObj = generateContentForContentObj(
    organization,
    organizationType,
    percentComplete,
    program,
    setObj,
    setActualResponses,
    setIsPremium,
    setPossibleResponses,
    setSummaryLink
  );

  return (
    <div className={classes.actionContainer}>
      <h3>{contentObj.title}</h3>
      <div className={classes.actionBody}>{contentObj.body}</div>
      {!isNil(updatedBy) && <div className={classes.actionUpdatedBy}>{updatedBy}</div>}
      {contentObj.link && (
        <Button
          className={classes.actionButton}
          color="primary"
          variant="contained"
          href={contentObj.link}
        >
          {contentObj.linkText}
        </Button>
      )}
    </div>
  );
}

const _updatedBy = (organization, setObj) => {
  let updatedBy;
  let available_sets = get(organization, "available_sets", []);
  let availableSet = find(available_sets, { id: setObj.id });
  let lastResponse = get(availableSet, "lastResponse", {});
  let updatedAt = get(lastResponse, "updated_at", null);

  if (moment(updatedAt).isValid()) {
    updatedBy = "Updated " + moment.utc(updatedAt).fromNow();

    if (lastResponse.user) {
      let nameFirst = get(lastResponse, "user.name_first", "");
      let nameLast = get(lastResponse, "user.name_last", "").charAt(0);
      updatedBy += " by " + nameFirst + " " + nameLast;
    }
  }

  return updatedBy;
};

const _percentComplete = (organization, setObj) => {
  let availableSet = find(organization.available_sets, (as) => {
    return as.id === setObj.id;
  });

  if (!isNil(availableSet)) {
    return availableSet.percentComplete;
  }

  return;
};

const generateContentForContentObj = (
  organization,
  organizationType,
  percentComplete,
  program,
  setObj,
  setActualResponses,
  setIsPremium,
  setPossibleResponses,
  setSummaryLink
) => {
  // Conditions determining content.
  let _isPremium = setIsPremium;
  let _setStatus = 0; // 0 = not started (default), 10 = started, 20 = completed
  if (percentComplete > 0 && percentComplete < 1) {
    _setStatus = 10;
  } else if (1 === percentComplete) {
    _setStatus = 20;
  }
  let _programMachineName = program ? program.machine_name : null;

  // Other vars we might use.
  let _questionsAnswered = setActualResponses;
  let _questionsRemaining = setPossibleResponses - setActualResponses;

  let _questionOrQuestionsAnswered = 1 === _questionsAnswered ? "question" : "questions";

  // Reasonable defaults that will mostly be overridden. However,
  // confirm what will fall through to use before changing these.
  let contentObj = {
    title: `A healthier ${organizationType.name.toLowerCase()} starts here!`,
    body: "Click below to view assessment",
    linkText: "View assessment",
    link: setSummaryLink,
  };

  // Below we'll set the generic/default values based on status. Further customization
  // base on program, set or org type should be done _after_ these.

  // ============
  // ==== PREMIUM
  // ============

  if (_isPremium) {
    switch (_setStatus) {
      case 0:
        // PREMIUM, NOT STARTED
        contentObj.title = "Comprehensive support for health and learning";
        contentObj.body =
          "Start with the core questions to help you build a strong foundation for healthy change.";
        contentObj.linkText = "Get started";
        break;
      case 10:
        // PREMIUM, STARTED
        contentObj.title = "Deepen your understanding";
        contentObj.body =
          "Continue working through your assessment to understand where you’re at. Record your progress as you make improvements.";
        contentObj.linkText = "Continue assessment";
        break;
      case 20:
        // PREMIUM, COMPLETED
        contentObj.title = "Great work!";
        contentObj.body = `You have answered all of the questions in this assessment. Review your responses each year to ensure that they're still accurate.`;
        break;
      default:
      // linters want a default case.
    }
  }

  // ================
  // ==== NOT PREMIUM
  // ================

  if (!_isPremium) {
    switch (_setStatus) {
      case 0:
        // NOT PREMIUM, NOT STARTED
        contentObj.body = `The ${
          setObj.name
        } will help identify your ${organizationType.name.toLowerCase()}'s current health priorities and highlight areas for improvement.`;
        contentObj.linkText = "Get started";
        break;
      case 10:
        // NOT PREMIUM, STARTED
        contentObj.title = `${organization.name} is moving toward a healthier future!`;
        contentObj.body = `You have answered ${_questionsAnswered} ${_questionOrQuestionsAnswered}. Only ${_questionsRemaining} left!`;
        contentObj.linkText = "Continue assessment";
        break;
      case 20:
        // NOT PREMIUM, COMPLETED
        contentObj.title = "Great work!";
        contentObj.body = `You have answered all of the questions in this assessment. Review your responses each year to ensure that they're still accurate.`;
        break;
      default:
      // linters want a default case.
    }
  }

  // ==============
  // ==== OVERRIDES
  // ==== Avoid adding overrides. It's messy to maintain. UI content will eventually be moved
  // ==== to a more typical DB-backed content management tool.
  // ==============

  // PROGRAM: APPLICATION READINESS
  // ------------------------------
  if ("application_readiness" === _programMachineName) {
    // Note: No additional accommodations for premium/not premium are made for the
    // overrides of this program. In practice, this program is unlikely to be
    // rendered as "premium."
    switch (_setStatus) {
      case 0:
        contentObj.body = `Join a national movement of schools dedicated to prioritizing the essential health needs of students, staff, and families. The ${setObj.name} will help you determine your school's eligibility to apply for a distinction in one or more topic areas.`;
        break;
      case 10:
        contentObj.body = `The ${setObj.name} will help you determine your school's eligibility to apply for a distinction in one or more topic areas. You have answered ${_questionsAnswered} ${_questionOrQuestionsAnswered}. Only ${_questionsRemaining} left!`;
        break;
      case 20:
        contentObj.body = `Review your responses to determine if your school would like to apply for a Healthier Generation Award. To be considered for a distinction in one or more topic areas, the responses should indicate Fully in Place for all questions in an individual topic. For more information, please visit the Award Eligibility Guide.`;
        break;
      default:
      // linters want a default case.
    }
  }

  // -------------------------------------------
  // Return whatever we now have as our content.
  // -------------------------------------------
  return contentObj;
};

const useStyles = makeStyles((theme) => ({
  actionContainer: {
    width: "100%",
  },
  actionBody: {
    marginBottom: theme.spacing(3),
  },
  actionButton: {
    borderRadius: 5,
  },
  actionUpdatedBy: {
    fontStyle: "italic",
    marginBottom: theme.spacing(),
  },
}));

AssessmentActionBox.propTypes = {
  organization: PropTypes.object,
  organizationType: PropTypes.object.isRequired,
  premiumSetMachineName: PropTypes.string,
  program: PropTypes.object,
  setActualResponses: PropTypes.number,
  setObj: PropTypes.object.isRequired,
  setPossibleResponses: PropTypes.number,
  setSummaryLink: PropTypes.string,
};
