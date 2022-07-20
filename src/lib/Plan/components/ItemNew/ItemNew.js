import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import {
  filter,
  find,
  forEach,
  get,
  includes,
  isArray,
  isEmpty,
  isNil,
  isNull,
  sortBy,
  without,
} from "lodash";
import isNumeric from "utils/isNumeric";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HotTipCta from "components/views/HotTipCta";
import { currentUserShape, organizationWithAvailableSetsShape } from "constants/propTypeShapes";
import extractSetFromOrgSetsData from "utils/orgSetsData/extractSetFrom";
import { nullBucket } from "../../utils/constants";
import errorSuffix from "utils/errorSuffix";
import programBranding from "utils/programBranding";
import AssessmentSelection from "./AssessmentSelection";
import ModalCloseButton from "../ModalCloseButton";
import ModuleRow from "./ModuleRow";
import styleVars from "style/_vars.scss";

export default function ItemNew({
  buckets,
  closeWith,
  createNewItems,
  currentUser,
  idForHeader,
  isCriterionInPlan,
  organization,
  orgSetsData,
  orgSetsDataLoading,
  programs,
  reloadPlanItems,
  showMessageFn,
  userCanViewActionPlan,
  userCanEditActionPlan,
  userCanViewAssessment,
  userCanEditAssessment,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();

  const { width, ref: resizeDetectorRef } = useResizeDetector();

  // Bucket selected as destination for new item.
  const [bucketId, setBucketId] = useState(null);
  const [bucket, setBucket] = useState(null); // set only via bucketId

  // Set to filter questions by.
  const [setId, setSetId] = useState(null);
  const [setData, setSetData] = useState(null); // set object populated based on setId
  const [setModules, setSetModules] = useState([]); // from set, but modified to include 'non-module'

  const [expandedModuleIds, setExpandedModuleIds] = useState([]);
  const [expandAll, setExpandAll] = useState(false);
  const [newlySelectedCriterionIds, setNewlySelectedCriterionIds] = useState([]);

  const [confDialogIsOpen, setConfDialogIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Watch URL path (location) for changes.
  //
  // - Establish initial values passed in from URL (if any).
  // - Close confirmation dialog when no longer viewing this component.
  useEffect(() => {
    let query = new URLSearchParams(location.search);
    let newBucketId = null;
    let newSetId = null;
    let pathname = location.pathname.toLowerCase();

    // Watch for path change so we can close dialog when ready.
    if (`app/account/organizations/${organization.id}/plan/items/new` !== pathname) {
      setConfDialogIsOpen(false);
    }

    // Watch for changes parameter changes.
    if (query) {
      newBucketId = query.get("plan_bucket_id");
      // @TODO Validate bucket ID here? (for non-numeric values)
      newBucketId = isNumeric(newBucketId) ? Number(newBucketId) : newBucketId;
      newSetId = query.get("set_id");
      newSetId = isNumeric(newSetId) ? newSetId : null;
    }
    setBucketId(newBucketId);
    setSetId(newSetId);
  }, [location, organization]);

  // Change bucket when bucketId changes.
  useEffect(() => {
    let newBucketVal = null;
    if (bucketId) {
      newBucketVal = find(buckets, ["id", bucketId]);
    }
    setBucket(newBucketVal);
  }, [bucketId, buckets]);

  // Change setData and setModules when setId changes.
  useEffect(() => {
    let newSetData = null;
    let newSetModules = [];

    if (setId && isNumeric(setId)) {
      newSetData = extractSetFromOrgSetsData(orgSetsData, Number(setId));
      if (newSetData) {
        newSetModules = get(newSetData, "modules", []);
        let nonModuleQuestions = findNonModuleQuestions(newSetData);
        if (nonModuleQuestions.length > 0) {
          // If there are non-module questions, add a non-module module entry.
          newSetModules.unshift({
            id: null,
            name: "No module",
            abbreviation: "n/a",
            description: null,
            set_id: setId,
            weight: -10000,
          });
        }
      }
    }

    if (mounted.current) {
      setSetData(newSetData);
      setSetModules(newSetModules);
      setExpandedModuleIds([]);
      setExpandAll(false);
    }
  }, [organization, orgSetsData, setId]);

  // Handle change to assessment selection field.
  const handleAssessmentSelectChange = (event) => {
    setSetId(event.value);
  };

  /**
   * Handle submission of criteria to be added to plan.
   */
  const handleSubmit = useCallback(() => {
    setSubmitting(true);

    /**
     * Callback that runs when createNewItems completes.
     * @param {bool} success
     * @param {object} error (optional)
     */
    let afterCreate = (success, error) => {
      if (mounted.current) {
        if (success) {
          reloadPlanItems();
          setConfDialogIsOpen(true);
          setSubmitting(false);
        } else {
          setSubmitting(false);
          if (showMessageFn) {
            showMessageFn(
              "An error occurred while adding these to your action plan. " + errorSuffix(error),
              "error"
            );
          }
        }
      }
    };

    // Determine bucket ID destination (if any).
    let planBucketId = null;

    if (bucket && bucket.id) {
      if (bucket.id === nullBucket.id) {
        // also treated as null
        planBucketId = null;
      } else {
        // our faux nullbucketid is the only acceptable non-numeric id
        // at this time, so we cast everything else to a number.
        planBucketId = Number(bucket.id);
      }
    }

    // Create plan items from provided Criterion IDs.
    let newPlanItems = [];
    let _criterionIdsIncluded = []; // to prevent dupes

    forEach(newlySelectedCriterionIds, (criterionId) => {
      // Only include one plan item per criterionId.
      if (!includes(_criterionIdsIncluded, criterionId)) {
        _criterionIdsIncluded.push(criterionId);
        newPlanItems.push({
          plan_bucket_id: planBucketId,
          criterion_id: criterionId,
          weight: 0, // set all of these to 0 weight since they're new.
        });
      }
    });

    createNewItems(newPlanItems, afterCreate);
  }, [createNewItems, reloadPlanItems, bucket, newlySelectedCriterionIds, showMessageFn]);

  /**
   * Toggle status of a question/criterion.
   *
   * @param {Number} criterionId
   */
  const handleQuestionClick = useCallback(
    (criterionId) => {
      let newSelections = [...newlySelectedCriterionIds];
      if (!includes(newlySelectedCriterionIds, criterionId)) {
        newSelections.push(criterionId);
      } else {
        newSelections = without(newSelections, criterionId);
      }
      setNewlySelectedCriterionIds(newSelections);
    },
    [newlySelectedCriterionIds]
  );

  /**
   * Output for confirmation dialog.
   */
  const confirmationDialogOutput = useCallback(() => {
    return (
      <Dialog
        open={confDialogIsOpen}
        aria-labelledby="add-items-conf-dialog-title"
        fullScreen={width && width < theme.breakpoints.values.sm}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogTitle id="add-items-conf-dialog-title">
          <div className={classes.confIconWrapper}>
            <CheckCircleIcon className={classes.confIcon} />
          </div>
          <div className={classes.confText}>
            The selected items have been added to the Action Plan
          </div>
        </DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            component={Link}
            to={`/app/account/organizations/${organization.id}/plan`}
            disabled={submitting}
            color="primary"
            className={classes.confButton}
            variant="contained"
          >
            Go to the Action Plan
          </Button>
        </DialogContent>
      </Dialog>
    );
  }, [classes, organization, width, confDialogIsOpen, submitting, theme]);

  /**
   * Output for submit button.
   */
  const submitButtonOutput = useCallback(() => {
    // Hide altogether if there's no set selected yet.
    if (!setData) {
      return null;
    }

    let isDisabled = submitting || isEmpty(newlySelectedCriterionIds);

    return (
      <Button
        fullWidth
        to={`/app/account/organizations/${organization.id}/plan`}
        disabled={isDisabled}
        color="primary"
        className={classes.submitButton}
        variant="contained"
        onClick={handleSubmit}
      >
        Add selected items to the Action Plan
      </Button>
    );
  }, [classes, handleSubmit, organization, newlySelectedCriterionIds, setData, submitting]);

  /**
   * Gets program specific branding based on machine name
   * @returns {Object|Null} JSX content or Null value
   */
  const programBrandingOutput = useCallback(() => {
    if (isNil(setData)) {
      return null;
    }
    let programBrandingStyle = {
      alignItems: "center",
      display: "flex",
      justifyContent: "flex-end",
      marginTop: theme.spacing(3),
    };
    let setDataProgram = find(programs.data, { id: setData.program_id });
    return programBranding(setDataProgram.machine_name, programBrandingStyle);
  }, [programs, setData, theme]);

  /**
   * Toggle expand/collapse state of all modules.
   */
  const handleExpandAllClick = useCallback(() => {
    let newExpandedModuleIds = [];
    let newExpandAll = !expandAll;

    // If new state is to expand all, add all module
    // IDs to the expandedModuleIds array.
    if (newExpandAll && isArray(setModules)) {
      forEach(setModules, (mod) => {
        newExpandedModuleIds.push(mod.id);
      });
    }
    setExpandAll(newExpandAll);
    setExpandedModuleIds(newExpandedModuleIds);
  }, [expandAll, setModules]);

  // Reverse the expansion state of a given module row.
  const toggleModuleExpansion = useCallback(
    (modId) => {
      let newExpandedModuleIds = [...expandedModuleIds];
      if (includes(expandedModuleIds, modId)) {
        newExpandedModuleIds = without(newExpandedModuleIds, modId);
      } else {
        newExpandedModuleIds.push(modId);
      }
      setExpandedModuleIds(newExpandedModuleIds);
    },
    [expandedModuleIds]
  );

  // Must be able to edit the plan and view assessment data.
  if (!userCanEditActionPlan || !userCanViewAssessment) {
    return null;
  }
  return (
    <Box
      ref={resizeDetectorRef}
      sx={{
        minHeight: "450px", // prevent select element from being clipped when open
        padding: styleVars.paperPadding,
      }}
    >
      <ModalCloseButton closeWith={closeWith} hideText={true} />
      <h1 id={idForHeader}>Select items to add to {organization.name}'s Action Plan.</h1>
      {bucket && (
        <Fragment>
          <p>
            We'll add these to <strong>{bucket.name}</strong>
          </p>
        </Fragment>
      )}

      <Grid container spacing={Number(styleVars.gridSpacing)}>
        <Grid item xs={12} sm={6}>
          <Paper style={{ padding: styleVars.paperPadding }}>
            <h3>Which assessment would you like to add Criteria from?</h3>
            <AssessmentSelection
              classes={classes}
              handleAssessmentSelectChange={handleAssessmentSelectChange}
              organization={organization}
              selectedSetId={setId}
              userCanEditActionPlan={userCanEditActionPlan}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper style={{ padding: styleVars.paperPadding }}>
            <HotTipCta organizationId={organization.id} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {setData && (
            <React.Fragment>
              <div className={classes.expansionHead}>
                <div className={classes.expansionTopicContainer}>
                  <div className={classes.expansionTopic}>Topic</div>
                </div>
                <div onClick={handleExpandAllClick}>
                  {expandAll === true ? (
                    <div className={classes.expansionExpandAll}>
                      <div>Collapse All</div>
                      <ExpandLessIcon className={classes.centerIcon} />
                    </div>
                  ) : (
                    <div className={classes.expansionExpandAll}>
                      <div>Expand All</div>
                      <ExpandMoreIcon className={classes.centerIcon} />
                    </div>
                  )}
                </div>
              </div>

              <React.Fragment>
                {setModules.map((mod, modIdx) => {
                  let setQuestions = get(setData, "criterion_instances", []);
                  let modQuestions = filter(setQuestions, {
                    module_id: mod.id,
                  });
                  return (
                    <React.Fragment key={modIdx}>
                      <ModuleRow
                        classes={classes}
                        expanded={includes(expandedModuleIds, mod.id)}
                        handleQuestionClick={handleQuestionClick}
                        isCriterionInPlan={isCriterionInPlan}
                        module={mod}
                        moduleQuestions={modQuestions}
                        newlySelectedCriterionIds={newlySelectedCriterionIds}
                        organization={organization}
                        orgSetsData={orgSetsData}
                        toggleExpansion={() => toggleModuleExpansion(mod.id)}
                        userCanEditActionPlan={userCanEditActionPlan}
                      />
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            </React.Fragment>
          )}
          {submitButtonOutput()}
          {programBrandingOutput()}
        </Grid>
      </Grid>

      {confirmationDialogOutput()}
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  confIconWrapper: {
    marginBottom: theme.spacing(),
    textAlign: "center",
  },
  confIcon: {
    color: theme.palette.success.main,
    fontSize: "4.5em",
  },
  confText: {
    fontSize: "1.25em",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  noCriterion: {
    margin: theme.spacing(2),
  },
  expansionHead: {
    alignItems: "center",
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
  },
  expansionTopicContainer: {
    flexGrow: 0.2,
  },
  expansionTopic: {
    marginLeft: theme.spacing(2),
    color: "#707070",
    fontSize: 10,
    textTransform: "uppercase",
  },
  expansionExpandAll: {
    color: styleVars.colorPrimaryWithMoreContrast,
    display: "flex",
    alignItems: "center",
    fontSize: 10,
    marginRight: theme.spacing(2),
    cursor: "pointer",
    textTransform: "uppercase",
  },
  accordion: {
    marginBottom: "1em",
  },
  expansionSummary: {
    justifyContent: "space-between",
    display: "flex",
    width: "100%",
  },
  centerIcon: {
    verticalAlign: "middle",
    fontSize: "1em",
    height: "1em",
    color: styleVars.colorPrimaryWithMoreContrast,
    paddingRight: ".1em",
    width: "auto",
  },
  summaryName: {
    alignItems: "center",
    display: "flex",
    width: "45%",
    marginRight: "1em",
    textOverflow: "ellipsis",
  },
  moduleName: {
    color: styleVars.colorPrimaryWithMoreContrast,
    fontSize: "14px",
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    margin: 0,
  },
  accordionDetails: {
    padding: 0,
  },
  submitButton: {},
  th: {
    color: styleVars.txtColorDefault,
    fontSize: 10,
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.25),
    [theme.breakpoints.up("sm")]: {
      fontSize: 11,
    },
  },
  thHandle: {
    textAlign: "left",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(4),
    },
  },
  thStatus: {
    textAlign: "left",
  },
  thAdd: {
    textAlign: "center",
  },
  tableHeadRow: {
    background: "#F3F5F7",
  },
  td: {},
  tdHandle: {
    color: styleVars.colorPrimaryWithMoreContrast,
    width: "20%",
    [theme.breakpoints.up("sm")]: {
      fontSize: 16,
      fontWeight: styleVars.txtFontWeightDefaultBold,
      paddingLeft: theme.spacing(4),
      width: "15%",
    },
  },
  handleStr: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "100%",
  },
  tdName: {
    width: "60%",
    [theme.breakpoints.up("sm")]: {
      width: "40%",
    },
  },
  tdStatus: {
    textAlign: "left",
    [theme.breakpoints.up("sm")]: {
      width: "25%",
    },
  },
  statusLabelInNameCol: {
    fontSize: 10,
    marginTop: theme.spacing(),
    textTransform: "uppercase",
  },
  tdAdd: {
    textAlign: "center",
    width: "20%",
    [theme.breakpoints.up("sm")]: {
      width: "20%",
    },
  },
  tipLinkContainer: {
    marginTop: theme.spacing(),
  },
}));

const findNonModuleQuestions = (setData) => {
  let questions = get(setData, "criterion_instances", []);
  let result = [];
  if (questions && questions.length > 0) {
    forEach(questions, (q) => {
      if (isNull(q.module_id)) {
        result.push(q);
      }
    });
  }
  result = sortBy(result, ["weight", "handle"]);
  return result;
};

ItemNew.propTypes = {
  buckets: PropTypes.array, // All buckets in plan, including faux
  closeWith: PropTypes.func,
  createNewItems: PropTypes.func,
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  idForHeader: PropTypes.string.isRequired,
  isCriterionInPlan: PropTypes.func,
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
  orgSetsData: PropTypes.array,
  plan: PropTypes.object.isRequired,
  programs: PropTypes.object.isRequired, // @TODO Create custom proptype shape (this has data prop)
  reloadPlanItems: PropTypes.func.isRequired,
  showMessageFn: PropTypes.func,
  userCanViewActionPlan: PropTypes.bool.isRequired,
  userCanEditActionPlan: PropTypes.bool.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired,
  userCanEditAssessment: PropTypes.bool.isRequired,
};
