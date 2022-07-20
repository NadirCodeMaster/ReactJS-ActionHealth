import React, { Fragment, useCallback, useEffect, useReducer, useRef, useState } from "react";
import moment from "moment";
import { useHistory, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  debounce,
  find,
  findIndex,
  forEach,
  get,
  includes,
  isArray,
  isObject,
  sortBy,
} from "lodash";
import { Fade, Modal, Paper } from "@mui/material";
import ItemDetail from "./ItemDetail/ItemDetail";
import ItemNew from "./ItemNew/ItemNew";
import PlanBoard from "./PlanBoard/PlanBoard";
import getPusherInstance from "api/getPusherInstance";
import { currentUserShape, organizationWithAvailableSetsShape } from "constants/propTypeShapes";
import {
  requestCreatePlanItems,
  requestDeletePlanItem,
  requestOrganizationPlan,
  requestOrganizationPlanBuckets,
  requestOrganizationPlanItems,
  requestOrganizationSets,
  requestPlanItem,
  requestUpdatePlanBucketItems,
  requestUpdatePlanItem,
} from "api/requests";
import bucketItemsForBucket from "../utils/bucketItemsForBucket";
import itemsReducer from "../utils/itemsReducer";
import { nullBucket } from "../utils/constants";
import generatePlanItemViewData from "../utils/generatePlanItemViewData";
import findCurrentResponseTextForCriterion from "utils/orgSetsData/findCurrentResponseTextForCriterion";
import isNumeric from "utils/isNumeric";
import hgToast from "utils/hgToast";
import styleVars from "style/_vars.scss";

//
// Action Plan
// -----------
// Acts as controller for the plan board and detail subpages/views.
//

