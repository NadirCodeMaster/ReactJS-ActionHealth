import React from "react";
import { List, ListItem, ListItemIcon, ListItemText, Paper } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";

export default {
  title: "Molecules/Nav Lists",
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
};

export const SimpleList = () => (
  <List component="nav">
    <ListItem button>
      <ListItemText primary="Trash" />
    </ListItem>
    <ListItemLink href="#simple-list" onClick={(e) => e.preventDefault()}>
      <ListItemText primary="Spam" />
    </ListItemLink>
  </List>
);

export const SimpleListWPaper = () => (
  <Paper>
    <List component="nav">
      <ListItem button>
        <ListItemText primary="Trash" />
      </ListItem>
      <ListItemLink href="#simple-list" onClick={(e) => e.preventDefault()}>
        <ListItemText primary="Spam" />
      </ListItemLink>
    </List>
  </Paper>
);
SimpleListWPaper.storyName = "Simple List w/Paper";

export const IconList = () => (
  <React.Fragment>
    <List component="nav">
      <ListItem button>
        <ListItemIcon>
          <InboxIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <DraftsIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="Drafts" />
      </ListItem>
    </List>
    <br />
    <p>
      Note: Icons here and in implementations of this pattern in Programs2 have{" "}
      <code>color="primary"</code> manually applied to make them orange.
    </p>
  </React.Fragment>
);

export const IconListWPaper = () => (
  <React.Fragment>
    <Paper>
      <List component="nav">
        <ListItem button>
          <ListItemIcon>
            <InboxIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <DraftsIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Drafts" />
        </ListItem>
      </List>
    </Paper>
    <br />
    <p>
      Note: Icons here and in implementations of this pattern in Programs2 have{" "}
      <code>color="primary"</code> manually applied to make them orange.
    </p>
  </React.Fragment>
);
IconListWPaper.storyName = "Icon List w/Paper";

const ListItemLink = (props) => (
  <React.Fragment>
    <ListItem button component="a" {...props} />
  </React.Fragment>
);
