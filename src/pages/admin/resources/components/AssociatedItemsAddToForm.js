import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { get, isNil } from "lodash";
import { ValidatorForm } from "react-form-validator-core";
import { Button, FormControl } from "@mui/material";
import { withStyles } from "@mui/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "components/ui/SearchBar";

class AssociatedItemsAddToForm extends Component {
  static propTypes = {
    resourceId: PropTypes.number.isRequired,
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          id: PropTypes.number,
        })
      ),
      PropTypes.arrayOf(PropTypes.number),
    ]),
    itemsNeedRefresh: PropTypes.bool.isRequired,
    searchedItems: PropTypes.array,
    searchingItems: PropTypes.bool,
    itemsAreRefreshed: PropTypes.func.isRequired,
    getItemsRequest: PropTypes.func.isRequired,
    linkResourceItemsRequest: PropTypes.func.isRequired,
    textFieldValueKey: PropTypes.string,
  };

  constructor(props) {
    super(props);

    let resourceId = this.props.resourceId;

    this.searchBarRef = React.createRef();
    this.maxResultsPerSearch = 600;

    this.emptyDraftPivot = {
      [resourceId]: null,
    };

    this.state = {
      submitting: false, // submitting add request to API
      selectedItem: null,
      draftPivot: this.emptyDraftPivot,
      // If we're currently awaiting search results from api
      searching: false,
      // Latest search results from API. (array of objects)
    };
  }

  componentDidMount() {
    this.initializeSearchAndSelections();
  }

  componentDidUpdate(prevProps) {
    const { items: prevItems } = prevProps;
    const { items } = this.props;

    if (prevItems !== items) {
      this.initializeSearchAndSelections();
    }
  }

  /**
   * Setup for search bar and selections, initial values
   */
  initializeSearchAndSelections = () => {
    this.setState(
      {
        submitting: false,
        selectedItem: null,
        draftPivot: this.emptyDraftPivot,
      },
      () => this.searchBarRef.current.clearSearch()
    );
  };

  /**
   * Item selection handling
   * @param {object} selectedItem
   */
  handleSelectItem = (selectedItem) => {
    const { resourceId } = this.props;
    this.setState({
      selectedItem: selectedItem ? selectedItem : null,
      draftPivot: {
        ...this.state.draftPivot,
        [resourceId]: selectedItem ? selectedItem.id : null,
      },
    });
  };

  /**
   * Calls item association function
   */
  associateItem = () => {
    const { linkResourceItemsRequest, resourceId } = this.props;
    const { selectedItem } = this.state;

    this.searchBarRef.current.clearSearch();

    linkResourceItemsRequest(resourceId, selectedItem.id);
  };

  /**
   * Calls search function
   * @param {object} search
   */
  executeSearch = (search) => {
    const { getItemsRequest, items } = this.props;

    let itemRequestParams = {
      name_sort: "asc",
      per_page: this.maxResultsPerSearch,
      ...search,
    };

    getItemsRequest(itemRequestParams, items);
  };

  searchBarLabel = () => {
    const { searchBarDisplay } = this.props;

    if (isNil(searchBarDisplay)) {
      return "Search for items to associate to this resource";
    }

    return searchBarDisplay;
  };

  queryKey = () => {
    const { queryKey } = this.props;

    if (isNil(queryKey)) {
      return "name";
    }

    return queryKey;
  };

  resultLabelTransform = (item) => {
    const { customDisplayComponent } = this.props;

    if (isNil(customDisplayComponent)) {
      return get(item, "name", "");
    }

    const CustomDisplayComponent = customDisplayComponent;

    return <CustomDisplayComponent item={item} />;
  };

  render() {
    const { classes, searchedItems, searchingItems, textFieldValueKey } = this.props;
    const { selectedItem } = this.state;

    return (
      <ValidatorForm onSubmit={this.associateItem}>
        <FormControl className={classes.formControl} variant="standard">
          <SearchBar
            ref={this.searchBarRef}
            label={this.searchBarLabel()}
            onSelectItem={this.handleSelectItem}
            queryKey={this.queryKey()}
            resultsSource={searchedItems}
            resultLabelTransform={(selectedItem) => {
              return this.resultLabelTransform(selectedItem);
            }}
            searchable={this.executeSearch}
            searching={searchingItems}
            textFieldValueKey={textFieldValueKey}
          />
        </FormControl>

        <FormControl className={classes.formControl} variant="standard">
          <Button
            aria-label="Add Item"
            color="primary"
            type="submit"
            variant="contained"
            disabled={!selectedItem}
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
});

const mapStateToProps = (state) => {
  return {};
};
const mapDispatchToProps = (dispatch) => ({});

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  withStyles(styles, { withTheme: true })(AssociatedItemsAddToForm)
);
