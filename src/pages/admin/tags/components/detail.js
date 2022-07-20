import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { get, isEmpty, isNil, set } from "lodash";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import HgTextField from "components/ui/HgTextField";
import { Button, FormControl, Grid, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Checkbox from "components/ui/CheckboxWrapper";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import styleVars from "style/_vars.scss";

/*
 * Tag detail page for viewing a specific tag /app/tags/{id}
 */
class TagDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      draftTag: {},
      validTagSlug: false,
    };
    this.isCancelled = false;
  }

  static propTypes = {
    getTagRequest: PropTypes.func.isRequired,
    loadingTag: PropTypes.bool.isRequired,
    tag: PropTypes.object,
    tagId: PropTypes.number.isRequired,
    validateTagSlug: PropTypes.func.isRequired,
    tagResources: PropTypes.array.isRequired,
  };

  componentDidMount() {
    const { getTagRequest, tagId } = this.props;
    if (!isNaN(tagId)) {
      getTagRequest(tagId);
    }
    this.populateTag();

    generateTitle(`Tag ${tagId}`);
  }

  componentDidUpdate(prevProps) {
    const { tagId: prevTagId, loadingTag: prevLoadingTag } = prevProps;
    const { getTagRequest, loadingTag, tag, tagId, validateTagSlug } = this.props;

    // If page is changed to another detail page, update draftTag
    if (tagId !== prevTagId && !isNaN(tagId)) {
      this.populateTag();
      getTagRequest(tagId);
    }

    if (prevLoadingTag === true && loadingTag === false && !isNil(tag)) {
      this.setState({
        draftTag: { ...tag },
        validTagSlug: validateTagSlug(tag.slug || ""),
      });
    }

    generateTitle(`Tag ${tagId}`);
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Populate draftTag object from tag prop
   */
  populateTag() {
    const { loadingTag, tag, validateTagSlug } = this.props;

    if (!isNil(tag) && !loadingTag) {
      this.setState({
        draftTag: { ...tag },
        validTagSlug: validateTagSlug(tag.slug),
      });
    }
  }

  /**
   * call updateTag endpoint from props
   * @param {object} event
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { tagId, updateTag } = this.props;
    const { draftTag } = this.state;

    updateTag(tagId, draftTag);
  };

  /**
   * setState on draftTag for generic field change
   * @param {object} event
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

  render() {
    const { classes, deleteTag, deletingTag, loadingTag, tag, tagId, tagResources } = this.props;
    const { draftTag, validTagSlug } = this.state;

    if (!tag || loadingTag) {
      return <CircularProgressGlobal />;
    }

    let disabledSave = !validTagSlug || loadingTag || !draftTag.name || !draftTag.slug;
    let hasTagResources = !isEmpty(tagResources);
    let isInternal = get(draftTag, "internal", false);

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/tags" root>
            Tag Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/tags/${tagId}`}>{tag.name}</Breadcrumb>
        </Breadcrumbs>

        <h1>Tag Detail</h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                {/* Name */}
                <FormControl fullWidth variant="standard">
                  <div className={classes.tagTextField}>
                    <HgTextField
                      placeholder="Name"
                      label="Name"
                      name="name"
                      id="tag_name"
                      value={draftTag.name || ""}
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
                      value={draftTag.slug || ""}
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
              <div className={classes.tagActions}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.tagButton}
                  type="submit"
                  fullWidth
                  disabled={disabledSave}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (window.confirm("Are you sure?")) {
                      deleteTag(tagId);
                    }
                  }}
                  className={classes.tagButton}
                  disabled={deletingTag}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>

        {hasTagResources && (
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <h3>Associated Resources</h3>
                <ul>
                  {tagResources.map((tr) => (
                    <li key={`tag_resource_${tr.id}`}>
                      <Link to={`/app/admin/resources/${tr.id}`}>{tr.name}</Link>
                    </li>
                  ))}
                </ul>
              </Paper>
            </Grid>
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  tagActions: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  tagButton: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  tagTextField: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  tagTextFieldEnd: {
    margin: theme.spacing(0, 0, 0, 0),
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(TagDetail));
