import React, { Component } from "react";
import IntroActionPlanCta from "components/views/IntroActionPlanCta";
import SeeActionPlanActionCta from "components/views/SeeActionPlanActionCta";
import PrintActionPlanCta from "components/views/PrintActionPlanCta";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

/**
 * Wrapper for tip boxes CTA for action plan.
 *
 * @extends Component
 */
class ActionPlanCtaWrapper extends Component {
  render() {
    const { classes, isBlankState, organization } = this.props;

    return (
      <React.Fragment>
        <div className="no-print">
          <Grid
            container
            className={classes.planCtaWrapperContainer}
            spacing={Number(styleVars.gridSpacing)}
          >
            <Grid item xs={12} md={6} lg={6}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <IntroActionPlanCta isBlankState={isBlankState} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={6}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <SeeActionPlanActionCta isBlankState={isBlankState} />
              </Paper>
            </Grid>
          </Grid>
        </div>
        <div className="only-print">
          <div className={classes.printPlanCtaWrapperContainer}>
            <Paper style={{ padding: styleVars.paperPadding }}>
              <PrintActionPlanCta organization={organization} />
            </Paper>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  planCtaWrapperContainer: {
    marginBottom: theme.spacing(2),
  },
  printPlanCtaWrapperContainer: {
    marginBottom: theme.spacing(2),
    display: "block",
    width: "97%",
  },
});

export default withStyles(styles, { withTheme: true })(ActionPlanCtaWrapper);