export default function Plan({
  detailItemId,
  currentUser,
  organization,
  programs,
  userCanViewActionPlan,
  userCanEditActionPlan,
  userCanViewAssessment,
  userCanEditAssessment,
  userCanInviteOrgUsers,
  userCanViewCriterionTasks,
  userCanEditCriterionTasks,
  userCanViewCriterionNotes,
  userCanEditCriterionNotes,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const pusherRef = useRef(getPusherInstance());

  const history = useHistory();
  const location = useLocation();

  // Whether we will render as "blank state" (i.e., no items).
  // @TODO We don't actually show anything different for the blank state.
  const [isBlankState, setIsBlankState] = useState(false);

  const [orgSetsData, setOrgSetsData] = useState([]);

  // Plan-related state vars.
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  // -- Items
  const [items, dispatchItemsReducer] = useReducer(itemsReducer, []);
  const [itemsLoading, setItemsLoading] = useState(false);
  // eslint-disable-next-line
  const [creatingNewItems, setCreatingNewItems] = useState(false); // when new item record(s) are being created.
  const [bucketItems, setBucketItems] = useState({}); // items grouped by ID of bucket they belong to. Keyed by bucket Id.
  // -- Buckets
  const [buckets, setBuckets] = useState([]);
  // eslint-disable-next-line
  const [bucketsLoading, setBucketsLoading] = useState(false);

  // Detail plan item, to be shown in modal.
  // Determined by detailItemId.
  // URL path is: app/account/organizations/{ID}/plan/issues/{ID}
  const [detailItem, setDetailItem] = useState(null); // null or item object
  const [detailItemModalOpen, setDetailItemModalOpen] = useState(false);

  // New item. Form is shown in modal.
  // URL path is: app/account/organizations/{ID}/plan/issues/new
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  // General messaging via toastify.
  const notify = useCallback((msg) => hgToast(msg), []);

  // Websocket-related messaging via toastify.
  // Use this for notifying about changes coming in from Pusher. It's
  // debounced to avoid duplicate/excessive notifications.
  //
  // NOTE: The eslint line disable is to prevent warning about "useCallback
  //       received a function whose dependencies are unknown" that comes
  //       from using debounce().
  //
  // eslint-disable-next-line
  const notifyAboutWsChanges = useCallback(
    debounce(
      () => {
        hgToast(changesFromOthersAppliedMessage, "info");
      },
      6000,
      { leading: true, trailing: false }
    ),
    []
  );

  // Load plan.
  const loadPlan = useCallback(() => {
    if (userCanViewActionPlan) {
      setPlanLoading(true);
      requestOrganizationPlan(organization.id)
        .then((res) => {
          let newPlan = get(res, "data.data", null);
          // If that is not an object, we need to know
          if (!isObject(newPlan)) {
            console.warn("received non-object plan from API", newPlan);
            newPlan = {};
          }
          if (mounted.current) {
            setPlan(newPlan);
            setPlanLoading(false);
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setPlan(null);
            setPlanLoading(false);
            console.error(`An error occurred retrieving plan. ${error.name}: ${error.message}`);
          }
        });
    }
  }, [organization, userCanViewActionPlan]);

  // Load buckets.
  const loadBuckets = useCallback(() => {
    if (userCanViewActionPlan) {
      setBucketsLoading(true);
      requestOrganizationPlanBuckets(organization.id)
        .then((res) => {
          // Sort 'em.
          let sortedBuckets = sortBy(res.data.data, ["weight"]);
          // Prepend the null bucket.
          sortedBuckets.unshift(nullBucket);
          if (mounted.current) {
            setBuckets(sortedBuckets);
            setBucketsLoading(false);
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setBuckets([]);
            setBucketsLoading(false);
            console.error(`An error occurred retrieving buckets. ${error.name}: ${error.message}`);
          }
        });
    }
  }, [organization, userCanViewActionPlan]);

  // Load all items.
  // Note: This replaces the entire items array.
  const loadItems = useCallback(() => {
    setItemsLoading(true);
    requestOrganizationPlanItems(organization.id)
      .then((res) => {
        let newItems = res.data.data;
        if (mounted.current) {
          dispatchItemsReducer({ type: "replace", payload: newItems });
          setItemsLoading(false);
        }
      })
      .catch((error) => {
        if (mounted.current) {
          dispatchItemsReducer({ type: "clear" });
          setItemsLoading(false);
          console.error(`An error occurred retrieving items. ${error.name}: ${error.message}`);
        }
      });
  }, [organization]);

  // Reload items for a specific bucket.
  // This will remove all items in the reducer _for that bucket_, then
  // insert whatever the server returns. An empty or non-numeric bucketId
  // will be treated as the null bucket.
  // @TODO TEST THIS, IMPLEMENT IF NEEDED
  // eslint-disable-next-line
  const reloadBucketItems = useCallback(
    (bucketId) => {
      if (userCanViewActionPlan) {
        setItemsLoading(true);

        requestOrganizationPlanItems(organization.id)
          .then((res) => {
            // Locate existing items to purge.
            let _bucketId = null;
            if (isNumeric(bucketId) && Number(bucketId) >= 0) {
              _bucketId = Number(bucketId);
            }
            let curBucketItems = items.forEach((item) => {
              return item.plan_bucket_id === _bucketId;
            });
            dispatchItemsReducer({
              type: "remove",
              payload: curBucketItems.map((item) => item.id),
            });

            // Add the updated ones.
            let newItems = res.data.data;
            if (mounted.current) {
              dispatchItemsReducer({ type: "add", payload: newItems });
              setItemsLoading(false);
            }
          })
          .catch((error) => {
            if (mounted.current) {
              setItemsLoading(false);
              console.error(`An error occurred retrieving items. ${error.name}: ${error.message}`);
            }
          });
      }
    },
    [items, organization, userCanViewActionPlan]
  );

  // Load plan data when org changes.
  useEffect(() => {
    loadPlan();
    loadBuckets();
    loadItems();
  }, [loadPlan, loadBuckets, loadItems, organization]);

  // (re)load an item.
  // Item will be retrieved from the server and updated in `items`.
  const loadItem = useCallback((itemId, callback = null) => {
    requestPlanItem(itemId)
      .then((res) => {
        let newItem = res.data.data;
        if (mounted.current) {
          dispatchItemsReducer({ type: "add", payload: [newItem] });
        }
        if (callback) {
          callback(true);
        }
      })
      .catch((error) => {
        if (mounted.current) {
          dispatchItemsReducer({ type: "remove", payload: [itemId] });
          console.error(`An error occurred retrieving item. ${error.name}: ${error.message}`);
        }
        if (callback) {
          callback(false);
        }
      });
  }, []);

  // Handle incoming websocket plan item event notifications for pusher.
  //
  // @param {string} eventName
  // @param {array} data
  const handleWsPlanItemEvent = useCallback(
    (eventName, data) => {
      // @TODO Remove. (temp for debugging)
      // console.log("handleWsPlanItemEvent | pusher instance:", pusherRef.current);
      // console.log(`handleWsPlanItemEvent | ${eventName} | data:`, data);
      // ------------------------------------------------------------------

      switch (eventName) {
        case "plan-items-added":
        case "plan-items-updated":
          // --------------------------------------------------------------------------------
          // @TODO Rework how we're incorporating Pusher updates so we can simply
          // dispatch the items reducer here using the payload from Pusher.
          // (Our old channels don't provide all of the properties we now need,
          //  so we're triggering reload of the item that we found out was updated).
          let itemId = get(data, "id", null);
          if (itemId) {
            loadItem(itemId, (ok) => {
              if (ok) {
                // @TODO Only show message if user is on the plan board (not detail, etc),
                // but make avoid using location or other frequently-changing value
                // as a dependency on this function.
                notifyAboutWsChanges();
              } else {
                console.error("Failed to apply pushed changes");
              }
            });
          }
          // --------------------------------------------------------------------------------
          break;
        case "plan-items-removed":
          // @TODO Only show message if user is on the plan board (not detail, etc),
          // but make avoid using location or other frequently-changing value
          // as a dependency on this function.
          dispatchItemsReducer({
            type: "remove",
            payload: data,
          });
          notifyAboutWsChanges();
          break;
        default:
        // no default
      }
    },
    [loadItem, notifyAboutWsChanges]
  );

  // Declare blank state if there are no items and we aren't actively loading items.
  useEffect(() => {
    let newIsBlankState = false;
    if (!itemsLoading && isArray(items) && 0 === items.length) {
      newIsBlankState = true;
    }
    setIsBlankState(newIsBlankState);
  }, [items, itemsLoading]);

  // For plan items: Populate pusher instance, set channels and subscriptions.
  useEffect(() => {
    let ws = pusherRef.current;

    let wsPlanItemUpdatesCh = ws.subscribe(wsPlanItemUpdatesChannnelName(organization));
    for (let e of wsPlanItemUpdatesChannnelEvents) {
      wsPlanItemUpdatesCh.bind(e, (data) => {
        handleWsPlanItemEvent(e, data);
      });
    }
    // return teardown function.
    return () => {
      ws.unsubscribe(wsPlanItemUpdatesChannnelName(organization));
    };
  }, [handleWsPlanItemEvent, organization]);

  // Handle incoming websocket bucket event notifications for pusher.
  //
  // @param {int} bucketId
  // @param {string} eventName
  // @param {array} data
  //   const handleWsBucketEvent = useCallback(
  //     (eventName, data) => {
  //       let itemsCopy = items.slice(),
  //         itemPos,
  //         showChangesAppliedMessage;
  //
  //       // @TODO Remove. (temp for debugging)
  //       // console.log(`handleWsBucketEvent | ${eventName} | data:`, data);
  //       return;
  //       switch (eventName) {
  //         case 'plan-items-sorted':
  //           // Data will be an array of objects containing item IDs and
  //           // corresponding weights within a bucket.
  //           // All we need to do is locate those items and adjust their weight
  //           // values, and that will result in correct sorting within the
  //           // bucket. @TODO It's not resulting in the correct sorting.
  //           let newWeight = 0;
  //           forEach(data, sortedItem => {
  //             itemPos = findIndex(itemsCopy, ['id', sortedItem.id]);
  //             if (itemPos !== -1) {
  //               // Skip if not found. Otherwise, modify it.
  //               newWeight = sortedItem.weight ? sortedItem.weight : 1;
  //               itemsCopy[itemPos].weight = newWeight;
  //             }
  //           });
  //           showChangesAppliedMessage = true;
  //           dispatchItemsReducer({ type: 'add', payload: itemsCopy });
  //           break;
  //         default:
  //         // no default
  //       }
  //
  //       if (showChangesAppliedMessage) {
  //         hgToast(changesFromOthersAppliedMessage, 'info');
  //       }
  //     },
  //     [items]
  //   );

  // For buckets: Populate pusher instance, set channels and subscriptions.
  //   useEffect(() => {
  //     let ws = pusherRef.current;
  //     let bIds = buckets.map(b => b.id);
  //     let chNames = wsBucketUpdatesChannnelNames(organization, bIds);
  //
  //     let subs = {};
  //     chNames.forEach(chName => {
  //       subs[chName] = ws.subscribe(chName);
  //       for (let e of wsBucketUpdatesChannnelEvents) {
  //         subs[chName].bind(e, data => {
  //           handleWsBucketEvent(e, data);
  //         });
  //       }
  //     });
  //
  //     // return teardown function.
  //     return () => {
  //       chNames.forEach(chName => {
  //         ws.unsubscribe(chNames);
  //       });
  //     };
  //   }, [buckets, handleWsBucketEvent, organization]);

  // Watch and adjust for URL path changes.
  useEffect(() => {
    // Close new item modal if not at that path.
    let reNewItemPath = /^app\/account\/organizations\/([\d]+)\/plan\/items\/new([/]?)$/i;
    if (!reNewItemPath.test(location.pathname)) {
      setNewItemModalOpen(false);
    }
    // Close detail item modal if not at that path.
    let reDetailItemPath = /^app\/account\/organizations\/([\d]+)\/plan\/items\/([\d]+)([/]?)$/i;
    if (!reDetailItemPath.test(location.pathname)) {
      setDetailItemModalOpen(false);
    }
  }, [location, organization]);

  // Set the detail item (shown in modal) when detailItemId changes.
  useEffect(() => {
    let newDetailItem = null;
    if (detailItemId && isNumeric(detailItemId)) {
      // Retrieve it from items array.
      let v = find(items, ["id", Number(detailItemId)]);
      newDetailItem = v ? v : null;
    }
    setDetailItem(newDetailItem);
  }, [detailItemId, items]);

  // Open the item detail modal when detail item is populated.
  useEffect(() => {
    let newVal = detailItem ? true : false;
    if (mounted.current) {
      setDetailItemModalOpen(newVal);
    }
  }, [detailItem]);

  // Open/close the detail item modal.
  const toggleDetailItemModal = useCallback((open) => {
    open = !!open; // ensure it's a pure bool
    if (mounted.current) {
      setDetailItemModalOpen(open);
    }
  }, []);

  // Open the new item modal when detail item id prop is for "new".
  useEffect(() => {
    if ("new" === detailItemId && mounted.current) {
      setNewItemModalOpen(true);
    }
  }, [detailItemId]);

  // Open/close the new item modal.
  const toggleNewItemModal = useCallback((open) => {
    open = !!open; // ensure it's a pure bool
    if (mounted.current) {
      setNewItemModalOpen(open);
    }
  }, []);

  /**
   * Populate bucketItems property using provided buckets, items.
   *
   * @param {array} buckets
   * @param {array} items
   */
  useEffect(() => {
    let draftBucketItems = {};
    forEach(buckets, (b) => {
      draftBucketItems[b.id] = bucketItemsForBucket(b.id, items);
    });
    setBucketItems(draftBucketItems);
  }, [buckets, items]);

  /**
   * Save sorted array of items to a bucket.
   *
   * This will immediately update bucketItems in component state and asynchronously
   * save those changes to the server.
   *
   * @param {Number|String} bucketId
   *  Bucket ID or equivalent, such as tne null bucket ID.
   * @param {Array} planItems
   *  Sorted array of items to be stored in bucket. Must include
   *  _all_ items in the bucket, not just new.
   * @param {Function|null} callback Optional callback that takes bool success arg.
   */
  const saveBucketItems = useCallback(
    (bucketId, planItems, callback = null) => {
      bucketId = !bucketId ? 0 : Number(bucketId);
      requestUpdatePlanBucketItems(organization.id, bucketId, planItems)
        .then((res) => {
          if (200 === res.status || 201 === res.status) {
            if (callback && mounted.current) {
              callback(true);
            }
          }
        })
        .catch((err) => {
          if (callback && mounted.current) {
            callback(false);
          }
          console.error("Error saving bucket items");
        });
    },
    [organization]
  );

  /**
   * Add multiple new items to the Action Plan in this.state.
   *
   * @param {Array} planItems
   *  Actual array of PlanItems to create. See API docs for /api/v1/plan-items-bulk endpoint,
   *  where these end up in the "items" property.
   * @param {Function|null} callback
   *  Optional callback that takes bool success arg.
   */
  const createNewItems = useCallback(
    (planItems, callback = null) => {
      if (organization && plan && plan.organization_id === organization.id) {
        setCreatingNewItems(true);
        let _planItemsToSubmit = [];
        let _criterionIdsIncluded = [];
        forEach(planItems, (item) => {
          // Only assume we'll add item if it doesn't have a criterion_id
          // (we'll check for dupes below)
          let addIt = !item.criterion_id;
          // Check for dupe criterion IDs within this submission.
          if (!addIt && !includes(_criterionIdsIncluded, item.criterion_id)) {
            _criterionIdsIncluded.push(item.criterion_id);
            addIt = true;
          }
          if (addIt) {
            _planItemsToSubmit.push(item);
          }
        });

        let data = {
          plan_id: plan.id,
          organization_id: organization.id,
          items: _planItemsToSubmit,
        };
        requestCreatePlanItems(data)
          .then((res) => {
            if (200 === res.status || 201 === res.status) {
              if (mounted.current) {
                setCreatingNewItems(false);
                if (callback) {
                  callback(true);
                }
              }
            }
          })
          .catch((err) => {
            if (mounted.current) {
              setCreatingNewItems(false);
              if (callback) {
                callback(false, err);
              }
            }
          });
      }
    },
    [organization, plan]
  );

  /**
   * Move items from one bucket to another.
   *
   * @param {Array} sourceList Bucket list item is coming from.
   * @param {mixed} sourceBucketId Allows faux bucket IDs.
   * @param {Number} sourceIndex Index of item that is being moved out of source array
   * @param {Array} destinationList Bucket list item is going to.
   * @param {mixed} destinationBucketId Allows faux bucket IDs.
   * @param {Number} destinationIndex Index of item that is being moved out of source array
   * @param {Function|null} callback
   *  Optional callback that takes bool success arg.
   * @returns {Object}
   *  Returns object with two properties: One for the source bucket
   *  and one for the destination. They are named based on the
   *  corresponding bucket IDs (includeing any faux IDs).
   *  They contain the updated list for each.
   *  @see saveBucketItems()
   */
  const moveItemsBetweenBuckets = useCallback(
    (
      sourceList,
      sourceBucketId,
      sourceIndex,
      destinationList,
      destinationBucketId,
      destinationIndex,
      callback = null
    ) => {
      // const { items } = this.state;

      const sourceListClone = Array.from(sourceList);
      const destListClone = Array.from(destinationList);
      const [removed] = sourceListClone.splice(sourceIndex, 1);

      destListClone.splice(destinationIndex, 0, removed);

      const results = {};
      results[sourceBucketId] = sourceListClone;
      results[destinationBucketId] = destListClone;

      // Update in items array, which will trigger bucketItems updates.
      let itemsCopy = items.slice(),
        itemPos,
        indexForWeight = 0;

      for (let itemInDest of results[destinationBucketId]) {
        itemPos = findIndex(itemsCopy, ["id", itemInDest.id]);
        if (itemPos !== -1 && itemsCopy[itemPos]) {
          let _bid = destinationBucketId;
          if (destinationBucketId === nullBucket.id) {
            _bid = null;
          }
          itemsCopy[itemPos].plan_bucket_id = _bid;
          itemsCopy[itemPos].weight = indexForWeight++;
        }
      }

      // Update component state immediately.
      dispatchItemsReducer({ type: "add", payload: itemsCopy });

      // Report just the _destination_ bucket change to the server.
      // (That will modify the bucket ID if the item in question,
      //  which effectively does all of the work. The correct sorting
      //  is maintained by the weight (on the server) and the list
      //  position (here in the FE)).
      saveBucketItems(destinationBucketId, results[destinationBucketId], callback);

      return results;
    },
    [items, saveBucketItems]
  );

  /**
   * Reorder bucket items.
   *
   * Updates state.items and saves change to the server.
   *
   * @method reorder
   * @param  {Array} prevOrderedBucketItems Old-sorted array of items.
   * @param  {mixed} bucketId Bucket ID (faux bucket IDs allowed)
   * @param  {Number} startIndex Original index of item in items.
   * @param  {Number} endIndex Destination index of item in items.
   * @param {Function|null} callback
   *  Optional callback that takes bool success arg.
   * @return {Array} Re-sorted copy of items.
   * @see saveBucketItems()
   */
  const reorderItemsInBucket = useCallback(
    (prevOrderedBucketItems, bucketId, startIndex, endIndex, callback = null) => {
      const result = Array.from(prevOrderedBucketItems);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      // Clone state items and modify weights there for sake of UI.
      let itemsCopy = items.slice(),
        itemPos;

      for (let i = 0; i < result.length; i++) {
        itemPos = findIndex(itemsCopy, ["id", result[i].id]);
        if (itemPos !== -1 && itemsCopy[itemPos]) {
          itemsCopy[itemPos].weight = i + 1;
        }
      }

      // Update component state immediately.
      dispatchItemsReducer({ type: "add", payload: itemsCopy });

      // Save the change behind the scenes.
      saveBucketItems(bucketId, result, callback);
      return result;
    },
    [items, saveBucketItems]
  );

  /**
   * Change a single PlanItem's assigned bucket.
   *
   * @param {Object} planItem
   * @param {mixed} newBucketId Numweric ID, null, or nullBucket.id.
   * @param {Function|null} callback Optional callback that takes bool success arg.
   */
  const moveItem = useCallback(
    (planItem, newBucketId, callback = null) => {
      let itemsCopy = items.slice();
      newBucketId = newBucketId ? newBucketId : null;

      if (isNumeric(newBucketId)) {
        // Cast numeric bucket IDs
        newBucketId = Number(newBucketId);
      } else {
        // Handle special cases here.
        if (newBucketId === nullBucket.id) {
          newBucketId = null;
        }
      }

      planItem.plan_bucket_id = newBucketId;
      planItem.weight = 0;

      // Find in items array and save it there for the UI.
      let itemPos = findIndex(itemsCopy, ["id", planItem.id]);
      if (itemPos !== -1) {
        itemsCopy[itemPos] = planItem;
        dispatchItemsReducer({ type: "replace", payload: itemsCopy });
        // this.setState({
        //   items: itemsCopy
        // });
      }

      // Then send change to server.
      requestUpdatePlanItem(planItem)
        .then((res) => {
          if (callback && mounted.current) {
            callback(true);
          }
        })
        .catch((err) => {
          if (callback && mounted.current) {
            callback(false);
          }
          console.error("An error occurred updating a planItem bucket assignment", err);
        });
    },
    [items]
  );

  /**
   * Check if a Criterion is already in the org's action plan.
   *
   * @param {Number} criterionId
   * @returns {boolean}
   */
  const isCriterionInPlan = useCallback(
    (criterionId) => {
      return Boolean(find(items, ["criterion_id", criterionId]));
    },
    [items]
  );

  // Load orgSetsData when org is present or changed.
  // @TODOP REFACTOR TO RELY ON PLAN ITEMS INSTEAD OF ORGSETSDATA
  useEffect(() => {
    if (userCanViewAssessment) {
      requestOrganizationSets(organization.id)
        .then((res) => {
          if (mounted.current) {
            setOrgSetsData(res.data.data);
          }
        })
        .catch((error) => {
          if (mounted.current) {
            setOrgSetsData([]);
            console.error(
              `An error occurred retrieving the organization sets data. ${error.name}: ${error.message}`
            );
          }
        });
    } else {
      // User not allowed, so clear orgSetsData.
      setOrgSetsData([]);
    }
  }, [organization, userCanViewAssessment]);

  /**
   * Mark a plan item as complete.
   * @param {Object} planItem
   * @param {Function|null} callback Optional callback that takes bool success arg.
   */
  const closeItem = useCallback(
    (planItem, callback = null) => {
      planItem.date_completed = moment().toISOString();
      planItem.completed_by = currentUser.data.id;

      requestUpdatePlanItem(planItem)
        .then((res) => {
          if (mounted.current) {
            if (callback) {
              callback(true);
            }
          }
        })
        .catch((err) => {
          if (mounted.current) {
            if (callback) {
              callback(false);
            }
            console.error("An error occurred marking an item complete");
          }
        });
    },
    [currentUser]
  );

  /**
   * Delete a plan item.
   * @param {Object} planItem
   * @param {Function|null} callback Optional callback that takes bool success arg.
   */
  const deleteItem = (planItem, callback = null) => {
    requestDeletePlanItem(planItem.id)
      .then((res) => {
        if (mounted.current && callback) {
          callback(true);
        }
      })
      .catch((err) => {
        if (mounted.current && callback) {
          callback(false);
        }
        console.error("An error occurred deleting an item");
      });
  };

  /**
   * Reopen a previously completed plan item.
   * @param {Object} planItem
   * @param {Function|null} callback Optional callback that takes bool success arg.
   */
  const reopenItem = (planItem, callback = null) => {
    planItem.date_completed = null;
    planItem.completed_by = null;

    requestUpdatePlanItem(planItem)
      .then((res) => {
        if (mounted.current && callback) {
          callback(true);
        }
      })
      .catch((err) => {
        if (mounted.current && callback) {
          callback(false);
        }
        console.error("An error occurred re-opening an item");
      });
  };

  // Add/update a plan item in our items store.
  //
  // Intended primarily for passing along to child components
  // so they can easily send changes upstream.
  // @TODO MAYBE NOT NEEDED (but is new as of 11/2021)
  // const applyUpdatedPlanItem = (planItem) => {
  //   dispatchItemsReducer({ type: 'add', payload: [planItem] });
  // };

  // OUTPUT =====================================================================
  return (
    <Fragment>
      {/* ========== PRIMARY DISPLAY ========== */}
      {isBlankState && (
        <Fragment>
          {/* @TODO
            We eventually want a special "blank state" view here, so
            we're leaving this carve out in place so it's easy to
            implement when the time comes.
          */}
        </Fragment>
      )}

      {plan ? (
        <PlanBoard
          bucketItems={bucketItems}
          buckets={buckets}
          closeItem={closeItem}
          currentUser={currentUser}
          deleteItem={deleteItem}
          organization={organization}
          orgSetsData={orgSetsData}
          moveItemsBetweenBuckets={moveItemsBetweenBuckets}
          plan={plan}
          generatePlanItemViewData={generatePlanItemViewData}
          reopenItem={reopenItem}
          reorderItemsInBucket={reorderItemsInBucket}
          showMessageFn={notify}
          userCanViewActionPlan={userCanViewActionPlan}
          userCanEditActionPlan={userCanEditActionPlan}
          userCanViewAssessment={userCanViewAssessment}
          findCurrentResponseTextForCriterion={findCurrentResponseTextForCriterion}
        />
      ) : (
        <Fragment>
          {planLoading && (
            <div>
              <small>loading...</small>
            </div>
          )}
        </Fragment>
      )}

      {/* =========== NEW ITEM MODAL ============== */}

      {plan && (
        <Modal
          open={newItemModalOpen}
          onClose={(event, reason) => {
            toggleNewItemModal(false);
            modalOnClose(organization.id, history, location);
          }}
          closeAfterTransition={true}
          sx={sxModal}
        >
          {/* <Fade in={newItemModalOpen}> */}
          <Paper square={true} sx={sxModalPaper}>
            {/* Note that Modal requires a class-based component inside. */}
            <ItemNew
              buckets={buckets}
              closeWith={() => modalOnClose(organization.id, history, location)}
              createNewItems={createNewItems}
              currentUser={currentUser}
              idForHeader="plan-item-new-modal-header"
              isCriterionInPlan={isCriterionInPlan}
              organization={organization}
              orgSetsData={orgSetsData}
              plan={plan}
              programs={programs}
              reloadPlanItems={loadItems}
              showMessageFn={notify}
              userCanViewActionPlan={userCanViewActionPlan}
              userCanEditActionPlan={userCanEditActionPlan}
              userCanViewAssessment={userCanViewAssessment}
              userCanEditAssessment={userCanEditAssessment}
            />
          </Paper>
          {/* </Fade> */}
        </Modal>
      )}

      {/* ========== DETAIL ITEM DETAIL MODAL ========== */}
      {plan && detailItem && (
        <Modal
          open={detailItemModalOpen}
          onClose={(event, reason) => {
            toggleDetailItemModal(false);
            modalOnClose(organization.id, history, location);
          }}
          closeAfterTransition={true}
          sx={sxModal}
        >
          <Fade in={detailItemModalOpen}>
            <Paper square={true} sx={sxModalPaper}>
              {/* Note that Modal requires a class-based component inside. */}
              <ItemDetail
                buckets={buckets}
                closeWith={() => modalOnClose(organization.id, history, location)}
                closePlanItem={closeItem}
                currentUser={currentUser}
                deletePlanItem={deleteItem}
                idForHeader="plan-item-detail-modal-header"
                generatePlanItemViewData={generatePlanItemViewData}
                moveItem={moveItem}
                planItem={detailItem}
                organization={organization}
                orgSetsData={orgSetsData}
                reloadPlanItems={loadItems}
                reloadPlanItem={loadItem}
                reopenPlanItem={reopenItem}
                showMessageFn={notify}
                userCanViewActionPlan={userCanViewActionPlan}
                userCanEditActionPlan={userCanEditActionPlan}
                userCanViewAssessment={userCanViewAssessment}
                userCanEditAssessment={userCanEditAssessment}
                userCanViewCriterionTasks={userCanViewCriterionTasks}
                userCanEditCriterionTasks={userCanEditCriterionTasks}
                userCanViewCriterionNotes={userCanViewCriterionNotes}
                userCanEditCriterionNotes={userCanEditCriterionNotes}
              />
            </Paper>
          </Fade>
        </Modal>
      )}
    </Fragment>
  );
}

const sxModal = (theme) => ({
  margin: "2px auto",
  maxWidth: "1400px",
  "& .plan-modal-close-button-wrapper": {
    position: "absolute",
    right: theme.spacing(2), // make sure to clear scrollbar in Windows
    top: "1em",
  },
});

const sxModalPaper = {
  backgroundColor: styleVars.colorOffWhite,
  overflowY: "scroll",
  maxHeight: "100vh",
};

// Call when user closes one of the modals here.
//
// Adjusts the path so they're back at the primary plan board.
const modalOnClose = (orgId, history, location) => {
  let newPath = `/app/account/organizations/${orgId}/plan`;
  // Only push if the new path would be different from the existing path.
  if (location.pathname !== newPath) {
    history.push(newPath);
  }
};

// WebSocket (Pusher)-related.
// -- PLAN ITEMS
const wsPlanItemUpdatesChannnelName = (org) => {
  return `private-organizations.${org.id}.currentPlan.items`;
};
const wsPlanItemUpdatesChannnelEvents = [
  "plan-items-added",
  "plan-items-updated",
  "plan-items-removed",
];
// -- BUCKETS
// const wsBucketUpdatesChannnelNames = (org, bucketIds = []) => {
//   let names = [];
//   for (let i = 0; i < bucketIds.length; i++) {
//     names.push(`private-organizations.${org.id}.currentPlan.plan-buckets.${bucketIds[i]}.items`);
//   }
//   return names;
// };
// const wsBucketUpdatesChannnelEvents = ['plan-items-sorted'];

const changesFromOthersAppliedMessage = "Updated plan with changes from another member of the team";

Plan.propTypes = {
  detailItemId: PropTypes.oneOfType([
    PropTypes.string, // "new"
    PropTypes.number, // ID of plan item to be shown
  ]),
  currentUser: PropTypes.shape(currentUserShape).isRequired,
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
  programs: PropTypes.object.isRequired, // @TODO Create custom proptype shape (this has data prop)
  userCanViewActionPlan: PropTypes.bool.isRequired,
  userCanEditActionPlan: PropTypes.bool.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired,
  userCanEditAssessment: PropTypes.bool.isRequired,
  userCanInviteOrgUsers: PropTypes.bool.isRequired,
  userCanViewCriterionTasks: PropTypes.bool.isRequired,
  userCanEditCriterionTasks: PropTypes.bool.isRequired,
  userCanViewCriterionNotes: PropTypes.bool.isRequired,
  userCanEditCriterionNotes: PropTypes.bool.isRequired,
};
