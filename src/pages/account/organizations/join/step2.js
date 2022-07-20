import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import { includes, isNil, map } from "lodash";
import HelpFindingOrg from "components/views/HelpFindingOrg";
import PageNotFound from "components/views/PageNotFound";
import PropTypes from "prop-types";
import HgSelect from "components/ui/HgSelect";
import { Button, CircularProgress, Paper } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestCreateUserActivity, requestOrganizations } from "api/requests";
import generateTitle from "utils/generateTitle";
import orgTypeForMachineName from "utils/orgTypeForMachineName";
import currentUserOrgCount from "utils/currentUserOrgCount";
import errorSuffix from "utils/errorSuffix";
import stateCodes from "constants/state_codes";
import userBelongsToOrg from "utils/userBelongsToOrg";
import { currentUserShape } from "constants/propTypeShapes";
import reactSelectStyles from "style/reactSelectStyles";
import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

/**
 * Step 2 of joining an org: UI for locating the organization.
 */
class Step2 extends Component {
  static propTypes = {
    // Machine name of org type that informs this display.
    orgTypeMachineName: PropTypes.string.isRequired,
    // State ID. Ignored if providedParentId is set.
    providedStateId: PropTypes.string,
    // Note that parent is only applicable for some organization types.
    providedParentId: PropTypes.number, // if available/applicable
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    organizationTypes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // Org types that should use the parent org selector.
    this.orgTypesThatUseParents = ["school"];

    // Org type to primary parent org type map.
    //  EX: 'school' org type's primary parent type is 'district'
    //      'school' can also have parent type values of 'cmo' or 'esd'
    //      The reason 'cmo' and 'esd' are not primary of a 'school' is the
    //      parent dropdown will have an option for "N/A (does not belong to a
    //      district.)"
    //      Selecting N/A will result in a lookup excluding their primary
    //      parent org type value, 'district' in this example, showing schools
    //      that have an org type parent of 'esd', 'cmo', or no parent value
    this.orgTypePrimaryParentTypes = {
      school: "district",
    };

    this.isCancelled = false;
    this.state = {
      orgType: null, // set in init method
      orgTypeIsInvalid: null, // set in init method
      parentType: null, // set in init method
      selectedStateId: props.providedStateId ? props.providedStateId : null,
      parents: [],
      parentsLoading: false,
      selectedParentId: props.providedParentId ? props.providedParentId : null,
      selectedOrganizationId: null,
      organizations: [],
      organizationsLoading: false,
      title: null, // set in init method
    };
  }

  componentDidMount() {
    const { organizationTypes, orgTypeMachineName, providedParentId, providedStateId } = this.props;

    let _orgType = orgTypeForMachineName(orgTypeMachineName, organizationTypes);
    let _parentType = this.primaryParentTypeForChildMachineName(orgTypeMachineName);

    // Initialize component and display abased on those type objects.
    this.initForOrgType(_orgType, _parentType);

    // Try populating the selectable parents.
    this.populateParents(_orgType, _parentType, providedStateId);

    // Try populating the selectable organizations The population method
    // will deal with missing state/parent values for us.
    this.populateOrganizations(_orgType, _parentType, providedStateId, providedParentId);
  }

  componentDidUpdate(prevProps, prevState) {
    const { organizationTypes, orgTypeMachineName } = this.props;
    const { orgTypeMachineName: prevOrgTypeMachineName } = prevProps;
    const { orgType, parentType, selectedParentId, selectedStateId } = this.state;
    const {
      parentType: prevParentType,
      selectedParentId: prevSelectedParentId,
      selectedStateId: prevSelectedStateId,
    } = prevState;

    // Initialize these vars with the current state values. We'll
    // override below as needed.
    let currentOrgType = orgType;
    let currentParentType = parentType;

    // If org type prop changed, re-init the component.
    if (orgTypeMachineName !== prevOrgTypeMachineName) {
      currentOrgType = orgTypeForMachineName(orgTypeMachineName, organizationTypes);
      currentParentType = this.primaryParentTypeForChildMachineName(orgType.machine_name);
      this.initForOrgType(currentOrgType, currentParentType);
    }

    // If any values change that impact selectable parents, update them.
    if (selectedStateId !== prevSelectedStateId || orgTypeMachineName !== prevOrgTypeMachineName) {
      this.populateParents(currentOrgType, currentParentType, selectedStateId);
      // And reset the selected parent, org values.
      this.setState({
        selectedOrganizationId: null,
        selectedParentId: null,
      });
    }

    // If any values change that impact selectable orgs, update them.
    if (
      selectedStateId !== prevSelectedStateId ||
      orgTypeMachineName !== prevOrgTypeMachineName ||
      parentType !== prevParentType ||
      selectedParentId !== prevSelectedParentId
    ) {
      this.populateOrganizations(
        currentOrgType,
        currentParentType,
        selectedStateId,
        selectedParentId
      );
    }

    // If anything changes that would impact the URL, update it.
    if (selectedStateId !== prevSelectedStateId || selectedParentId !== prevSelectedParentId) {
      this.updateAddressBar();
    }
  }

