import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { set as lodashSet } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestCreateModule } from "api/requests";
import DraftEditor from "components/ui/DraftEditor";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Switch from "components/ui/SwitchWrapper";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class SetModuleNew extends Component {
  static propTypes = {
    currentUser: PropTypes.shape(currentUserShape).isRequired,
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
      draftModule: {
        set_id: props.set.id,
        internal: false,
      },
      saving: false,
      savingError: false,
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

  handleSubmit = (event) => {
    const { declareSetModulesHaveChanged, history, program, set } = this.props;
    const { draftModule } = this.state;
    event.preventDefault();

    this.setState({ saving: true });

    requestCreateModule(draftModule).then((res) => {
      if (!this.isCancelled) {
        if (201 === res.status) {
          // Create succeeded
          let newModule = res.data.data;
          hgToast(`Created topic ${newModule.id}`);
          this.setState({
            saving: false,
            savingError: false,
          });
          declareSetModulesHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets/${set.id}/modules`);
        } else {
          // Create failed
          hgToast("An error occurred creating topic", "error");
          this.setState({
            saving: false,
            savingError: true,
          });
        }
      }
    });
  };

  componentDidMount() {
    const { set } = this.props;
    generateTitle(`New Topic for Assessment ${set.id}`);
  }

  componentDidUpdate(prevProps) {
    const { set } = this.props;
    generateTitle(`New Topic for Assessment ${set.id}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { classes, program, set } = this.props;
    const { draftModule, saving } = this.state;

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
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/${set.id}/modules/new`}>
            New
          </Breadcrumb>
        </Breadcrumbs>

        <h1>New Topic</h1>
        <p>Define a new topic in the {set.name} assessment.</p>

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
                      keyProp="draft_module"
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
                    disabled={saving}
                    type="submit"
                    fullWidth
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
)(withStyles(styles, { withTheme: true })(SetModuleNew));
