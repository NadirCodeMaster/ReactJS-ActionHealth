import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { isNil, find } from "lodash";
import CtaTemplateA from "components/ui/CtaTemplateA";

/**
 * Asessment Info Overview Box
 */
export default function AsessmentInfoOverviewBox({ organization }) {
  const orgHasNoResponsesForAnySet = () => {
    let possibleLastResponse = find(organization.available_sets, (_set) => {
      return _set.lastResponse;
    });

    return isNil(possibleLastResponse);
  };

  return (
    <div>
      {orgHasNoResponsesForAnySet && (
        <CtaTemplateA
          title={"How Assessments work"}
          text={
            <div>
              Answering assessment questions helps identify strengths and opportunities for
              improvement. Add items to your
              <Link to={`/app/account/organizations/${organization.id}/plan`}> Action Plan </Link>
              to make progress toward your goals!
            </div>
          }
        />
      )}
      {!orgHasNoResponsesForAnySet && (
        <CtaTemplateA
          title={"Resources to help you make progress"}
          text={
            <div>
              Each question on the assessment is accompanied by links to related
              <Link to={`/app/resources`}> resources</Link>, designed to support your progress in
              every topic.
            </div>
          }
        />
      )}
    </div>
  );
}

// const useStyles = makeStyles(theme => ({}));

AsessmentInfoOverviewBox.propTypes = {
  organization: PropTypes.object,
};
