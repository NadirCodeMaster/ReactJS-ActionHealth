import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { isEmpty, toArray, uniqBy } from "lodash";
import { withStyles } from "@mui/styles";
import MoreIcon from "@mui/icons-material/MoreVert";
import extractCriterionFromOrgSetsData from "utils/orgSetsData/extractCriterionFrom";
import extractQuestionsFromOrgSetsData from "utils/orgSetsData/extractQuestionsFrom";
import extractSetFromOrgSetsData from "utils/orgSetsData/extractSetFrom";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

/**
 * Semi-"dumb" component for rendering a Action Plan Item Card
 * @extends Component
 */
class PlanItemCard extends Component {
  static propTypes = {
    orgSetsData: PropTypes.array.isRequired,
    organizationId: PropTypes.number.isRequired,
    planItem: PropTypes.object.isRequired,
    planItemIndex: PropTypes.number.isRequired,
    closeItem: PropTypes.func.isRequired,
    deleteItem: PropTypes.func.isRequired,
    reopenItem: PropTypes.func.isRequired,
    responseTextForCriterion: PropTypes.func.isRequired,
    userCanViewActionPlan: PropTypes.bool,
    userCanViewAssessment: PropTypes.bool,
    userCanEditActionPlan: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    // When not Criterion-based and no name is set.
    this.defaultName = "Untitled";

    // When Criterion-based, but Criterion doesn't exist or is not visible to user. (edge case).
    this.unavailableName = "Unavailable";
    this.unavailableResponse = "Unavailable";

    this.state = {
      // Criterion represented by planItem.
      criterion: null,
      // CriterionInstances represented by planItem
      // (only for criterion-based planItems)
      criterionInstances: [],
      // Whether planItem represents a Criterion.
      isCriterionBased: false,
      // Response status text.
      responseText: "",
      // is Plan item completed
      isComplete: false,
    };
  }

  componentDidMount() {
    this.initComponentStateValues();
  }

  componentDidUpdate(prevProps, prevState) {
    const { planItem } = this.props;
    const { planItem: prevPlanItem } = prevProps;
    const { criterion } = this.state;
    const { criterion: prevCriterion } = prevState;

    if (planItem !== prevPlanItem || criterion !== prevCriterion) {
      this.initComponentStateValues();
    }
  }

  /**
   * Init state values
   * ...
   */
  initComponentStateValues() {
    const { orgSetsData, planItem, responseTextForCriterion, userCanViewAssessment } = this.props;

    let newStateVars = {
      criterion: null,
      isCriterionBased: false,
      criterionInstances: [],
      responseText: "",
      isComplete: Boolean(planItem.date_completed),
    };

    // --- Setup for Criterion-based items.
    if (planItem.criterion_id) {
      let extractedQs = extractQuestionsFromOrgSetsData(orgSetsData, planItem.criterion_id);
      extractedQs = toArray(extractedQs);

      newStateVars.criterion = extractCriterionFromOrgSetsData(orgSetsData, planItem.criterion_id);

      newStateVars.isCriterionBased = true;

      newStateVars.criterionInstances = uniqBy(extractedQs, (v) => {
        // Prevent us from having the multiple identical handles
        // in the same set.
        return `${v.handle}_${v.set_id}`;
      });

      if (newStateVars.criterion && userCanViewAssessment) {
        newStateVars.responseText = responseTextForCriterion(planItem.criterion_id);
      } else {
        newStateVars.responseText = this.unavailableResponse;
      }
    }

    this.setState({ ...newStateVars });
  }

  /**
   * Output for header of planItem.
   */
  headerContentOutput() {
    const { classes, orgSetsData, organizationId, planItem } = this.props;
    const { criterion, criterionInstances, isCriterionBased } = this.state;

    // --- For items that are Criterion-based w/Criterion and CriterionInstances available.
    if (isCriterionBased && criterion && !isEmpty(criterionInstances)) {
      return (
        <div className={classes.headerCriterionInstances}>
          {criterionInstances.map((ci, ciIdx) => {
            let setObj = extractSetFromOrgSetsData(orgSetsData, ci.set_id);
            let setDisplayName = !isEmpty(setObj.abbreviation) ? setObj.abbreviation : setObj.name;
            return (
              <div className={classes.headerCriterionInstance} key={ciIdx}>
                <div className={classes.headerCriterionInstanceHandle}>
                  <Link
                    to={`/app/account/organizations/${organizationId}/plan/items/${planItem.id}`}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>{ci.handle}</span>
                  </Link>
                </div>
                <div className={classes.headerCriterionInstanceSet}>{setDisplayName}</div>
              </div>
            );
          })}
        </div>
      );
    }

    // --- Others...
    let name;

    // -- Items that are not Criterion-based.
    if (!isCriterionBased) {
      name = isEmpty(planItem.name) ? this.defaultName : planItem.name;
    } else {
      // --- For items that are Criterion-based and Criterion is available, but CIs are not.
      if (criterion && !isEmpty(criterion.name)) {
        name = criterion.name;
      }
      // --- Criterion-based, but no Criterion or CIs available.
      else {
        name = this.unavailableName;
      }
    }

    return <div className={classes.headerItemName}>{name}</div>;
  }

