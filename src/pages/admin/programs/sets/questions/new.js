import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, isNil, values, set as lodashSet } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, CircularProgress, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import HgSelect from "components/ui/HgSelect";
import { requestCreateCriterionInstance } from "api/requests";
import DocQuestionCriterionRelationship from "components/ui/DocQuestionCriterionRelationship";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import isNumeric from "utils/isNumeric";
import { currentUserShape } from "constants/propTypeShapes";
import CriterionSelector from "./components/CriterionSelector";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class CriterionInstanceNew extends Component {
  static propTypes = {
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    setCriterionInstances: PropTypes.array.isRequired,
    declareSetCriterionInstancesHaveChanged: PropTypes.func.isRequired,
    setCriterionInstancesHaveChanged: PropTypes.bool,
    setModules: PropTypes.array.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.onCriterionSelectorSelectItem = this.onCriterionSelectorSelectItem.bind(this);

    this.state = {
      draftCriterionInstance: {
        criterion_instance_id: null,
        handle: "",
        module_id: null,
        set_id: props.set.id,
        weight: 0,
      },
      saving: false,
      savingError: false,
    };
  }

  handleChange = ({ target }) => {
    this.setState((state) =>
      lodashSet(state, `draftCriterionInstance.${target.name}`, target.value)
    );
  };

  handleSelectChange = (field, e) => {
    this.setState((state) => lodashSet(state, `draftCriterionInstance.${field}`, e.value));
  };

  onCriterionSelectorSelectItem = (selectedCriterionObj) => {
    let newId = get(selectedCriterionObj, "id", null);
    this.setState((state) => lodashSet(state, `draftCriterionInstance.criterion_id`, newId));
  };

  handleSubmit = (event) => {
    const { declareSetCriterionInstancesHaveChanged, history, program, set } = this.props;
    const { draftCriterionInstance } = this.state;
    event.preventDefault();

    this.setState({ saving: true });

    requestCreateCriterionInstance(draftCriterionInstance).then((res) => {
      if (!this.isCancelled) {
        if (201 === res.status) {
          // Update succeeded
          let newCriterionInstance = res.data.data;
          hgToast(`Created question ${newCriterionInstance.id}!`);
          this.setState({
            draftCriterionInstance: { ...newCriterionInstance },
            saving: false,
            savingError: false,
          });
          declareSetCriterionInstancesHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets/${set.id}/questions`);
        } else {
          // Update failed
          hgToast("An error occurred creating question", "error");
          this.setState({
            saving: false,
            savingError: true,
          });
        }
      }
    });
  };

  selectModuleValues = () => {
    const { setModules } = this.props;
    let modulesArr = values(setModules);

    return modulesArr.map((module) => {
      return { value: module.id, label: module.name };
    });
  };

  noCriterionSelected = () => {
    let criterionId = get(this.state, "draftCriterionInstance.criterion_id", null);
    return !isNumeric(criterionId);
  };

  submitEnabled = () => {
    let draftCriterionInstance = get(this.state, "draftCriterionInstance", {});
    let criterionId = get(draftCriterionInstance, "criterion_id", null);
    let moduleId = get(draftCriterionInstance, "module_id", null);
    let handle = get(draftCriterionInstance, "handle", "");
    let weight = get(draftCriterionInstance, "weight", null);

    if (
      !isNumeric(criterionId) ||
      !isNumeric(moduleId) ||
      !isNumeric(weight) ||
      handle.length < 1
    ) {
      return false;
    }
    return true;
  };

  componentDidMount() {
    const { set } = this.props;
    generateTitle(`New Question for Assessment ${set.id}`);
  }

  componentDidUpdate(prevProps) {
    const { set } = this.props;
    generateTitle(`New Question for Assessment ${set.id}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { classes, program, set, theme } = this.props;
    const { draftCriterionInstance, saving } = this.state;

    if (isNil(draftCriterionInstance)) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/programs" root>
            Program Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}`}>{program.name}</Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets`}>Assessments</Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}`}>
            {set.name}
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/questions`}>
            Questions
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/questions/new`}>
            New
          </Breadcrumb>
        </Breadcrumbs>

        <h1>New Question</h1>
        <p>Define a new question in the {set.name} assessment.</p>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={7}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <div className={classes.formFieldWrapper}>
                  <FormControl
                    fullWidth
                    variant="standard"
                    error={this.noCriterionSelected()}
                    style={{
                      borderBottom: `1px solid ${styleVars.colorLightGray}`,
                      marginBottom: theme.spacing(),
                      paddingBottom: theme.spacing(2),
                    }}
                  >
                    <FormLabel
                      className={classes.formLabel}
                      style={{
                        marginBottom: theme.spacing(1.5),
                      }}
                    >
                      Criterion *
                    </FormLabel>

                    <CriterionSelector onSelectItem={this.onCriterionSelectorSelectItem} />
                  </FormControl>
                </div>

                <div className={classes.formFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Topic *</FormLabel>
                    <HgSelect
                      placeholder="Topic"
                      aria-label="Topic"
                      name="module_id"
                      required={true}
                      options={this.selectModuleValues()}
                      value={
                        this.selectModuleValues().filter(
                          ({ value }) => value === draftCriterionInstance.module_id
                        ) || ""
                      }
                      onChange={(e) => this.handleSelectChange("module_id", e)}
                    />
                  </FormControl>
                </div>

                <div className={classes.formFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Handle"
                      name="handle"
                      id="criterion_instance_handle"
                      value={get(draftCriterionInstance, "handle", "")}
                      onChange={this.handleChange}
                      placeholder="Example: AB-1"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>

                <div className={classes.formFieldWrapperMulti}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="criterion_instance_weight"
                      value={get(draftCriterionInstance, "weight", 0)}
                      onChange={this.handleChange}
                      placeholder="0"
                      type="number"
                      required
                      fullWidth
                      onInput={(e) => {
                        e.target.value = Math.max(0, parseInt(e.target.value))
                          .toString()
                          .slice(0, 5);
                      }}
                    />
                  </FormControl>
                </div>

                <FormControl fullWidth variant="standard">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={saving || !this.submitEnabled()}
                    type="submit"
                    fullWidth
                  >
                    Save
                    {saving && (
                      <React.Fragment>
                        &nbsp;
                        <CircularProgress size="1em" />
                      </React.Fragment>
                    )}
                  </Button>
                </FormControl>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={5}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <DocQuestionCriterionRelationship />
              </Paper>
            </Grid>
          </Grid>
        </form>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  formLabel: {
    fontSize: styleVars.txtFontSizeXs,
    margin: theme.spacing(0, 0, 0.25, 0),
  },
  formFieldWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  formFieldWrapperMulti: {
    margin: theme.spacing(0, 0, 3, 0),
  },
});

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(CriterionInstanceNew));
