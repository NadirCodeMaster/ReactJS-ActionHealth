import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { ValidatorForm } from "react-form-validator-core";
import { includes, isNil, map } from "lodash";
import errorSuffix from "utils/errorSuffix";
import { Button, FormControl } from "@mui/material";
import { withStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "components/ui/SearchBar";
import hgToast from "utils/hgToast";

class AssociatedItemAddToCriterionForm extends Component {
  static propTypes = {
    associatedType: PropTypes.string.isRequired,
    criterionId: PropTypes.number.isRequired,
    criterionAssociatedItems: PropTypes.array.isRequired, // array of currently associated res.
    callbackAfterAdd: PropTypes.func, // optional; executes after successful add
    requestAssociated: PropTypes.func.isRequired,
    requestAssociatedLink: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    let requestId = this.props.requestId;

    this.searchBarRef = React.createRef();
    this.maxResultsPerSearch = 600;

    this.emptyDraftPivot = {
      [requestId]: null,
      weight: 0,
    };

    this.state = {
      submitting: false, // submitting add request to API
      selectedAssociatedItem: null,
      draftPivot: this.emptyDraftPivot,
      // If we're currently awaiting search results from api
      searching: false,
      // Latest search results from API. (array of objects)
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
    const { criterionAssociatedItems, requestAssociated, labelRender } = this.props;
    this.setState({ searching: true });
    requestAssociated({
      name_sort: "asc",
      per_page: this.maxResultsPerSearch,
      ...search,
    })
      .then((res) => {
        // SUCCESS
        let searchResults = res.data.data;

        if (labelRender) {
          searchResults = labelRender(searchResults);
        }

        // Filter out items already associated.
        if (criterionAssociatedItems && criterionAssociatedItems.length > 0) {
          let criterionAssociatedItemIds = map(criterionAssociatedItems, "id");
          searchResults = searchResults.filter(
            (associatedItem) => !includes(criterionAssociatedItemIds, associatedItem.id)
          );
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
        selectedAssociatedItem: null,
        draftPivot: this.emptyDraftPivot,
      },
      () => this.searchBarRef.current.clearSearch()
    );
  };

  associateAssociatedItem = () => {
    const { callbackAfterAdd, criterionId, requestAssociatedLink } = this.props;
    const { draftPivot } = this.state;

    this.setState({ submitting: true });

    requestAssociatedLink(criterionId, draftPivot)
      .then((res) => {
        // SUCCESS
        hgToast("Associated item with criterion");
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
            "An error occurred while associating item with criterion. " + errorSuffix(error),
            "error"
          );
          this.initializeSearchAndSelections();
        }
      });
  };

  handleSelectAssociatedItem = (selectedAssociatedItem) => {
    const { requestId } = this.props;
    this.setState({
      selectedAssociatedItem: selectedAssociatedItem ? selectedAssociatedItem : null,
      draftPivot: {
        ...this.state.draftPivot,
        [requestId]: selectedAssociatedItem ? selectedAssociatedItem.id : null,
      },
    });
  };

  componentDidMount() {
    this.initializeSearchAndSelections();
  }

  componentDidUpdate(prevProps) {
    const { criterionAssociatedItems: prevCriterionAssociatedItems } = prevProps;
    const { criterionAssociatedItems } = this.props;

    if (prevCriterionAssociatedItems !== criterionAssociatedItems) {
      this.initializeSearchAndSelections();
    }
  }

  render() {
    const { associatedType, classes, labelRender } = this.props;

    const { searching, searchResults, selectedAssociatedItem } = this.state;

    return (
      <ValidatorForm className={classes.form} onSubmit={this.associateAssociatedItem}>
        <FormControl className={classes.formControl} variant="standard">
          <SearchBar
            ref={this.searchBarRef}
            label={"Search for " + associatedType + "s to associate with this criterion"}
            onSelectItem={this.handleSelectAssociatedItem}
            queryKey="name"
            resultsSource={searchResults}
            resultLabelTransform={(selectedAssociatedItem) => (
              <span>
                {labelRender
                  ? selectedAssociatedItem.name
                  : selectedAssociatedItem.id + ": " + selectedAssociatedItem.name}
              </span>
            )}
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
            disabled={!selectedAssociatedItem}
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

const mapStateToProps = (state) => {
  return {};
};
const mapDispatchToProps = (dispatch) => ({});

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withStyles(styles, { withTheme: true })(AssociatedItemAddToCriterionForm)
);
