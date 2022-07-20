import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { isNil } from "lodash";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Button, CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";

/**
 * Navigation/Save buttons for questions
 */
class SaveNavigation extends React.Component {
  static propTypes = {
    handlePrevClick: PropTypes.func.isRequired,
    handleNextClick: PropTypes.func.isRequired,
    handleSaveClick: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    nextLabel: PropTypes.string,
    prevLabel: PropTypes.string,
    prevCriterionInstance: PropTypes.object,
  };

  render() {
    const {
      classes,
      handlePrevClick,
      handleNextClick,
      handleSaveClick,
      nextLabel,
      prevLabel,
      prevCriterionInstance,
      saving,
    } = this.props;

    return (
      <div className={classes.questionActions}>
        {/* SAVE AND NEXT BUTTON */}
        <Button
          aria-label={nextLabel}
          className={clsx(classes.questionNextButton)}
          color="primary"
          onClick={handleNextClick}
          variant="contained"
        >
          {nextLabel}
          <ChevronRightIcon className={classes.questionActionIcon} />
        </Button>

        {/* PREV BUTTON */}
        <Button
          aria-label={prevLabel}
          className={clsx(classes.questionPrevButton, {
            [classes.hide]: isNil(prevCriterionInstance),
          })}
          color="primary"
          onClick={handlePrevClick}
          variant="contained"
        >
          <ChevronLeftIcon className={classes.questionActionIcon} />
          {prevLabel}
        </Button>

        {/* SAVE BUTTON */}
        <Button
          aria-label="Save"
          className={classes.questionSaveButton}
          color="secondary"
          onClick={handleSaveClick}
          variant="contained"
        >
          {saving ? (
            <span>
              {" "}
              <CircularProgress size="1em" color="primary" variant="indeterminate" />{" "}
            </span>
          ) : (
            <span>Save</span>
          )}
        </Button>
      </div>
    );
  }
}

const styles = (theme) => ({
  questionActions: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
    },
  },
  questionActionIcon: {
    height: theme.spacing(1.5),
  },
  questionPrevButton: {
    display: "flex",
    marginBottom: theme.spacing(),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      marginBottom: 0,
      width: "auto",
      order: 1,
    },
  },
  questionNextButton: {
    display: "flex",
    marginBottom: theme.spacing(),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      marginBottom: 0,
      width: "auto",
      order: 3,
    },
  },
  questionSaveButton: {
    display: "flex",
    marginBottom: theme.spacing(),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      marginBottom: 0,
      width: "auto",
      order: 2,
    },
  },
  hide: {
    visibility: "hidden",
    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },
});

export default withStyles(styles, { withTheme: true })(SaveNavigation);
