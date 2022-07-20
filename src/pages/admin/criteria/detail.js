import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PropTypes from "prop-types";
import { get, difference, each, isNil, find, map, remove, set, sortBy } from "lodash";
import HgTextField from "components/ui/HgTextField";
import {
  Button,
  Divider,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  FormLabel,
  Grid,
  Paper,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import generateTitle from "utils/generateTitle";
import errorSuffix from "utils/errorSuffix";
import repositionArrayItem from "utils/repositionArrayItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Checkbox from "components/ui/CheckboxWrapper";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import DraftEditor from "components/ui/DraftEditor";
import CriterionAssociatedItemAdmin from "components/views/CriterionAssociatedItemAdmin";
import CriterionCdcHandles from "components/views/CriterionCdcHandles";
import {
  requestDeleteCriterion,
  requestUpdateCriterion,
  requestLinkCriterionGradeLevel,
  requestUnlinkCriterionGradeLevel,
  requestCriterionUserFunctions,
  requestUpdateCriterionUserFunctions,
  requestUnlinkCriterionUserFunction,
  requestUserFunctions,
  requestLinkCriterionUserFunction,
  requestCriterionResources,
  requestUpdateCriterionResources,
  requestUnlinkCriterionResource,
  requestResources,
  requestLinkCriterionResource,
  requestCriterion,
} from "api/requests";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "#ECF8EC" : "#FFF",
});

const getItemStyle = (isDragging, disabled, draggableStyle) => ({
  userSelect: "none",
  padding: 2,
  margin: `0.5em 0`,
  color: isDragging ? "#FFFFFF" : "#55524C",
  backgroundColor: isDragging ? "rgba(251,79,20, 0.5)" : "#FFFFFF",
  border: isDragging ? "1px solid #FB4F14" : "none",
  overflow: "auto",
  opacity: disabled ? 0.5 : 1.0,
  // styles we need to apply on draggables:
  ...draggableStyle,
});

const styles = (theme) => ({
  formControlInputWrapper: {
    marginTop: theme.spacing(4),
  },
  actions: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(2),
  },
  accordionDetails: {
    display: "block",
  },
  formLabel: {
    marginBottom: theme.spacing(0.25),
    marginTop: theme.spacing(2),
    fontSize: styleVars.txtFontSizeXs,
  },
  formLabelGradeLevels: {
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(2),
    fontSize: styleVars.txtFontSizeXs,
  },
  resourceAccordion: {
    position: "relative",
    [theme.breakpoints.down("md")]: {
      paddingBottom: theme.spacing(10),
    },
  },
  resourceForm: {
    display: "flex",
    flexWrap: "wrap",
    paddingRight: theme.spacing(10),
  },
  resourceFormControl: {
    margin: theme.spacing(),
  },
  resourceFormButton: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
  },
  accordion: {
    border: "none",
    cursor: "auto",
  },
});

// @TODO Add validation
// @TODO Add resources

