import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { get, has, includes } from "lodash";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import { Grid, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { itemWithResponseShape } from "../../prop-type-shapes";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import ModalCloseButton from "../ModalCloseButton";
import CriterionQuestion from "lib/Criterion/components/CriterionQuestion";
import CategorySelectionBlock from "./CategorySelectionBlock";
import CompletionToggleBlock from "./CompletionToggleBlock";
import DeleteItemBlock from "./DeleteItemBlock";
import StatusBlock from "./StatusBlock";
import CriterionInstancesBlock from "./CriterionInstancesBlock";
import CriterionResources from "components/views/CriterionResources";
import CriterionNotes from "lib/Criterion/components/CriterionNotes";
import CriterionTasks from "lib/Criterion/components/CriterionTasks";
import styleVars from "style/_vars.scss";

// @TODO Question, tasks, notes are to be collapsible
// https://projects.invisionapp.com/share/XGKVZ3QMAWE#/screens/453061251

export default function ItemDetail({
  buckets,
  closePlanItem,
  closeWith,
  currentUser,
  deletePlanItem,
  generatePlanItemViewData,
  idForHeader,
  moveItem,
  organization,
  orgSetsData,
  planItem,
  planItemLoading,
  reloadPlanItem,
  reloadPlanItems,
  reopenPlanItem,
  showMessageFn,
  userCanViewActionPlan,
  userCanEditActionPlan,
  userCanViewAssessment,
  userCanEditAssessment,
  userCanViewCriterionTasks,
  userCanEditCriterionTasks,
  userCanViewCriterionNotes,
  userCanEditCriterionNotes,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const history = useHistory();
  const classes = useStyles();

  const { ref: resizeDetectorRef } = useResizeDetector();

  const [saving, setSaving] = useState(false);
  const [planItemViewData, setPlanItemViewData] = useState(null); // intentionally null until set

  // Reload the item from the server to capture updates from
  // others that for whatever reason were not received via
  // push/websocket.
  useEffect(() => {
    reloadPlanItem(planItem.id);
  }, [planItem.id, reloadPlanItem]);

  // Populate basic values from planItem.
  useEffect(() => {
    let newPlanItemViewData = generatePlanItemViewData(
      planItem,
      orgSetsData,
      userCanViewActionPlan,
      userCanViewAssessment
    );
    setPlanItemViewData(newPlanItemViewData);
  }, [
    generatePlanItemViewData,
    orgSetsData,
    planItem,
    userCanViewActionPlan,
    userCanViewAssessment,
  ]);

  // Handle change to bucket selection.
  const handleBucketSelectChange = useCallback(
    (event) => {
      setSaving(true);
      let newBucketId = event.value ? event.value : null;

      let callback = (success) => {
        if (success) {
          reloadPlanItems();
          if (showMessageFn) {
            showMessageFn("Category update saved", "success");
          }
          if (mounted.current) {
            setSaving(false);
          }
          return;
        }
        if (showMessageFn) {
          showMessageFn(
            "An error occurred saving your changes. Please refresh the page and try again.",
            "error"
          );
        }
      };

      moveItem(planItem, newBucketId, callback);
    },
    [moveItem, planItem, showMessageFn, reloadPlanItems]
  );

  // Handle change of completion toggle.
  // @param {string} newVal 'open'|'close'
  const handleCompletionToggleChange = useCallback(
    (newVal) => {
      let valid = ["open", "close"];
      if (!includes(valid, newVal)) {
        console.warning("Invalid newVal in handleCompletionToggleChange()", newVal);
        return;
      }

      if (mounted.current) {
        setSaving(true);
      }

      let callback = (success) => {
        if (success) {
          // Save succeeded.
          if (mounted.current) {
            setSaving(false);
          }
          reloadPlanItem(planItem.id);
          // Show message.
          let message = "Marked as complete";
          if ("close" !== newVal) {
            message = "Reopened";
          }
          if (showMessageFn) {
            showMessageFn(message, "success");
          }
        } else {
          if (mounted.current) {
            setSaving(false);
          }
          if (showMessageFn) {
            showMessageFn(
              "An error occurred saving your changes. Please refresh the page and try again.",
              "error"
            );
          }
        }
      };

      let op = newVal === "close" ? closePlanItem : reopenPlanItem;
      op(planItem, callback);
    },
    [closePlanItem, planItem, showMessageFn, reloadPlanItem, reopenPlanItem]
  );

  const handleDelete = useCallback(() => {
    setSaving(true);
    let callback = (success) => {
      if (success) {
        // Delete succeeded.
        if (mounted.current) {
          setSaving(false);
        }
        reloadPlanItems();
        // Show message.
        if (showMessageFn) {
          showMessageFn("Item removed from Action Plan", "success");
        }
        // Send back to plan board.
        history.push(`/app/account/organizations/${organization.id}/plan`);
      } else {
        if (mounted.current) {
          setSaving(false);
        }
        if (showMessageFn) {
          showMessageFn(
            "An error occurred saving your changes. Please refresh the page and try again.",
            "error"
          );
        }
      }
    };
    deletePlanItem(planItem, callback);
  }, [deletePlanItem, history, organization, planItem, showMessageFn, reloadPlanItems]);

  const afterResponseChange = useCallback(
    (ok) => {
      // @TODO THIS MIGHT NOT BE NEEDED
      // @TODO THIS ISN'T WORKING ANYWAY
      reloadPlanItem(planItem.id);
    },
    [planItem, reloadPlanItem]
  );

  return (
    <div ref={resizeDetectorRef} className={classes.wrapper}>
      {userCanViewActionPlan && userCanViewAssessment && planItemViewData && (
        <Fragment>
          <header className={classes.header}>
            <h1 className={classes.h1} id={idForHeader}>
              {planItemViewData.name}
            </h1>
            <ModalCloseButton closeWith={closeWith} hideText={true} />
          </header>
          <div className={classes.body}>
            <Grid container spacing={Number(styleVars.gridSpacing)}>
              {/* PRIMARY COLUMN */}
              <Grid item xs={12} md={8}>
                <div className={classes.primary}>
                  <div className={classes.primaryContentBlock}>
                    {/* QUESTION */}
                    {planItemViewData.criterion && (
                      <div className={classes.primaryContentBlock}>
                        <Paper style={{ padding: styleVars.paperPadding }}>
                          <div className={classes.questionWrapper}>
                            <CriterionQuestion
                              afterResponseChange={afterResponseChange}
                              criterion={planItemViewData.criterion}
                              currentUser={currentUser}
                              organization={organization}
                              parentResponse={null /*@TODO*/}
                              parentResponseLoaded={null /*@TODO*/}
                              parentResponseLoading={null /*@TODO*/}
                              parentSuggestionLabel={"" /*@TODO*/}
                              userCanEditActionPlan={userCanEditActionPlan}
                              userCanEditAssessment={userCanEditAssessment}
                              userCanViewActionPlan={userCanViewActionPlan}
                              userCanViewAssessment={userCanViewAssessment}
                            />
                          </div>
                        </Paper>
                      </div>
                    )}

                    {/* TASKS */}
                    {has(planItemViewData, "criterion") && planItemViewData.criterion && (
                      <div className={classes.primaryContentBlock}>
                        {userCanViewCriterionTasks && (
                          <Paper style={{ padding: styleVars.paperPadding }}>
                            <h2 className={classes.tasksHeadline}>Tasks</h2>
                            <CriterionTasks
                              criterionId={planItemViewData.criterion.id}
                              currentUser={currentUser}
                              organization={organization}
                            />
                          </Paper>
                        )}
                      </div>
                    )}

                    {/* NOTES */}
                    {has(planItemViewData, "criterion") && planItemViewData.criterion && (
                      <div className={classes.primaryContentBlock}>
                        {userCanViewCriterionNotes && (
                          <Paper style={{ padding: styleVars.paperPadding }}>
                            <h2 className={classes.notesHeadline}>Notes</h2>
                            <CriterionNotes
                              criterionId={planItemViewData.criterion.id}
                              currentUser={currentUser}
                              organization={organization}
                            />
                          </Paper>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Grid>

              {/* SECONDARY COLUMN */}
              <Grid item xs={12} md={4}>
                <div className={classes.secondary}>
                  {/* STATUS */}
                  <div className={classes.secondaryContentBlock}>
                    <StatusBlock response={get(planItem, "response", null)} />
                  </div>

                  {/* CATEGORY (bucket) */}
                  <div className={classes.secondaryContentBlock}>
                    <CategorySelectionBlock
                      buckets={buckets}
                      readOnly={!userCanEditActionPlan}
                      handleSelectionChange={handleBucketSelectChange}
                      savingChanges={saving}
                      selectedBucketId={planItem.plan_bucket_id || null}
                    />
                    <CompletionToggleBlock
                      handleToggleChange={handleCompletionToggleChange}
                      isComplete={!!planItem.date_completed}
                      readOnly={!userCanEditActionPlan}
                      savingChanges={saving}
                    />
                  </div>

                  {/* DELETE */}
                  <div className={classes.secondaryContentBlock}>
                    <DeleteItemBlock
                      handle={handleDelete}
                      readOnly={!userCanEditActionPlan}
                      savingChanges={saving}
                    />
                  </div>

                  {/* SETS */}
                  {planItemViewData.criterionInstances && userCanViewAssessment && (
                    <div className={classes.secondaryContentBlock}>
                      <CriterionInstancesBlock
                        criterionInstances={planItemViewData.criterionInstances}
                        headerText="Appears in"
                        headerTagLevel={3}
                        organizationId={organization.id}
                        orgSetsData={orgSetsData}
                        userCanViewAssessment={userCanViewAssessment}
                      />
                    </div>
                  )}

                  {/* RESOURCES */}
                  {planItemViewData.criterion && (
                    <div className={classes.secondaryContentBlock}>
                      <CriterionResources
                        criterionId={planItemViewData.criterion.id}
                        headerText="Related resources"
                        headerTagLevel={3}
                        quantity={6}
                      />
                    </div>
                  )}

                  {/* HELP */}
                  <div className={classes.secondaryContentBlock}>
                    <h3>Need help?</h3>
                    <p>
                      {/* NOTE: react-router-dom <Link> requires absolute URLs omit
                          any protocol (i.e., `https:`) and simply begin with `//`. */}
                      {/* @TODO Make URL a constant and search for it elsewhere */}
                      <Link to="//www.healthiergeneration.org/node/6639">Get help</Link>
                    </p>
                  </div>
                </div>
              </Grid>
            </Grid>
          </div>
        </Fragment>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  wrapper: {
    //
  },
  header: {
    backgroundColor: styleVars.colorWhite,
    borderBottom: `2px solid ${styleVars.colorLightGray}`,
    padding: styleVars.paperPadding,
  },
  h1: {
    color: styleVars.txtColorDefault,
    fontSize: styleVars.fontSizeLg,
    fontWeight: styleVars.txFontWeightHeaders,
    margin: 0,
  },
  notesHeadline: {
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultSemibold,
    marginBottom: theme.spacing(1.5),
  },
  tasksHeadline: {
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultSemibold,
    marginBottom: theme.spacing(1.5),
  },
  body: {
    // sibling of header, contains primary and secondary
    margin: "0 auto",
    padding: styleVars.paperPadding,
  },
  primary: {},
  secondary: {},
  primaryContentBlock: {
    marginBottom: theme.spacing(3),
  },
  secondaryContentBlock: {
    marginBottom: theme.spacing(4),
  },
}));

ItemDetail.propTypes = {
  buckets: PropTypes.array.isRequired,
  closePlanItem: PropTypes.func.isRequired,
  closeWith: PropTypes.func,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  deletePlanItem: PropTypes.func.isRequired,
  generatePlanItemViewData: PropTypes.func.isRequired,
  idForHeader: PropTypes.string.isRequired,
  organization: PropTypes.shape(organizationShape).isRequired,
  orgSetsData: PropTypes.array.isRequired,
  moveItem: PropTypes.func.isRequired,
  planItem: PropTypes.shape(itemWithResponseShape).isRequired,
  planItemLoading: PropTypes.bool,
  reloadPlanItem: PropTypes.func.isRequired,
  reloadPlanItems: PropTypes.func.isRequired,
  reopenPlanItem: PropTypes.func.isRequired,
  showMessageFn: PropTypes.func,
  userCanViewActionPlan: PropTypes.bool.isRequired,
  userCanEditActionPlan: PropTypes.bool.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired,
  userCanEditAssessment: PropTypes.bool.isRequired,
  userCanViewCriterionTasks: PropTypes.bool.isRequired,
  userCanEditCriterionTasks: PropTypes.bool.isRequired,
  userCanViewCriterionNotes: PropTypes.bool.isRequired,
  userCanEditCriterionNotes: PropTypes.bool.isRequired,
};
