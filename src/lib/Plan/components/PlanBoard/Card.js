import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { isEmpty } from "lodash";
import { useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Draggable } from "react-beautiful-dnd";
import extractSetFromOrgSetsData from "utils/orgSetsData/extractSetFrom";
import { itemShape } from "../../prop-type-shapes";
import styleVars from "style/_vars.scss";

//
// Renders an action plan item as a card.
// --------------------------------------
//

export default function Card({
  closeItem,
  deleteItem,
  draggableId,
  generatePlanItemViewData,
  orgSetsData,
  organizationId,
  planItem,
  planItemIndex,
  reopenItem,
  userCanEditActionPlan,
  userCanViewActionPlan,
  userCanViewAssessment,
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

  const [planItemViewData, setPlanItemViewData] = useState(null); // null until set

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

  // CSS to use in the HTML below.
  const cardStyle = useCallback(
    (isDragging, isComplete) => {
      return {
        backgroundColor: isComplete ? "#DEDEDE" : "#FFFFFF",
        borderStyle: "solid",
        borderWidth: "2px",
        userSelect: "none",
        margin: `0 0 ${theme.spacing(1.5)} 0`,
        borderColor: isDragging ? styleVars.colorBrandOrange : "rgba(0,0,0,0.125)",
      };
    },
    [theme]
  );

  // JSX for card header.
  const contentForCardHeader = useCallback(() => {
    if (!planItemViewData) {
      return null;
    }
    // HTML for a stack of criterion instances representing the criterion.
    return (
      <div className={classes.headerCriterionInstances}>
        {planItemViewData.criterionInstances.map((ci, ciIdx) => {
          let setObj = extractSetFromOrgSetsData(orgSetsData, ci.set_id);
          let setDisplayName = !isEmpty(setObj.abbreviation) ? setObj.abbreviation : setObj.name;
          return (
            <div className={classes.headerCriterionInstance} key={ciIdx}>
              <div className={classes.headerCriterionInstanceHandle}>
                <span style={{ whiteSpace: "nowrap" }}>{ci.handle}</span>
              </div>
              <div className={classes.headerCriterionInstanceSet}>{setDisplayName}</div>
            </div>
          );
        })}
      </div>
    );
  }, [classes, orgSetsData, planItemViewData]);

  if (!planItemViewData) {
    return null;
  }

  // DISPLAY =================
  return (
    <Draggable
      draggableId={draggableId}
      index={planItemIndex}
      isDragDisabled={!userCanEditActionPlan}
    >
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Link to={`/app/account/organizations/${organizationId}/plan/items/${planItem.id}`}>
            <article style={cardStyle(snapshot.isDragging, planItemViewData.isComplete)}>
              <div className={classes.upper}>
                <header className={classes.header}>
                  <div className={classes.headerContentWrapper}>{contentForCardHeader()}</div>
                </header>
                <div className={classes.body}>
                  {/* @TODO REMOVE WEIGHT MARKUP BELOW (leaving for quick debugging later) */}
                  {/* <div><small>{planItem.weight}</small></div> */}
                  {/* @TODO REMOVE WEIGHT MARKUP ABOVE (leaving for quick debugging later) */}

                  {planItemViewData.name}
                </div>
              </div>
              <footer className={classes.footer}>
                <div className={classes.footerResponseValue}>{planItemViewData.responseText}</div>
              </footer>
            </article>
          </Link>
        </div>
      )}
    </Draggable>
  );
}

const useStyles = makeStyles((theme) => ({
  upper: {
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(),
  },
  header: {
    // top section of cards, inside .upper
    alignItems: "flex-start",
    color: styleVars.txtColorDefault,
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
  footerResponseValue: {
    color: styleVars.txtColorDefault,
    fontSize: 12,
  },
  headerCriterionInstance: {
    alignItems: "top",
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "space-between",
  },
  headerCriterionInstanceHandle: {
    fontSize: 14,
    fontWeight: styleVars.txtFontWeightDefaultNormal,
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
}));

Card.propTypes = {
  closeItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  draggableId: PropTypes.string.isRequired,
  generatePlanItemViewData: PropTypes.func.isRequired,
  orgSetsData: PropTypes.array.isRequired,
  organizationId: PropTypes.number.isRequired,
  planItem: PropTypes.shape(itemShape).isRequired,
  planItemIndex: PropTypes.number.isRequired,
  reopenItem: PropTypes.func.isRequired,
  userCanViewActionPlan: PropTypes.bool,
  userCanViewAssessment: PropTypes.bool,
  userCanEditActionPlan: PropTypes.bool,
};
