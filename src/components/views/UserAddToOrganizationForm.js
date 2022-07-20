import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { ValidatorForm } from "react-form-validator-core";
import HgSelect from "components/ui/HgSelect";
import HgTextValidator from "components/ui/HgTextValidator";
import { get, isNil, startsWith, values, set as lodashSet } from "lodash";
import { Button, FormControl } from "@mui/material";
import { withStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import { requestOrganizations, requestLinkUserOrganization } from "api/requests";
import SearchBar from "components/ui/SearchBar";
import filterUserFunctionsByOrganizationType from "utils/filterUserFunctionsByOrganizationType.js";
import errorSuffix from "utils/errorSuffix";
import { currentUserShape } from "constants/propTypeShapes";

import hgToast from "utils/hgToast";

class UserAddToOrganizationForm extends Component {
  static propTypes = {
    subjectUser: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name_first: PropTypes.string,
    }).isRequired, // user data object
    callbackAfterAdd: PropTypes.func, // optional; executes after successful add
    currentUser: PropTypes.shape(currentUserShape).isRequired,
  };

  constructor(props) {
    super(props);

    this.searchBarRef = React.createRef();

    this.maxResultsPerSearch = 600;

    this.emptyDraftPivot = {
      organization_id: null,
      organization_role_id: null,
      user_function_id: null,
      user_function_other: "",
    };

    this.state = {
      submitting: false, // submitting add request to API
      selectedOrg: null,
      draftPivot: this.emptyDraftPivot,
      // If we're currently awaiting search results from api
      searching: false,
      // Latest search results from API. (array of objects)
      searchResults: [],
    };
  }

  sameCurrentAndSubjectUser = () => {
    const { currentUser, subjectUser } = this.props;
    return parseInt(currentUser.data.id, 10) === parseInt(subjectUser.id, 10);
  };

  /**
   * Search the API for a given string, populate searchResults.
   *
   * `search` should be an object as {searchfield: searchstring}
   * (as per SearchBar.js)
   */
  executeSearch = (search) => {
    const { subjectUser } = this.props;

    this.setState({ searching: true });

    requestOrganizations({
      name_sort: "asc",
      per_page: this.maxResultsPerSearch,
      not_user_id: subjectUser.id,
      ...search,
    })
      .then((res) => {
        // SUCCESS
        if (!this.isCancelled) {
          this.setState({
            searching: false,
            searchResults: res.data.data,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            searching: false,
            searchResults: [],
          });
        }
      });
  };

  initializeSearchAndSelections = () => {
    this.setState(
      {
        submitting: false,
        selectedOrg: null,
        draftPivot: this.emptyDraftPivot,
      },
      () => this.searchBarRef.current.clearSearch()
    );
  };

  addNewOrganization = () => {
    const { callbackAfterAdd, subjectUser } = this.props;
    const { draftPivot, selectedOrg } = this.state;

    this.setState({ submitting: true });

    requestLinkUserOrganization(subjectUser.id, draftPivot)
      .then((res) => {
        // SUCCESS
        if (!this.isCancelled) {
          let nameFirst = get(subjectUser, "name_first", "");
          hgToast(`Added ${nameFirst} to ${selectedOrg.name}!`);
          this.initializeSearchAndSelections();

          // Call the post-add callback if caller provided one.
          if (!isNil(callbackAfterAdd)) {
            callbackAfterAdd();
          }
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while adding user to organization. " + errorSuffix(error),
            "error"
          );
          this.initializeSearchAndSelections();
        }
      });
  };

  handlePivotFieldChange = (event) => {
    let name = event.target.name;
    this.setState({
      draftPivot: {
        ...this.state.draftPivot,
        [name]: event.target.value,
      },
    });
  };

  handleSelectChange = (field, e) => {
    this.setState((state) => lodashSet(state, `draftPivot.${field}`, e.value));
  };

  handleSelectOrganization = (selectedOrg) => {
    if (!isNil(selectedOrg)) {
      this.setState({
        selectedOrg: selectedOrg,
        draftPivot: {
          ...this.state.draftPivot,
          organization_id: selectedOrg.id,
        },
      });
    }
  };

  newSelectionIsValid = () => {
    const { appMeta } = this.props;
    const { selectedOrg, draftPivot } = this.state;

    const userFunctions = appMeta.data.userFunctions;

    return (
      selectedOrg &&
      draftPivot.user_function_id &&
      (!startsWith(get(userFunctions[draftPivot.user_function_id], "name"), "Other") ||
        draftPivot.user_function_other) &&
      draftPivot.organization_role_id
    );
  };

  selectPositionValues = () => {
    const { appMeta } = this.props;
    const { selectedOrg } = this.state;

    let userFunctions = appMeta.data.userFunctions;
    let userFunctionCategories = appMeta.data.userFunctionCategories;
    let userFunctionsForOrganization = [];

    if (!isNil(selectedOrg)) {
      userFunctionsForOrganization = filterUserFunctionsByOrganizationType(
        values(userFunctions),
        values(userFunctionCategories),
        selectedOrg.organization_type_id
      );
    }
    return userFunctionsForOrganization.map((uf) => {
      let label = userFunctionCategories[uf.user_function_category_id].name + ": " + uf.name;
      return { value: uf.id, label };
    });
  };

  selectOrgRoleValues = () => {
    const { appMeta } = this.props;
    let organizationRoles = get(appMeta, "data.organizationRoles", []);

    return Object.entries(organizationRoles).map(([key, value]) => {
      return { value: value.id, label: value.name };
    });
  };

  componentDidMount() {
    this.initializeSearchAndSelections();
  }

  render() {
    const { appMeta, classes } = this.props;
    const { draftPivot, searching, searchResults, selectedOrg } = this.state;
    const commonInputProps = {
      validators: ["required"],
      variant: "outlined",
    };

    // Shorten access to appMeta.
    let userFunctions = appMeta.data.userFunctions;

    // Whether to show the "other" user function field.
    let showUserFuncOther = false;
    if (
      !isNil(draftPivot.user_function_id) &&
      startsWith(userFunctions[draftPivot.user_function_id].name, "Other")
    ) {
      showUserFuncOther = true;
    }

    return (
      <ValidatorForm className={classes.form} onSubmit={this.addNewOrganization}>
        <FormControl className={classes.formControl} variant="standard">
          <SearchBar
            ref={this.searchBarRef}
            label="Search for organization"
            onSelectItem={this.handleSelectOrganization}
            queryKey="name"
            resultsSource={searchResults}
            resultLabelTransform={(selectedOrg) => (
              <span>
                {selectedOrg.id}: {selectedOrg.name}
                {selectedOrg.state_id && (
                  <React.Fragment> ({selectedOrg.state_id.toUpperCase()})</React.Fragment>
                )}
              </span>
            )}
            searchable={this.executeSearch}
            searching={searching}
          />
        </FormControl>

        {selectedOrg && (
          <React.Fragment>
            <FormControl className={classes.formControl} variant="standard">
              <HgSelect
                placeholder="Position"
                aria-label="Position"
                name="user_function_id"
                options={this.selectPositionValues()}
                value={
                  this.selectPositionValues().filter(
                    ({ value }) => value === draftPivot.user_function_id
                  ) || ""
                }
                onChange={(e) => this.handleSelectChange("user_function_id", e)}
              />
            </FormControl>

            {showUserFuncOther && (
              <FormControl className={classes.formControl} variant="standard">
                <HgTextValidator
                  name="user_function_other"
                  label="Other Position"
                  value={draftPivot.user_function_other}
                  onChange={this.handlePivotFieldChange}
                  {...commonInputProps}
                />
              </FormControl>
            )}

            <FormControl className={classes.formControl} variant="standard">
              <HgSelect
                placeholder="Organization Role"
                aria-label="Organization Role"
                name="organization_role_id"
                options={this.selectOrgRoleValues()}
                value={
                  this.selectOrgRoleValues().filter(
                    ({ value }) => value === draftPivot.organization_role_id
                  ) || ""
                }
                onChange={(e) => this.handleSelectChange("organization_role_id", e)}
              />
            </FormControl>
          </React.Fragment>
        )}

        <FormControl className={classes.formControl} variant="standard">
          <Button
            aria-label="Add to Organization"
            className={classes.addButton}
            color="primary"
            disabled={!this.newSelectionIsValid()}
            type="submit"
            variant="contained"
          >
            <AddIcon color="inherit" />
          </Button>
        </FormControl>
      </ValidatorForm>
    );
  }
}

const styles = (theme) => ({
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 180,
    width: "100%",
  },
  formField: {
    width: "100%",
  },
});

const mapStateToProps = (state) => {
  return {
    appMeta: state.app_meta,
    currentUser: state.auth.currentUser,
  };
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withStyles(styles, { withTheme: true })(UserAddToOrganizationForm)
);
