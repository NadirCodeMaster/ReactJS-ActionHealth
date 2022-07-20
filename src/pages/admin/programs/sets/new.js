import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { set as lodashSet, values } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestCreateSet } from "api/requests";
import HgSelect from "components/ui/HgSelect";
import DraftEditor from "components/ui/DraftEditor";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Switch from "components/ui/SwitchWrapper";
import validDownloadableSetUrl from "utils/validDownloadableSetUrl";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class ProgramSetNew extends Component {
  static propTypes = {
    program: PropTypes.object.isRequired,
    programSets: PropTypes.array.isRequired,
    declareProgramSetsHaveChanged: PropTypes.func.isRequired,
    setsHaveChanged: PropTypes.bool,
    organizationTypes: PropTypes.object.isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      draftSet: {
        program_id: props.program.id,
        restricted: false,
        public: false,
      },
      saving: false,
      savingError: false,
      downloadUrlError: false,
    };
  }

  handleChange = ({ target }) => {
    this.setState((state) => lodashSet(state, `draftSet.${target.name}`, target.value));
  };

  handleChangeSelect = (event) => {
    this.setState((state) => lodashSet(state, `draftSet.organization_type_id`, event.value));
  };

  handleChangeDownloadUrl = ({ target }) => {
    let downloadUrl = target.value;
    let isValidDownloadUrl = validDownloadableSetUrl(downloadUrl);

    if (isValidDownloadUrl || downloadUrl === "") {
      this.setState({ downloadUrlError: false });
    } else {
      this.setState({ downloadUrlError: true });
    }

    this.setState((state) => lodashSet(state, `draftSet.download_url`, downloadUrl));
  };

  handleChangeDescription = (description) => {
    this.setState({
      draftSet: {
        ...this.state.draftSet,
        description: description,
      },
    });
  };

  handleSwitchChange = ({ target }) => {
    let cur = this.state.draftSet[target.name];
    this.setState((state) => lodashSet(state, `draftSet.${target.name}`, !cur));
  };

  handleSubmit = (event) => {
    const { declareProgramSetsHaveChanged, history, program } = this.props;
    const { draftSet } = this.state;
    event.preventDefault();

    this.setState({ saving: true });

    requestCreateSet(draftSet).then((res) => {
      if (!this.isCancelled) {
        if (201 === res.status) {
          // Create succeeded
          let newSet = res.data.data;
          hgToast(`Created set ${newSet.id}!`);
          this.setState({
            saving: false,
            savingError: false,
          });
          declareProgramSetsHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets`);
        } else {
          // Update failed
          hgToast("An error occurred updating set", "error");
          this.setState({
            saving: false,
            savingError: true,
          });
        }
      }
    });
  };

  selectValues = () => {
    const { organizationTypes } = this.props;
    let orgTypesArr = values(organizationTypes);

    return orgTypesArr.map((orgType) => {
      return { value: orgType.id, label: orgType.name };
    });
  };

  componentDidMount() {
    generateTitle("New Assessment");
  }

  componentDidUpdate() {
    generateTitle("New Assessment");
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  render() {
    const { classes, program } = this.props;
    const { draftSet, downloadUrlError, saving } = this.state;

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/programs" root>
            Program Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}`}>{program.name}</Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets`}>Assessments</Breadcrumb>
          <Breadcrumb path={`/app/admin/programs/${program.id}/sets/new`}>New</Breadcrumb>
        </Breadcrumbs>

        <h1>New Assessment</h1>
        <p>Define a new {program.name} assessment.</p>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={9}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Name"
                      name="name"
                      id="set_name"
                      value={draftSet.name || ""}
                      onChange={this.handleChange}
                      placeholder="Set name"
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
                      id="set_abbreviation"
                      value={draftSet.abbreviation || ""}
                      onChange={this.handleChange}
                      placeholder="NA"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Version"
                      name="version"
                      id="set_version"
                      value={draftSet.version || ""}
                      onChange={this.handleChange}
                      placeholder="101"
                      required
                      fullWidth
                    />
                  </FormControl>
                </div>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Download URL"
                      name="download_url"
                      id="set_download_url"
                      value={draftSet.download_url || ""}
                      onChange={this.handleChangeDownloadUrl}
                      placeholder="https://www.healthiergeneration.org/media/x"
                      fullWidth
                      error={downloadUrlError}
                      helperText={
                        downloadUrlError
                          ? `Must be an absolute URL (i.e., it must start with "https://")`
                          : ""
                      }
                    />
                  </FormControl>
                </div>
                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="set_weight"
                      value={draftSet.weight || 0}
                      onChange={this.handleChange}
                      margin="none"
                      placeholder="0"
                      type="number"
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
                    <FormLabel className={classes.formLabel}>Organization Type</FormLabel>
                    <HgSelect
                      placeholder="Organization Type"
                      aria-label="Organization Type"
                      maxMenuHeight={220}
                      name="organization_type_id"
                      options={this.selectValues()}
                      value={
                        this.selectValues().filter(
                          ({ value }) => value === draftSet.organization_type_id
                        ) || ""
                      }
                      onChange={this.handleChangeSelect}
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Description</FormLabel>
                    <DraftEditor
                      keyProp="draft_set"
                      onChange={this.handleChangeDescription}
                      value={draftSet.description || ""}
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <Switch
                    name={"public"}
                    label={"Public"}
                    value={"public"}
                    checked={draftSet.public}
                    handleChange={this.handleSwitchChange}
                  />
                  <Switch
                    name={"restricted"}
                    label={"Restricted"}
                    value={"restricted"}
                    checked={draftSet.restricted}
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

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      organizationTypes: app_meta.data.organizationTypes,
      currentUser: auth.currentUser,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(ProgramSetNew));