  componentWillUnmount() {
    this.isCancelled = true;
  }

  /**
   * Generate string to be passed to generateTitle() and used in component.
   * @returns {String}
   */
  titleForOrgType(orgTypeObj) {
    if (orgTypeObj && orgTypeObj.name) {
      return `Find Your ${orgTypeObj.name}`;
    }
    return "Find Your Organization";
  }

  /**
   * Provide this with an orgType object to setup component for that type.
   *
   * Call from componentDidMount() and componentDidUpdate().
   *
   * @param {Object|null} orgType OrgType object for org we'll be selecting.
   * @param {Object|null} parentType
   *  OrgType object of parent type, if child uses parents.
   */
  initForOrgType(orgType = null, parentType = null) {
    if (orgType) {
      // Log start.
      requestCreateUserActivity(`organization_registration_started_${orgType.machine_name}`);

      // Establish page title string.
      let title = this.titleForOrgType(orgType);

      this.setState({
        title: title,
        orgType: orgType,
        parentType: parentType ? parentType : null,
        orgTypeIsInvalid: false,
      });
      generateTitle(title);
      return;
    }
    this.setState({
      title: "",
      orgType: null,
      parentType: null,
      orgTypeIsInvalid: true,
    });
  }

  /**
   * Check if current org type uses parents.
   *
   * @param {String} orgTypeMachineName
   * @returns {Boolean}
   */
  checkIfOrgTypeUsesParents(orgTypeMachineName) {
    return includes(this.orgTypesThatUseParents, orgTypeMachineName);
  }

  /**
   * Get the parent org type object (if any) based on org type.
   * @see this.orgTypePrimaryParentTypes
   *
   * @param {String} childOrgTypeMachineName
   * @returns {Object|null}
   */
  primaryParentTypeForChildMachineName(childOrgTypeMachineName) {
    const { organizationTypes } = this.props;
    if (!isNil(this.orgTypePrimaryParentTypes[childOrgTypeMachineName])) {
      return orgTypeForMachineName(
        this.orgTypePrimaryParentTypes[childOrgTypeMachineName],
        organizationTypes
      );
    }
    return null;
  }

  /**
   * Update address bar when things change.
   */
  updateAddressBar() {
    const { history } = this.props;
    const { orgType, selectedStateId, selectedParentId } = this.state;

    let knownOrgTypeStr = orgType ? orgType.machine_name : null;

    // Only do if we have a known org type ready to roll.
    if (knownOrgTypeStr) {
      let newPathStr = `/app/account/organizations/join/${knownOrgTypeStr}/find`;
      if (selectedStateId) {
        newPathStr += `/${selectedStateId}`;
        if (selectedParentId) {
          newPathStr += `/${selectedParentId}`;
        }
      }
      history.push(newPathStr);
    }
  }

  /**
   * Handle change to state selection.
   * @param {Object} event
   */
  handleStateSelectChange = (event) => {
    this.setState({ selectedStateId: event.value });
  };

  /**
   * Handle change to parent org selection.
   * @param {Object} event
   */
  handleParentSelectChange = (event) => {
    this.setState({ selectedParentId: event.value });
  };

  /**
   * Handle change to org selection.
   * @param {Object} event
   */
  handleOrganizationSelectChange = (event) => {
    this.setState({ selectedOrganizationId: event.value });
  };

