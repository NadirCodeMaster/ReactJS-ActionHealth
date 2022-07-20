import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, find, isNil, set } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import DraftEditor from "components/ui/DraftEditor";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import { requestUpdateTerm } from "api/requests";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

class Term extends Component {
  static propTypes = {
    terms: PropTypes.array.isRequired,
    declareTermsHaveChanged: PropTypes.func.isRequired,
    termId: PropTypes.number.isRequired,
    allowedHtml: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      draftTerm: {
        name: "",
      },
      term: null,
      termMissing: false,
      saving: false,
      savingError: false,
    };
  }

  componentDidMount() {
    const { termId, termsHaveChanged, refreshTerms } = this.props;

    this.populateTerm();

    if (termsHaveChanged) {
      refreshTerms();
    }

    generateTitle(`Term ${termId}`);
  }

  componentDidUpdate(prevProps) {
    const { termId: prevTermId } = prevProps;
    const { termId } = this.props;

    if (termId !== prevTermId) {
      this.populateTerm();
    }
    generateTitle(`Term ${termId}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  populateTerm() {
    const { terms, termId } = this.props;

    let term = find(terms, (t) => {
      return Number(termId) === Number(t.id);
    });
    if (term) {
      this.setState({
        term: term,
        draftTerm: { ...term },
      });
    } else {
      this.setState({ termMissing: true });
    }
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
    // const { termId } = this.props;
    // const { popup } = this.context;

    event.preventDefault();

    this.setState({ saving: true });

    //@TODO: Find out why popup is remounting component
    let termChangesSuccessCallback = () => {
      // popup({
      //   message: `Updated term ${termId}!`,
      //   severity: 'success'
      // });
      this.setState({
        saving: false,
        savingError: false,
      });
    };
    let termChangesFailureCallback = () => {
      // popup({
      //   message: 'An error occurred updating criterion',
      //   severity: 'error'
      // });
      this.setState({
        saving: false,
        savingError: true,
      });
    };

    this.sendTermChangesToServer(termChangesSuccessCallback, termChangesFailureCallback);
  };

  // Updates term record on server and replaces
  // our term and draftTerm objects in
  // component state.
  sendTermChangesToServer = (successCallback, failureCallback) => {
    const { termId } = this.props;
    const { draftTerm } = this.state;

    requestUpdateTerm(termId, draftTerm).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let term = res.data.data;
          this.setState({
            term: term,
            draftTerm: term,
          });
          if (successCallback) {
            successCallback();
          }
        } else {
          // Update failed
          this.setState({
            saving: false,
            savingError: true,
          });
          if (failureCallback) {
            failureCallback();
          }
        }
      }
    });
  };

  isEmptyOption = (option) => {
    return !option.value && !option.weight;
  };

  render() {
    const { allowedHtml, classes } = this.props;
    const { draftTerm, term, termMissing, saving } = this.state;

    let allowedHtmlTerms = get(allowedHtml, "terms", "");
    let disabledSave = true;

    if (draftTerm.name && !saving) {
      disabledSave = false;
    }

    if (termMissing) {
      return (
        <p>
          <em>Term not found.</em>
        </p>
      );
    }

    if (isNil(term)) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/terms" root>
            Term Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/terms/new`}>{term.name}</Breadcrumb>
        </Breadcrumbs>

        <h1>{term.name}</h1>

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
                      value={draftTerm.name}
                      onChange={this.handleChangeName}
                      fullWidth
                      required
                    />
                  </div>

                  <div className={classes.textFieldWrapper}>
                    <FormLabel className={classes.termFormLabel}>Definition</FormLabel>
                    <DraftEditor
                      onChange={this.handleChangeDefinition}
                      value={draftTerm.definition ? draftTerm.definition : ""}
                      customToolbarHtml={allowedHtmlTerms.definition}
                    />
                  </div>

                  <FormLabel className={classes.termFormLabel}>Source</FormLabel>
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
  termFormLabel: {
    fontSize: styleVars.txtFontSizeXs,
    margin: theme.spacing(0, 0, 0.25, 0),
  },
  termActions: {
    marginTop: theme.spacing(2),
  },
  textFieldWrapper: {
    margin: theme.spacing(0, 0, 2, 0),
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
)(withStyles(styles, { withTheme: true })(Term));
