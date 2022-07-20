import React from "react";
import PropTypes from "prop-types";
import { filter, sortBy } from "lodash";
import OrgAddToSetForm from "components/views/OrgAddToSetForm";
import ClearIcon from "@mui/icons-material/Clear";
import ConfirmButton from "components/ui/ConfirmButton";
import { List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { withStyles } from "@mui/styles";
import { requestSetOrganizations, requestUnlinkOrganizationSet } from "api/requests";
import errorSuffix from "utils/errorSuffix";

import hgToast from "utils/hgToast";

/**
 * UI for administration of Organizations associated with a restricted set.
 * Intended for use on the assessment admin pages
 */
class RestrictedOrganizationsAdmin extends React.Component {
  static propTypes = {
    setId: PropTypes.number.isRequired,
    orgTypeId: PropTypes.number.isRequired,
    programId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      orgs: [],
      orgsLoading: false,
      orgsSaving: false,
    };
    this.isCancelled = false;
    this.loadOrgs = this.loadOrgs.bind(this);
  }

  componentDidMount() {
    this.loadOrgs();
  }

  componentDidUpdate(prevProps) {
    const { setId: prevSetId } = prevProps;
    const { setId } = this.props;

    if (prevSetId !== setId) {
      this.loadOrgs();
    }
  }

  /**
   * Populate state.orgs array based on props.setId.
   */
  loadOrgs = () => {
    const { setId } = this.props;

    this.setState({ orgsLoading: true });

    requestSetOrganizations(setId, {})
      .then((res) => {
        if (200 === res.status) {
          if (!this.isCancelled) {
            this.setState({
              orgsLoading: false,
              orgs: sortBy(res.data.data, "pivot.weight"),
            });
          }
        }
      })
      .catch((error) => {
        // ERROR
        console.error("An error occurred retrieving organization records");
        if (!this.isCancelled) {
          this.setState({
            orgsLoading: false,
            orgs: [],
          });
        }
      });
  };

  /**
   * Remove an organiztion from this assessment.
   */
  removeAssociatedItem = (associatedItemId) => {
    const { setId } = this.props;

    this.setState({ orgsSaving: true });

    requestUnlinkOrganizationSet(setId, associatedItemId)
      .then((res) => {
        // SUCCESS
        hgToast("Disassociated organization");
        if (!this.isCancelled) {
          // New array of items omitting the removed item.
          let newOrgs = filter(this.state.orgs, (associatedItem) => {
            return associatedItem.id !== associatedItemId;
          });
          this.setState({
            orgs: newOrgs,
            orgsSaving: false,
          });
        }
      })
      .catch((error) => {
        // ERROR
        hgToast("An error occurred disassociating organization. " + errorSuffix(error), "error");
        if (!this.isCancelled) {
          this.setState({ orgsSaving: false });
        }
      });
  };

  render() {
    const { classes, orgTypeId, programId, setId, theme } = this.props;
    const { orgsLoading, orgsSaving, orgs } = this.state;

    let showLoader = orgsLoading || orgsSaving;
    let hasOrgs = orgs && orgs.length > 0;

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

        {!showLoader && !hasOrgs && (
          <div className={classes.noOrgs}>
            <em>No Organizations are associated with this Assessment.</em>
          </div>
        )}

        <OrgAddToSetForm
          orgTypeId={orgTypeId}
          associatedOrgs={orgs}
          callbackAfterAdd={this.loadOrgs}
          programId={programId}
          setId={setId}
          orgs={orgs}
        />

        <List className={classes.listContainer} dense={true}>
          {this.state.orgs.map((ch, index) => (
            <ListItem key={ch.id}>
              <ListItemText primary={ch.name} />
              <ConfirmButton
                className={classes.removeOrgItemButton}
                size="small"
                color="primary"
                onConfirm={() => this.removeAssociatedItem(ch.id)}
                title="Are you sure you want to remove this Organization?"
                aria-label="Remove"
                variant="text"
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
  noOrgs: {
    margin: ".5em",
  },
  listContainer: {
    margin: ".5em",
  },
});

export default withStyles(styles, { withTheme: true })(RestrictedOrganizationsAdmin);
