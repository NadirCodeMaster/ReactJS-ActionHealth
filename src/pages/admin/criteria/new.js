import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { map, set } from "lodash";
import HgSelect from "components/ui/HgSelect";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import { requestCreateCriterion } from "api/requests";
import generateTitle from "utils/generateTitle";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class CriterionNew extends Component {
  static propTypes = {
    responseStructures: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      draftCriterion: {
        name: "",
        response_structure_id: null,
      },
      saving: false,
      savingError: false,
    };
  }

  componentDidMount() {
    generateTitle("New Criterion");
  }

  componentDidUpdate() {
    generateTitle("New Criterion");
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  handleChange = ({ target }) => {
    this.setState((state) => set(state, `draftCriterion.${target.name}`, target.value));
  };

  /**
   * setState on draftCriterion for response_structure_id
   * @param {object} selectedOption
   */
  handleSelectChange = (selectedOption) => {
    this.setState({
      draftCriterion: {
        ...this.state.draftCriterion,
        response_structure_id: selectedOption.value,
      },
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.sendCriterionToServer();
  };

  // Sends draftCriterion to server, creating a new record.
  sendCriterionToServer = () => {
    const { history } = this.props;
    const { draftCriterion } = this.state;
    this.setState({ saving: true });

    // Code to execute after we're done saving everything
    let handleSuccess = (id) => {
      hgToast(`Created criterion ${id}!`);
      this.setState({
        saving: false,
        savingError: false,
      });
      history.push(`/app/admin/criteria/${id}`);
    };

    // Code to execute if save fails.
    let handleFailure = (res) => {
      hgToast("An error occurred creating criterion. " + errorSuffix(res), "error");
      this.setState({
        saving: false,
        savingError: true,
      });
    };

    requestCreateCriterion(draftCriterion).then((res) => {
      if (!this.isCancelled) {
        if (201 === res.status) {
          // Create succeeded
          let newCriterion = res.data.data;

          handleSuccess(newCriterion.id);

          return;
        } else {
          // Create failed
          handleFailure(res);
        }
      }
    });
  };

  isEmptyOption = (option) => {
    return !option.value && !option.weight;
  };

  /**
   * Correlates value and label from appMeta.data.responseStructure
   **/
  getResponseStructureOptions = () => {
    const { responseStructures } = this.props;

    return map(responseStructures, (rs) => {
      return {
        value: rs.id,
        label: rs.name,
      };
    });
  };

  render() {
    const { classes } = this.props;
    const { draftCriterion, saving } = this.state;
    let disabledSave = true;
    let responseStructureOptions = this.getResponseStructureOptions();

    if (draftCriterion.response_structure_id && draftCriterion.name && !saving) {
      disabledSave = false;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/criteria" root>
            Criterion Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/criteria/new`}>New</Breadcrumb>
        </Breadcrumbs>

        <h1>New Criterion</h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      placeholder="New Criterion"
                      label="Name"
                      name="name"
                      id="criterion_name"
                      value={draftCriterion.name}
                      onChange={this.handleChange}
                      fullWidth
                      required
                    />
                  </FormControl>
                </div>

                <FormControl fullWidth variant="standard">
                  <div className={classes.selectWrapper}>
                    <HgSelect
                      placeholder="Select your Response Structure"
                      name="response_structures"
                      isMulti={false}
                      options={responseStructureOptions}
                      onChange={this.handleSelectChange}
                      aria-label="Select your Response Structure"
                    />
                  </div>
                </FormControl>
              </Paper>

              <div className={classes.actions}>
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
  actions: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(2),
  },
  selectWrapper: {
    fontSize: styleVars.reactSelectFontSize,
  },
  textFieldWrapper: {
    margin: theme.spacing(0, 0, 2, 0),
  },
});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      responseStructures: app_meta.data.responseStructures,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(CriterionNew));