class CriterionDetail extends Component {
  static propTypes = {
    criterionId: PropTypes.number.isRequired,
    appMeta: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      criterionMissing: false,
      criterion: null,
      draftCriterion: null,
      draftGradeLevelIds: null,
      saving: false,
      savingError: false,
      deleting: false,
      deletingError: false,
    };
  }

  componentDidMount() {
    const { criterionId } = this.props;
    this.populateCriterion();

    generateTitle(`Criterion ${criterionId}`);
  }

  componentDidUpdate(prevProps) {
    const { criterionId: prevCriterionId } = prevProps;
    const { criterionId } = this.props;

    if (criterionId !== prevCriterionId) {
      this.populateCriterion();
    }
    generateTitle(`Criterion ${criterionId}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  populateCriterion() {
    const { criterionId } = this.props;

    this.setState({ criterionLoading: true });

    requestCriterion(criterionId)
      .then((res) => {
        if (!this.isCancelled) {
          let criterion = res.data.data;
          let gradeLevelIds = map(criterion.grade_levels, (gl) => {
            return gl.id;
          });
          this.setState({
            criterionLoading: false,
            criterion: criterion,
            draftCriterion: { ...criterion },
            draftGradeLevelIds: gradeLevelIds,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({ criterionLoading: false });
          console.error("An error occurred retrieving the criterion.");
        }
      });
  }

  onDragEnd = (result) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    let reorderedOptions = repositionArrayItem(
      this.state.draftCriterion.options,
      result.source.index,
      result.destination.index
    );

    // Modify the weight property of each item to reflect change.
    let newOptions = map(reorderedOptions, (item, index) => {
      item.weight = (index + 1) * 10;
      return item;
    });

    this.setState({
      draftCriterion: {
        ...this.state.draftCriterion,
        options: newOptions,
      },
    });
  };

  handleChange = ({ target }) => {
    this.setState((state) => set(state, `draftCriterion.${target.name}`, target.value));
  };

  handleChangeLabel = (label, index) => {
    const { draftCriterion } = this.state;
    let opts = draftCriterion.options;
    opts[index].display_label = label;

    this.setState({
      draftCriterion: {
        ...draftCriterion,
        options: opts,
      },
    });
  };

  /**
   * setState of feedback for draftCriterion.options
   * @param {string} feedback
   * @param {number} index
   */
  handleChangeFeedback = (feedback, index) => {
    const { draftCriterion } = this.state;
    let opts = draftCriterion.options;
    opts[index].feedback = feedback;

    this.setState({
      draftCriterion: {
        ...draftCriterion,
        options: opts,
      },
    });
  };

  /**
   * setState of draftCriterion for description
   * @param {string} description
   */
  handleChangeDescription = (description) => {
    this.setState({
      draftCriterion: {
        ...this.state.draftCriterion,
        description,
      },
    });
  };

  /**
   * setState for grade levels (checkboxes)
   * @param {{target}} javascript event.target
   */
  handleChangeGradeLevel = ({ target }) => {
    let { draftGradeLevelIds } = this.state;

    if (target.checked) {
      draftGradeLevelIds.push(target.name);
    } else {
      remove(draftGradeLevelIds, (level) => level === target.name);
    }
    this.setState({ draftGradeLevelIds });
  };

  handleClickDelete = () => {
    const { criterionId, history } = this.props;
    this.setState({ deleting: true });
    requestDeleteCriterion(criterionId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted criterion ${criterionId}`);
          this.setState({
            deleting: false,
            deletingError: false,
            criterionMissing: true,
            criterion: null,
            draftCriterion: null,
          });
          history.push("/app/admin/criteria");
        } else {
          // Delete failed
          hgToast("An error occurred deleting criterion. " + errorSuffix(res), "error");
          this.setState({
            deleting: false,
            deletingError: true,
          });
        }
      }
    });
  };

  /**
   * Prepends userFunctionCategory names to userFunction names
   * @param {string} userFunction
   */
  getUserFunctionLabel = (userFunctions) => {
    const userFunctionCategories = get(this.props.appMeta.data, "userFunctionCategories", "");

    const userFunctionsWithCategoryNames = map(userFunctions, (userFunction) => {
      let categoryName = get(
        userFunctionCategories[userFunction.user_function_category_id],
        "name",
        ""
      );

      if (categoryName && userFunction.name.indexOf("|") < 1) {
        userFunction.nameNoUfCat = userFunction.name;
        userFunction.name = categoryName + " | " + userFunction.name;
      }

      return userFunction;
    });

    return sortBy(userFunctionsWithCategoryNames, ["name", "nameNoUfCat"]);
  };

  /**
   * Get array of grade level IDs in draft,
   * but not original criterion.
   */
  gradeLevelsToLink = () => {
    const { criterion, draftGradeLevelIds } = this.state;
    let cur = map(criterion.grade_levels, "id");
    return difference(draftGradeLevelIds, cur);
  };

  /**
   * Get array of grade level IDs in original
   * criterion, but not draft.
   */
  gradeLevelsToUnlink = () => {
    const { criterion, draftGradeLevelIds } = this.state;
    let cur = map(criterion.grade_levels, "id");
    return difference(cur, draftGradeLevelIds);
  };

  // Updates grade level assignments on server based
  // on changes made in this form. Does _not_ update
  // our criterion or draftCriterion objects.
  //
  // Executes callback after all grade level changes
  // have processed. If ther are no changes, callback
  // will run immediately.
  sendGradeLevelChangesToServer = (callback) => {
    const { criterionId } = this.props;
    let changesApplied = 0;

    // Compile a single array of changes to make.
    let changes = [];
    each(this.gradeLevelsToLink(), (item) => {
      changes.push({
        task: "link",
        gradeLevelId: item,
      });
    });
    each(this.gradeLevelsToUnlink(), (item) => {
      changes.push({
        task: "unlink",
        gradeLevelId: item,
      });
    });
    if (0 === changes.length) {
      if (callback) {
        callback();
      }
      return;
    }
    let thisComponent = this;
    function applyChanges() {
      // If done.
      if (changesApplied === changes.length) {
        if (callback) {
          callback();
        }
        return;
      }
      // If not, do the deed.
      let change = changes[changesApplied];
      let req;
      if ("link" === change.task) {
        req = requestLinkCriterionGradeLevel;
      } else {
        req = requestUnlinkCriterionGradeLevel;
      }
      req(criterionId, change.gradeLevelId).then((res) => {
        if (!thisComponent.isCancelled) {
          changesApplied++;
          return applyChanges();
        }
      });
    }
    return applyChanges();
  };

  // Updates criterion record on server and replaces
  // our criterion and draftCriterion objects in
  // component state.
  //
  // You must run sendGradeLevelChangesToServer() before
  // calling this, since this method will overwrite those
  // changes.
  sendCriterionChangesToServer = (successCallback, failureCallback) => {
    const { criterionId } = this.props;
    const { draftCriterion } = this.state;

    requestUpdateCriterion(criterionId, draftCriterion).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedCriterion = res.data.data;
          let updatedGradeLevelIds = map(updatedCriterion.grade_levels, (gl) => {
            return gl.id;
          });
          this.setState({
            criterion: updatedCriterion,
            draftCriterion: updatedCriterion,
            draftGradeLevelIds: updatedGradeLevelIds,
          });
          if (successCallback) {
            successCallback();
          }
        } else {
          // Delete failed
          if (failureCallback) {
            failureCallback();
          }
        }
      }
    });
  };

  handleSubmit = (event) => {
    const { criterionId } = this.props;

    event.preventDefault();

    this.setState({ saving: true });
    let criterionChangesSuccessCallback = () => {
      hgToast(`Updated criterion ${criterionId}!`);
      this.setState({
        saving: false,
        savingError: false,
      });
    };
    let criterionChangesFailureCallback = () => {
      hgToast("An error occurred updating criterion", "error");
      this.setState({
        saving: false,
        savingError: true,
      });
    };

    // Modify grades first, passing the actual
    // criterion update as a callback to that.
    // Using double-arrow to so callback isn't executed
    // right here.
    this.sendGradeLevelChangesToServer(() =>
      this.sendCriterionChangesToServer(
        criterionChangesSuccessCallback,
        criterionChangesFailureCallback
      )
    );
  };

  /**
   * Creates option JSK for render()
   *
   * @param {Object} criterion
   * @param {Object} draftCriterion
   * @returns {object} JSX of options
   */
  getMappedOptions = (criterion, draftCriterion) => {
    const { saving, deleting } = this.state;
    const { appMeta, classes } = this.props;
    const allowedHtml = get(appMeta.data.allowedHtml, "criterion_options", "");
    const responseStructureId = get(criterion, "response_structure_id", "");
    const responseStructures = get(appMeta.data, "responseStructures", "");
    const responseStructureValues = get(
      responseStructures[responseStructureId],
      "response_value",
      ""
    );
    let disable = deleting || saving;

    return draftCriterion.options.map((option, index) => {
      // let optionResponseValueId = option.response_value_id;

      let responseStructureValue = find(responseStructureValues, (rsv) => {
        return Number(option.response_value_id) === Number(rsv.id);
      });
      let displayValue = get(responseStructureValue, "value", "");
      let displayLabel = get(responseStructureValue, "label", "");

      let mappedOption = (
        <Draggable
          key={`option_${option.id}`}
          draggableId={`option_${option.id}`}
          index={index}
          isDragDisabled={disable}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={getItemStyle(snapshot.isDragging, disable, provided.draggableProps.style)}
            >
              <Accordion key={`option_${option.id}`} className={classes.accordion}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <p>{displayValue + " - " + displayLabel}</p>
                </AccordionSummary>
                <AccordionDetails
                  classes={{
                    root: classes.accordionDetails,
                  }}
                >
                  <FormLabel className={classes.formLabel}>Label:</FormLabel>
                  <DraftEditor
                    keyProp={`option_label_${option.id}`}
                    indexProp={index}
                    onChange={this.handleChangeLabel}
                    value={isNil(option.display_label) ? "" : option.display_label}
                    customToolbarHtml={allowedHtml.feedback}
                  />
                  <br />
                  <FormLabel className={classes.formLabel}>Feedback:</FormLabel>
                  <DraftEditor
                    keyProp={`option_feedback_${option.id}`}
                    indexProp={index}
                    onChange={this.handleChangeFeedback}
                    value={isNil(option.feedback) ? "" : option.feedback}
                    customToolbarHtml={allowedHtml.feedback}
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          )}
        </Draggable>
      );

      return mappedOption;
    });
  };

  render() {
    const { appMeta, classes, criterionId } = this.props;
    const { criterion, criterionMissing, draftCriterion, draftGradeLevelIds, saving, deleting } =
      this.state;
    const allowedHtmlCriteria = get(appMeta.data.allowedHtml, "criteria", "");

    if (criterionMissing) {
      return (
        <React.Fragment>
          <p>
            <em>Criterion not found.</em>
          </p>
        </React.Fragment>
      );
    }
    if (isNil(criterion)) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/criteria" root>
            Criterion Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/criteria/${criterion.id}`}>{criterion.id}</Breadcrumb>
        </Breadcrumbs>

        <h1>Criterion Detail</h1>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <FormControl margin="none" fullWidth variant="standard">
                  <HgTextField
                    label="Name"
                    name="name"
                    id="criterion_name"
                    value={draftCriterion.name}
                    onChange={this.handleChange}
                    fullWidth
                  />
                </FormControl>

                <FormControl margin="normal" fullWidth variant="standard">
                  <FormLabel className={classes.formLabel}>Description</FormLabel>
                  <DraftEditor
                    keyProp={criterion.id}
                    onChange={this.handleChangeDescription}
                    value={draftCriterion.description || ""}
                    customToolbarHtml={allowedHtmlCriteria.description}
                  />
                </FormControl>

                <br />
                <br />

                <DragDropContext onDragEnd={this.onDragEnd}>
                  <FormLabel className={classes.formLabel}>
                    Options (Drag and drop to reorder)
                  </FormLabel>
                  <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                      >
                        {this.getMappedOptions(criterion, draftCriterion)}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <FormControl component="fieldset" variant="standard">
                  <FormLabel className={classes.formLabelGradeLevels} component="legend">
                    Grade Levels
                  </FormLabel>
                  <Checkbox
                    name={"pk"}
                    value={"pk"}
                    label={"Pre-kindergarten"}
                    checked={draftGradeLevelIds.indexOf("pk") > -1}
                    handleChange={this.handleChangeGradeLevel}
                  />
                  <Checkbox
                    name={"es"}
                    value={"es"}
                    label={"Elementary school"}
                    checked={draftGradeLevelIds.indexOf("es") > -1}
                    handleChange={this.handleChangeGradeLevel}
                  />
                  <Checkbox
                    name={"ms"}
                    value={"ms"}
                    label={"Middle school"}
                    checked={draftGradeLevelIds.indexOf("ms") > -1}
                    handleChange={this.handleChangeGradeLevel}
                  />
                  <Checkbox
                    name={"hs"}
                    value={"hs"}
                    label={"High school"}
                    checked={draftGradeLevelIds.indexOf("hs") > -1}
                    handleChange={this.handleChangeGradeLevel}
                  />
                </FormControl>
              </Paper>

              <div className={classes.actions}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  disabled={saving || deleting}
                  type="submit"
                  fullWidth
                >
                  Save{" "}
                  {saving && (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgressForButtons />
                    </React.Fragment>
                  )}
                </Button>

                {this.handleClickDelete && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (window.confirm("Are you sure?")) {
                        this.handleClickDelete();
                      }
                    }}
                    className={classes.deleteButton}
                    disabled={saving || deleting}
                    fullWidth
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Grid>
          </Grid>
        </form>

        <br />
        <Divider />
        <br />

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <h3>CDC Handles</h3>
              <CriterionCdcHandles criterionId={criterionId} />
            </Paper>
          </Grid>
        </Grid>

        <br />

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <h3>Associated resources</h3>
              <CriterionAssociatedItemAdmin
                criterionId={criterionId}
                requestId={"resource_id"}
                associatedType={"resource"}
                criterionRequest={requestCriterionResources}
                criterionUpdate={requestUpdateCriterionResources}
                criterionUnlink={requestUnlinkCriterionResource}
                requestAssociated={requestResources}
                requestAssociatedLink={requestLinkCriterionResource}
              />
            </Paper>
          </Grid>
        </Grid>
        <br />
        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <h3>Associated positions</h3>
              <CriterionAssociatedItemAdmin
                criterionId={criterionId}
                requestId={"user_function_id"}
                associatedType={"position"}
                criterionRequest={requestCriterionUserFunctions}
                criterionUpdate={requestUpdateCriterionUserFunctions}
                criterionUnlink={requestUnlinkCriterionUserFunction}
                requestAssociated={requestUserFunctions}
                requestAssociatedLink={requestLinkCriterionUserFunction}
                labelRender={this.getUserFunctionLabel}
              />
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      appMeta: app_meta,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(CriterionDetail));