  /**
   * Populate selectable parent orgs array from server.
   *
   * Resulting array consists of objects with label and value props.
   *
   * @param {Object} orgObj Organization type object of _child_ org.
   * @param {Object|null} parentType Org type object for selectable org's parent.
   * @param {String|null} stateId 2-character state ID (abbreviation)
   */
  populateParents(orgType, parentType = null, stateId = null) {
    // If not applicable, just empty our cache of parents.
    if (!stateId || !parentType) {
      this.setState({
        parentsLoading: false,
        parents: [],
      });
      return;
    }

    let parTypeName = parentType.name.toLowerCase();

    stateId = stateId.toLowerCase();

    this.setState({
      parentsLoading: true,
    });

    let apiParams = {
      organization_type_id: parentType.id,
      state_id: stateId,
      per_page: 2500,
      name_sort: "asc",
    };

    requestOrganizations(apiParams)
      .then((res) => {
        // SUCCESS
        let opts = [];
        if (res.data && res.data.data) {
          if (res.data.data.length) {
            opts = map(res.data.data, (pOrg) => {
              return { value: pOrg.id, label: pOrg.name };
            });
          }
          opts.unshift({
            value: -1,
            label: `N/A (does not belong to a ${parTypeName})`,
          });
        }

        if (!this.isCancelled) {
          this.setState({
            parentsLoading: false,
            parents: opts,
          });
        }
      })
      .catch((error) => {
        // FAILURE
        console.error(error);
        if (!this.isCancelled) {
          this.setState({
            parentsLoading: false,
            parents: [],
          });
        }
        hgToast(
          "An error occurred while retrieving parent organization records. " + errorSuffix(error),
          "error"
        );
      });
  }