  /**
   * Output for body of planItem.
   */
  bodyContentOutput() {
    const { classes, planItem } = this.props;
    const { criterion, isCriterionBased } = this.state;

    // --- For items that are Criterion-based.
    if (isCriterionBased && !isEmpty(criterion)) {
      return <div className={classes.bodyCriterionDescription}>{criterion.name}</div>;
    }
    // --- For items that are NOT Criterion based.
    else {
      return (
        <div className={classes.bodyDescription}>
          {/* Note: this does not use the RTE */}
          {planItem.description}
        </div>
      );
    }
  }

  defaultCardStyle = () => {
    const { theme } = this.props;
    const { isComplete } = this.state;

    return {
      backgroundColor: isComplete ? "#DEDEDE" : "#FFFFFF",
      borderStyle: "solid",
      borderWidth: "2px",
      userSelect: "none",
      margin: `0 0 ${theme.spacing(1.5)} 0`,
      borderColor: "rgba(0,0,0,0.125)",
    };
  };

  render() {
    const { classes, organizationId, planItem, userCanViewActionPlan, customCardStyle } =
      this.props;
    const { responseText } = this.state;

    if (!userCanViewActionPlan) {
      return null;
    }

    return (
      <article style={customCardStyle ? customCardStyle : this.defaultCardStyle()}>
        <div className={classes.upper}>
          <header className={classes.header}>
            <div className={classes.headerContentWrapper}>{this.headerContentOutput()}</div>
            <div className={classes.headerButtonWrapper}>
              {/* Disabling for now (no applicable actions) */}
              {/*
            <IconButton
              color="primary"
              className={classes.headerButton}
              aria-label="Item options"
            >
              <MoreIcon className={classes.headerButtonIcon} />
            </IconButton>
            */}
            </div>
          </header>
          <div className={classes.body}>{this.bodyContentOutput()}</div>
        </div>
        <footer className={classes.footer}>
          <div className={classes.footerResponseValue}>{responseText}</div>
          <div className={clsx(classes.footerActions, "no-print")}>
            <Link
              to={`/app/account/organizations/${organizationId}/plan/items/${planItem.id}`}
              className={classes.footerLinkToDetail}
            >
              View &gt;
            </Link>
          </div>
        </footer>
      </article>
    );
  }
}

const styles = (theme) => ({
  upper: {
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(1.5),
  },
  header: {
    // top section of cards, inside .upper
    alignItems: "flex-start",
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  body: {
    // mid-section of cards, inside .upper
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  footer: {
    // bottom section of cards.
    alignItems: "center",
    borderTop: "2px solid #ECE8E8",
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    paddingBottom: theme.spacing(),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    paddingTop: theme.spacing(),
  },
  footerLinkToDetail: {
    fontSize: 11,
  },
  footerResponseValue: {
    fontSize: 12,
  },
  headerCriterionInstance: {
    alignItems: "top",
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "space-between",
  },
  headerCriterionInstanceHandle: {
    color: styleVars.colorPrimaryWithMoreContrast,
    fontSize: 16,
    fontWeight: styleVars.txtFontWeightDefaultBold,
    paddingRight: theme.spacing(),
    textAlign: "left",
    display: "inline-flex",
    alignItems: "center",
  },
  headerCriterionInstanceSet: {
    alignItems: "center",
    border: `2px solid ${styleVars.colorLightGray}`,
    borderRadius: "2px",
    display: "inline-flex",
    fontSize: 9,
    marginBottom: "4px",
    marginTop: "2px",
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    textTransform: "uppercase",
  },
  headerItemName: {
    display: "inline-flex",
    paddingRight: theme.spacing(),
    flex: "auto",
  },
  headerButtonWrapper: {
    flex: "initial",
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  headerButton: {
    alignSelf: "flex-start",
    padding: 0,
  },
  headerButtonIcon: {
    width: theme.spacing(1.5),
  },
});

export default withStyles(styles, { withTheme: true })(PlanItemCard);
