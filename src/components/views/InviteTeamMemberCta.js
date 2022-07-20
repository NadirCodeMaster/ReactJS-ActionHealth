import React, { Component } from "react";
import PropTypes from "prop-types";
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { withStyles } from "@mui/styles";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InviteTeamMemberDialog from "components/views/InviteTeamMemberDialog";
import { currentUserShape, organizationShape } from "constants/propTypeShapes";
import styleVars from "style/_vars.scss";

// Provides a link/button to open the "Invite Team Member" modal.
//
// Permission to inite team members must be checked by calling
// this code. It is not checked here (to avoid redundant checks).

class InviteTeamMemberCta extends Component {
  static propTypes = {
    // Object props here must be fully loaded before mounting.
    organization: PropTypes.shape(organizationShape).isRequired,
    currentUser: PropTypes.shape(currentUserShape).isRequired,
    orgTypesData: PropTypes.object.isRequired,
    // @TODO: update with more robust proptype shape
    customText: PropTypes.node,
    asListItem: PropTypes.bool,
    withIcon: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.defaultText = "Invite a Team Member";
    this.state = {
      dialogOpen: false,
    };
  }

  // Opens the modal.
  openInviteTeamMemberDialog = () => {
    this.setState({ dialogOpen: true });
  };

  // Callback triggered when modal is closed (from
  // within itself).
  onInviteTeamMemberDialogClosed = () => {
    this.setState({ dialogOpen: false });
  };

  render() {
    const {
      currentUser,
      customListItemStyle,
      classes,
      customText,
      organization,
      orgTypesData,
      asListItem,
      withIcon,
      customImageIcon,
    } = this.props;
    const { dialogOpen } = this.state;

    let _text = customText ? customText : this.defaultText;

    return (
      <React.Fragment>
        {asListItem ? (
          <ListItem
            style={customListItemStyle}
            button
            onClick={() => this.openInviteTeamMemberDialog()}
          >
            {withIcon && (
              <ListItemIcon>
                <PersonAddIcon color="primary" />
              </ListItemIcon>
            )}
            {customImageIcon && (
              <ListItemIcon>
                <img alt="" src={customImageIcon} />
              </ListItemIcon>
            )}
            <ListItemText primary={_text} className={classes.listItemText} disableTypography />
          </ListItem>
        ) : (
          <span className={classes.spanLink} onClick={() => this.openInviteTeamMemberDialog()}>
            {withIcon && (
              <React.Fragment>
                <PersonAddIcon color="primary" />
              </React.Fragment>
            )}
            {_text}
          </span>
        )}

        <InviteTeamMemberDialog
          currentUser={currentUser}
          organization={organization}
          orgTypesData={orgTypesData}
          open={Boolean(dialogOpen)}
          onClose={this.onInviteTeamMemberDialogClosed}
        />
      </React.Fragment>
    );
  }
}

const styles = (theme) => ({
  listItemText: {
    color: styleVars.txtColorLink,
  },
  spanLink: {
    color: styleVars.txtColorLink,
    cursor: "pointer",
  },
});

export default withStyles(styles, { withTheme: true })(InviteTeamMemberCta);
