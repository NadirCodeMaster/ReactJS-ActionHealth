import { get, isEmpty, isString, toArray, uniqBy } from 'lodash';
import extractQuestionsFromOrgSetsData from 'utils/orgSetsData/extractQuestionsFrom';
import { defaultPlanItemName, unavailableName } from './constants';

// Generate an object with ready-to-use planItem properties for item cards, detail views.
export default function generatePlanItemViewData(
  planItem,
  orgSetsData,
  userCanViewActionPlan = false,
  userCanViewAssessment = false
) {
  let _criterion = null;
  let _criterionInstances = [];
  let _isComplete = false;
  let _name = unavailableName;
  let _responseText = '';

  // Handle for non-criterion plan items first, since that logic is shared regardless
  // of user/assessment perms.
  if (userCanViewActionPlan && (!planItem.criterion_id || isEmpty(planItem.criterion))) {
    // Not criterion-based (or is at least missing criterion obj).
    _name =
      isString(planItem.name) && planItem.name.length > 0 ? planItem.name : defaultPlanItemName;
  }

  // Criterion-based.
  else {
    // Check that user can view assessments before setting set-related values.
    if (userCanViewAssessment) {
      _criterion = planItem.criterion;
      _name = get(planItem, 'criterion.name', unavailableName);
      _responseText = get(planItem, 'response.response_value.label', 'Unanswered');

      // CIs
      _criterionInstances = extractQuestionsFromOrgSetsData(orgSetsData, planItem.criterion.id);
      _criterionInstances = toArray(_criterionInstances);
      // Prevent us from having the multiple identical handles in the same set.
      _criterionInstances = uniqBy(_criterionInstances, v => {
        return `${v.handle}_${v.set_id}`;
      });
    }
  }

  if (planItem.date_completed) {
    _isComplete = Boolean(planItem.date_completed);
  }

  return {
    criterion: _criterion,
    criterionInstances: _criterionInstances,
    isComplete: _isComplete,
    name: _name,
    responseText: _responseText
  };
}