  /**
   * Populate selectable orgs array from server.
   *
   * Resulting array consists of objects with label and value props,
   * and a boolean `enabled` prop to indicate if it should be selectable.
   * Array is assigned to this.state.organizations.
   *
   * @param {Object} orgType Org type object for selectable org.
   * @param {Object|null} parentType Org type object for selectable org's parent.
   * @param {String|null} stateId 2-character state ID (abbreviation)
   * @param {Number|null} parentId Parent org ID
   */
  populateOrganizations(orgType, parentType = null, stateId = null, parentId = null) {
    const { currentUser } = this.props;

    // If not applicable, just empty our cache of orgs.
    if (!stateId || (parentType && !parentId)) {
      this.setState({
        organizationsLoading: false,
        organizations: [],
      });
      return;
    }

    stateId = stateId.toLowerCase();

    this.setState({
      organizationsLoading: true,
    });

    let parentIdParam = parentType && parentId ? parentId : null;

    let apiParams = {
      organization_type_id: orgType.id,
      state_id: stateId,
      per_page: 2500,
      name_sort: "asc",
    };

    // N/A selected from parent dropdown, exclude primary parent type
    if (parentIdParam === -1) {
      apiParams.not_parent_organization_type_id = parentType.id.toString();
    }

    // Valid parent type, include in org search apiParams
    if (parentIdParam !== -1 && !isNil(parentIdParam)) {
      apiParams.parent_id = parentIdParam;
    }

    requestOrganizations(apiParams)
      .then((res) => {
        // SUCCESS
        let opts = [];
        if (res.data && res.data.data) {
          if (res.data.data.length) {
            opts = map(res.data.data, (pOrg) => {
              let userBelongs = userBelongsToOrg(currentUser.data.id, pOrg, true);
              return {
                value: pOrg.id,
                label: pOrg.name,
                enabled: userBelongs,
              };
            });
          }
        }

        if (!this.isCancelled) {
          this.setState({
            organizationsLoading: false,
            organizations: opts,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        if (!this.isCancelled) {
          this.setState({
            organizationsLoading: false,
            organizations: [],
          });
        }
        hgToast("An error occurred while retrieving organization records.", "error");
      });
  }

  render() {
    const { currentUser, classes } = this.props;
    const {
      orgType,
      orgTypeIsInvalid,
      parentType,
      selectedOrganizationId,
      organizations,
      organizationsLoading,
      parents,
      parentsLoading,
      selectedParentId,
      selectedStateId,
      title,
    } = this.state;

    if (orgTypeIsInvalid) {
      return <PageNotFound />;
    }
    if (!orgType) {
      return "loading...";
    }

    let orgTypeUsesParents = Boolean(parentType);

    let showParentSelector = orgTypeUsesParents && selectedStateId;
    let showOrganizationSelector =
      selectedStateId && ((orgTypeUsesParents && selectedParentId) || !orgTypeUsesParents);
    let showNextButton = showOrganizationSelector && selectedOrganizationId;

    let pathToNext = "";
    if (orgType && orgType.machine_name && selectedOrganizationId) {
      pathToNext = `/app/account/organizations/join/${orgType.machine_name}/${selectedOrganizationId}`;
    }

    let userHasOrgs = !!currentUserOrgCount(currentUser.data);

    return (
      <React.Fragment>
        <Paper className={classes.wrapperPaper}>
          <div className={classes.textWrapper}>
            <h1>{title}</h1>
            {!userHasOrgs && (
              <p>You don't belong to any organizations yet. Join one below to get started!</p>
            )}
          </div>

          {/* SELECT STATE */}
          <div className={classes.selectWrapper}>
            <HgSelect
              placeholder="Select your state"
              aria-label="Select your state"
              maxMenuHeight={220}
              name="state_id"
              isMulti={false}
              options={stateCodesForSelect}
              value={stateCodesForSelect.filter(({ value }) => value === selectedStateId) || ""}
              onChange={this.handleStateSelectChange}
            />
          </div>

          {/* SELECT PARENT ORG (if applicable)
                Note that we show the select even if no parent orgs are
                available (user will select the n/a option). */}
          {showParentSelector && (
            <div className={classes.selectWrapper}>
              {parentsLoading ? (
                <div className={classes.selectProgressWrapper}>
                  <CircularProgress size="1em" />
                </div>
              ) : (
                <React.Fragment>
                  {parents.length ? (
                    <HgSelect
                      styles={reactSelectStyles}
                      placeholder={`Select your ${parentType.name.toLowerCase()}`}
                      aria-label={`Select your ${parentType.name.toLowerCase()}`}
                      maxMenuHeight={220}
                      name="parent_id"
                      isMulti={false}
                      options={parents}
                      value={parents.filter(({ value }) => value === selectedParentId) || ""}
                      getOptionLabel={({ label }) => label}
                      getOptionValue={({ value }) => value}
                      onChange={this.handleParentSelectChange}
                    />
                  ) : (
                    <p className={classes.noneFoundText}>
                      No {parentType.name_plural.toLowerCase()} found here.
                    </p>
                  )}
                </React.Fragment>
              )}
            </div>
          )}

          {/* SELECT ORG */}
          {showOrganizationSelector && (
            <div className={classes.selectWrapper}>
              {organizationsLoading ? (
                <div className={classes.selectProgressWrapper}>
                  <CircularProgress size="1em" />
                </div>
              ) : (
                <React.Fragment>
                  {organizations.length ? (
                    <HgSelect
                      styles={reactSelectStyles}
                      placeholder={`Select your ${orgType.name.toLowerCase()}`}
                      aria-label={`Select your ${orgType.name.toLowerCase()}`}
                      maxMenuHeight={220}
                      name="organization_id"
                      isMulti={false}
                      options={organizations}
                      value={
                        organizations.filter(({ value }) => value === selectedOrganizationId) || ""
                      }
                      isOptionDisabled={(opt) => opt.enabled}
                      getOptionLabel={({ label }) => label}
                      getOptionValue={({ value }) => value}
                      onChange={this.handleOrganizationSelectChange}
                    />
                  ) : (
                    <React.Fragment>
                      <p className={classes.noneFoundText}>
                        No {orgType.name_plural.toLowerCase()} found here.
                      </p>
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </div>
          )}

          {/* NEXT BUTTON */}
          {showNextButton && (
            <div className={classes.nextButtonWrapper}>
              <Button
                color="primary"
                className={classes.nextButton}
                component={Link}
                variant="contained"
                to={pathToNext}
              >
                Next
              </Button>
            </div>
          )}
        </Paper>
        {selectedStateId && (
          <div className={classes.helpFindingOrgWrapper}>
            <HelpFindingOrg orgTypeMachineName={orgType.machine_name} />
          </div>
        )}
      </React.Fragment>
    );
  }
}

const stateCodesForSelect = stateCodes.map(function (item) {
  return { value: item[0].toLowerCase(), label: item[1] };
});

const styles = (theme) => ({
  helpFindingOrgWrapper: {
    fontSize: styleVars.txtFontSizeXs,
    marginTop: theme.spacing(2),
    maxWidth: "380px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  textWrapper: {
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  selectWrapper: {
    marginBottom: theme.spacing(),
    maxWidth: "310px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  selectProgressWrapper: {
    textAlign: "center",
  },
  nextButtonWrapper: {
    marginBottom: theme.spacing(),
    marginLeft: "auto",
    marginRight: "auto",
    maxWidth: "310px",
  },
  nextButton: {
    marginBottom: theme.spacing(),
    width: "100%",
  },
  noneFoundText: {
    fontStyle: "italic",
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(1.5),
    textAlign: "center",
  },
  wrapperPaper: {
    padding: styleVars.paperPadding,
    paddingBottom: theme.spacing(6),
  },
});

const mapStateToProps = (state) => {
  return {
    organizationTypes: state.app_meta.data.organizationTypes,
    currentUser: state.auth.currentUser,
  };
};
const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles, { withTheme: true })
)(Step2);
