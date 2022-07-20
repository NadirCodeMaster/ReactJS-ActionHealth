import React from "react";
import PropTypes from "prop-types";
import HgTextField from "components/ui/HgTextField";
import { CircularProgress, Divider, IconButton, InputAdornment, MenuItem } from "@mui/material";
import { withStyles } from "@mui/styles";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import { clone, isEmpty } from "lodash";

/**
 * Defines a searchbar that can either be used to search an endpoint, or
 * a static array.
 *
 * If searchable prop defined, it will search the searchable endpoint, and
 * results prop will be the results.
 *
 * If searchable not defined, results prop will be searched by queryKey for
 * strings that include the searchQuery
 */
class SearchBar extends React.Component {
  state = {
    lastSearch: null,
    open: false,
    searchQuery: "",
    selectedItem: "",
  };

  static propTypes = {
    label: PropTypes.string,
    onSelectItem: PropTypes.func.isRequired,
    queryKey: PropTypes.string.isRequired,
    results: PropTypes.array,
    resultsSource: PropTypes.array.isRequired,
    resultLabelTransform: PropTypes.func,
    searchable: PropTypes.func.isRequired,
    searching: PropTypes.bool,
  };

  componentDidUpdate(prevProps, prevState) {
    const { searching: prevSearching } = prevProps;
    const { searchable, searching } = this.props;

    const { lastSearch: prevLastSearch } = prevState;
    const { lastSearch } = this.state;

    if (searchable) {
      if (prevSearching && !searching) {
        this.setState({ open: true });
      }
    } else {
      if (prevLastSearch !== lastSearch && lastSearch !== "") {
        this.setState({ open: true });
      }
    }
  }

  /**
   * Closing of MenuItem results from search
   */
  handleClose = () => {
    this.setState({ lastSearch: null, open: false });
  };

  /**
   * Opening of MenuItem results from search
   */
  handleOpen = () => {
    this.setState({ open: true });
  };

  /**
   * Cleanup and filtering of results
   * @returns {array} resultsSource
   */
  internalResults = () => {
    const { queryKey, resultsSource } = this.props;
    const { searchQuery } = this.state;
    let qLowerCase = searchQuery.toLowerCase();
    return resultsSource.filter((result) => result[queryKey].toLowerCase().includes(qLowerCase));
  };

  /**
   * When clicking X button to clear search value
   */
  clearSearch = () => {
    const { onSelectItem } = this.props;

    this.setState({ lastSearch: null, searchQuery: "", selectedItem: "" });
    onSelectItem(null);
  };

  /**
   * Handler for typing in search bar
   */
  onSearchChange = (event) => {
    this.setState({ searchQuery: event.target.value });
  };

  /**
   * Event when clicking on a result in MenuItem
   */
  handleMenuItemClick = (e, result) => {
    const { onSelectItem, textFieldValueKey, resultsSource, queryKey } = this.props;

    this.setState({
      selectedItem: textFieldValueKey ? result[textFieldValueKey] : result[queryKey],
    });

    onSelectItem(resultsSource.find((r) => r.id.toString() === result.id.toString()));
  };

  /**
   * State handling and endpoint call on search
   */
  search = () => {
    const { queryKey, searchable } = this.props;
    const { searchQuery } = this.state;

    this.setState({ lastSearch: clone(searchQuery) });
    searchable && searchable({ [queryKey]: searchQuery });
  };

  /**
   * @returns {string} TextField component value
   */
  textFieldValue = () => {
    const { searching } = this.props;
    const { lastSearch, searchQuery, selectedItem } = this.state;

    if (searching || (!lastSearch && !selectedItem)) {
      return searchQuery;
    } else {
      return selectedItem;
    }
  };

  /**
   * @returns {array} results from searching
   */
  menuItemResults = () => {
    const { resultsSource, searchable } = this.props;

    if (searchable) {
      return resultsSource; // for externally-provided results
    } else {
      return this.internalResults();
    }
  };

  /**
   * @returns {string} id attr for TextField
   */
  idAttrValue = () => {
    const { label, queryKey } = this.props;

    let labelForIdAttrValue = label ? label.replace(/\W/g, "") : "";
    labelForIdAttrValue = labelForIdAttrValue.toLowerCase();

    return `search_bar_${queryKey}_${labelForIdAttrValue}`;
  };

  /**
   * @returns {boolean} Should we display TextField for searching or for results
   */
  showSearchTextField = () => {
    const { searching } = this.props;
    const { lastSearch } = this.state;

    return !lastSearch || searching;
  };

  /**
   * @returns {object} jsx for end adornment (clear/search icons in bar)
   */
  endInputAdornment = () => {
    const { classes, searchable, searching } = this.props;
    const { selectedItem } = this.state;

    if (searchable && searching) {
      return <CircularProgress color="primary" size="1em" />;
    }

    return (
      <InputAdornment position="end">
        {!isEmpty(this.textFieldValue()) && (
          <IconButton
            aria-label="Clear"
            onClick={this.clearSearch}
            className={classes.endAdornmentIconButton}
            size="large"
          >
            <ClearIcon color="primary" />
          </IconButton>
        )}
        <Divider className={classes.iconButtonDivider} orientation="vertical" />
        <IconButton
          aria-label="Search"
          onClick={this.search}
          className={classes.endAdornmentIconButton}
          disabled={selectedItem ? true : false}
          size="large"
        >
          <SearchIcon color={selectedItem ? "secondary" : "primary"} />
        </IconButton>
      </InputAdornment>
    );
  };

  render() {
    const { label, queryKey, resultLabelTransform, searching } = this.props;
    const { lastSearch, open, searchQuery } = this.state;
    let results = this.menuItemResults();

    return this.showSearchTextField() ? (
      <HgTextField
        id={`searchable_${this.idAttrValue()}`}
        InputProps={{
          endAdornment: this.endInputAdornment(),
        }}
        label={label}
        name={queryKey}
        onChange={this.onSearchChange}
        onKeyDown={(e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            this.search();
          }
        }}
        value={this.textFieldValue()}
        variant="outlined"
      />
    ) : (
      <React.Fragment>
        <HgTextField
          id={`searched_${this.idAttrValue()}`}
          InputProps={{
            endAdornment: this.endInputAdornment(),
          }}
          label={lastSearch ? `Results for ${searchQuery}` : label}
          name={queryKey}
          select={lastSearch && !searching}
          SelectProps={{
            open,
            onClose: this.handleClose,
            onOpen: this.handleOpen,
            IconComponent: () => null,
          }}
          value={this.textFieldValue()}
          variant="outlined"
        >
          {lastSearch &&
            !searching &&
            (results.length ? (
              results.map((result, index) => (
                <MenuItem
                  key={`menu_item_${result.id}`}
                  value={result.id}
                  onClick={(e) => this.handleMenuItemClick(e, result)}
                >
                  {resultLabelTransform ? resultLabelTransform(result) : result[queryKey]}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                No results found for '{searchQuery}
                '.
              </MenuItem>
            ))}
        </HgTextField>
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  endAdornmentIconButton: {
    padding: theme.spacing(0.5),
  },
  iconButtonDivider: {
    height: theme.spacing(3),
    margin: theme.spacing(),
  },
});

export default withStyles(styles, { withTheme: true })(SearchBar);
