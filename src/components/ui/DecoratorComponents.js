import React from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import DraftEditor from "components/ui/DraftEditor";
import { get, isEmpty, isString } from "lodash";
import { requestTerm } from "api/requests";
import CloseIcon from "@mui/icons-material/Close";

/**
 * Custom components used as decorators for the DraftEditor
 * These are things like Dialog Terms, Links, and Tooltips
 */

const styles = (theme) => ({
  closeButton: {
    position: "absolute",
    right: theme.spacing(),
    top: theme.spacing(),
    color: theme.palette.grey[500],
  },
  dialogSource: {
    marginTop: theme.spacing(),
  },
  termDataStyle: {
    cursor: "pointer",
    borderBottom: "1px dotted #38B8EA",
  },
  termDataReadOnlyStyle: {
    borderBottom: "1px dotted #38B8EA",
  },
  tooltipSpan: {
    borderBottom: "1px dotted #38B8EA",
  },
});

class PureTermDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      term: {},
    };
  }

  handleClick = (e) => {
    if (e) {
      e.preventDefault();
    }

    const { open } = this.state;
    this.getTerm();
    this.setState({
      open: !open,
      term: {},
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  isEmptyDraftObject = (draftObj) => {
    if (isString(draftObj)) {
      try {
        draftObj = JSON.parse(draftObj);
      } catch (e) {
        console.error(`Tried converting string draftObj to JSON but failed: ${e.message}`);
      }
    }

    if (
      isEmpty(draftObj) ||
      (draftObj.blocks.length === 1 &&
        (draftObj.blocks[0].text === null || draftObj.blocks[0].text === ""))
    ) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieve terms from server.
   */
  getTerm = () => {
    const { contentState, entityKey } = this.props;
    const { dec } = contentState.getEntity(entityKey).getData();

    this.setState({ termLoading: true });

    requestTerm(dec)
      .then((res) => {
        if (!this.isCancelled) {
          let term = res.data.data;
          this.setState({
            term: term,
            termLoading: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        if (!this.isCancelled) {
          this.setState({
            term: [],
            termLoading: false,
          });
          console.error("An error occurred retrieving term.");
        }
      });
  };

  render() {
    const { classes, entityKey, contentState, readOnly, theme } = this.props;
    const { open, termLoading, term } = this.state;
    const { dec } = contentState.getEntity(entityKey).getData();
    //@TODO: Get design input/implement something better
    let hasTerm = !isEmpty(term);
    let hasSource = !this.isEmptyDraftObject(get(term, "source", {}));
    let hasDefinition = !this.isEmptyDraftObject(get(term, "definition", {}));

    if (!readOnly) {
      return (
        <abbr className={classes.termDataReadOnlyStyle} data-term={dec}>
          {this.props.children}
        </abbr>
      );
    }

    return (
      <React.Fragment>
        <abbr
          className={classes.termDataStyle}
          data-term={dec}
          onClick={(e) => {
            this.handleClick(e);
          }}
        >
          {this.props.children}
        </abbr>

        <Dialog open={open} onClose={this.handleClose}>
          {termLoading && <CircularProgress style={{ margin: theme.spacing(4) }} size="2em" />}
          {hasTerm && (
            <React.Fragment>
              <DialogTitle>
                <div>{term.name}</div>
                <IconButton className={classes.closeButton} onClick={this.handleClose} size="large">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                {hasDefinition && (
                  <React.Fragment>
                    <h3>Definition</h3>
                    <DraftEditor readOnly={true} value={term.definition ? term.definition : ""} />
                  </React.Fragment>
                )}
                {hasSource && (
                  <React.Fragment>
                    <h3 className={classes.dialogSource}>Source</h3>
                    <DraftEditor readOnly={true} value={term.source ? term.source : ""} />
                  </React.Fragment>
                )}
              </DialogContent>
            </React.Fragment>
          )}
        </Dialog>
      </React.Fragment>
    );
  }
}

const TermDialog = withStyles(styles, { withTheme: true })(PureTermDialog);
export { TermDialog };

export const AbbrTitle = withStyles(styles)((props) => {
  const { classes } = props;
  const { dec } = props.contentState.getEntity(props.entityKey).getData();

  return (
    <React.Fragment>
      <Tooltip title={dec} placement="top">
        <span className={classes.tooltipSpan}>{props.children}</span>
      </Tooltip>
    </React.Fragment>
  );
});

export const Link = (props) => {
  const { dec, isLinkTargetBlank } = props.contentState.getEntity(props.entityKey).getData();
  if (isLinkTargetBlank) {
    return (
      <a href={dec} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    );
  } else {
    return <a href={dec}>{props.children}</a>;
  }
};
