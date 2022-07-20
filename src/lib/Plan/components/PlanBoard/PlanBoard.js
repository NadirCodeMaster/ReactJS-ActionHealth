import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { isEmpty } from "lodash";
import { CircularProgress } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import Breadcrumbs from "components/ui/Breadcrumbs";
import Breadcrumb from "components/ui/Breadcrumb";
import Bucket from "./Bucket";
import Card from "./Card.js";
import generateTitle from "utils/generateTitle";
import isNumeric from "utils/isNumeric";
import filterContentMachineNames from "utils/filterContentMachineNames";
import clsx from "clsx";
import PageNotFound from "components/views/PageNotFound";
import ActionPlanCtaWrapper from "components/views/ActionPlanCtaWrapper";
import HelpIcon from "@mui/icons-material/Help";
import memoizee from "memoizee";
import { DragDropContext } from "react-beautiful-dnd";
import { fetchContents } from "store/actions";
import { organizationWithAvailableSetsShape } from "constants/propTypeShapes";

export default function PlanBoard({
  buckets,
  bucketItems,
  closeItem,
  deleteItem,
  generatePlanItemViewData,
  isBlankState,
  itemsLoading,
  moveItemsBetweenBuckets,
  organization,
  orgSetsData,
  orgSetsDataLoading,
  plan,
  reopenItem,
  reorderItemsInBucket,
  showMessageFn,
  userCanViewActionPlan,
  userCanEditActionPlan,
  userCanViewAssessment,
}) {
  // Set-up `mounted` to avoid running code when no longer mounted.
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const { width, ref: resizeDetectorRef } = useResizeDetector();
  const [inHorizontalLayout, setInHorizontalLayout] = useState(true);
  const [bucketsToRender, setBucketsToRender] = useState([]);

  // For content in Redux.
  const contents = useSelector((state) => state.contents);
  const dispatch = useDispatch();

  // Set page title.
  useEffect(() => {
    generateTitle("Action Plan");
  }, []);

  useEffect(() => {
    // Horizontal layout is intended for larger displays, but we also use it for
    // browsers that don't support resize detection (IE11). We detect the non-detecting
    // by checking the `width` prop, which will be undefined in those browsers.
    let newInHorizontalLayout = false;
    if (!width || width >= minWidthForHorizontalLayout) {
      newInHorizontalLayout = true;
    }
    setInHorizontalLayout(newInHorizontalLayout);
  }, [width]);

  useEffect(() => {
    let newBucketsToRender = isEmpty(buckets) ? [] : buckets;
    setBucketsToRender(newBucketsToRender);
  }, [buckets]);

  /**
   * General-purpose callback for changes that are sent to the server.
   *
   * @param {bool} success Whether the request succeeded.
   */
  const genericRequestCallback = useCallback(
    (success) => {
      if (success) {
        if (showMessageFn) {
          showMessageFn("Changes saved", "success");
        }
        return;
      } else {
        if (showMessageFn) {
          showMessageFn(
            "An error occurred saving your changes. Try reloading this page or contact Healthier Generation for assistance.",
            "error"
          );
        }
      }
    },
    [showMessageFn]
  );

  useEffect(() => {
    // Get array of content machine names that haven't yet been loaded into redux.
    let missingContent = filterContentMachineNames(contents, componentContentMachineNames);
    // If that's not empty, dispatch the content loader.
    if (!isEmpty(missingContent)) {
      dispatch(fetchContents({ machine_name: missingContent }));
    }
    // Disable linting of next line because we are intentionally omitting
    // the `contents` dep.
  }, [dispatch]); // eslint-disable-line

  const onDragEnd = useCallback(
    (result) => {
      const { source, destination } = result;
      // dropped outside the list
      if (!destination) {
        return;
      }

      let sourceBucketId = convertBucketDroppableId(source.droppableId, "bucket");

      // SAME LIST
      // ---------
      // If source and destination bucket are the same,
      // then we're just re-ordering.
      if (source.droppableId === destination.droppableId) {
        reorderItemsInBucket(
          bucketItems[sourceBucketId],
          sourceBucketId,
          source.index,
          destination.index,
          genericRequestCallback
        );
        return;
      }

      // DIFFERENT LIST
      // --------------
      else {
        let destinationBucketId = convertBucketDroppableId(destination.droppableId, "bucket");

        // Move it. Updates the bucketItems prop and saves to server.
        moveItemsBetweenBuckets(
          bucketItems[sourceBucketId],
          sourceBucketId,
          source.index,
          bucketItems[destinationBucketId],
          destinationBucketId,
          destination.index,
          genericRequestCallback
        );
        return;
      }
    },
    [bucketItems, genericRequestCallback, moveItemsBetweenBuckets, reorderItemsInBucket]
  );

  if (!userCanViewActionPlan) {
    return <PageNotFound />;
  }

  // DISPLAY ==============================================
  return (
    <div ref={resizeDetectorRef}>
      <Breadcrumbs>
        <Breadcrumb path="/app/account" root>
          Account
        </Breadcrumb>
        <Breadcrumb path={`/app/account/organizations/${organization.id}`}>
          {organization.name}
        </Breadcrumb>
        <Breadcrumb path={`/app/account/organizations/${organization.id}/plan`}>
          Action Plan
        </Breadcrumb>
      </Breadcrumbs>

      <h1 className="print-page-title">
        Action Plan
        <a
          rel="noopener noreferrer"
          href="https://www.healthiergeneration.org/node/6827"
          target="_blank"
          className={clsx(classes.titleHelpLink, "no-print")}
        >
          <span className={classes.titleHelpText}>
            https://www.healthiergeneration.org/node/6827
          </span>
          <HelpIcon className={classes.titleHelp} color="secondary" />
        </a>
      </h1>

      {itemsLoading && <CircularProgress size="1em" />}

      {!itemsLoading && (
        <ActionPlanCtaWrapper organization={organization} isBlankState={isBlankState} />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={clsx(
            classes.planBoard,
            {
              [horizontalClassModifier]: inHorizontalLayout,
            },
            "print-no-flex-container"
          )}
        >
          {bucketsToRender.map((bucket, bucketIdx) => (
            <div
              key={`bucket_${bucket.id}`}
              className={clsx(
                classes.planBucketColumnWrapper,
                {
                  [horizontalClassModifier]: inHorizontalLayout,
                },
                "print-no-flex-item"
              )}
            >
              <Bucket
                title={bucket.name}
                description={bucket.description}
                droppableId={convertBucketDroppableId(bucket.id, "droppable")}
                planBucketId={bucket.id}
                organizationId={organization.id}
                userCanViewActionPlan={userCanViewActionPlan}
                userCanEditActionPlan={userCanEditActionPlan}
              >
                {bucketItems[bucket.id] && (
                  <Fragment>
                    {bucketItems[bucket.id].map((bucketItem, bucketItemIdx) => (
                      <Card
                        key={`bucket_item_${bucketItem.id}`}
                        draggableId={convertItemDraggableId(bucketItem.id, "draggable")}
                        orgSetsData={orgSetsData}
                        generatePlanItemViewData={generatePlanItemViewData}
                        planItem={bucketItem}
                        organizationId={organization.id}
                        planItemIndex={bucketItemIdx}
                        closeItem={closeItem}
                        deleteItem={deleteItem}
                        reopenItem={reopenItem}
                        userCanEditActionPlan={userCanEditActionPlan}
                        userCanViewActionPlan={userCanViewActionPlan}
                        userCanViewAssessment={userCanViewAssessment}
                      />
                    ))}
                  </Fragment>
                )}
              </Bucket>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  planBoard: {
    display: "block",
    [`&.${horizontalClassModifier}`]: {
      alignItems: "start",
      display: "flex",
      justifyContent: "flex-start",
      paddingBottom: theme.spacing(2),
    },
  },
  planBucketColumnWrapper: {
    marginBottom: theme.spacing(2),
    width: "100%",
    [`&.${horizontalClassModifier}`]: {
      flex: `0 0 ${columnWidthPx}px`,
      marginBottom: 0,
      marginRight: theme.spacing(2),
      width: `${columnWidthPx}px`,
    },
  },
  planItemCardWrapper: {},
  titleHelpLink: {
    textDecoration: "none",
    marginLeft: theme.spacing(),
  },
  titleHelp: {
    fontSize: 20,
  },
  titleHelpText: {
    display: "none",
  },
}));

const minWidthForHorizontalLayout = 500;
const columnWidthPx = 360;
const horizontalClassModifier = "_horizontal";
const componentContentMachineNames = [
  "action_plan_help",
  "blank_state_action_plan_tip_1_header",
  "blank_state_action_plan_tip_1_body",
  "blank_state_action_plan_tip_2_header",
  "blank_state_action_plan_tip_2_body",
  "active_state_action_plan_tip_1_header",
  "active_state_action_plan_tip_2_header",
  "active_state_action_plan_tip_1_body",
  "active_state_action_plan_tip_2_body",
];

/**
 * Convert to or from a bucket id or its draggable id.
 *
 * @param {Number|String} toConvert
 *  The bucket ID or droppable to convert.
 * @param {String} toBucketOrDroppable
 *  Type if ID you'd like to receive ('droppable'|'bucket')
 * @returns {String|Number}
 *  Returns a number if value is numeric, otherwise a string.
 */
const convertBucketDroppableId = memoizee((toConvert, toBucketOrDroppable = "droppable") => {
  let prefix = "bucket_",
    id;
  toConvert = toConvert + ""; // cast value to string
  switch (toBucketOrDroppable) {
    case "droppable":
      return prefix + toConvert;
    case "bucket":
    default:
      id = toConvert.substring(prefix.length);
      if (isNumeric(id)) {
        id = Number(id);
      }
      return id;
  }
});

/**
 * Convert to or from an item id or its draggable id.
 *
 * @param {Number|String} toConvert
 *  The item ID or draggableId to convert.
 * @param {String} toItemOrDraggable
 *  Type if ID you'd like to receive ('draggable'|'item')
 * @returns {String|Number}
 *  Returns a number if value is numeric, otherwise a string.
 */
const convertItemDraggableId = memoizee((toConvert, toItemOrDraggable = "draggable") => {
  let prefix = "item_",
    id,
    returning;

  toConvert = toConvert + ""; // cast value to string

  switch (toItemOrDraggable) {
    case "draggable":
      returning = prefix + toConvert;
      break;
    case "item":
    default:
      id = toConvert.substring(prefix.length);
      if (isNumeric(id)) {
        id = Number(id);
      }
      returning = id;
      break;
  }

  return returning;
});

PlanBoard.propTypes = {
  buckets: PropTypes.array,
  bucketItems: PropTypes.object,
  closeItem: PropTypes.func.isRequired,
  deleteItem: PropTypes.func.isRequired,
  generatePlanItemViewData: PropTypes.func.isRequired,
  isBlankState: PropTypes.bool,
  itemsLoading: PropTypes.bool,
  moveItemsBetweenBuckets: PropTypes.func.isRequired,
  organization: PropTypes.shape(organizationWithAvailableSetsShape).isRequired,
  orgSetsData: PropTypes.array.isRequired,
  orgSetsDataLoading: PropTypes.bool,
  plan: PropTypes.object.isRequired,
  reopenItem: PropTypes.func.isRequired,
  reorderItemsInBucket: PropTypes.func.isRequired,
  showMessageFn: PropTypes.func,
  userCanViewActionPlan: PropTypes.bool.isRequired,
  userCanEditActionPlan: PropTypes.bool.isRequired,
  userCanViewAssessment: PropTypes.bool.isRequired,
};
