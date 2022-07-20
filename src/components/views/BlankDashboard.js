import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import schoolLogo from "images/school.svg";
import researchLogo from "images/research.svg";
import appleBooksLogo from "images/apple_books.svg";
import processLogo from "images/process.svg";
import { fetchContents } from "store/actions";
import { isEmpty } from "lodash";
import filterContentMachineNames from "utils/filterContentMachineNames";
import DynamicContent from "components/ui/DynamicContent";
import { Button, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import styleVars from "style/_vars.scss";

const componentContentMachineNames = [
  "blank_state_dashboard_resource_body",
  "blank_state_dashboard_training_body",
  "blank_state_dashboard_process_body",
];

class BlankDashboard extends Component {
  componentDidMount() {
    this.addContentsToStore();
  }

  // Add contents for this route to store unless
  // they have already been loaded into redux
  addContentsToStore = () => {
    const { addToContents, contents } = this.props;

    let paramMachineNames = filterContentMachineNames(contents, componentContentMachineNames);

    // Fetch content only if its not already in redux
    if (!isEmpty(paramMachineNames)) {
      addToContents(paramMachineNames);
    }
  };

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Paper>
          <div className={classes.blankContainerTop}>
            <header className={classes.actionHeader}>
              <p className={classes.actionHeaderSmallText}>Ready to get started?</p>
            </header>
            <img alt="" className={classes.blankLogo} src={schoolLogo} />
            <h2 className={classes.blankHeaderTop}>Join your organization's team to access</h2>
            <div className={classes.blankListWrapper}>
              <ul className={classes.blankList}>
                <li className={classes.blankListItem}>Assessments</li>
                <li className={classes.blankListItem}>Action Plan</li>
                <li className={classes.blankListItem}>Awards</li>
                <li className={classes.blankListItem}>And more!</li>
              </ul>
            </div>
            <p>
              <Button
                className={classes.blankButton}
                component={Link}
                to="/app/account/organizations/join/school/find"
                variant="contained"
                color="primary"
              >
                Join a School
              </Button>
            </p>
            <p>
              <Button
                className={classes.blankButton}
                component={Link}
                to="/app/account/organizations/join/district/find"
                variant="contained"
                color="primary"
              >
                Join a District
              </Button>
            </p>
            <p>
              <Button
                className={classes.blankButton}
                component={Link}
                to="/app/account/organizations/join/ost/find"
                variant="contained"
                color="primary"
              >
                Join Out-Of-School Time Site
              </Button>
            </p>
            <p>
              <Link to={`/app/account/organizations/join/`}>Join another Organization</Link>
            </p>
            <h2 className={classes.blankHeaderBottom}>What else can you do here?</h2>
          </div>
          <Grid
            container
            spacing={Number(styleVars.gridSpacing)}
            className={classes.blankContainerBottom}
          >
            <Grid item xs={12} sm={4}>
              <div className={classes.blankItemBottomLeft}>
                <img alt="" className={classes.blankBottomLogo} src={researchLogo} />
                <h3 className={classes.blankH3}>Find a resource</h3>
                <div className={classes.blankTextItem}>
                  <DynamicContent machineName={"blank_state_dashboard_resource_body"} />
                </div>
                <a
                  href="https://www.healthiergeneration.org/resources"
                  className={classes.blankTextItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access our Resource Library
                </a>
              </div>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.blankItemGridBottomRight}>
              <div className={classes.blankItemBottomRight}>
                <img alt="" className={classes.blankBottomLogo} src={appleBooksLogo} />
                <h3 className={classes.blankH3}>Watch a training</h3>
                <div className={classes.blankTextItem}>
                  <DynamicContent machineName={"blank_state_dashboard_training_body"} />
                </div>
                <a
                  href="https://www.healthiergeneration.org/resources/trainings"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Access the training library
                </a>
              </div>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.blankItemGridBottomRight}>
              <div className={classes.blankItemBottomRight}>
                <img alt="" className={classes.blankBottomLogo} src={processLogo} />
                <h3 className={classes.blankH3}>About our process</h3>
                <div className={classes.blankTextItem}>
                  <DynamicContent machineName={"blank_state_dashboard_process_body"} />
                </div>
                <a
                  href="https://www.healthiergeneration.org/our-work/six-step-process"
                  className={classes.blankTextItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn about the 6 Step Process
                </a>
              </div>
            </Grid>
          </Grid>
        </Paper>
      </React.Fragment>
    );
  }
}
const styles = (theme) => ({
  actionHeader: {
    marginTop: theme.spacing(5),
  },
  actionHeaderSmallText: {
    fontSize: 11,
    fontWeight: styleVars.txtFontWeightDefaultMedium,
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  blankButton: {
    minWidth: "240px",
  },
  blankContainerTop: {
    textAlign: "center",
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down("md")]: {
      marginBottom: theme.spacing(3),
    },
  },
  blankContainerBottom: {
    textAlign: "center",
    marginBottom: theme.spacing(3),
  },
  blankH3: {
    fontSize: styleVars.txtFontSizeLg,
    margin: theme.spacing(),
  },
  blankListWrapper: {
    marginBottom: theme.spacing(),
    textAlign: "center",
  },
  blankList: {
    display: "inline-block",
    margin: "auto",
    paddingBottom: theme.spacing(),
    paddingTop: theme.spacing(),
  },
  blankListItem: {
    textAlign: "left",
  },
  blankItemBottomLeft: {
    textAlign: "center",
    width: "70%",
    margin: "auto",
    marginBottom: theme.spacing(5),
  },
  blankItemBottomRight: {
    textAlign: "center",
    width: "70%",
    margin: "auto",
    marginBottom: theme.spacing(5),
  },
  blankItemLinkBottom: {
    width: "30%",
    margin: "1em 1.5em 4em 1.5em",
  },
  blankLogo: {
    margin: "1em 0em 0 0em",
    width: "50px",
  },
  blankBottomLogo: {
    margin: 0,
    width: "50px",
    [theme.breakpoints.up("md")]: {
      marginBottom: theme.spacing(),
    },
  },
  blankTextItem: {
    margin: theme.spacing(),
  },
  blankItemGridBottomRight: {
    [theme.breakpoints.up("sm")]: {
      borderLeft: `2px solid ${styleVars.colorLightGray}`,
    },
  },
  blankHeaderBottom: {
    margin: theme.spacing(10, 0, 0, 0),
  },
  blankHeaderTop: {
    margin: theme.spacing(0, 0, 0, 0),
  },
});
const mapStateToProps = (state) => {
  return {
    contents: state.contents,
  };
};
const mapDispatchToProps = (dispatch) => ({
  addToContents: (machineNames) => {
    dispatch(
      fetchContents({
        machine_name: machineNames,
      })
    );
  },
});
export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(BlankDashboard));
