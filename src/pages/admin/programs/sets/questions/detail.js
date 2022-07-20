import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { find, values, isNil, set as lodashSet } from "lodash";
import HgTextField from "components/ui/HgTextField";
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Paper,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import HgSelect from "components/ui/HgSelect";
import { requestDeleteCriterionInstance, requestUpdateCriterionInstance } from "api/requests";
import DocQuestionCriterionRelationship from "components/ui/DocQuestionCriterionRelationship";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import generateTitle from "utils/generateTitle";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

// @TODO Add validation

class CriterionInstanceDetail extends Component {
  static propTypes = {
    criterionInstanceId: PropTypes.number.isRequired,
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

    this.state = {
      criterionInstance: null,
      draftCriterionInstance: null,
      criterionInstanceMissing: false,
      saving: false,
      savingError: false,
      deleting: false,
      deletingError: false,
    };
  }

  handleChange = ({ target }) => {
    this.setState((state) =>
      lodashSet(state, `draftCriterionInstance.${target.name}`, target.value)
    );
  };

  handleChangeSelect = (event) => {
    this.setState((state) => lodashSet(state, `draftCriterionInstance.module_id`, event.value));
  };

  handleClickDelete = () => {
    const { criterionInstanceId, declareSetCriterionInstancesHaveChanged, history, program, set } =
      this.props;
    this.setState({ deleting: true });
    requestDeleteCriterionInstance(criterionInstanceId).then((res) => {
      if (!this.isCancelled) {
        if (204 === res.status) {
          // Delete succeeded
          hgToast(`Deleted question ${criterionInstanceId}`);
          this.setState({
            deleting: false,
            deletingError: false,
            criterionInstanceMissing: true,
            criterionInstance: null,
            draftcriterionInstance: null,
          });
          declareSetCriterionInstancesHaveChanged();
          history.push(`/app/admin/programs/${program.id}/sets/${set.id}/questions`);
        } else {
          // Delete failed
          hgToast("An error occurred deleting question", "error");
          this.setState({
            deleting: false,
            deletingError: true,
          });
        }
      }
    });
  };

  handleSubmit = (event) => {
    const { criterionInstanceId, declareSetCriterionInstancesHaveChanged } = this.props;
    const { draftCriterionInstance } = this.state;
    event.preventDefault();

    this.setState({ saving: true });

    requestUpdateCriterionInstance(criterionInstanceId, draftCriterionInstance).then((res) => {
      if (!this.isCancelled) {
        if (200 === res.status) {
          // Update succeeded
          let updatedCriterionInstance = res.data.data;
          hgToast(`Updated question ${criterionInstanceId}`);
          this.setState({
            criterionInstance: updatedCriterionInstance,
            draftCriterionInstance: { ...updatedCriterionInstance },
            saving: false,
            savingError: false,
          });
          declareSetCriterionInstancesHaveChanged();
        } else {
          // Update failed
          hgToast("An error occurred updating question", "error");
          this.setState({
            saving: false,
            savingError: true,
          });
        }
      }
    });
  };

  /**
   * Initializes the component and its state based on new or updated props.
   */
  initComponentForProps() {
    const { setCriterionInstances, criterionInstanceId } = this.props;

    generateTitle(`Question ${criterionInstanceId}`);

    let ci = find(setCriterionInstances, (_ci) => {
      return Number(criterionInstanceId) === Number(_ci.id);
    });

    if (ci) {
      this.setState({
        criterionInstance: ci,
        draftCriterionInstance: { ...ci },
      });
    } else {
      this.setState({ criterionInstanceMissing: true });
    }
  }

  componentDidMount() {
    this.initComponentForProps();
  }

  componentDidUpdate(prevProps) {
    const { criterionInstanceId: prevCriterionInstanceId } = prevProps;
    const { criterionInstanceId } = this.props;
    if (criterionInstanceId !== prevCriterionInstanceId) {
      this.initComponentForProps();
    }
  }

  componentWillUnmount() {
    // https://stackoverflow.com/a/50429904/1191154
    this.isCancelled = true;
  }

  selectValues = () => {
    const { setModules } = this.props;
    let setModulesArr = values(setModules);

    return setModulesArr.map((setModule) => {
      return { value: setModule.id, label: setModule.name };
    });
  };

  render() {
    const { classes, criterionInstanceId, program, set } = this.props;
    const { draftCriterionInstance, criterionInstanceMissing, saving, deleting } = this.state;

    if (criterionInstanceMissing) {
      return (
        <p>
          <em>Question not found.</em>
        </p>
      );
    }

    if (isNil(draftCriterionInstance)) {
      return <CircularProgressGlobal />;
    }

    let criterion = draftCriterionInstance.criterion;

    let hasHandle = false;
    if (!isNil(draftCriterionInstance.handle) && draftCriterionInstance.handle.length > 0) {
      hasHandle = true;
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
          <Breadcrumb
            path={`/app/admin/programs/${program.id}/sets/${set.id}/questions/${criterionInstanceId}`}
          >
            {hasHandle && <React.Fragment>{draftCriterionInstance.handle}</React.Fragment>}
            {!hasHandle && <React.Fragment>{criterionInstanceId}</React.Fragment>}
          </Breadcrumb>
        </Breadcrumbs>

        <h1>
          Question Detail (#
          {draftCriterionInstance.id})
        </h1>

        <form onSubmit={this.handleSubmit}>
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={7}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <p>
                  Appears in set #{set.id}:{" "}
                  <Link to={`/app/admin/programs/${program.id}/sets/${set.id}`}>{set.name}</Link>
                </p>
                <p>
                  Represents criterion #{criterion.id}:{" "}
                  <Link to={`/app/admin/criteria/${criterion.id}`}>{criterion.name}</Link>
                </p>

                <div className={classes.formFieldWrapper}>
                  <Divider light />
                </div>

                <div className={classes.formFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.formLabel}>Topic *</FormLabel>
                    <HgSelect
                      placeholder="Topic"
                      aria-label="Topic"
                      name="module_id"
                      required={true}
                      options={this.selectValues()}
                      value={
                        this.selectValues().filter(
                          ({ value }) => value === draftCriterionInstance.module_id
                        ) || ""
                      }
                      onChange={this.handleChangeSelect}
                    />
                  </FormControl>
                </div>

                <div className={classes.formFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Handle"
                      name="handle"
                      id="criterion_instance_handle"
                      value={draftCriterionInstance.handle || 0}
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
                      value={draftCriterionInstance.weight || 0}
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
                </FormControl>

                <br />

                <Divider light />

                <FormControl fullWidth variant="standard">
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
    margin: theme.spacing(0, 0, 2, 0),
  },
});

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(CriterionInstanceDetail));
