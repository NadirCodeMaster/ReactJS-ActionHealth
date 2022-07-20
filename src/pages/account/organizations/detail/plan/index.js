import React, { Fragment, useEffect, useRef, useState } from "react";
import { Switch } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import PrivateRoute from "components/ui/PrivateRoute";
import Plan from "lib/Plan/components/Plan.js";
import userCan from "utils/userCan";
import { organizationWithAvailableSetsShape } from "constants/propTypeShapes";

//
// Routing and controller for action plan functionality.
//

export default function PlanController({ organization }) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const programs = useSelector((state) => state.programs);

  const [userCanViewActionPlan, setuserCanViewActionPlan] = useState(false);
  const [userCanEditActionPlan, setUserCanEditActionPlan] = useState(false);
  const [userCanViewAssessment, setUserCanViewAssessment] = useState(false);
  const [userCanEditAssessment, setUserCanEditAssessment] = useState(false);
  const [userCanInviteOrgUsers, setUserCanInviteOrgUsers] = useState(false);
  const [userCanViewCriterionTasks, setUserCanViewCriterionTasks] = useState(false);
  const [userCanEditCriterionTasks, setUserCanEditCriterionTasks] = useState(false);
  const [userCanViewCriterionNotes, setUserCanViewCriterionNotes] = useState(false);
  const [userCanEditCriterionNotes, setUserCanEditCriterionNotes] = useState(false);

  // Check permissions.
  useEffect(() => {
    if (mounted.current) {
      setuserCanViewActionPlan(userCan(currentUser, organization, "view_action_plan"));
      setUserCanEditActionPlan(userCan(currentUser, organization, "edit_action_plan"));
      setUserCanViewAssessment(userCan(currentUser, organization, "view_assessment"));
      setUserCanEditAssessment(userCan(currentUser, organization, "edit_assessment"));
      setUserCanInviteOrgUsers(userCan(currentUser, organization, "invite_team_member"));
      setUserCanEditCriterionNotes(userCan(currentUser, organization, "edit_criterion_notes"));
      setUserCanEditCriterionTasks(userCan(currentUser, organization, "edit_criterion_tasks"));
      setUserCanViewCriterionTasks(userCan(currentUser, organization, "view_criterion_tasks"));
      setUserCanViewCriterionNotes(userCan(currentUser, organization, "view_criterion_notes"));
    }
  }, [currentUser, organization]);

  // Make sure we have a loaded user with access before proceeding.
  if (!userCanViewActionPlan || !currentUser || !currentUser.loaded) {
    return null;
  }

  return (
    <Fragment>
      <Switch>
        {/* Action Plan board */}
        <PrivateRoute
          path="/app/account/organizations/:organization_id/plan/(items)?/:item_id?"
          redirectBackOnLogin={true}
          currentUser={currentUser}
          render={({ match }) => (
            <Plan
              detailItemId={match.params.item_id}
              currentUser={currentUser}
              organization={organization}
              programs={programs}
              userCanViewActionPlan={userCanViewActionPlan}
              userCanEditActionPlan={userCanEditActionPlan}
              userCanViewAssessment={userCanViewAssessment}
              userCanEditAssessment={userCanEditAssessment}
              userCanInviteOrgUsers={userCanInviteOrgUsers}
              userCanViewCriterionTasks={userCanViewCriterionTasks}
              userCanEditCriterionTasks={userCanEditCriterionTasks}
              userCanViewCriterionNotes={userCanViewCriterionNotes}
              userCanEditCriterionNotes={userCanEditCriterionNotes}
            />
          )}
        />
      </Switch>
    </Fragment>
  );
}

PlanController.propTypes = {
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
};
