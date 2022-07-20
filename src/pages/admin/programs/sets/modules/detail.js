import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { find, isNil, set as lodashSet } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, CircularProgress, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestDeleteModule, requestUpdateModule } from "api/requests";
import DraftEditor from "components/ui/DraftEditor";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import Switch from "components/ui/SwitchWrapper";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

// @TODO Add validation

class SetModuleDetail extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    moduleId: PropTypes.number.isRequired,
    program: PropTypes.object.isRequired,
    set: PropTypes.object.isRequired,
    setModules: PropTypes.array.isRequired,
    declareSetModulesHaveChanged: PropTypes.func.isRequired,
    setModulesHaveChanged: PropTypes.bool,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      module: null,
      draftModule: null,
      moduleMissing: false,
      saving: false,
      savingError: false,
      deleting: false,
      deletingError: false,
    };
  }

  handleChange = ({ target }) => {
    this.setState((state) => lodashSet(state, `draftModule.${target.name}`, target.value));
  };

  handleChangeDescription = (description) => {
    this.setState({
      draftModule: {
        ...this.state.draftModule,
        description: description,
      },
    });
  };

  handleSwitchChange = ({ target }) => {
    let cur = this.state.draftModule[target.name];
    this.setState((state) => lodashSet(state, `draftModule.${target.name}`, !cur));
  };

  handleClickDelete = () => {
    const { moduleId, declareSetModulesHaveChanged, history, program, set } = this.props;
    this.setState({ deleting: true });
    requestDeleteModule(moduleId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted topic ${moduleId}`);
          this.setState({
            deleting: false,
            deletingError: false,
            moduleMissing: true,
            module: null,
            draftModule: null,
          });
          declareSetModulesHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets/${set.id}/modules`);
        } else {
          // Delete failed
          hgToast("An error occurred deleting topic", "error");
          this.setState({
            deleting: false,
            deletingError: true,
          });
        }
      }
    });
  };

  handleSubmit = (event) => {
    const { moduleId, declareSetModulesHaveChanged } = this.props;
    const { draftModule } = this.state;
    event.preventDefault();

    this.setState({ saving: true });
    requestUpdateModule(moduleId, draftModule).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedModule = res.data.data;
          hgToast(`Updated topic ${moduleId}`);
          this.setState({
            module: updatedModule,
            draftModule: { ...updatedModule },
            saving: false,
            savingError: false,
          });
          declareSetModulesHaveChanged();
        } else {
          // Update failed
          hgToast("An error occurred updating topic", "error");
          this.setState({
            saving: false,
            savingError: true,
          });
        }
      }
    });
  };

  populateModule() {
    const { setModules, moduleId } = this.props;

    let mod = find(setModules, (m) => {
      return Number(moduleId) === Number(m.id);
    });

    if (mod) {
      this.setState({
        module: mod,
        draftModule: { ...mod },
      });
    } else {
      this.setState({ moduleMissing: true });
    }
  }

  componentDidMount() {
    const { moduleId } = this.props;
    this.populateModule();
    generateTitle(`Topic ${moduleId}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  componentDidUpdate(prevProps) {
    const { moduleId: prevModuleId } = prevProps;
    const { moduleId } = this.props;

    if (moduleId !== prevModuleId) {
      this.populateModule();
    }

    generateTitle(`Topic ${moduleId}`);
  }

  render() {
    const { classes, moduleId, program, set } = this.props;
    const { draftModule, moduleMissing, saving, deleting } = this.state;

    if (moduleMissing) {
      return (
        <p>
          <em>Module not found.</em>
        </p>
      );
    }

    if (isNil(draftModule)) {
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
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/modules`}>
            Topics
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/modules/${moduleId}`}>
            {draftModule.name}
          </Breadcrumb>
        </Breadcrumbs>

        <h1>
          Topic Detail (#
          {draftModule.id})
        </h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={9}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Name"
                      name="name"
                      id="module_name"
                      value={draftModule.name || ""}
                      onChange={this.handleChange}
                      placeholder="New Topic"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Abbreviation"
                      name="abbreviation"
                      id="module_abbreviation"
                      value={draftModule.abbreviation || ""}
                      onChange={this.handleChange}
                      placeholder="NM"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="module_weight"
                      value={draftModule.weight || 0}
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

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Description</FormLabel>
                    <DraftEditor
                      keyProp={draftModule.id}
                      onChange={this.handleChangeDescription}
                      value={draftModule.description || ""}
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <Switch
                    name={"internal"}
                    label={"Internal"}
                    value={"internal"}
                    checked={draftModule.internal}
                    handleChange={this.handleSwitchChange}
                  />
                </div>

                <div>
                  <Button
                    style={{ marginBottom: "0.5em" }}
                    variant="contained"
                    color="primary"
                    disabled={saving || deleting}
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

                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (window.confirm("Are you sure?")) {
                        this.handleClickDelete();
                      }
                    }}
                    disabled={saving || deleting}
                    fullWidth
                  >
                    Delete
                  </Button>
                </div>
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
  textFieldWrapper: {
    margin: theme.spacing(0, 0, 1, 0),
  },
});

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(SetModuleDetail));
