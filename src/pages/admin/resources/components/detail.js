import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { find, get, forEach, isEmpty, isNil, set } from "lodash";
import HgSelect from "components/ui/HgSelect";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import moment from "moment";
import HgTextField from "components/ui/HgTextField";
import HgAlert from "components/ui/HgAlert";
import { DatePicker, TimePicker } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Paper,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Checkbox from "components/ui/CheckboxWrapper";
import CircularProgressGlobal from "components/ui/CircularProgressGlobal";
import DraftEditor from "components/ui/DraftEditor";
import RadioGroupBuilder from "components/ui/RadioGroupBuilder";
import Switch from "components/ui/SwitchWrapper";
import AssociatedItems from "./AssociatedItems";
import ResourceTranslationGroup from "./ResourceTranslationGroup";
import generateTitle from "utils/generateTitle";
import isResourceDetailUrl from "utils/isResourceDetailUrl";
import formatBytes from "utils/formatBytes";
import AssociatedCriterionCustomDisplay from "./AssociatedCriterionCustomDisplay";
import AssociatedTagCustomDisplay from "./AssociatedTagCustomDisplay";
import AssociatedUserFunctionCustomDisplay from "./AssociatedUserFunctionCustomDisplay";
import resourceDefaultBackgroundImage from "images/resource_preview_pending.svg";

import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/*
 * Resource detail page for viewing/updating a specific resource
 */
class ResourceDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      draftResource: {},
      hour: null,
      minute: null,
      validResourceUrl: false,
      populateDraftEditor: false,
      tagSearchParam: "name",
    };

    this.isCancelled = false;
    this.initialLoading = true;
  }

  static propTypes = {
    createResourceFile: PropTypes.func.isRequired,
    getResourceRequest: PropTypes.func.isRequired,
    loadingResource: PropTypes.bool.isRequired,
    resource: PropTypes.object,
    resourceId: PropTypes.number.isRequired,
    tags: PropTypes.array.isRequired,
    tagsLoading: PropTypes.bool.isRequired,
    tagsNeedRefresh: PropTypes.bool.isRequired,
    tagsAreRefreshed: PropTypes.func.isRequired,
    criteria: PropTypes.array.isRequired,
    criteriaLoading: PropTypes.bool.isRequired,
    criteriaNeedRefresh: PropTypes.bool.isRequired,
    criteriaAreRefreshed: PropTypes.func.isRequired,
    getResourceTypeAllowedExt: PropTypes.func.isRequired,
    getResourceTypeMachineName: PropTypes.func.isRequired,
    getResourceTypeName: PropTypes.func.isRequired,
    getResourceTagsRequest: PropTypes.func.isRequired,
    getTagsRequest: PropTypes.func.isRequired,
    linkResourceTagsRequest: PropTypes.func.isRequired,
    unlinkResourceTagsRequest: PropTypes.func.isRequired,
    getResourceCriteriaRequest: PropTypes.func.isRequired,
    getCriteriaRequest: PropTypes.func.isRequired,
    linkResourceCriteriaRequest: PropTypes.func.isRequired,
    unlinkResourceCriteriaRequest: PropTypes.func.isRequired,
    validateResourceUrl: PropTypes.func.isRequired,
    relatedResourcesLoading: PropTypes.bool.isRequired,
    userFunctions: PropTypes.array.isRequired,
    searchedUserFunctions: PropTypes.array.isRequired,
    searchingUserFunctions: PropTypes.bool.isRequired,
    userFunctionsLoading: PropTypes.bool.isRequired,
    userFunctionsNeedRefresh: PropTypes.bool.isRequired,
    userFunctionsAreRefreshed: PropTypes.func.isRequired,
    getUserFunctionsRequest: PropTypes.func.isRequired,
    getResourceUserFunctionsRequest: PropTypes.func.isRequired,
    linkUserFunctionsRequest: PropTypes.func.isRequired,
    unlinkUserFunctionsRequest: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { getResourceRequest, resourceId } = this.props;

    if (!isNaN(resourceId)) {
      getResourceRequest(resourceId);
    }

    this.populateResource();

    generateTitle(`Resource ${resourceId}`);
  }

  componentDidUpdate(prevProps) {
    const { resourceId: prevResourceId, loadingResource: prevLoadingResource } = prevProps;
    const { getResourceRequest, resource, resourceId, loadingResource, validateResourceUrl } =
      this.props;

    // If page is changed to another detail page, update draftResource
    if (resourceId !== prevResourceId && !isNaN(resourceId)) {
      this.populateResource();
      getResourceRequest(resourceId);
    }

    // Once resource request is complete with resource data, populate draftResource
    if (prevLoadingResource === true && loadingResource === false && !isNil(resource)) {
      this.initialLoading = false;
      this.setState({
        draftResource: { ...resource },
        validResourceUrl: validateResourceUrl(resource.url || ""),
        populateDraftEditor: true,
      });
    }

    generateTitle(`Resource ${resourceId}`);
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Populate draftResource object from resource prop
   */
  populateResource() {
    const { loadingResource, resource } = this.props;

    if (!isNil(resource) && !loadingResource) {
      this.setState({
        draftResource: { ...resource },
      });
    }
  }

  /**
   * get resource training type object from props object given id
   * @param {number} id
   * @return {object} resourceTrainingTypeObject
   */
  getResourceTrainingType = (id) => {
    const { resourceTrainingTypes } = this.props;

    return find(resourceTrainingTypes, { id });
  };

  /**
   * setState on draftResource for generic field change
   * @param {object} selectedOption
   */
  handleChange = ({ target }) => {
    const { validateResourceUrl } = this.props;

    if (target.name === "url") {
      this.setState({
        validResourceUrl: validateResourceUrl(target.value),
      });
    }

    this.setState((state) => set(state, `draftResource.${target.name}`, target.value));
  };

  /**
   * setState on draftResource for generic field change
   * @param {object} selectedOption
   */
  handleChangeDuration = ({ target }) => {
    const { draftResource } = this.state;

    let durationDraft = get(draftResource, "duration", null);
    let duration, durationArray;

    if (!isNil(durationDraft)) {
      durationArray = durationDraft.split(":");
      if (target.name === "hour") {
        durationArray = [target.value, durationArray[1]];
      }
      if (target.name === "minute") {
        durationArray = [durationArray[0], target.value];
      }
    }

    if (isNil(durationDraft)) {
      if (target.name === "hour") {
        durationArray = [target.value, 0];
      }
      if (target.name === "minute") {
        durationArray = [0, target.value];
      }
    }

    duration = durationArray.join(":");

    this.setState((state) => set(state, `draftResource.duration`, duration));
  };

  /**
   * setState on draftResource for training isRecorded checkbox field change
   * @param {object} target
   */
  handleChangeCheckbox = ({ target }) => {
    this.setState((state) => set(state, `draftResource.is_recorded`, target.checked));
  };

  /**
   * formData creation for uploading file
   * @param {string} fieldName
   * @param {object} event
   */
  handleInputChange = (fieldName, { target }) => {
    const { createResourceFile, getResourceTypeAllowedExt, resource, resourceId } = this.props;

    let file = get(target, "files[0]", "");
    let fileSize = get(file, "size", "");
    let guidanceFileLimit = formatBytes(process.env.REACT_APP_MAX_UPLOAD_BYTES_GUIDANCE, 2);

    // Limit file size to 4.25mb or less
    if (fileSize && fileSize > process.env.REACT_APP_MAX_UPLOAD_BYTES_ACTUAL) {
      hgToast(`File is too large, must be smaller than ${guidanceFileLimit}`, "error");
      return;
    }

    let allowedFileTypes = "jpeg,png,jpg,gif,svg";

    if (fieldName === "file_id") {
      allowedFileTypes = getResourceTypeAllowedExt(resource.resource_type_id);
    }

    let formData = new FormData();
    formData.append("resource_file", file);
    formData.append("file_types", allowedFileTypes);

    createResourceFile(formData, fieldName, resourceId);
  };

  /**
   * setState on draftCriterion for response_structure_id
   * @param {object} selectedOption
   */
  handleSelectChange = (selectedOption) => {
    const { languages } = this.props;

    this.setState({
      draftResource: {
        ...this.state.draftResource,
        language_id: languages[selectedOption.value].id.toString(),
      },
    });
  };

  resourceLanguageSelectValue = () => {
    const { draftResource } = this.state;

    return this.resourceLanguageOptions().filter(({ value }) => {
      return value === get(draftResource, "language_id", null);
    });
  };

  resourceLanguageOptions = () => {
    const { resource, languages } = this.props;
    let allowedResourceLanguageOptions = [];

    forEach(languages, (language) => {
      if (!(language.id in resource.translations)) {
        allowedResourceLanguageOptions.push({
          value: language.id,
          label: language.exonym,
        });
      }
    });

    return allowedResourceLanguageOptions;
  };

  /**
   * setState for tagSearchParam radio buttons
   * @param {object} e
   */
  handleChangeRadio = (e) => {
    this.setState({
      tagSearchParam: e.target.value,
    });
  };

  /**
   * setState of draftContent for content
   * @param {obj} content
   */
  handleChangeContent = (content) => {
    this.setState({
      draftResource: {
        ...this.state.draftResource,
        content,
      },
    });
  };

  /**
   * setState of draftContent for date picker
   * @param {obj} event
   * @param {obj} field
   */
  handleChangeDate = (event, field) => {
    const { draftResource } = this.state;

    if (!moment(event).isValid()) {
      this.setState({
        invalidField: true,
      });
    }

    if (moment(event).isValid() || isNil(event)) {
      let startTime = get(draftResource, "start_time", null);

      if (!isNil(startTime)) {
        let startTimeArray = startTime.split(" ");
        if (field === "date") {
          startTimeArray = [moment(event).format("YYYY-MM-DD"), startTimeArray[1]];
        }

        if (field === "time") {
          startTimeArray = [startTimeArray[0], moment(event).format("HH:mm:ss")];
        }

        startTime = startTimeArray.join(" ");
      }

      if (isNil(startTime)) {
        if (field === "date") {
          startTime = moment(event).format("YYYY-MM-DD");
          startTime += " 00:00:00";
        }

        if (field === "time") {
          startTime = moment(event).format("HH:mm");
          // no need to qualify to seconds
          startTime += ":00";
        }
      }

      this.setState({
        draftResource: {
          ...this.state.draftResource,
          start_time: startTime,
        },
        invalidField: false,
      });
    }
  };

  /**
   * setState of draftResource for published boolean
   * @param {object} event
   */
  handleSwitchChange = ({ target }) => {
    let cur = this.state.draftResource[target.name];
    this.setState((state) => set(state, `draftResource.${target.name}`, !cur));
  };

  /**
   * removes file from resource
   * @param {string} resourceKey
   * @param {string} resourceFieldName
   * @param {object} event
   */
  handleRemoveFile = (resourceKey, resourceFieldName, e) => {
    const { resourceId, updateResource } = this.props;
    const { draftResource } = this.state;
    let absentCriticalField = "";

    if (draftResource.published) {
      absentCriticalField = resourceFieldName;
    }

    updateResource(resourceId, { [resourceKey]: 0, published: false }, absentCriticalField);
  };

  /**
   * call updateResource endpoint from props
   * @param {object} event
   */
  handleSubmit = (e) => {
    e.preventDefault();
    const { resourceId, updateResource } = this.props;
    const { draftResource } = this.state;

    updateResource(resourceId, draftResource);
  };

  resourceTextFieldConditional = (isFileResourceType) => {
    const { classes } = this.props;

    if (!isFileResourceType) {
      return classes.resourceTextField;
    }

    return classes.resourceTextFieldAboveMulti;
  };

  disableButton = () => {
    const { saving, deletingResource, loadingResource } = this.props;
    const { invalidField } = this.state;

    return (
      saving ||
      deletingResource ||
      loadingResource ||
      invalidField ||
      !this.isRequiredResourceFilePopulated()
    );
  };

  /**
   * If file based resource, is file field populated
   * @returns {boolean}
   */
  isRequiredResourceFilePopulated = () => {
    const { getResourceTypeMachineName, resource } = this.props;
    let resourceTypeMachineName = getResourceTypeMachineName(resource.resource_type_id);
    let isFileResourceType =
      resourceTypeMachineName === "document" || resourceTypeMachineName === "image";

    // Return true if resource is not a file based resource
    // OR if the resource file field is populated
    if (!isFileResourceType || !isNil(resource.file_id)) {
      return true;
    }

    return false;
  };

  render() {
    const {
      classes,
      linkRelatedResourceRequest,
      unlinkRelatedResourceRequest,
      getRelatedResourcesRequest,
      deleteResource,
      deletingResource,
      loadingResource,
      saving,
      getResourceTypeName,
      getResourceTypeMachineName,
      getResourceTypeAllowedExt,
      resource,
      resourceId,
      tags,
      tagsLoading,
      tagsNeedRefresh,
      tagsAreRefreshed,
      getResourceTagsRequest,
      getTagsRequest,
      searchedTags,
      searchingTags,
      linkResourceTagsRequest,
      unlinkResourceTagsRequest,
      criteria,
      criteriaLoading,
      criteriaNeedRefresh,
      criteriaAreRefreshed,
      searchedCriteria,
      searchingCriteria,
      getCriteriaRequest,
      getResourceCriteriaRequest,
      linkResourceCriteriaRequest,
      unlinkResourceCriteriaRequest,
      userFunctions,
      userFunctionsLoading,
      userFunctionsNeedRefresh,
      userFunctionsAreRefreshed,
      searchedUserFunctions,
      searchingUserFunctions,
      getUserFunctionsRequest,
      getResourceUserFunctionsRequest,
      linkUserFunctionsRequest,
      unlinkUserFunctionsRequest,
      theme,
      getResourcesRequest,
      resources,
      resourcesLoading,
      updateResource,
      populateTranslationGroupResource,
      translationGroupResource,
      relatedResources,
      relatedAreRefreshed,
      relatedNeedRefresh,
      relatedResourcesLoading,
    } = this.props;
    const { draftResource, populateDraftEditor, validResourceUrl, tagSearchParam } = this.state;

    if (this.initialLoading) {
      return <CircularProgressGlobal />;
    }

    if (!resource) {
      if (loadingResource) {
        return <CircularProgressGlobal />;
      }
      return <div>No Resource information available</div>;
    }

    let resourceTypeMachineName = getResourceTypeMachineName(resource.resource_type_id);
    let resourceTypeName = getResourceTypeName(resource.resource_type_id);
    let allowedFileTypes = getResourceTypeAllowedExt(resource.resource_type_id);
    let featureMediaFileName = get(resource, "feature_media.upload_name", "");
    let resourceFileName = get(resource, "file.upload_name", "");
    let resourceImage = get(resource, "feature_media.thumbnail", "");
    let urlHelperText = "Must be an absolute URL";
    if (resourceTypeMachineName === "video") {
      urlHelperText += " (ex: https://example.com/my-page)";
    }
    let validResourceUrlSubmit = true;
    if (
      resourceTypeMachineName === "video" ||
      resourceTypeMachineName === "training" ||
      resourceTypeMachineName === "web_page"
    ) {
      validResourceUrlSubmit = validResourceUrl;
    }
    let hour, minute;
    let durationString = get(draftResource, "duration", null);
    if (!isNil(durationString)) {
      let durationArray = durationString.split(":");
      hour = durationArray[0];
      minute = durationArray[1];
    }
    let date;
    let dateTimeString = get(draftResource, "start_time", null);
    if (!isNil(dateTimeString)) {
      let dateTimeArray = dateTimeString.split(" ");
      date = dateTimeArray[0];
    }
    let disableTimePicker = true;
    if (date) {
      disableTimePicker = false;
    }
    let isFileResourceType =
      resourceTypeMachineName === "document" || resourceTypeMachineName === "image";
    let isRecorded = get(draftResource, "is_recorded", false);
    let trainingTypeId = get(draftResource, "training_type_id", null);
    let trainingTypeMachineName = get(
      this.getResourceTrainingType(trainingTypeId),
      "machine_name",
      null
    );
    let trainingTypeName = get(this.getResourceTrainingType(trainingTypeId), "name", "");
    if (!isEmpty(trainingTypeName)) {
      resourceTypeName += " - " + trainingTypeName;
    }

    return (
      <React.Fragment>
        <Breadcrumbs>
          <Breadcrumb path="/app/admin/resources" root>
            Resource Management
          </Breadcrumb>
          <Breadcrumb path={`/app/admin/resources/${resourceId}`}>{resource.name}</Breadcrumb>
        </Breadcrumbs>

        <h1>Resource Detail</h1>

        <form onSubmit={this.handleSubmit} encType="multipart/form-data">
          <Grid container spacing={Number(styleVars.gridSpacing)}>
            <Grid item xs={12} sm={8}>
              <Paper style={{ padding: styleVars.paperPadding }}>
                <h3>Type: {resourceTypeName}</h3>

                {/* Name */}
                <Box sx={sxFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      placeholder="Name"
                      label="Name"
                      name="name"
                      id="resource_name"
                      value={draftResource.name || ""}
                      onChange={this.handleChange}
                      fullWidth
                      required
                    />
                  </FormControl>
                </Box>

                {/* Summary */}
                <Box sx={sxFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      placeholder="Summary"
                      label="Summary"
                      name="summary"
                      id="summary"
                      value={draftResource.summary || ""}
                      onChange={this.handleChange}
                      multiline
                      classes={{
                        root: classes.textFieldMultiLine,
                      }}
                    />
                  </FormControl>
                </Box>

                {/* Content */}
                <Box sx={sxFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel
                      style={{ marginBottom: theme.spacing(0.25) }}
                      className={classes.resourceLabel}
                    >
                      Content
                    </FormLabel>
                    {populateDraftEditor && (
                      <DraftEditor
                        keyProp={`resource_content_${resource.id}`}
                        onChange={this.handleChangeContent}
                        value={draftResource.content}
                      />
                    )}
                  </FormControl>
                </Box>

                {/* Languages */}
                <Box sx={sxFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <FormLabel className={classes.resourceLabelSelect}>Language *</FormLabel>
                    <div className={classes.selectWrapper}>
                      <HgSelect
                        styles={{
                          menu: (provided) => ({ ...provided, zIndex: 9999 }),
                        }}
                        placeholder="Select Language"
                        name="resource_types"
                        isMulti={false}
                        options={this.resourceLanguageOptions()}
                        onChange={this.handleSelectChange}
                        aria-label="Select Language"
                        value={this.resourceLanguageSelectValue()}
                      />
                    </div>
                  </FormControl>
                </Box>

                {/* Language Group */}
                <Box sx={sxFauxFieldset}>
                  <ResourceTranslationGroup
                    resource={resource}
                    resources={resources}
                    resourcesLoading={resourcesLoading}
                    getResourcesRequest={getResourcesRequest}
                    updateResource={updateResource}
                    populateTranslationGroupResource={populateTranslationGroupResource}
                    translationGroupResource={translationGroupResource}
                  />
                </Box>

                {/* Training Type */}
                {resourceTypeMachineName === "training" && trainingTypeMachineName === "event" && (
                  <div className={classes.resourceTrainingTypeWrapper}>
                    <Checkbox
                      name={"isRecorded"}
                      value={"isRecorded"}
                      label={"Is recorded"}
                      checked={isRecorded}
                      handleChange={this.handleChangeCheckbox}
                    />

                    <Box sx={sxFauxFieldset}>
                      <Box key={`resource_date`}>
                        <Box sx={sxFieldWrapper}>
                          {/* @see https://mui.com/components/date-picker/ */}
                          <DatePicker
                            label="Training date"
                            inputFormat="MM/DD/YYYY"
                            placeholder="MM/DD/YYYY"
                            id={`resource_date`}
                            value={date ? date : null}
                            onChange={(e) => this.handleChangeDate(e, "date")}
                            renderInput={(params) => <HgTextField required {...params} />}
                          />
                        </Box>

                        <Box sx={sxFieldWrapper}>
                          <TimePicker
                            ampm={false}
                            id={`resource_time`}
                            label={`Training start time, in ET (24h)`}
                            value={dateTimeString ? dateTimeString : null}
                            onChange={(e) => this.handleChangeDate(e, "time")}
                            renderInput={(params) => (
                              <HgTextField required disabled={disableTimePicker} {...params} />
                            )}
                          />
                        </Box>
                      </Box>

                      <Box sx={sxFieldWrapper}>
                        <p>
                          <small>Duration</small>
                        </p>
                        <HgTextField
                          className={classes.durationHour}
                          placeholder="Hr"
                          label="Hr"
                          name="hour"
                          id="resource_hour"
                          value={hour || ""}
                          onChange={this.handleChangeDuration}
                          required
                          type="number"
                          inputProps={{ min: "0" }}
                        />
                        <HgTextField
                          className={classes.durationMinute}
                          placeholder="Min"
                          label="Min"
                          name="minute"
                          id="resource_minute"
                          value={minute || ""}
                          onChange={this.handleChangeDuration}
                          required
                          type="number"
                          inputProps={{ min: "0" }}
                        />
                      </Box>
                    </Box>
                  </div>
                )}

                {/* Weight */}
                <Box sx={sxFieldWrapper}>
                  <FormControl fullWidth variant="standard">
                    <HgTextField
                      label="Sorting Weight"
                      name="weight"
                      id="weight"
                      value={draftResource.weight || ""}
                      onChange={this.handleChange}
                      placeholder="0"
                      type="number"
                      fullWidth
                    />
                  </FormControl>
                </Box>

                {/* URL */}
                {!isFileResourceType && (
                  <Box sx={sxFieldWrapper}>
                    <FormControl fullWidth variant="standard">
                      <HgTextField
                        placeholder="URL"
                        label="URL"
                        name="url"
                        id="resource_url"
                        value={draftResource.url || ""}
                        onChange={this.handleChange}
                        fullWidth
                        required
                        error={!validResourceUrl}
                        helperText={urlHelperText}
                        FormHelperTextProps={{
                          classes: {
                            root: classes.resourceHelperTextRoot,
                          },
                        }}
                      />
                    </FormControl>
                  </Box>
                )}

                {/* Feature Media File Upload */}
                <Box sx={sxFieldWrapper}>
                  <FormLabel className={classes.resourceLabel}>
                    <span>Featured Media File </span>
                    <span className={classes.fileLimitText}>
                      ({formatBytes(process.env.REACT_APP_MAX_UPLOAD_BYTES_GUIDANCE, 2)} limit)
                    </span>
                  </FormLabel>
                  <div className={classes.resourceFile}>
                    {featureMediaFileName ? (
                      <React.Fragment>
                        <div>{featureMediaFileName}</div>

                        <img
                          src={resourceImage || resourceDefaultBackgroundImage}
                          className={classes.resourceImage}
                          alt=""
                        />
                        <div>
                          <Button
                            size="small"
                            component="span"
                            variant="contained"
                            color="primary"
                            disabled={saving || deletingResource || loadingResource}
                            onClick={(e) =>
                              this.handleRemoveFile("feature_media_id", "Feature Media File", e)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>No file selected</React.Fragment>
                    )}
                  </div>
                  {!featureMediaFileName && (
                    <React.Fragment>
                      <input
                        accept="jpeg,png,jpg,gif,svg"
                        className={classes.input}
                        id="feature-media"
                        type="file"
                        hidden
                        onChange={(e) => this.handleInputChange("feature_media_id", e)}
                      />
                      <div>
                        <label htmlFor="feature-media">
                          <Button
                            size="small"
                            component="span"
                            variant="contained"
                            color="secondary"
                            disabled={saving || deletingResource || loadingResource}
                          >
                            Upload Featured Media
                          </Button>
                        </label>
                      </div>
                    </React.Fragment>
                  )}
                </Box>

                {/* Resource File Upload */}
                {isFileResourceType && (
                  <Box sx={sxFieldWrapper}>
                    <FormLabel className={classes.resourceLabel}>
                      <span>Resource File *</span>
                      <span className={classes.fileLimitText}>
                        ({formatBytes(process.env.REACT_APP_MAX_UPLOAD_BYTES_GUIDANCE, 2)} limit)
                      </span>
                    </FormLabel>
                    <div className={classes.resourceFile}>
                      {resourceFileName ? (
                        <React.Fragment>
                          <a rel="noopener noreferrer" href={resource.url} target="_blank" download>
                            {resourceFileName}
                          </a>
                          <br />
                          <Button
                            size="small"
                            component="span"
                            variant="contained"
                            color="primary"
                            className={classes.uploadButton}
                            disabled={saving || deletingResource || loadingResource}
                            onClick={(e) => this.handleRemoveFile("file_id", "Resource File", e)}
                          >
                            Remove
                          </Button>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>No file selected</React.Fragment>
                      )}
                    </div>
                    {!resourceFileName && (
                      <React.Fragment>
                        <input
                          accept={allowedFileTypes}
                          className={classes.input}
                          id="resource-file"
                          type="file"
                          hidden
                          onChange={(e) => this.handleInputChange("file_id", e)}
                        />
                        <div>
                          <label htmlFor="resource-file">
                            <Button
                              size="small"
                              component="span"
                              variant="contained"
                              color="secondary"
                              className={classes.uploadButton}
                              disabled={saving || deletingResource || loadingResource}
                            >
                              Upload File
                            </Button>
                          </label>
                        </div>
                      </React.Fragment>
                    )}
                  </Box>
                )}

                {!this.isRequiredResourceFilePopulated() && (
                  <div>
                    <HgAlert
                      includeIcon={true}
                      message={
                        "The resource cannot be published until the required file field is populated"
                      }
                      severity="info"
                    />
                  </div>
                )}

                <Box sx={sxFieldWrapper}>
                  {/* Published */}
                  <Switch
                    name={"published"}
                    value={"published"}
                    label={"Published"}
                    checked={draftResource.published || false}
                    handleChange={this.handleSwitchChange}
                  />
                  {/* Direct Download */}
                  {resourceTypeMachineName !== "video" && (
                    <Switch
                      name={"direct_download"}
                      value={"direct_download"}
                      label={"Direct Download"}
                      checked={draftResource.direct_download || false}
                      handleChange={this.handleSwitchChange}
                    />
                  )}
                  {/* Restricted */}
                  <Switch
                    name={"restricted"}
                    value={"restricted"}
                    label={"Restricted"}
                    checked={draftResource.restricted || false}
                    handleChange={this.handleSwitchChange}
                  />
                  {/* Soft Gate */}
                  <Switch
                    name={"soft_gate"}
                    value={"soft_gate"}
                    label={"Soft Gate"}
                    checked={draftResource.soft_gate || false}
                    handleChange={this.handleSwitchChange}
                  />
                </Box>

                <Box sx={sxFieldWrapper}>
                  {isResourceDetailUrl(resource.link_url) ? (
                    <Link to={`/app/resources/${resource.id}`} target="_blank">
                      View this resource &raquo;
                    </Link>
                  ) : (
                    <a href={resource.link_url} rel="noopener noreferrer" target="_blank">
                      View this resource &raquo;
                    </a>
                  )}
                </Box>
              </Paper>

              {/* Save Button */}
              <div className={classes.resourceActions}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.resourceButton}
                  type="submit"
                  fullWidth
                  disabled={this.disableButton() || !validResourceUrlSubmit}
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
                      deleteResource(resourceId);
                    }
                  }}
                  className={classes.resourceButton}
                  disabled={saving || deletingResource || loadingResource}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Divider className={classes.resourceDivider} />
          </Grid>
        </Grid>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper
              style={{
                marginBottom: theme.spacing(2),
                padding: styleVars.paperPadding,
              }}
            >
              <h3>Related Resources</h3>
              <AssociatedItems
                resourceId={resourceId}
                items={relatedResources}
                itemsLoading={relatedResourcesLoading}
                itemsNeedRefresh={relatedNeedRefresh}
                itemsAreRefreshed={relatedAreRefreshed}
                searchedItems={resources}
                searchingItems={resourcesLoading}
                getItemsRequest={getResourcesRequest}
                getResourceItemsRequest={getRelatedResourcesRequest}
                linkResourceItemsRequest={linkRelatedResourceRequest}
                unlinkResourceItemsRequest={unlinkRelatedResourceRequest}
                customDisplayComponent={AssociatedTagCustomDisplay}
                searchBarDisplay={"Search for Resources to associate"}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper
              style={{
                marginBottom: theme.spacing(2),
                padding: styleVars.paperPadding,
              }}
            >
              <h3>Tags</h3>
              <AssociatedItems
                resourceId={resourceId}
                items={tags}
                itemsLoading={tagsLoading}
                itemsNeedRefresh={tagsNeedRefresh}
                itemsAreRefreshed={tagsAreRefreshed}
                searchedItems={searchedTags}
                searchingItems={searchingTags}
                getItemsRequest={getTagsRequest}
                getResourceItemsRequest={getResourceTagsRequest}
                linkResourceItemsRequest={linkResourceTagsRequest}
                unlinkResourceItemsRequest={unlinkResourceTagsRequest}
                customDisplayComponent={AssociatedTagCustomDisplay}
                searchBarDisplay={"Search for Tags to associate with this resource"}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper
              style={{
                padding: styleVars.paperPadding,
                marginBottom: theme.spacing(2),
              }}
            >
              <h3>Criteria</h3>

              <RadioGroupBuilder
                handleChange={this.handleChangeRadio}
                groupValue={tagSearchParam}
                groupName={"tag-search-parameter"}
                radios={[
                  {
                    value: "name",
                    label: "Name",
                  },
                  {
                    value: "criterion_instance_handle",
                    label: "Criterion Instance Handle",
                  },
                ]}
              />

              <AssociatedItems
                resourceId={resourceId}
                items={criteria}
                itemsLoading={criteriaLoading}
                itemsNeedRefresh={criteriaNeedRefresh}
                itemsAreRefreshed={criteriaAreRefreshed}
                searchedItems={searchedCriteria}
                searchingItems={searchingCriteria}
                getItemsRequest={getCriteriaRequest}
                getResourceItemsRequest={getResourceCriteriaRequest}
                linkResourceItemsRequest={linkResourceCriteriaRequest}
                unlinkResourceItemsRequest={unlinkResourceCriteriaRequest}
                customDisplayComponent={AssociatedCriterionCustomDisplay}
                searchBarDisplay={"Search for Criteria to associate with this resource"}
                queryKey={tagSearchParam}
                textFieldValueKey={"name"}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={Number(styleVars.gridSpacing)}>
          <Grid item xs={12} sm={8}>
            <Paper
              style={{
                padding: styleVars.paperPadding,
              }}
            >
              <h3>User Functions</h3>
              <AssociatedItems
                resourceId={resourceId}
                items={userFunctions}
                itemsLoading={userFunctionsLoading}
                itemsNeedRefresh={userFunctionsNeedRefresh}
                itemsAreRefreshed={userFunctionsAreRefreshed}
                searchedItems={searchedUserFunctions}
                searchingItems={searchingUserFunctions}
                getItemsRequest={getUserFunctionsRequest}
                getResourceItemsRequest={getResourceUserFunctionsRequest}
                linkResourceItemsRequest={linkUserFunctionsRequest}
                unlinkResourceItemsRequest={unlinkUserFunctionsRequest}
                searchBarDisplay={"Search for User Function to associate"}
                customDisplayComponent={AssociatedUserFunctionCustomDisplay}
              />
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

const sxFauxFieldset = (theme) => ({
  border: `1px solid ${styleVars.colorLightGray}`,
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
});

const sxFieldWrapper = (theme) => ({
  marginBottom: theme.spacing(1.5),
  marginTop: theme.spacing(1),
});

const styles = (theme) => ({
  fileLimitText: {
    fontStyle: "italic",
    marginLeft: theme.spacing(0.5),
  },
  resourceLoaderWrapper: {
    padding: theme.spacing(3),
    textAlign: "center",
  },
  resourceActions: {
    margin: theme.spacing(1, 0, 1, 0),
  },
  resourceButton: {
    margin: theme.spacing(0, 0, 1, 0),
  },
  resourceDivider: {
    margin: theme.spacing(1, 0, 3, 0),
  },
  resourceFile: {
    fontSize: styleVars.txtFontSizeXs,
    fontStyle: "italic",
  },
  resourceImage: {
    objectFit: "cover",
    height: "140px",
    width: "140px",
  },
  resourceLabel: {
    fontSize: styleVars.txtFontSizeXs,
  },
  resourceLabelSelect: {
    fontSize: styleVars.txtFontSizeXs,
    marginBottom: theme.spacing(0.5),
  },
  resourceHelperTextRoot: {
    margin: 0,
    fontSize: "10px",
  },
  resourceTypeControl: {
    marginBottom: theme.spacing(3),
  },
  resourceTrainingTypeWrapper: {
    marginBottom: theme.spacing(2),
  },
  datePicker: {
    marginRight: theme.spacing(2),
  },
  durationHour: {
    marginRight: theme.spacing(2),
    width: theme.spacing(8),
  },
  durationMinute: {
    width: theme.spacing(8),
  },
  resourceTextFieldAboveMulti: {
    marginBottom: theme.spacing(2),
  },
  selectWrapper: {
    fontSize: styleVars.reactSelectFontSize,
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

const mapStateToProps = (state) => {
  return {
    languages: state.app_meta.data.languages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(ResourceDetail));
