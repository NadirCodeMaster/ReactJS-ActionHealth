import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { filter, map, sortBy } from "lodash";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import ClearIcon from "@mui/icons-material/Clear";
import AssociatedItemAddToCriterionForm from "components/views/AssociatedItemAddToCriterionForm";
import repositionArrayItem from "utils/repositionArrayItem";
import errorSuffix from "utils/errorSuffix";
import ConfirmButton from "components/ui/ConfirmButton";

import hgToast from "utils/hgToast";

/**
 * UI for administration of Resources associated with a Criterion.
 *
 * Intended for use on the Criterion admin detail pages.
 */
class CriterionAssociatedItemAdmin extends React.Component {
  static propTypes = {
    criterionId: PropTypes.number.isRequired,
    associatedType: PropTypes.string.isRequired,
    criterionRequest: PropTypes.func.isRequired,
    criterionUpdate: PropTypes.func.isRequired,
    criterionUnlink: PropTypes.func.isRequired,
    requestAssociated: PropTypes.func.isRequired,
    requestAssociatedLink: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      associatedItems: [],
      associatedItemsLoading: false,
      associatedItemsSaving: false,
    };
    this.isCancelled = false;
    this.onDragEnd = this.onDragEnd.bind(this);
    this.loadAssociatedItems = this.loadAssociatedItems.bind(this);
  }

  componentDidMount() {
    this.loadAssociatedItems();
  }

  componentDidUpdate(prevProps) {
    const { callerAssociatedItems: prevCallerAssociatedItems, criterionId: prevCriterionId } =
      prevProps;
    const { callerAssociatedItems, criterionId } = this.props;

    if (prevCriterionId !== criterionId || prevCallerAssociatedItems !== callerAssociatedItems) {
      this.loadAssociatedItems();
    }
  }

  /**
   * Save criterion/resource associations to API.
   *
   * You must pass an array with pivot relationship objects to this method
   * (it doesn't extract them from state or anything like that). This also
   * means the resources in state could fall out of sync if the pivots param
   * is incorrect or competing operations are occurring).
   *
   * Existing resource associations are updated at the API if present in
   * the pivots param. They are removed at the API if not included in pivots.
   *
   * @param {Array} pivots Per params for requestUpdateCriterionResources()
   */
  saveAssociatedItems = (pivots) => {
    const { criterionId, criterionUpdate } = this.props;

    this.setState({ associatedItemsSaving: true });

    criterionUpdate(criterionId, pivots)
      .then((res) => {
        // SUCCESS
        hgToast("Item associations have been saved");
        if (!this.isCancelled) {
          this.setState({ associatedItemsSaving: false });
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred saving item associations. " + errorSuffix(error), "error");
        if (!this.isCancelled) {
          this.setState({ associatedItemsSaving: false });
        }
      });
  };

  /**
   * Populate state.resources array based on props.criterionId.
   */
  loadAssociatedItems = () => {
    const { criterionId, criterionRequest } = this.props;

    this.setState({ associatedItemsLoading: true });

    criterionRequest(criterionId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              associatedItemsLoading: false,
              associatedItems: sortBy(res.data.data, "pivot.weight"),
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving item records");
        if (!this.isCancelled) {
          this.setState({
            associatedItemsLoading: false,
            associatedItems: [],
          });
        }
      });
  };

  /**
   * Remove a resource from this criterion.
   */
  removeAssociatedItem = (associatedItemId) => {
    const { criterionId, criterionUnlink } = this.props;

    this.setState({ associatedItemsSaving: true });
    criterionUnlink(criterionId, associatedItemId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated item");
        if (!this.isCancelled) {
          // New array of items omitting the removed item.
          let newAssociatedItems = filter(this.state.associatedItems, (associatedItem) => {
            return associatedItem.id !== associatedItemId;
          });
          this.setState({
            associatedItems: newAssociatedItems,
            associatedItemsSaving: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating item", "error");
        if (!this.isCancelled) {
          this.setState({ associatedItemsSaving: false });
        }
      });
  };

  /**
   * Handler for DragDropContext onDragEnd.
   *
   * @param {Object} result
   *  The dropped item. Its draggableId prop will contain it's ID (i.e., the
   *  item ID). Its new position collection of items is accessed via
   *  result.destination.index.
   */
  onDragEnd(result) {
    const { requestId } = this.props;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedAssociatedItems = repositionArrayItem(
      this.state.associatedItems,
      result.source.index,
      result.destination.index
    );

    // Modify the pivot.weight prop of each item to reflect change.
    let newAssociatedItems = map(reorderedAssociatedItems, (item, index) => {
      item.pivot.weight = (index + 1) * 10;
      return item;
    });

    // Create array of minimal pivot objects to send to API.
    let newAssociatedItemPivots = map(newAssociatedItems, (item) => {
      return {
        [requestId]: item.id,
        weight: item.pivot.weight,
      };
    });

    // Save changes.
    this.saveAssociatedItems(newAssociatedItemPivots);

    // Update items in component state.
    this.setState({
      associatedItems: newAssociatedItems,
    });
  }

  render() {
    const {
      associatedType,
      classes,
      criterionId,
      requestAssociated,
      requestAssociatedLink,
      requestId,
      theme,
      labelRender,
    } = this.props;
    const { associatedItemsLoading, associatedItemsSaving } = this.state;
    let { associatedItems } = this.state;

    let showLoader = associatedItemsLoading || associatedItemsSaving;
    let disable = associatedItemsLoading || associatedItemsSaving;
    let hasAssociatedItems = associatedItems && associatedItems.length > 0;

    if (labelRender) {
      associatedItems = labelRender(associatedItems);
    }

    return (
      <div style={{ position: "relative" }}>
        {showLoader && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: theme.spacing(),
            }}
          >
            <CircularProgress />
          </div>
        )}

        {!showLoader && !hasAssociatedItems && (
          <p>
            <br />
            <em>No items are associated with this Criterion.</em>
            <br />
          </p>
        )}

        <AssociatedItemAddToCriterionForm
          associatedType={associatedType}
          criterionId={criterionId}
          criterionAssociatedItems={associatedItems}
          requestId={requestId}
          callbackAfterAdd={this.loadAssociatedItems}
          requestAssociated={requestAssociated}
          requestAssociatedLink={requestAssociatedLink}
          labelRender={labelRender ? labelRender : undefined}
        />
        <br />

        {hasAssociatedItems && (
          <React.Fragment>
            <p>Drag and drop the items below to reorder them.</p>

            <DragDropContext onDragEnd={this.onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    {this.state.associatedItems.map((associatedItem, index) => (
                      <Draggable
                        key={associatedItem.id}
                        draggableId={`associated_item_${associatedItem.id}`}
                        index={index}
                        isDragDisabled={disable}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              disable,
                              provided.draggableProps.style
                            )}
                          >
                            <div className={classes.associatedItemName}>{associatedItem.name}</div>
                            <ConfirmButton
                              className={classes.removeAssociatedItemButton}
                              size="small"
                              color="primary"
                              onConfirm={() => this.removeAssociatedItem(associatedItem.id)}
                              title="Are you sure you want to disassociate this item?"
                              aria-label="Remove"
                              variant="text"
                            >
                              <ClearIcon fontSize="small" />
                            </ConfirmButton>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </React.Fragment>
        )}
      </div>
    );
  }
}

/**
 * Basic styles for the draggable items.
 *
 * @link https://codesandbox.io/s/k260nyxq9v
 */
const getItemStyle = (isDragging, disabled, draggableStyle) => ({
  userSelect: "none",
  padding: 8, // @TODO
  margin: `0.5em 0`,
  color: isDragging ? "#FFFFFF" : "#55524C",
  backgroundColor: isDragging ? "rgba(251,79,20, 0.5)" : "#FFFFFF",
  border: isDragging ? "1px solid #FB4F14" : "1px solid #DDDDDD",
  overflow: "auto",
  opacity: disabled ? 0.5 : 1.0,
  // styles we need to apply on draggables:
  ...draggableStyle,
});

/**
 * Basic styles for the list.
 *
 * @link https://codesandbox.io/s/k260nyxq9v
 */
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "#ECF8EC" : "#FFF",
});

const styles = (theme) => ({
  associatedItemName: {
    float: "left",
    marginBottom: theme.spacing(),
    marginRight: theme.spacing(),
    marginTop: theme.spacing(),
  },
  removeAssociatedItemButton: {
    float: "right",
    minWidth: "unset",
  },
});

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => ({});

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(withStyles(styles, { withTheme: true })(CriterionAssociatedItemAdmin));
