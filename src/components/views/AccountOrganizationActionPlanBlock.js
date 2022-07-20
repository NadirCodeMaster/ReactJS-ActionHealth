import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { get, isEmpty } from "lodash";
import moment from "moment";
import styleVars from "style/_vars.scss";

/**
 * Action Plan + Item box, used in Organization Overview page
 */
export default function AccountOrganizationActionPlanBlock({
  organization,
  qtyPlanItems,
  updatedByData,
}) {
  const classes = useStyles();

  const planLabel = () => {
    if (qtyPlanItems === 1) {
      return "Action Plan Item";
    }

    return "Action Plan Items";
  };

  const planValue = () => {
    if (qtyPlanItems) {
      return qtyPlanItems;
    }

    return 0;
  };

  const actionPlanBlockText = () => {
    if (!qtyPlanItems) {
      return `Use your Action Plan to outline plans, identify resources and capture progress. This to-do list will help your team collaborate, prioritize and align goals with your school improvement efforts.`;
    }

    if (qtyPlanItems) {
      return `Visit your Action Plan to keep track of assessment items in progress. Add new items, prioritize this year's goals, or mark items complete.`;
    }
  };

  /**
   * Creates updated at string for render method if updated_at data exists
   * @return {string} updatedAt || ''
   */
  const updatedByString = () => {
    let updatedAt = updatedByData.updated_at;

    if (moment(updatedAt).isValid()) {
      let updatedByString = "Updated " + moment.utc(updatedAt).fromNow();
      let nameFirst = get(updatedByData, "updated_by.name_first", "");
      let nameLastInitial = get(updatedByData, "updated_by.name_last", "").charAt(0);

      if (!isEmpty(nameFirst)) {
        updatedByString += " by " + nameFirst + " " + nameLastInitial;
      }

      return updatedByString;
    }

    return "";
  };

  return (
    <div className={classes.actionPlanBlockWrapper}>
      <div className={classes.actionPlanBlockContainer}>
        <div className={classes.statusValue}>
          <Link to={`/app/account/organizations/${organization.id}/plan`}>{planValue()}</Link>
        </div>
        <div className={classes.statusLabel}>{planLabel()}</div>
        {updatedByData && updatedByData.updated && (
          <div className={classes.updatedByWrapper}>{updatedByString()}</div>
        )}
        <div className={classes.statusLinkWrapper}>
          <Link
            className={classes.statusLink}
            to={`/app/account/organizations/${organization.id}/plan`}
          >
            Go to Action Plan
          </Link>
        </div>
      </div>
      <div className={classes.actionPlanBlockText}>{actionPlanBlockText()}</div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  actionPlanBlockWrapper: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignContent: "center",
  },
  actionPlanBlockContainer: {
    width: "35%",
    textAlign: "center",
    borderRight: `2px solid ${styleVars.colorLightGray}`,
    paddingRight: theme.spacing(),
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  statusValue: {
    color: theme.palette.primary.main,
    fontSize: "32px",
  },
  statusLabel: {
    fontSize: styleVars.txtFontSizeLg,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
  },
  statusLinkWrapper: {
    marginTop: theme.spacing(1),
  },
  actionPlanBlockText: {
    width: "64%",
    paddingLeft: theme.spacing(2),
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
    flexDirection: "column",
  },
  updatedByWrapper: {
    fontStyle: "italic",
    marginTop: theme.spacing(0.5),
  },
}));

AccountOrganizationActionPlanBlock.propTypes = {
  organization: PropTypes.object,
  qtyPlanItems: PropTypes.number,
};
