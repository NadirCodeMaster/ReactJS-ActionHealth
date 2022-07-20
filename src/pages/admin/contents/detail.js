import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, isNil, find, set } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, FormLabel, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import generateTitle from "utils/generateTitle";
import errorSuffix from "utils/errorSuffix";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressForButtons from "components/ui/CircularProgressForButtons";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import DraftEditor from "components/ui/DraftEditor";
import Switch from "components/ui/SwitchWrapper";
import { requestUpdateContent } from "api/requests";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

class ContentDetail extends Component {
  static propTypes = {
    // Provided by caller
    // ------------------
    contentMachineName: PropTypes.string.isRequired,
    contents: PropTypes.array.isRequired,
    contentsHaveChanged: PropTypes.bool,
    // Provided by state
    // ------------------
    allowedHtml: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      contentMissing: false,
      content: null,
      draftContent: null,
      saving: false,
      savingError: false,
    };
  }

  componentDidMount() {
    const { contentsHaveChanged, refreshContents, contentMachineName } = this.props;

    this.populateContent();

    if (contentsHaveChanged) {
      refreshContents();
    }

    generateTitle(`Content ${contentMachineName}`);
  }

  componentDidUpdate(prevProps) {
    const { contentMachineName: prevContentMachineName } = prevProps;
    const { contentMachineName } = this.props;

    if (contentMachineName !== prevContentMachineName) {
      this.populateContent();
    }
    generateTitle(`Content ${contentMachineName}`);
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Populate content from contents array prop
   */
  populateContent() {
    const { contents, contentMachineName } = this.props;

    let content = find(contents, (c) => {
      return contentMachineName === c.machine_name;
    });

    if (content) {
      this.setState({
        content: content,
        draftContent: { ...content },
      });
    } else {
      this.setState({ contentMissing: true });
    }
  }

  /**
   * setState of draftContent text fields
   * @param {object} event
   */
  handleChange = ({ target }) => {
    this.setState((state) => set(state, `draftContent.${target.name}`, target.value));
  };

  /**
   * setState of draftContent for content
   * @param {obj} content
   */
  handleChangeContent = (content) => {
    this.setState({
      draftContent: {
        ...this.state.draftContent,
        content,
      },
    });
  };

  /**
   * setState of draftContent for published boolean
   * @param {object} event
   */
  handleSwitchChange = ({ target }) => {
    let cur = this.state.draftContent[target.name];
    this.setState((state) => set(state, `draftContent.${target.name}`, !cur));
  };

  /**
   * Updates content record on server and replaces
   * our content and draftContent objects in
   * component state.
   */
  sendContentChangesToServer = (successCallback, failureCallback) => {
    const { contentMachineName, declareContentsHaveChanged } = this.props;
    const { draftContent } = this.state;

    requestUpdateContent(contentMachineName, draftContent).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedContent = res.data.data;
          this.setState({
            content: updatedContent,
            draftContent: updatedContent,
          });
          if (successCallback) {
            successCallback();
          }
        } else {
          // Update failed
          if (failureCallback) {
            failureCallback(res);
          }
        }
        declareContentsHaveChanged();
      }
    });
  };

  handleSubmit = (event) => {
    const { contentMachineName } = this.props;

    event.preventDefault();

    this.setState({ saving: true });
    let contentChangesSuccessCallback = () => {
      hgToast(`Updated content ${contentMachineName}`);
      this.setState({
        saving: false,
        savingError: false,
      });
    };
    let contentChangesFailureCallback = (error) => {
      hgToast("An error occurred updating content. " + errorSuffix(error), "error");
      this.setState({
        saving: false,
        savingError: true,
      });
    };

    this.sendContentChangesToServer(contentChangesSuccessCallback, contentChangesFailureCallback);
  };

  render() {
    const { allowedHtml, classes } = this.props;
    const { content, contentMissing, draftContent, saving, deleting } = this.state;
    const allowedHtmlContents = get(allowedHtml, "contents.content", null);

    if (contentMissing) {
      return (
        <React.Fragment>
          <p>
            <em>Content not found.</em>
          </p>
        </React.Fragment>
      );
    }
    if (isNil(content)) {
      return <CircularProgressGlobal />;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/content" root>
            Content Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/content/${content.id}`}>{content.id}</Breadcrumb>
        </Breadcrumbs>

        <h1>Content Detail</h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <div className={classes.textFieldWrapper}>
                  <HgTextField
                    id="content_id"
                    label="ID"
                    defaultValue={content.id}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>

                <div className={classes.textFieldWrapper}>
                  <HgTextField
                    id="content_machine_name"
                    label="Machine name"
                    defaultValue={content.machine_name}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Name"
                      name="name"
                      id="content_name"
                      value={draftContent.name || ""}
                      onChange={this.handleChange}
                      fullWidth
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Internal Title"
                      name="internal_title"
                      id="content_internal_title"
                      value={draftContent.internal_title || ""}
                      onChange={this.handleChange}
                      fullWidth
                      required
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Internal Description"
                      name="internal_description"
                      id="content_internal_description"
                      value={draftContent.internal_description || ""}
                      onChange={this.handleChange}
                      fullWidth
                      multiline={true}
                      required
                      classes={{
                        root: classes.textFieldMultiLine,
                      }}
                    />
                  </FormControl>
                </div>

                <div className={classes.textFieldWrapperMulti}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Content</FormLabel>
                    <DraftEditor
                      keyProp={content.id}
                      onChange={this.handleChangeContent}
                      value={draftContent.content}
                      customToolbarHtml={allowedHtmlContents}
                    />
                  </FormControl>
                </div>

                <Switch
                  name={"published"}
                  label={"Published"}
                  value={"published"}
                  checked={draftContent.published}
                  handleChange={this.handleSwitchChange}
                />

                <div className={classes.saveButtonWrapper}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={saving || deleting}
                    type="submit"
                    fullWidth
                  >
                    Save{" "}
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
  textFieldWrapper: {
    margin: "1em 0",
  },
  formLabel: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.25),
    fontSize: styleVars.txtFontSizeXs,
  },
  saveButtonWrapper: {
    marginTop: theme.spacing(2),
  },
  textFieldMultiLine: {
    "& .MuiInputBase-root": {
      padding: 0,
      "& .MuiInput-inputMultiline": {
        padding: theme.spacing(1.5),
      },
    },
  },
});

export default compose(
  withRouter,
  connect(
    ({ app_meta, auth }) => ({
      allowedHtml: app_meta.data.allowedHtml,
    }),
    {}
  )
)(withStyles(styles, { withTheme: true })(ContentDetail));
