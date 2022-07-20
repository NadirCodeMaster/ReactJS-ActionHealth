import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { get, isNil } from "lodash";
import { CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { withStyles } from "@mui/styles";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmButton from "components/ui/ConfirmButton";
import AssociatedItemsAddToForm from "./AssociatedItemsAddToForm";

/**
 * UI for administration of items association with resources.
 *
 * Intended for use on the Resource admin detail pages.
 */

class AssociatedItems extends React.Component {
  static propTypes = {
    resourceId: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    itemsLoading: PropTypes.bool.isRequired,
    itemsNeedRefresh: PropTypes.bool.isRequired,
    itemsAreRefreshed: PropTypes.func.isRequired,
    searchedItems: PropTypes.array,
    searchingItems: PropTypes.bool,
    getItemsRequest: PropTypes.func.isRequired,
    getResourceItemsRequest: PropTypes.func.isRequired,
    linkResourceItemsRequest: PropTypes.func.isRequired,
    unlinkResourceItemsRequest: PropTypes.func.isRequired,
    textFieldValueKey: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.isCancelled = false;
  }

  componentDidMount() {
    this.refreshItems();
  }

  componentDidUpdate() {
    const { itemsNeedRefresh } = this.props;

    if (itemsNeedRefresh) {
      this.refreshItems();
    }
  }

  /**
   * Calls refresh item function
   */
  refreshItems = () => {
    const { getResourceItemsRequest, itemsAreRefreshed, resourceId } = this.props;

    getResourceItemsRequest(resourceId);
    itemsAreRefreshed();
  };

  /**
   * Calls unlink item function
   */
  unlinkItem = (itemId) => {
    const { unlinkResourceItemsRequest, resourceId } = this.props;

    unlinkResourceItemsRequest(resourceId, itemId);
  };

  confirmButton = (itemId) => {
    const { classes, itemsLoading } = this.props;

    return (
      <ConfirmButton
        className={classes.removeItemButton}
        size="small"
        color="primary"
        onConfirm={() => this.unlinkItem(itemId)}
        title="Are you sure you want to disassociate this item?"
        aria-label="Remove"
        variant="text"
        disabled={itemsLoading}
      >
        <ClearIcon fontSize="small" />
      </ConfirmButton>
    );
  };

  /**
   * What to render for ListItemText primary prop
   */
  listItemTextPrimary = (item) => {
    const { classes, customDisplayComponent } = this.props;

    let CustomDisplayComponent = customDisplayComponent;

    return (
      <div className={classes.listItemContainer}>
        <div className={classes.listItemTextContainer}>
          {!isNil(customDisplayComponent) && <CustomDisplayComponent item={item} />}
          {isNil(customDisplayComponent) && (
            <React.Fragment>{get(item, "name", "")}</React.Fragment>
          )}
        </div>
        <div className={classes.removeItemButton}>{this.confirmButton(item.id)}</div>
      </div>
    );
  };

  render() {
    const {
      classes,
      customDisplayComponent,
      resourceId,
      items,
      itemsLoading,
      itemsNeedRefresh,
      itemsAreRefreshed,
      getResourceItemsRequest,
      getItemsRequest,
      searchedItems,
      searchingItems,
      linkResourceItemsRequest,
      searchBarDisplay,
      queryKey,
      textFieldValueKey,
    } = this.props;

    return (
      <React.Fragment>
        <div>
          <AssociatedItemsAddToForm
            resourceId={resourceId}
            items={items}
            itemsLoading={itemsLoading}
            itemsNeedRefresh={itemsNeedRefresh}
            itemsAreRefreshed={itemsAreRefreshed}
            searchedItems={searchedItems}
            searchingItems={searchingItems}
            getItemsRequest={getItemsRequest}
            getResourceItemsRequest={getResourceItemsRequest}
            linkResourceItemsRequest={linkResourceItemsRequest}
            searchBarDisplay={searchBarDisplay}
            queryKey={queryKey}
            customDisplayComponent={customDisplayComponent}
            textFieldValueKey={textFieldValueKey}
          />
        </div>

        {itemsLoading && (
          <CircularProgress size={"1em"} className={classes.loadingCircularProgress} />
        )}

        <List dense={true}>
          {items.map((item, index) => {
            let itemText = this.listItemTextPrimary(item);

            return (
              <ListItem key={item.id}>
                <ListItemText disableTypography primary={itemText} />
              </ListItem>
            );
          })}
        </List>
      </React.Fragment>
    );
  }
}
const styles = (theme) => ({
  removeItemButton: {
    minWidth: "unset",
    position: "relative",
    top: "-1px",
  },
  loadingCircularProgress: {
    marginTop: theme.spacing(2),
  },
  listItemContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  listItemTextContainer: {
    width: "100%",
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
)(withStyles(styles, { withTheme: true })(AssociatedItems));
