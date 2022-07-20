import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import HgSkeleton from "components/ui/HgSkeleton";
import ResourceCard from "components/views/ResourceCard";
import { get } from "lodash";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";

/**
 * Resource Block, used in Organization Overview page
 */
export default function AccountOrganizationResourcesBlock({ resources, resourcesLoading }) {
  const classes = useStyles();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const { width, ref } = useResizeDetector();
  const maxSmSize = 450;

  // @TODO: find way to make this less redundant
  // For now this works cleanly, might have to adjust ResourceCard
  const widthSizeStr = () => {
    if (width > maxSmSize) {
      return "lg";
    }

    return "sm";
  };

  return (
    <div ref={ref}>
      {resourcesLoading && (
        <Fragment>
          <HgSkeleton variant="rect" height={"200px"} />
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
          <HgSkeleton variant="text" />
        </Fragment>
      )}
      {!resourcesLoading && (
        <Fragment>
          <h3>Resources</h3>
          <div className={clsx(classes.resourceContainer, widthSizeStr())}>
            {resources.map((r, idx) => {
              return (
                <div
                  key={`resource_card_wrapper_${r.id}`}
                  className={clsx(classes.resourceCardWrapper, widthSizeStr())}
                >
                  <ResourceCard
                    currentUser={currentUser}
                    handleSearch={() => {
                      return true;
                    }}
                    resourceImage={get(r, "feature_media.card", null)}
                    resourceTags={r.tags || null}
                    resourceSummary={r.summary || null}
                    restricted={r.restricted || null}
                    resourceTranslations={r.translations || []}
                    resourceLinkUrl={r.link_url}
                    resourceId={r.id}
                    resourceName={r.name}
                    widthSizeStr={"100%"}
                  />
                </div>
              );
            })}
          </div>
          <Link to={`/app/resources`}>Find more resources</Link>
        </Fragment>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  resourceContainer: {
    "&.lg": {
      display: "flex",
      justifyContent: "space-between",
    },
  },
  resourceCardWrapper: {
    marginBottom: theme.spacing(4),
    width: "100%",
    "&.lg": {
      flex: "0 0 auto",
      marginBottom: 0,
      width: "32%",
    },
  },
}));

AccountOrganizationResourcesBlock.propTypes = {
  resources: PropTypes.array,
  resourcesLoading: PropTypes.bool,
};
