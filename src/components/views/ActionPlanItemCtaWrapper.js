import React, { Component } from "react";
import LearnFromLeadersCta from "components/LearnFromLeadersCta";
import ActionPlanQuestionsCta from "components/views/ActionPlanQuestionsCta";
import { Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

/**
 * Wrapper for tip boxes CTA for action plan index page.
 *
 * @extends Component
 */
class ActionPlanItemCtaWrapper extends Component {
  render() {
    const { theme } = this.props;

    return (
      <React.Fragment>
        <Grid item xs={12} md={6} lg={6}>
          <Paper style={{ padding: styleVars.paperPadding }}>
            <LearnFromLeadersCta />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <Paper style={{ padding: styleVars.paperPadding }}>
            <ActionPlanQuestionsCta />
          </Paper>
        </Grid>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  planCtaWrapperContainer: {
    marginBottom: theme.spacing(2),
  },
});

export default withStyles(styles, { withTheme: true })(ActionPlanItemCtaWrapper);
