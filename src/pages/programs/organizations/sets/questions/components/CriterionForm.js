import React, { Component } from "react";
import PropTypes from "prop-types";
import HgSkeleton from "components/ui/HgSkeleton";
import {
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Icon,
  Paper,
  Radio,
  RadioGroup,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import DraftEditor from "components/ui/DraftEditor";
import { find } from "lodash";
import SaveNavigation from "components/views/SaveNavigation";
import AddToActionPlan from "components/views/AddToActionPlan";
import styleVars from "style/_vars.scss";

/**
 * Form component for use in question detail page.
 * Description, radio selection, and calling of save component
 */
class CriterionForm extends Component {
  static propTypes = {
    criterionInstance: PropTypes.object.isRequired,
    parentSuggestionLabel: PropTypes.string.isRequired,
    userCanEditActionPlan: PropTypes.bool.isRequired,
    userCanViewActionPlan: PropTypes.bool.isRequired,
    prevCriterionInstance: PropTypes.object,
    nextCriterionInstance: PropTypes.object,
    savedResponse: PropTypes.object,
    draftResponseValue: PropTypes.string,
    saving: PropTypes.bool.isRequired,
    parentResponse: PropTypes.object,
    parentResponseLoaded: PropTypes.bool,
    parentResponseLoading: PropTypes.bool,
    loadingUser: PropTypes.bool,
  };

  /**
   * @returns {object} jsx for skeleton screens
   */
  responseSkeletonScreen = () => {
    const { classes } = this.props;
    const skeletonResponseKeys = [0, 1, 2, 3];

    return (
      <React.Fragment>
        {skeletonResponseKeys.map((srk) => {
          return (
            <div className={classes.responseSkeletonContainer} key={srk}>
              <HgSkeleton variant="text" width={"15%"} />
              <HgSkeleton variant="text" />
              <HgSkeleton variant="text" />
              <HgSkeleton variant="text" />
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  /**
   * @param {object} option
   * @returns {array} radioClasses
   */
  radioClasses = (option) => {
    const { classes, parentResponseVal } = this.props;
    let radioClasses = [classes.questionOptionRadio];

    if (parentResponseVal && parentResponseVal.toString() === option.response_value_id.toString()) {
      // Add a special string CSS class if this is
      // the parent selection.
      radioClasses.push("questionDetailParentSelection");
    }
    radioClasses = radioClasses.join(" ");

    return radioClasses;
  };

  /**
   * @param {object} option
   * @returns {string} option response label
   */
  optionResponseLabel = (option) => {
    const { responseStructureValues } = this.props;

    return find(responseStructureValues, (rsv) => {
      return Number(rsv.id) === Number(option.response_value_id);
    }).label;
  };

  /**
   * @param {object} option
   * @returns {object} jsx for option display label
   */
  optionDisplayLabel = (option) => {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <div className={classes.optionResponseLabel}>{this.optionResponseLabel(option)}</div>
        <DraftEditor readOnly={true} value={option.display_label || ""} />
      </React.Fragment>
    );
  };

  render() {
    const {
      classes,
      organization,
      theme,
      criterionInstance,
      draftResponseValue,
      prevCriterionInstance,
      parentSuggestionLabel,
      planItemLoading,
      savedResponseLoaded,
      savedResponseLoading,
      saving,
      userCanEdit,
      sortedOptions,
      feedback,
      hasParent,
      hasParentResponse,
      nextLabel,
      prevLabel,
      handleChangeResponse,
      handlePrevClick,
      handleNextClick,
      handleSaveClick,
      addToActionPlan,
      planItem,
      userCanEditActionPlan,
      userCanViewActionPlan,
    } = this.props;

    return (
      <form>
        <Paper style={{ position: "relative" }}>
          <div style={{ padding: theme.spacing(4) }}>
            <div className={classes.criterionDescription}>
              <DraftEditor readOnly={true} value={criterionInstance.criterion.description || ""} />
            </div>
          </div>
          <Divider />
          <div style={{ padding: theme.spacing(4) }}>
            {savedResponseLoading ? (
              this.responseSkeletonScreen()
            ) : (
              <React.Fragment>
                {!userCanEdit && (
                  <Icon
                    className={classes.lock}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                    }}
                    fontSize="small"
                    color="secondary"
                  >
                    lock
                  </Icon>
                )}
                <FormControl component="fieldset" variant="standard">
                  <FormLabel className="sr-only" component="legend">
                    Answer
                  </FormLabel>
                  <RadioGroup
                    aria-label="Answer"
                    name="responseValue"
                    value={draftResponseValue}
                    onChange={handleChangeResponse}
                  >
                    {sortedOptions.map((option, index) => {
                      return (
                        <FormControlLabel
                          className={`questionDetailOption ${classes.questionOption}`}
                          key={option.response_value_id.toString()}
                          value={option.response_value_id.toString()}
                          control={
                            <Radio
                              className={this.radioClasses(option)}
                              color="primary"
                              disabled={
                                !userCanEdit ||
                                saving ||
                                !savedResponseLoaded ||
                                savedResponseLoading
                              }
                            />
                          }
                          label={this.optionDisplayLabel(option)}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                {feedback && (
                  <React.Fragment>
                    <Divider />
                    <br />
                    <DraftEditor readOnly={true} value={feedback} />
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </div>
          {hasParent && hasParentResponse && (
            <React.Fragment>
              <Divider />
              <div
                style={{
                  paddingTop: theme.spacing(3),
                  paddingBottom: theme.spacing(3),
                  paddingLeft: theme.spacing(4),
                  paddingRight: theme.spacing(4),
                }}
              >
                <p>
                  <span style={{ color: theme.palette.primary.main }}>*</span>{" "}
                  {parentSuggestionLabel}
                </p>
              </div>
            </React.Fragment>
          )}
        </Paper>
        <Paper className={classes.questionDetailCtaContainer}>
          <div className={classes.questionDetailCta}>
            {planItemLoading ? (
              <React.Fragment>
                <HgSkeleton variant="text" />
              </React.Fragment>
            ) : (
              <React.Fragment>Is this something you'd like to work on?</React.Fragment>
            )}
            <span className={classes.questionDetailCtaButton}>
              <AddToActionPlan
                addToActionPlan={addToActionPlan}
                organization={organization}
                criterionInstance={criterionInstance}
                planItem={planItem}
                planItemLoading={planItemLoading}
                userCanEditActionPlan={userCanEditActionPlan}
                userCanViewActionPlan={userCanViewActionPlan}
                shouldSave={true}
              />
            </span>
          </div>
        </Paper>
        <SaveNavigation
          handlePrevClick={handlePrevClick}
          handleNextClick={handleNextClick}
          handleSaveClick={handleSaveClick}
          userCanEdit={userCanEdit}
          saving={saving}
          nextLabel={nextLabel}
          prevLabel={prevLabel}
          prevCriterionInstance={prevCriterionInstance}
        />
      </form>
    );
  }
}

const styles = (theme) => ({
  parentSelection: {
    color: "#FB4F14",
    fontSize: "20px",
    left: "-11px",
    top: "14px",
    position: "absolute",
  },
  criterionDescription: {
    color: styleVars.txtColorDefault,
    fontFamily: styleVars.txtFontFamilyDefault,
    fontSize: 18,
  },
  questionOption: {
    // @see App.css for related IE hacks applied
    // via .questionDetailOption
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(),
  },
  questionOptionRadio: {
    margin: theme.spacing(-1, 0, 0, 0),
  },
  questionDetailCtaContainer: {
    marginTop: theme.spacing(),
  },
  questionDetailCta: {
    textAlign: "center",
    padding: theme.spacing(3),
  },
  questionDetailCtaButton: {
    marginLeft: theme.spacing(3),
  },
  optionResponseLabel: {
    color: "#707070",
    fontSize: 10,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    marginBottom: "0.2em",
    textTransform: "uppercase",
  },
  responseSkeletonContainer: {
    margin: theme.spacing(0, 0, 3, 0),
  },
});

export default withStyles(styles, { withTheme: true })(CriterionForm);
