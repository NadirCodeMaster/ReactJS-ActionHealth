import React, { Fragment } from "react";
import { makeStyles } from "@mui/styles";
import HgSkeleton from "components/ui/HgSkeleton";

export default function ResponseSkeletonLoader() {
  const classes = useStyles();
  const skeletonResponseKeys = [0, 1, 2, 3];

  return (
    <Fragment>
      {skeletonResponseKeys.map((srk) => {
        return (
          <div className={classes.responseSkeletonContainer} key={srk}>
            <HgSkeleton variant="text" width={"15%"} />
            <HgSkeleton variant="text" />
            <HgSkeleton variant="text" />
            <HgSkeleton variant="text" />
          </div>
        );
      })}
    </Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  responseSkeletonContainer: {
    margin: theme.spacing(0, 0, 3, 0),
  },
}));
