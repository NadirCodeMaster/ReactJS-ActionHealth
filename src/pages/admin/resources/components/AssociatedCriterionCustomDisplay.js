import React from "react";
import { get, join, map, uniqBy } from "lodash";
import { withStyles } from "@mui/styles";

/**
 * Custom display for associated criterion
 *
 * This was required mainly due to the added complexity of displaying
 * criterion instances
 */

function AssociatedCriterionCustomDisplay({ item, classes }) {
  let criterionInstances = uniqBy(get(item, "criterion_instances", []), "handle");
  let criterionInstancesDisplay = join(
    map(criterionInstances, (ci) => {
      return get(ci, "handle", "");
    }),
    ", "
  );

  return (
    <div className={classes.criterionDisplayContainer}>
      <div className={classes.criterionChild}>{item.id}</div>
      <div className={classes.criterionChild}>
        <div>{item.name}</div>
        <div className={classes.criterionInstances}>{criterionInstancesDisplay}</div>
      </div>
    </div>
  );
}

const styles = (theme) => ({
  criterionDisplayContainer: {
    display: "flex",
  },
  criterionChild: {
    marginRight: theme.spacing(),
  },
  criterionInstances: {
    fontStyle: "italic",
    marginTop: theme.spacing(),
  },
});

export default withStyles(styles)(AssociatedCriterionCustomDisplay);
