import React, { useCallback, useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { CircularProgress, useTheme, Popover } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HelpIcon from "@mui/icons-material/Help";
import AddIcon from "@mui/icons-material/AddCircle";
import clsx from "clsx";
import { Droppable } from "react-beautiful-dnd";
import styleVars from "style/_vars.scss";

export default function Bucket({
  children,
  description,
  title,
  isLoading,
  organizationId,
  planBucketId,
  droppableId,
  userCanViewActionPlan,
  userCanEditActionPlan,
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
  const theme = useTheme();

  const [descriptionVisible, setDescriptionVisible] = useState(false);
  const [descriptionAnchorEl, setDescriptionAnchorEl] = useState(null);
  const [descriptionButtonVisible, setDescriptionButtonVisible] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    let newShowTitle = title && !isEmpty(title);
    setShowTitle(newShowTitle);
  }, [title]);

  useEffect(() => {
    let newDescriptionVisible = Boolean(descriptionAnchorEl);
    setDescriptionVisible(newDescriptionVisible);
  }, [descriptionAnchorEl]);

  useEffect(() => {
    let newDescriptionButtonVisible = description && !isEmpty(description);
    setDescriptionButtonVisible(newDescriptionButtonVisible);
  }, [description]);

  const handlePopoverOpen = (event) => {
    setDescriptionAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setDescriptionAnchorEl(null);
  };

  const listStyle = useCallback(
    (isDraggingOver) => ({
      background: isDraggingOver ? "#DEFFA9" : "transparent",
      paddingBottom: theme.spacing(),
      paddingTop: theme.spacing(),
      width: "100%",
    }),
    [theme]
  );

  const addItemButton = useCallback(() => {
    return (
      <Link
        aria-label="Add item"
        className={classes.addItemButton}
        to={{
          pathname: `/app/account/organizations/${organizationId}/plan/items/new`,
          search: `?plan_bucket_id=${planBucketId}`,
        }}
      >
        <div className={classes.addItemButtonInner}>
          <span className={classes.addItemButtonIconWrapper}>
            <AddIcon color="inherit" className={classes.addItemButtonIcon} />
          </span>
          <span className={classes.addItemButtonTextWrapper}>Add item</span>
        </div>
      </Link>
    );
  }, [classes, organizationId, planBucketId]);

  if (!userCanViewActionPlan) {
    return null;
  }

  // DISPLAY =========================
  return (
    <React.Fragment>
      <div className={classes.bucketColumn}>
        <header className={classes.header}>
          {showTitle && (
            <React.Fragment>
              <h2 className={classes.bucketTitle}>
                {title}
                {descriptionButtonVisible && (
                  <div className="no-print">
                    <div className={classes.helpIconContainer}>
                      <HelpIcon
                        className={classes.descriptionIcon}
                        color="secondary"
                        aria-label="About this category"
                        aria-owns={
                          descriptionVisible
                            ? `bucket-column-popover-description-${planBucketId}`
                            : undefined
                        }
                        aria-haspopup="true"
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                      />
                    </div>
                  </div>
                )}
              </h2>
              <Popover
                id={`bucket-column-popover-description-${planBucketId}`}
                sx={{ pointerEvents: "none" }}
                open={descriptionVisible}
                onClose={handlePopoverClose}
                disableRestoreFocus
                anchorEl={descriptionAnchorEl}
                anchorReference={descriptionAnchorEl ? "anchorEl" : "none"}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <div className={classes.description}>{description}</div>
              </Popover>
            </React.Fragment>
          )}
          <div className={classes.headerMoreButtonWrapper}>
            {/* Disabling for now (no applicable actions) */}
            {/*
            <IconButton
              color="primary"
              className={classes.headerMoreButton}
              aria-label="Bucket options"
            >
              <MoreIcon className={classes.headerMoreButtonIcon} />
            </IconButton>
            */}
          </div>
        </header>

        {userCanEditActionPlan && <div className="no-print">{addItemButton(classes)}</div>}

        {isLoading && (
          <React.Fragment>
            <CircularProgress />
          </React.Fragment>
        )}

        <Droppable droppableId={droppableId} isDropDisabled={!userCanEditActionPlan}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={listStyle(snapshot.isDraggingOver, theme)}
              className={clsx(classes.itemCards)}
            >
              {children && <React.Fragment>{children}</React.Fragment>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  addItemButton: {
    backgroundColor: "#fff",
    alignItems: "center",
    border: `2px dashed ${styleVars.colorLightGray}`,
    display: "flex",
    fontSize: 12,
    justifyContent: "center",
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
    padding: `${theme.spacing(0.75)} ${theme.spacing(0.25)}`,
    textTransform: "none",
    width: "100%",
    "&:hover": {
      borderColor: styleVars.colorPrimary,
    },
  },
  addItemButtonTextWrapper: {
    fontWeight: "normal",
  },
  addItemButtonIconWrapper: {
    display: "inline-flex",
    paddingRight: theme.spacing(0.5),
  },
  addItemButtonIcon: {
    fontSize: 19,
  },
  addItemButtonInner: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  bucketColumn: {
    backgroundColor: "#F3F2F2",
    border: "2px solid #ECE8E8",
    borderRadius: "2px",
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    width: "100%",
  },
  bucketColumnLoading: {
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    flexWrap: "nowrap",
    justifyContent: "space-between",
  },
  bucketTitle: {
    alignItems: "center",
    display: "inline-flex",
    flex: "auto",
    fontSize: 20,
  },
  headerMoreButtonWrapper: {
    flex: "initial",
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  headerMoreButton: {
    padding: 0,
  },
  headerMoreButtonIcon: {
    width: theme.spacing(1.5),
  },
  helpIconContainer: {
    alignItems: "center",
    display: "flex",
  },
  descriptionIcon: {
    fontSize: 20,
    marginLeft: theme.spacing(0.75),
  },
  description: {
    // inside popover
    fontSize: 12,
    fontStyle: "italic",
    maxWidth: "300px",
  },
  itemCards: {
    minHeight: theme.spacing(10),
  },
}));

Bucket.propTypes = {
  // children: ???
  title: PropTypes.string,
  description: PropTypes.string,
  isLoading: PropTypes.bool,
  organizationId: PropTypes.number.isRequired,
  planBucketId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  droppableId: PropTypes.string.isRequired,
  userCanViewActionPlan: PropTypes.bool,
  userCanEditActionPlan: PropTypes.bool,
};
