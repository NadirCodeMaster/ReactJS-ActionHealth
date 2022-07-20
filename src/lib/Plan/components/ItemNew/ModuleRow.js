import React from "react";
import PropTypes from "prop-types";
import { includes } from "lodash";
import clsx from "clsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Hidden,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Checkbox from "components/ui/CheckboxWrapper";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import findCurrentResponseForCriterion from "utils/orgSetsData/findCurrentResponseForCriterion";
import { organizationWithAvailableSetsShape } from "constants/propTypeShapes";

//
// Output for a single module as an expansion box.
//

export default function ModuleRow({
  classes,
  expanded,
  isCriterionInPlan,
  handleQuestionClick,
  module,
  moduleQuestions,
  orgSetsData,
  newlySelectedCriterionIds,
  toggleExpansion,
  userCanEditActionPlan,
}) {
  return (
    <div>
      <Accordion
        className={classes.accordion}
        key={module.id}
        expanded={expanded}
        onChange={toggleExpansion}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel-content-module-${module.id}`}
          id={`panel-header-module-${module.id}`}
        >
          <div className={classes.expansionSummary}>
            <div className={classes.summaryName}>
              <div className={classes.moduleName}>{module.name}</div>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          {moduleQuestions && moduleQuestions.length > 0 && (
            <Table>
              <TableHead>
                <TableRow className={classes.tableHeadRow}>
                  <TableCell className={clsx(classes.th, classes.thHandle)} colSpan={2}>
                    Criteria
                  </TableCell>
                  <Hidden smDown>
                    <TableCell className={clsx(classes.th, classes.thStatus)}>Status</TableCell>
                  </Hidden>
                  <TableCell className={clsx(classes.th, classes.thAdd)}>
                    Add to Action Plan
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moduleQuestions.map((q, qIdx) => {
                  let statusLabel = "Unanswered";
                  let qResp = findCurrentResponseForCriterion(orgSetsData, q.criterion_id);
                  if (qResp && qResp.response_value) {
                    statusLabel = qResp.response_value.label;
                  }

                  let alreadyInPlan = isCriterionInPlan(q.criterion_id);
                  let isChecked =
                    alreadyInPlan || includes(newlySelectedCriterionIds, q.criterion_id);
                  let isDisabled = alreadyInPlan;

                  return (
                    <TableRow key={qIdx} hover>
                      <TableCell className={clsx(classes.td, classes.tdHandle)}>
                        <div className={classes.handleStr}>{q.handle}</div>
                      </TableCell>
                      <TableCell className={clsx(classes.td, classes.tdName)}>
                        {q.criterion.name}
                        <Hidden smUp>
                          <div className={classes.statusLabelInNameCol}>{statusLabel}</div>
                        </Hidden>
                      </TableCell>
                      <Hidden smDown>
                        <TableCell className={clsx(classes.td, classes.tdStatus)}>
                          {statusLabel}
                        </TableCell>
                      </Hidden>
                      <TableCell className={clsx(classes.td, classes.tdAdd)}>
                        {alreadyInPlan ? (
                          <em>Already added</em>
                        ) : (
                          <Checkbox
                            name={String(q.criterion_id)}
                            value={String(q.criterion_id)}
                            checked={isChecked}
                            disabled={isDisabled}
                            handleChange={() => handleQuestionClick(q.criterion_id)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          {moduleQuestions.length < 1 && (
            <div className={classes.noCriterion}>
              No questions are currently available in this topic.
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

ModuleRow.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  isCriterionInPlan: PropTypes.func.isRequired,
  handleQuestionClick: PropTypes.func.isRequired,
  module: PropTypes.object.isRequired,
  moduleQuestions: PropTypes.array.isRequired,
  newlySelectedCriterionIds: PropTypes.array.isRequired,
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
  orgSetsData: PropTypes.array.isRequired,
  toggleExpansion: PropTypes.func.isRequired,
  userCanEditActionPlan: PropTypes.bool.isRequired,
};
