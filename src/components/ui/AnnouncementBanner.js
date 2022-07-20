import React, { Fragment, useState } from "react";
import hgStyled from "style/hgStyled";
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";
import clsx from "clsx";
import styleVars from "style/_vars.scss";

const PREFIX = "AnnouncementBanner";

const classes = {
  announcementBannerWrapper: `${PREFIX}-announcementBannerWrapper`,
  announcementBannerContainer: `${PREFIX}-announcementBannerContainer`,
  announcementBody: `${PREFIX}-announcementBody`,
  announcementBodyText: `${PREFIX}-announcementBodyText`,
  announcementHeadline: `${PREFIX}-announcementHeadline`,
  announcementLinkWrapper: `${PREFIX}-announcementLinkWrapper`,
  announcementLink: `${PREFIX}-announcementLink`,
  announcementClose: `${PREFIX}-announcementClose`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = hgStyled("div")(({ theme }) => ({
  [`& .${classes.announcementBannerWrapper}`]: {
    background: "#178AA9",
    color: "#FFFFFF",
    marginBottom: theme.spacing(-8), // soaks up excess padding in contentArea
    padding: styleVars.paperPadding,
    paddingTop: theme.spacing(8.75), // push banner content beneath header bar
    position: "relative",
    zIndex: 10,

    // Side-menu expands at .up('md')
    [theme.breakpoints.up("md")]: {
      paddingLeft: `calc(${styleVars.siteSidebarMenuWidth} + (${styleVars.spacingUnit} * 3))`,
    },
  },

  [`& .${classes.announcementBannerContainer}`]: {
    alignItems: "center",
    display: "flex",
    maxWidth: styleVars.siteMainMaxWidth,
  },

  [`& .${classes.announcementBody}`]: {
    fontSize: styleVars.txtFontSizeLg,
    marginRight: theme.spacing(5),
    [theme.breakpoints.up("md")]: {
      maxWidth: "70%",
    },
  },

  [`& .${classes.announcementBodyText}`]: {
    "&.sm": {
      marginBottom: theme.spacing(2),
    },
  },

  [`& .${classes.announcementHeadline}`]: {
    fontWeight: styleVars.txtFontWeightDefaultSemibold,
  },

  [`& .${classes.announcementLinkWrapper}`]: {
    width: "20%",
    marginRight: theme.spacing(2),
    fontSize: styleVars.txtFontSizeLg,
    whiteSpace: "nowrap",
    [theme.breakpoints.up("md")]: {
      textAlign: "right",
    },
  },

  [`& .${classes.announcementLink}`]: {
    fontSize: styleVars.txtFontSizeLg,
    color: "#FFFFFF",
    textDecoration: "underline",
  },

  [`& .${classes.announcementClose}`]: {
    marginLeft: "auto",
  },
}));

/**
 * Announcement Banner (EX: used to announce new Integrated Assessment)
 *
 * NOTE! This component file is being left in place for future use, but
 * all supporting code in other files HAS BEEN REMOVED because it was
 * not sufficiently encapsulated to maintain. So, additional work will
 * be needed to utilize this. (ak, 2021-01-05)
 */
export default function AnnouncementBanner({
  contentHeadline,
  contentBody,
  contentLinkText,
  contentLinkHref,
  omit,
  handleClose,
}) {
  const { width, ref } = useResizeDetector();
  const maxSmSize = 500;
  const [closed, setClosed] = useState(omit);
  const hideBanner = closed || omit;
  // This logic is due to width value being 0 on route change
  // @TODO investigate why useResizeDetector sets width to 0 on
  // initial load of functional component when route changes.
  let sizeStr = "lg";
  if (width < maxSmSize && width !== 0) {
    sizeStr = "sm";
  }

  // Close banner, and execute close method if passed from parent component
  const closeClick = (e) => {
    setClosed(true);

    if (handleClose) {
      handleClose();
    }
  };

  return (
    <Root>
      {!hideBanner && (
        <div className={classes.announcementBannerWrapper} ref={ref}>
          <div className={classes.announcementBannerContainer}>
            <div className={classes.announcementBody}>
              <div className={classes.announcementHeadline}>{contentHeadline}</div>
              <div className={clsx(classes.announcementBodyText, sizeStr)}>{contentBody}</div>
              {sizeStr === "sm" && (
                <Link className={classes.announcementLink} to={contentLinkHref}>
                  {contentLinkText}
                </Link>
              )}
            </div>
            {sizeStr === "lg" && (
              <div className={classes.announcementLinkWrapper}>
                <Link className={classes.announcementLink} to={contentLinkHref}>
                  {contentLinkText}
                </Link>
              </div>
            )}
            <div className={classes.announcementClose}>
              <IconButton onClick={closeClick} aria-label="Close" color="inherit" size="small">
                <CloseIcon className={classes.announcementCloseIcon} />
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </Root>
  );
}

AnnouncementBanner.propTypes = {
  contentHeadline: PropTypes.string,
  contentBody: PropTypes.string,
  contentLinkText: PropTypes.string,
  contentLinkHref: PropTypes.string,
  omit: PropTypes.bool,
};
