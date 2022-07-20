import React from "react";
import hgStyled from "style/hgStyled";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

const PREFIX = "HgDialog";

const classes = {
  dialogContent: `${PREFIX}-dialogContent`,
  closeButton: `${PREFIX}-closeButton`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  title: `${PREFIX}-title`,
};

const Root = hgStyled("div")(({ theme }) => ({
  [`& .${classes.dialogContent}`]: {
    padding: theme.spacing(2),
  },

  [`& .${classes.closeButton}`]: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },

  [`& .${classes.dialogTitle}`]: {
    margin: 0,
    padding: theme.spacing(2),
  },

  [`& .${classes.title}`]: {
    width: "90%",
  },
}));

/**
 * Dialog wrapper for desktop and mobile views
 */

HgDialog.propTypes = {
  //component for bottom actions (EX next/prev)
  actions: PropTypes.element,
  //component for primary content
  content: PropTypes.element.isRequired,
  // don't allow user to close by clicking off modal and don't show
  // upper right X icon to close
  disableClose: PropTypes.bool,
  // Always set width to value of maxWidth prop
  fullWidth: PropTypes.bool,
  handleClose: PropTypes.func,
  maxWidth: PropTypes.string,
  open: PropTypes.bool.isRequired,
  // Title for top of modal
  title: PropTypes.string,
};

export default function HgDialog({
  actions,
  content,
  disableClose,
  fullWidth,
  handleClose,
  maxWidth = "md",
  open,
  title,
}) {
  const { width, ref } = useResizeDetector();
  const maxMobileWidth = 500;

  const isFullScreen = () => {
    return width < maxMobileWidth;
  };

  return (
    <Root ref={ref}>
      <Dialog
        maxWidth={isFullScreen() ? null : maxWidth}
        fullScreen={isFullScreen()}
        fullWidth={fullWidth ? fullWidth : null}
        open={open}
        onClose={disableClose ? null : handleClose}
      >
        {title && (
          <DialogTitle className={classes.dialogTitle}>
            <React.Fragment>
              <div className={classes.title}>{title}</div>
              {disableClose ? null : (
                <IconButton
                  aria-label="close"
                  className={classes.closeButton}
                  onClick={handleClose}
                  size="large"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </React.Fragment>
          </DialogTitle>
        )}

        <DialogContent className={classes.dialogContent} dividers>
          {content}
        </DialogContent>

        {actions && <DialogActions>{actions}</DialogActions>}
      </Dialog>
    </Root>
  );
}
