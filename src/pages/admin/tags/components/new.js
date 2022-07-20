import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import PropTypes from "prop-types";
import { get, set } from "lodash";
import HgTextField from "components/ui/HgTextField";
import { Button, CircularProgress, FormControl, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Checkbox from "components/ui/CheckboxWrapper";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

class TagsNew extends Component {
  static propTypes = {
    createTag: PropTypes.func.isRequired,
    validateTagSlug: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;

    this.state = {
      // initial state of new tag fields
      draftTag: {
        name: "",
        slug: "",
        internal: false,
      },
      saving: false,
      savingError: false,
      validTagSlug: false,
    };
  }

  componentDidMount() {
    generateTitle("New Tag");
  }

  componentDidUpdate() {
    generateTitle("New Tag");
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * setState on draftTag for generic field change
   * @param {object} selectedOption
   */
  handleChange = ({ target }) => {
    const { validateTagSlug } = this.props;

    if (target.name === "slug") {
      this.setState({
        validTagSlug: validateTagSlug(target.value),
      });
    }

    this.setState((state) => set(state, `draftTag.${target.name}`, target.value));
  };

  /**
   * setState on draftTag for internal tag change
   * @param {object} target
   */
  handleChangeCheckbox = ({ target }) => {
    this.setState((state) => set(state, `draftTag.internal`, target.checked));
  };

  /**
   * create tag from endpoint passed in props
   * @param {object} event
   */
  handleSubmit = (e) => {
    const { createTag } = this.props;
    const { draftTag } = this.state;

    e.preventDefault();

    createTag(draftTag);
  };

  /**
   * Set required that are required enabling save button
   */
  disableSave = () => {
    const { draftTag, saving, validTagSlug } = this.state;

    if (draftTag.name && draftTag.slug && !saving && validTagSlug) {
      return false;
    }

    return true;
  };

  render() {
    const { classes } = this.props;
    const { draftTag, saving, validTagSlug } = this.state;

    let isInternal = get(draftTag, "internal", false);

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/tags" root>
            Tag Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/tags/new`}>New</Breadcrumb>
        </Breadcrumbs>
        <h1>New Tag</h1>
        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                {/* Name */}
                <FormControl fullWidth variant="standard">
                  <div className={classes.tagTextField}>
                    <HgTextField
                      placeholder="New Tag"
                      label="Name"
                      name="name"
                      id="tag_name"
                      value={draftTag.name}
                      onChange={this.handleChange}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.tagTextField}>
                    <HgTextField
                      placeholder="slug"
                      label="Slug"
                      name="slug"
                      id="slug"
                      value={draftTag.slug}
                      onChange={this.handleChange}
                      error={!validTagSlug}
                      helperText={"Only lowercase and dashses (EX: valid-slug)"}
                      fullWidth
                      required
                    />
                  </div>
                  <div className={classes.tagTextFieldEnd}>
                    <Checkbox
                      name={"isInternal"}
                      value={"isInternal"}
                      label={"Is internal"}
                      checked={isInternal}
                      handleChange={this.handleChangeCheckbox}
                    />
                  </div>
                </FormControl>
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
  tagTextField: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  tagTextFieldEnd: {
    margin: theme.spacing(0, 0, 0, 0),
  },
});

const mapStateToProps = (state) => {
  return {
    tagTypes: state.app_meta.data.tagTypes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(TagsNew));
