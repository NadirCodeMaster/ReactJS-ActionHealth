import React, { Component } from "react";
import PropTypes from "prop-types";
import { ValidatorForm } from "react-form-validator-core";
import { includes, isNil, map } from "lodash";
import { Button, FormControl } from "@mui/material";
import { withStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "components/ui/SearchBar";
import errorSuffix from "utils/errorSuffix";
import { requestLinkOrganizationSet, requestProgramOrganizations } from "api/requests";

import hgToast from "utils/hgToast";

class OrgAddToSetForm extends Component {
  static propTypes = {
    orgTypeId: PropTypes.number.isRequired,
    programId: PropTypes.number.isRequired,
    setId: PropTypes.number.isRequired,
    associatedOrgs: PropTypes.array.isRequired,
    callbackAfterAdd: PropTypes.func.isRequired,
    orgs: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.searchBarRef = React.createRef();
    this.maxResultsPerSearch = 100;

    this.emptyDraftPivot = {
      organization_id: null,
    };

    this.state = {
      submitting: false,
      selectedOrg: null,
      draftPivot: this.emptyDraftPivot,
      searching: false,
      searchResults: [],
    };
  }

  /**
   * Search the API for a given string, populate searchResults.
   *
   * @param {String} search
   *  Must be an object as `{searchfield: searchstring}` (per SearchBar.js)
   */
  executeSearch = (search) => {
    const { orgs, orgTypeId, programId } = this.props;

    search.organization_type_id = orgTypeId;
    this.setState({ searching: true });

    requestProgramOrganizations(programId, {
      name_sort: "asc",
      per_page: this.maxResultsPerSearch,
      ...search,
    })
      .then((res) => {
        // SUCCESS
        let searchResults = res.data.data;

        // Filter out items already associated.
        if (orgs && orgs.length > 0) {
          let orgIds = map(orgs, "id");
          searchResults = searchResults.filter((orgs) => !includes(orgIds, orgs.id));
        }

        if (!this.isCancelled) {
          this.setState({
            searching: false,
            searchResults: searchResults,
          });
        }
      })
      .catch((error) => {
        // ERROR
        console.error(error);
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

  addOrg = () => {
    const { callbackAfterAdd, setId } = this.props;
    const { draftPivot } = this.state;

    this.setState({ submitting: true });

    requestLinkOrganizationSet(setId, draftPivot)
      .then((res) => {
        // SUCCESS
        hgToast(`Associated organization with assessment`);
        this.initializeSearchAndSelections();

        if (!this.isCancelled) {
          this.setState({ submitting: true });
        }

        // Call the post-add callback if caller provided one.
        if (!isNil(callbackAfterAdd)) {
          callbackAfterAdd();
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          hgToast(
            "An error occurred while associating item with assessment. " + errorSuffix(error),
            "error"
          );
          this.initializeSearchAndSelections();
        }
      });
  };

  handleSelectOrg = (selectedOrg) => {
    this.setState({
      selectedOrg: selectedOrg ? selectedOrg : null,
      draftPivot: {
        organization_id: selectedOrg ? selectedOrg.id : null,
      },
    });
  };

  componentDidMount() {
    this.initializeSearchAndSelections();
  }

  componentDidUpdate(prevProps) {
    const { associatedOrgs: prevAssociatedOrgs } = prevProps;
    const { associatedOrgs } = this.props;

    if (prevAssociatedOrgs !== associatedOrgs) {
      this.initializeSearchAndSelections();
    }
  }

  render() {
    const { classes } = this.props;
    const { searching, searchResults, selectedOrg } = this.state;

    return (
      <ValidatorForm className={classes.form} onSubmit={this.addOrg}>
        <FormControl className={classes.formControl} variant="standard">
          <SearchBar
            ref={this.searchBarRef}
            label={"Search for Organizations"}
            onSelectItem={this.handleSelectOrg}
            queryKey="name"
            resultsSource={searchResults}
            resultLabelTransform={(selectedOrg) => <span>{selectedOrg.name}</span>}
            searchable={this.executeSearch}
            searching={searching}
          />
        </FormControl>

        <FormControl className={classes.formControl} variant="standard">
          <Button
            aria-label="Add Item"
            className={classes.addButton}
            color="primary"
            type="submit"
            variant="contained"
            disabled={!selectedOrg}
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
    marginTop: theme.spacing(),
    minWidth: 180,
    width: "100%",
  },
  formField: {
    width: "100%",
  },
});

export default withStyles(styles, { withTheme: true })(OrgAddToSetForm);
