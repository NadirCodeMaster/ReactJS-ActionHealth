import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { find, isNil, set as lodashSet, values } from "lodash";
import HgTextField from "components/ui/HgTextField";
import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import HgSelect from "components/ui/HgSelect";
import { requestDeleteSet, requestUpdateSet } from "api/requests";
import DraftEditor from "components/ui/DraftEditor";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import Switch from "components/ui/SwitchWrapper";
import RestrictedOrganizationsAdmin from "components/views/RestrictedOrganizationsAdmin";
import validDownloadableSetUrl from "utils/validDownloadableSetUrl";
import generateTitle from "utils/generateTitle";
import errorSuffix from "utils/errorSuffix";
import isAbsoluteUrl from "utils/isAbsoluteUrl";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class ProgramSetDetail extends Component {
  static propTypes = {
    setId: PropTypes.number.isRequired,
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
      set: null,
      draftSet: null,
      setMissing: false,
      saving: false,
      savingError: false,
      deleting: false,
      deletingError: false,
      downloadUrlError: false,
      worksheetUrlError: false,
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

  handleChangeWorksheetUrl = ({ target }) => {
    let worksheetUrl = target.value;
    let isAbsoluteWorksheetUrl = isAbsoluteUrl(worksheetUrl);

    if (isAbsoluteWorksheetUrl || worksheetUrl === "") {
      this.setState({ worksheetUrlError: false });
    } else {
      this.setState({ worksheetUrlError: true });
    }

    this.setState((state) => lodashSet(state, `draftSet.worksheet_url`, worksheetUrl));
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

  handleClickDelete = () => {
    const { setId, declareProgramSetsHaveChanged, history, program } = this.props;
    this.setState({ deleting: true });
    requestDeleteSet(setId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted assessment ${setId}`);
          this.setState({
            deleting: false,
            deletingError: false,
            setMissing: true,
            set: null,
            draftSet: null,
          });
          declareProgramSetsHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets`);
        } else {
          // Delete failed
          hgToast("An error occurred deleting assessment. " + errorSuffix(res), "error");
          this.setState({
            deleting: false,
            deletingError: true,
          });
        }
      }
    });
  };

  handleSubmit = (event) => {
    const { setId, declareProgramSetsHaveChanged } = this.props;
    const { draftSet } = this.state;
    event.preventDefault();

    this.setState({ saving: true });

    requestUpdateSet(setId, draftSet).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedSet = res.data.data;
          hgToast(`Updated assessment ${setId}!`);
          this.setState({
            set: updatedSet,
            draftSet: { ...updatedSet },
            saving: false,
            savingError: false,
          });
          declareProgramSetsHaveChanged();
        } else {
          // Update failed
          hgToast("An error occurred updating assessment", "error");
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

  populateSet() {
    const { programSets, setId } = this.props;

    let set = find(programSets, (s) => {
      return Number(setId) === Number(s.id);
    });

    if (set) {
      this.setState({
        set: set,
        draftSet: { ...set },
      });
    } else {
      this.setState({ setMissing: true });
    }
  }

  componentDidMount() {
    const { setId } = this.props;

    this.populateSet();
    generateTitle(`Assessment ${setId}`);
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  componentDidUpdate(prevProps) {
    const { setId: prevSetId } = prevProps;
    const { setId } = this.props;

    if (setId !== prevSetId) {
      this.populateSet();
    }

    generateTitle(`Assessment ${setId}`);
  }

  render() {
    const { classes, program, theme, setId } = this.props;
    const { set, draftSet, setMissing, saving, deleting, downloadUrlError, worksheetUrlError } =
      this.state;

    if (setMissing) {
      return (
        <React.Fragment>
          <p>
            <em>Assessment not found.</em>
          </p>
        </React.Fragment>
      );
    }
    if (isNil(draftSet)) {
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
        </Breadcrumbs>

        <h1>
          Assessment Detail (#
          {draftSet.id})
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
                      id="set_name"
                      value={draftSet.name || ""}
                      onChange={this.handleChange}
                      placeholder="New Assessment"
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
                      label="Worksheet URL"
                      name="worksheet_url"
                      id="set_worksheet_url"
                      value={draftSet.worksheet_url || ""}
                      onChange={this.handleChangeWorksheetUrl}
                      placeholder="https://www.healthiergeneration.org/media/x"
                      fullWidth
                      error={worksheetUrlError}
                      helperText={
                        worksheetUrlError
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
                    <FormLabel
                      style={{
                        fontSize: styleVars.txtFontSizeXs,
                        marginBottom: theme.spacing(0.25),
                      }}
                    >
                      Organization Type
                    </FormLabel>
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
                    <FormLabel
                      style={{
                        fontSize: styleVars.txtFontSizeXs,
                        marginBottom: theme.spacing(0.25),
                      }}
                    >
                      Description
                    </FormLabel>
                    <DraftEditor
                      keyProp={draftSet.id}
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
                    disabled={saving || deleting || downloadUrlError || worksheetUrlError}
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

            <Grid item xs={12} sm={3}>
              <Paper>
                <p className={classes.manageBlockText}>Manage content in this assessment:</p>
                <List>
                  <ListItem
                    button
                    component={Link}
                    to={`/app/admin/programs/${program.id}/sets/${set.id}/modules`}
                  >
                    <ListItemText primary={<p className={classes.manageBlockLinks}>Topics</p>} />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    className={classes.manageBlockLinks}
                    to={`/app/admin/programs/${program.id}/sets/${set.id}/questions`}
                  >
                    <ListItemText primary={<p className={classes.manageBlockLinks}>Questions</p>} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </form>

        {draftSet.restricted && (
          <React.Fragment>
            <Grid container spacing={Number(styleVars.gridSpacing)} className={classes.bottomGrid}>
              <Grid item xs={12}>
                <Paper style={{ padding: styleVars.paperPadding }}>
                  <h3>Associate Organizations</h3>
                  <RestrictedOrganizationsAdmin
                    setId={setId}
                    orgTypeId={draftSet.organization_type_id}
                    programId={program.id}
                  />
                </Paper>
              </Grid>
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  bottomGrid: {
    marginTop: theme.spacing(),
  },
  formLabel: {
    fontSize: styleVars.txtFontSizeXs,
  },
  manageBlockText: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  manageBlockLinks: {
    color: styleVars.colorPrimaryWithMoreContrast,
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
)(withStyles(styles, { withTheme: true })(ProgramSetDetail));
