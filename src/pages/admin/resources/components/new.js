import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, map, set } from "lodash";
import HgSelect from "components/ui/HgSelect";
import HgTextField from "components/ui/HgTextField";
import { Button, CircularProgress, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

class ResourcesNew extends Component {
  static propTypes = {
    createResource: PropTypes.func.isRequired,
    getResourceOptions: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      // initial state of new resource fields
      draftResource: {
        name: "",
        description: "",
        direct_download: false,
        resource_type_id: 0,
        language_id: null,
        weight: 0,
      },
      saving: false,
      savingError: false,
      showTrainingTypeSelect: false,
    };
  }

  componentDidMount() {
    generateTitle("New Resource");
  }

  componentDidUpdate() {
    generateTitle("New Resource");
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * setState on draftResource for generic field change
   * @param {object} selectedOption
   */
  handleChange = ({ target }) => {
    this.setState((state) => set(state, `draftResource.${target.name}`, target.value));
  };

  /**
   * setState on draftResource for resource_type_id
   * @param {object} selectedOption
   */
  handleSelectChange = (draftResourceKey, selectedOption) => {
    const { showTrainingTypeSelect } = this.state;

    let selectedOptionLabel = selectedOption.label.toLowerCase();
    let tempShowTrainingTypeSelect = showTrainingTypeSelect;

    if (selectedOptionLabel === "trainings" && draftResourceKey === "resource_type_id") {
      tempShowTrainingTypeSelect = true;
    }

    this.setState({
      draftResource: {
        ...this.state.draftResource,
        [draftResourceKey]: selectedOption.value,
      },
      showTrainingTypeSelect: tempShowTrainingTypeSelect,
    });
  };

  /**
   * setState on draftCriterion for language
   * @param {object} selectedOption
   */
  handleSelectLanguageChange = (selectedOption) => {
    const { languages } = this.props;

    this.setState({
      draftResource: {
        ...this.state.draftResource,
        language_id: languages[selectedOption.value].id.toString(),
      },
    });
  };

  /**
   * create resource from endpoint passed in props
   * @param {object} event
   */
  handleSubmit = (e) => {
    const { createResource } = this.props;
    const { draftResource } = this.state;

    e.preventDefault();

    createResource(draftResource);
  };

  /**
   * Set required that are required enabling save button
   * @returns {boolean}
   */
  disableSave = () => {
    const { draftResource, saving } = this.state;

    if (
      draftResource.name &&
      draftResource.resource_type_id &&
      draftResource.language_id &&
      !saving
    ) {
      return false;
    }

    return true;
  };

  /**
   * @returns {string} language_id for select value prop
   */
  resourceLanguageSelectValue = () => {
    const { draftResource } = this.state;

    return this.resourceLanguageOptions().filter(({ value }) => {
      return value === get(draftResource, "language_id", null);
    });
  };

  /**
   * @returns {array} options for language select bar
   */
  resourceLanguageOptions = () => {
    const { languages } = this.props;

    return map(languages, (language) => {
      return {
        value: language.id,
        label: language.exonym,
      };
    });
  };

  render() {
    const { classes, getResourceOptions, getResourceTrainingTypeOptions } = this.props;
    const { draftResource, saving, showTrainingTypeSelect } = this.state;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/resources" root>
            Resource Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/resources/new`}>New</Breadcrumb>
        </Breadcrumbs>
        <h1>New Resource</h1>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                {/* Name */}
                <div className={classes.textFieldTopWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      placeholder="New Resource"
                      label="Name"
                      name="name"
                      id="resource_name"
                      value={draftResource.name}
                      onChange={this.handleChange}
                      fullWidth
                      required
                    />
                  </FormControl>
                </div>

                {/* Weight */}
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="weight"
                      value={draftResource.weight}
                      onChange={this.handleChange}
                      placeholder="0"
                      type="number"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>

                {/* Type */}
                <div>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Resource Type *</FormLabel>
                    <div className={classes.selectWrapper}>
                      <HgSelect
                        placeholder="Select your Resource Type"
                        name="resource_types"
                        isMulti={false}
                        options={getResourceOptions()}
                        onChange={(e) => this.handleSelectChange("resource_type_id", e)}
                        aria-label="Select your Resource Type"
                      />
                    </div>
                  </FormControl>
                </div>

                {/* Training Type */}
                {showTrainingTypeSelect && (
                  <div className={classes.resourceNewSelectContainer}>
                    <FormControl fullWidth variant="standard">
                      <FormLabel className={classes.formLabel}>Training Type *</FormLabel>
                      <div className={classes.selectWrapper}>
                        <HgSelect
                          placeholder="Select your Training Type"
                          name="training_types"
                          isMulti={false}
                          options={getResourceTrainingTypeOptions()}
                          onChange={(e) => this.handleSelectChange("training_type_id", e)}
                          aria-label="Select your Training Type"
                        />
                      </div>
                    </FormControl>
                  </div>
                )}

                {/* Languages */}
                <div className={classes.resourceNewSelectContainer}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Language *</FormLabel>
                    <div className={classes.selectWrapper}>
                      <HgSelect
                        placeholder="Select Language"
                        name="resource_types"
                        isMulti={false}
                        options={this.resourceLanguageOptions()}
                        onChange={this.handleSelectLanguageChange}
                        aria-label="Select Language"
                        value={this.resourceLanguageSelectValue()}
                      />
                    </div>
                  </FormControl>
                </div>
              </Paper>

              {/* Save Button */}
              <div className={classes.actions}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  fullWidth
                  disabled={this.disableSave()}
                >
                  Save
                  {saving && (
                    <React.Fragment>
                      &nbsp;
                      <CircularProgress size="1em" />
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
  formLabel: {
    fontSize: styleVars.txtFontSizeXs,
    margin: theme.spacing(0, 0, 0.25, 0),
  },
  selectWrapper: {
    fontSize: styleVars.reactSelectFontSize,
  },
  textFieldTopWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  textFieldWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourcesHelperField: {
    marginBottom: theme.spacing(2),
  },
  resourceNewSelectContainer: {
    marginTop: theme.spacing(),
  },
});

const mapStateToProps = (state) => {
  return {
    resourceTypes: state.app_meta.data.resourceTypes,
    languages: state.app_meta.data.languages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ResourcesNew));
