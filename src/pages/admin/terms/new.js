import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, set } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import DraftEditor from "components/ui/DraftEditor";
import { requestCreateTerm } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class TermNew extends Component {
  static propTypes = {
    terms: PropTypes.array.isRequired,
    declareTermsHaveChanged: PropTypes.func.isRequired,
    allowedHtml: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      draftTerm: {
        name: "",
      },
      saving: false,
      savingError: false,
    };
  }

  componentDidMount() {
    generateTitle("New Term");
  }

  componentDidUpdate() {
    generateTitle("New Term");
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  handleChangeDefinition = (definition) => {
    this.setState({
      draftTerm: {
        ...this.state.draftTerm,
        definition,
      },
    });
  };

  handleChangeSource = (source) => {
    this.setState({
      draftTerm: {
        ...this.state.draftTerm,
        source,
      },
    });
  };

  handleChangeName = ({ target }) => {
    this.setState((state) => set(state, `draftTerm.${target.name}`, target.value));
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.sendTermToServer();
  };

  // Sends draftTerm to server, creating a new record.
  sendTermToServer = () => {
    const { declareTermsHaveChanged, history } = this.props;
    const { draftTerm } = this.state;
    this.setState({ saving: true });

    // Code to execute after we're done saving everything
    let handleSuccess = (id) => {
      hgToast(`Created term ${id}`);
      this.setState({
        saving: false,
        savingError: false,
      });
      history.push(`/app/admin/terms/${id}`);
    };

    // Code to execute if save fails.
    let handleFailure = () => {
      hgToast("An error occurred creating term", "error");
      this.setState({
        saving: false,
        savingError: true,
      });
    };

    requestCreateTerm(draftTerm).then((res) => {
      if (!this.isCancelled) {
        if (201 === res.status) {
          // Create succeeded
          let newTerm = res.data.data;

          declareTermsHaveChanged();
          handleSuccess(newTerm.id);

          return;
        } else {
          // Create failed
          handleFailure();
        }
      }
    });
  };

  isEmptyOption = (option) => {
    return !option.value && !option.weight;
  };

  render() {
    const { allowedHtml, classes } = this.props;
    const { draftTerm, saving } = this.state;

    let allowedHtmlTerms = get(allowedHtml, "terms", "");
    let disabledSave = true;

    if (draftTerm.name && !saving) {
      disabledSave = false;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/terms" root>
            Term Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/terms/new`}>New</Breadcrumb>
        </Breadcrumbs>

        <h1>New Term</h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <FormControl fullWidth variant="standard">
                  <div className={classes.textFieldWrapper}>
                    <HgTextField
                      placeholder="New Term"
                      label="Name"
                      name="name"
                      id="term_name"
                      value={draftTerm.name ? draftTerm.name : ""}
                      onChange={this.handleChangeName}
                      fullWidth
                      required
                    />
                  </div>

                  <div className={classes.textFieldWrapper}>
                    <FormLabel className={classes.newTermFormLabel}>Definition</FormLabel>
                    <DraftEditor
                      onChange={this.handleChangeDefinition}
                      value={draftTerm.definition ? draftTerm.definition : ""}
                      customToolbarHtml={allowedHtmlTerms.definition}
                    />
                  </div>

                  <FormLabel className={classes.newTermFormLabel}>Source</FormLabel>
                  <DraftEditor
                    onChange={this.handleChangeSource}
                    value={draftTerm.source ? draftTerm.source : ""}
                    customToolbarHtml={allowedHtmlTerms.source}
                  />
                </FormControl>
              </Paper>

              <div className={classes.termActions}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  fullWidth
                  disabled={disabledSave}
                >
                  Save
                  {saving && (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgressForButtons />
                    </React.Fragment>
                  )}
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  newTermFormLabel: {
    fontSize: styleVars.txtFontSizeXs,
    margin: theme.spacing(0, 0, 0.25, 0),
  },
  textFieldWrapper: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  termActions: {
    marginTop: theme.spacing(2),
  },
});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      allowedHtml: app_meta.data.allowedHtml,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(TermNew));
