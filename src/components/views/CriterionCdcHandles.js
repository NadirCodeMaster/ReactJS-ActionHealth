import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { filter, sortBy, trim } from "lodash";
import {
  requestCriterionCdCHandles,
  requestLinkCriterionCdcHandle,
  requestDeleteCdcHandle,
} from "api/requests";
import HgTextField from "components/ui/HgTextField";
import { Button, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { withStyles } from "@mui/styles";
import errorSuffix from "utils/errorSuffix";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmButton from "components/ui/ConfirmButton";

import hgToast from "utils/hgToast";

/**
 * UI for administration of cdcHandles associated with a Criterion.
 *
 * Intended for use on the Criterion admin detail pages.
 */
class CriterionCdcHandles extends React.Component {
  static propTypes = {
    criterionId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      cdcHandle: "",
      cdcHandles: [],
      cdcHandlesAdding: false,
      cdcHandlesDeleting: false,
      cdcHandlesLoading: false,
    };
    this.isCancelled = false;
    this.loadCdcHandles = this.loadCdcHandles.bind(this);
  }

  componentDidMount() {
    this.loadCdcHandles();
  }

  /**
   * Populate state.cdcHandles array based on props.criterionId.
   */
  loadCdcHandles = (event) => {
    if (event) {
      event.preventDefault();
    }

    const { criterionId } = this.props;

    this.setState({ cdcHandlesLoading: true });
    requestCriterionCdCHandles(criterionId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              cdcHandlesLoading: false,
              cdcHandles: sortBy(res.data.data, "handle"),
              cdcHandle: "",
            });
          }
        }
      })
      .catch((error) => {
        console.error("An error occurred retrieving item records");
        if (!this.isCancelled) {
          this.setState({
            cdcHandlesLoading: false,
            cdcHandles: [],
            cdcHandle: "",
          });
        }
      });
  };

  /**
   * Add a CDC Handle then call loadCdcHandles
   */
  addCdcHandle = (event) => {
    if (event) {
      event.preventDefault();
    }

    const { criterionId } = this.props;
    const { cdcHandle } = this.state;
    let trimmedCdcHandle = trim(cdcHandle);
    let pivot = {
      criterion_id: criterionId,
      handle: trimmedCdcHandle,
    };

    this.setState({ cdcHandlesAdding: true });

    requestLinkCriterionCdcHandle(pivot)
      .then((res) => {
        // SUCCESS
        hgToast("Associated CDC Handle with criterion");
        this.loadCdcHandles();

        if (!this.isCancelled) {
          this.setState({ cdcHandlesAdding: false });
        }
      })
      .catch((error) => {
        if (!this.isCancelled) {
          let msg =
            "An error occurred while associating item with criterion. " + errorSuffix(error);
          hgToast(msg, "error");
          this.loadCdcHandles();
        }
      });
  };

  /**
   * Delete CDC Handle
   */
  deleteCdcHandle = (cdcHandleId) => {
    this.setState({ cdcHandlesDeleting: true });

    requestDeleteCdcHandle(cdcHandleId)
      .then((res) => {
        // SUCCESS
        hgToast("Deleted CDC Handle");
        if (!this.isCancelled) {
          // New array of cdcHandles omitting the removed item.
          let newCdcHandles = filter(this.state.cdcHandles, (cdcHandle) => {
            return cdcHandle.id !== cdcHandleId;
          });
          this.setState({
            cdcHandles: newCdcHandles,
            cdcHandlesDeleting: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred deleting item", "error");
        if (!this.isCancelled) {
          this.setState({ cdcHandlesDeleting: false });
        }
      });
  };

  handleChange = (event) => {
    this.setState({ cdcHandle: event.target.value });
  };

  render() {
    const { classes, theme } = this.props;
    const { cdcHandle, cdcHandles, cdcHandlesLoading, cdcHandlesDeleting, cdcHandlesAdding } =
      this.state;

    let waiting = cdcHandlesLoading || cdcHandlesAdding || cdcHandlesDeleting;
    let disableInput = waiting;
    let disableButton = !cdcHandle || waiting;

    return (
      <div style={{ position: "relative" }}>
        {waiting && (
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

        <form className={classes.form} noValidate autoComplete="off" onSubmit={this.addCdcHandle}>
          <HgTextField
            label="Create a CDC Handle"
            id="create_cdc_handle"
            margin="normal"
            variant="outlined"
            value={cdcHandle}
            onChange={this.handleChange}
            inputProps={{ maxLength: 255 }}
            disabled={disableInput}
            fullWidth
          />
          <Button
            className={classes.addButton}
            aria-label="Add CDC Handle"
            color="primary"
            type="submit"
            variant="contained"
            disabled={disableButton}
            fullWidth
          >
            <AddIcon color="inherit" />
          </Button>
        </form>

        <List dense={true}>
          {cdcHandles.map((ch, index) => (
            <ListItem key={ch.id}>
              <ListItemText primary={ch.handle} />
              <ConfirmButton
                className={classes.removeCdcHandleItemButton}
                size="small"
                color="primary"
                onConfirm={() => this.deleteCdcHandle(ch.id)}
                title="Are you sure you want to remove this CDC handle?"
                aria-label="Remove"
                variant="text"
                disabled={waiting}
              >
                <ClearIcon fontSize="small" />
              </ConfirmButton>
            </ListItem>
          ))}
        </List>
      </div>
    );
  }
}

const styles = (theme) => ({
  removeCdcHandleItemButton: {
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
)(withStyles(styles, { withTheme: true })(CriterionCdcHandles));
